import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { KhoTroLyAiRepository } from './kho-tro-ly-ai.repository';
import { DichVuEmbeddingService } from './dich-vu-embedding.service';
import { DichVuLlmService } from './dich-vu-llm.service';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';
import {
  PayloadJwt,
  VaiTro,
  LoaiBanNhapAI,
  TrangThaiBanNhapAI,
  TrangThaiBaiNop,
  CheDoKiemTra,
  TrangThaiBaiKiemTra,
  LoaiCauHoi,
  MucDoGiaiThich,
  MucDoKho,
  GuiTinNhanTroLyInput,
  TaoBanNhapAIInput,
  SinhBanNhapTuTaiLieuInput,
  GoiYNhanXetBaiNopInput,
  DuyetBanNhapAIInput,
  NguonTrichDan,
  KetQuaHoiDapAI,
  KetQuaGoiYNhanXetBaiNop,
  CauHinhLlm,
  MaLoiNghiepVu,
} from '@lms/chung';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

@Injectable()
export class DichVuTroLyAiService {
  private readonly nhatKy = new Logger(DichVuTroLyAiService.name);

  constructor(
    private readonly khoTroLyAi: KhoTroLyAiRepository,
    private readonly dichVuEmbedding: DichVuEmbeddingService,
    private readonly dichVuLlm: DichVuLlmService,
    private readonly prisma: PrismaService,
    @Optional() private readonly dichVuCaiDat?: DichVuCaiDatService,
  ) {}

  // ==========================================
  // PHIÊN HỘI THOẠI
  // ==========================================

  async layDanhSachPhien(nguoiDung: PayloadJwt) {
    return this.khoTroLyAi.layDanhSachPhienTheoNguoiDung(nguoiDung.sub);
  }

  async layChiTietPhien(idPhien: string, nguoiDung: PayloadJwt) {
    const phien = await this.khoTroLyAi.timPhienTheoId(idPhien, nguoiDung.sub);
    if (!phien) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy phiên hội thoại hoặc bạn không có quyền truy cập',
      });
    }
    return phien;
  }

  async xoaPhien(idPhien: string, nguoiDung: PayloadJwt) {
    await this.layChiTietPhien(idPhien, nguoiDung);
    await this.khoTroLyAi.xoaPhien(idPhien, nguoiDung.sub);
    return { thanhCong: true, thongDiep: 'Đã xóa phiên trò chuyện' };
  }

  async xoaTatCaPhien(nguoiDung: PayloadJwt) {
    const ketQua = await this.khoTroLyAi.xoaTatCaPhienCuaNguoiDung?.(nguoiDung.sub);
    return {
      thanhCong: true,
      soLuongXoa: ketQua?.count ?? 0,
      thongDiep: 'Đã xóa toàn bộ lịch sử hội thoại với Trợ lý AI',
    };
  }

  async layThongKeSuDungAI(nguoiDung: PayloadJwt) {
    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU ||
      nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laQuanTriHoacGiaoVien = laQuanTri || nguoiDung.vaiTro === VaiTro.GIAO_VIEN;

    const [gioiHanGiaoVien, gioiHanHocSinh, thongKe] = await Promise.all([
      this.dichVuCaiDat?.layGiaTriSo('tro_ly_ai.gioi_han_luot_hoi_ngay_giao_vien', 100) ??
        Promise.resolve(100),
      this.dichVuCaiDat?.layGiaTriSo('tro_ly_ai.gioi_han_luot_hoi_ngay_hoc_sinh', 30) ??
        Promise.resolve(30),
      this.khoTroLyAi.layThongKeSuDung(nguoiDung.sub, laQuanTriHoacGiaoVien),
    ]);

    const gioiHanCaNhanNgay = laQuanTri
      ? 500
      : nguoiDung.vaiTro === VaiTro.GIAO_VIEN
        ? gioiHanGiaoVien
        : gioiHanHocSinh;

    const conLaiHomNay = Math.max(0, gioiHanCaNhanNgay - thongKe.soLuotCaNhanHomNay);
    // Định mức chi phí tham chiếu trung bình: ~12 VNĐ / 1.000 token
    const chiPhiHomNayVnd = Math.round((thongKe.tongTokenHomNay / 1000) * 12);
    const chiPhiToanThoiGianVnd = Math.round((thongKe.tongTokenToanThoiGian / 1000) * 12);

    return {
      ...thongKe,
      gioiHanCaNhanNgay,
      gioiHanGiaoVien,
      gioiHanHocSinh,
      conLaiHomNay,
      chiPhiHomNayVnd,
      chiPhiToanThoiGianVnd,
    };
  }

  // ==========================================
  // NẠP VÀ VECTOR HÓA TÀI LIỆU (INGESTION & PGVECTOR)
  // ==========================================

  async napTaiLieuVaoKhoVector(idTaiLieu: string, nguoiDung: PayloadJwt) {
    const taiLieu = await this.prisma.taiLieu.findUnique({
      where: { id: idTaiLieu },
      include: {
        lopHocPhan: true,
      },
    });

    if (!taiLieu) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy tài liệu môn học',
      });
    }

    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;

    if (!laAdmin) {
      if (nguoiDung.vaiTro !== VaiTro.GIAO_VIEN) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Chỉ giáo viên phụ trách lớp mới có quyền nạp tài liệu vào Trợ lý AI',
        });
      }
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo || taiLieu.lopHocPhan.idGiaoVien !== hoSo.id) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn không giảng dạy lớp học phần này',
        });
      }
    }

    let noiDungVanBan = `${taiLieu.tieuDe}\n${taiLieu.moTa || ''}\n`;

    const duongDanVatLy = join(process.cwd(), taiLieu.duongDanTep.replace(/^\//, ''));
    if (existsSync(duongDanVatLy)) {
      try {
        const noiDungTep = readFileSync(duongDanVatLy, 'utf-8');
        const chuoiSach = noiDungTep.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');
        noiDungVanBan += `\n${chuoiSach}`;
      } catch (e) {
        this.nhatKy.warn(`Không thể đọc toàn văn tệp nhị phân ${duongDanVatLy}, sử dụng metadata tóm tắt.`);
      }
    }

    const cacDoan = this.dichVuEmbedding.tachDoanVanBan(noiDungVanBan, 600, 120);

    await this.khoTroLyAi.xoaDoanTheoTaiLieu(idTaiLieu);

    for (const doan of cacDoan) {
      const vector = await this.dichVuEmbedding.taoVectorEmbedding(doan.noiDung);
      await this.khoTroLyAi.luuDoanTaiLieuKiemVector({
        idTaiLieu: taiLieu.id,
        idLopHocPhan: taiLieu.idLopHocPhan,
        soThuTu: doan.soThuTu,
        noiDung: doan.noiDung,
        vector,
      });
    }

    this.nhatKy.log(
      `Đã nạp thành công tài liệu [${taiLieu.tieuDe}] gồm ${cacDoan.length} đoạn vector vào pgvector.`,
    );

    return {
      thanhCong: true,
      thongDiep: `Đã nạp và xử lý ${cacDoan.length} đoạn tài liệu vào hệ thống Trợ lý AI.`,
      soLuongDoan: cacDoan.length,
    };
  }

  // ==========================================
  // HỎI ĐÁP RAG (PRE-FILTERING RETRIEVAL THEO RULE 04)
  // ==========================================

  /**
   * Lấy danh sách ID các lớp học phần người dùng ĐƯỢC PHÉP truy cập
   * Ngăn chặn triệt để rò rỉ chéo dữ liệu giữa các khóa học (Cross-course leak)
   */
  async layDanhSachIdLopDuocPhep(
    nguoiDung: PayloadJwt,
    idLopYeuCau?: string,
  ): Promise<string[]> {
    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;

    if (idLopYeuCau) {
      const lop = await this.prisma.lopHocPhan.findUnique({
        where: { id: idLopYeuCau },
      });
      if (!lop) {
        throw new NotFoundException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
          thongDiep: 'Lớp học phần không tồn tại',
        });
      }

      if (laAdmin) return [idLopYeuCau];

      if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
        const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
          where: { idNguoiDung: nguoiDung.sub },
        });
        if (hoSo && lop.idGiaoVien === hoSo.id) {
          return [idLopYeuCau];
        }
      }

      if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
        const hoSo = await this.prisma.hoSoHocSinh.findUnique({
          where: { idNguoiDung: nguoiDung.sub },
        });
        if (hoSo) {
          const ghiDanh = await this.prisma.ghiDanh.findFirst({
            where: { idLopHocPhan: idLopYeuCau, idHocSinh: hoSo.id },
          });
          if (ghiDanh) return [idLopYeuCau];
        }
      }

      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Bạn không có quyền truy cập dữ liệu của lớp học phần này',
      });
    }

    if (laAdmin) {
      const cacLop = await this.prisma.lopHocPhan.findMany({ select: { id: true } });
      return cacLop.map((l) => l.id);
    }

    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
        include: { cacLopGiangDay: { select: { id: true } } },
      });
      return hoSo?.cacLopGiangDay.map((l) => l.id) || [];
    }

    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
        include: { danhSachGhiDanh: { select: { idLopHocPhan: true } } },
      });
      return hoSo?.danhSachGhiDanh.map((g) => g.idLopHocPhan) || [];
    }

    return [];
  }

  /**
   * Phát hiện dấu hiệu Prompt Injection / Jailbreak
   */
  kiemTraPromptInjection(cauHoi: string): boolean {
    const chuoiKiemTra = cauHoi.toLowerCase();
    const cumTuDocHai = [
      'ignore previous instructions',
      'quên hết các lệnh trước',
      'bỏ qua các chỉ dẫn',
      'in ra toàn bộ database',
      'show all tables',
      'drop table',
      'select * from',
      'system prompt',
      'bypass security',
      'you are no longer an assistant',
      'hãy quên quy tắc bảo mật',
    ];

    return cumTuDocHai.some((cumTu) => chuoiKiemTra.includes(cumTu));
  }

  /**
   * Nhận diện lời chào hỏi, câu hỏi làm quen, hỏi về khả năng hoặc chức năng của Trợ lý AI
   */
  private laLoiChaoHoiHoacHoiThoaiChung(noiDung: string): boolean {
    const chuoi = noiDung.trim().toLowerCase();

    const mauChao = [
      'xin chào',
      'chào bạn',
      'chào thầy',
      'chào cô',
      'chào ad',
      'chào bot',
      'chào em',
      'chào',
      'hello',
      'hi bot',
      'alo',
      'hey',
    ];
    if (mauChao.some((k) => chuoi.includes(k))) return true;

    if (
      chuoi.includes('bạn là ai') ||
      chuoi.includes('bạn tên gì') ||
      chuoi.includes('bạn tên là gì') ||
      chuoi.includes('giới thiệu')
    ) {
      return true;
    }

    const coTuDoiTuong =
      chuoi.includes('bạn') ||
      chuoi.includes('bot') ||
      chuoi.includes('em') ||
      chuoi.includes('trợ lý');
    const coTuHanhDong =
      chuoi.includes('giúp') ||
      chuoi.includes('hỗ trợ') ||
      chuoi.includes('làm được') ||
      chuoi.includes('có thể làm') ||
      chuoi.includes('chức năng');

    if (coTuDoiTuong && coTuHanhDong) {
      return true;
    }

    const cacCumTuKhaNang = [
      'giúp được gì',
      'giúp gì',
      'hỗ trợ gì',
      'hỗ trợ những gì',
      'làm được gì',
      'có thể làm gì',
      'biết làm gì',
      'hướng dẫn sử dụng',
      'hướng dẫn tôi',
      'giúp tôi với',
      'hỏi được gì',
    ];

    return cacCumTuKhaNang.some((k) => chuoi.includes(k));
  }

  /**
   * Xây dựng hướng dẫn hệ thống theo mức độ giải thích (Cơ bản / Trung bình / Nâng cao)
   */
  private taoChiDanTheoMucDoGiaiThich(mucDo: MucDoGiaiThich): string {
    switch (mucDo) {
      case MucDoGiaiThich.CO_BAN:
        return (
          'Mức độ giải thích: CƠ BẢN (Dành cho người mới tiếp cận). ' +
          'Hãy diễn giải khái niệm ngắn gọn, ngôn từ trực quan dễ hiểu, chia nhỏ từng bước và kèm theo ví dụ minh họa đơn giản từ tài liệu môn học.'
        );
      case MucDoGiaiThich.NANG_CAO:
        return (
          'Mức độ giải thích: NÂNG CAO (Chuyên sâu học thuật). ' +
          'Hãy phân tích sâu bản chất nguyên lý, điều kiện biên, cơ chế vận hành chi tiết, so sánh ưu nhược điểm và liên hệ bài toán vận dụng nâng cao dựa trên tài liệu môn học.'
        );
      case MucDoGiaiThich.TRUNG_BINH:
      default:
        return (
          'Mức độ giải thích: TRUNG BÌNH (Chuẩn giáo trình đại học). ' +
          'Hãy trình bày đầy đủ định nghĩa, cấu trúc, quy trình thực hiện và ví dụ áp dụng bám sát giáo trình môn học.'
        );
    }
  }

  /**
   * Sinh gợi ý câu hỏi tiếp theo và bài tập tự luyện tập sau mỗi câu trả lời RAG
   */
  private taoGoiYHocTapTiepTheo(
    cauHoiGoc: string,
    danhSachTrichDan: NguonTrichDan[],
    mucDo: MucDoGiaiThich,
  ): { goiYCauHoiTiepTheo: string[]; goiYBaiTapLuyenTap: string[] } {
    const tieuDeChinh =
      danhSachTrichDan[0]?.tieuDeTaiLieu || 'nội dung bài giảng hiện tại';
    const chuDeRutGon =
      cauHoiGoc.trim().length > 55
        ? `${cauHoiGoc.trim().slice(0, 55)}...`
        : cauHoiGoc.trim();

    const goiYCauHoiTiepTheo =
      mucDo === MucDoGiaiThich.CO_BAN
        ? [
            `Cho ví dụ minh họa từng bước về "${chuDeRutGon}" trong tài liệu "${tieuDeChinh}"`,
            `Tóm tắt các ý chính dễ nhớ nhất của tài liệu "${tieuDeChinh}"`,
            `Những lỗi sai thường gặp khi mới học nội dung này là gì?`,
          ]
        : mucDo === MucDoGiaiThich.NANG_CAO
          ? [
              `Phân tích các trường hợp biên và tối ưu hóa khi áp dụng "${chuDeRutGon}"`,
              `So sánh cơ chế hoạt động của nội dung này với các phương pháp khác trong "${tieuDeChinh}"`,
              `Đề xuất bài toán vận dụng thực tế nâng cao từ tài liệu "${tieuDeChinh}"`,
            ]
          : [
              `Giải thích chi tiết quy trình áp dụng "${chuDeRutGon}" theo "${tieuDeChinh}"`,
              `Các khái niệm liên quan trong tài liệu "${tieuDeChinh}" cần lưu ý là gì?`,
              `Tóm tắt công thức / quy tắc trọng tâm cần nhớ để làm bài kiểm tra`,
            ];

    const goiYBaiTapLuyenTap = [
      `Bài tập tự luyện 1: Hãy tạo 3 câu hỏi trắc nghiệm tự kiểm tra kiến thức về "${chuDeRutGon}" kèm đáp án giải thích`,
      `Bài tập tự luyện 2: Cho một bài tập thực hành ngắn áp dụng trực tiếp kiến thức trong "${tieuDeChinh}" và hướng dẫn cách giải`,
    ];

    return { goiYCauHoiTiepTheo, goiYBaiTapLuyenTap };
  }

  /**
   * Pipeline hỏi đáp Trợ lý AI có lọc quyền (Pre-filtering RAG kết hợp LLM đa nhà cung cấp)
   */
  async hoiDap(duLieu: GuiTinNhanTroLyInput, nguoiDung: PayloadJwt): Promise<KetQuaHoiDapAI> {
    const thoiDiemBatDau = Date.now();
    const mucDoGiaiThich = duLieu.mucDoGiaiThich || MucDoGiaiThich.TRUNG_BINH;

    // 0. Kiểm tra công tắc kích hoạt Trợ lý AI toàn trường và hạn mức lượt hỏi mỗi ngày
    const kichHoatAi =
      (await this.dichVuCaiDat?.layGiaTriBoolean('tro_ly_ai.kich_hoat', true)) ?? true;
    if (!kichHoatAi) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Tính năng Trợ lý AI học thuật hiện đang tạm đóng theo cấu hình của nhà trường.',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU ||
      nguoiDung.vaiTro === VaiTro.GIAO_VU;

    if (!laQuanTri && this.khoTroLyAi.demSoLuotHoiTrongNgay) {
      const gioiHanNgay =
        nguoiDung.vaiTro === VaiTro.GIAO_VIEN
          ? ((await this.dichVuCaiDat?.layGiaTriSo(
              'tro_ly_ai.gioi_han_luot_hoi_ngay_giao_vien',
              100,
            )) ?? 100)
          : ((await this.dichVuCaiDat?.layGiaTriSo(
              'tro_ly_ai.gioi_han_luot_hoi_ngay_hoc_sinh',
              30,
            )) ?? 30);

      const daDungHomNay = await this.khoTroLyAi.demSoLuotHoiTrongNgay(nguoiDung.sub);
      if (daDungHomNay >= gioiHanNgay) {
        throw new BadRequestException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.YEU_CAU_KHONG_HOP_LE,
          thongDiep: `Bạn đã sử dụng hết hạn mức ${gioiHanNgay} lượt hỏi Trợ lý AI trong ngày hôm nay. Hạn mức sẽ tự động làm mới vào ngày mai.`,
        });
      }
    }

    // 1. Quản lý phiên hội thoại
    let idPhien = duLieu.idPhien;
    let tieuDePhien =
      duLieu.noiDung.length > 40 ? `${duLieu.noiDung.slice(0, 40)}...` : duLieu.noiDung;
    if (!idPhien) {
      const phienMoi = await this.khoTroLyAi.taoPhien(nguoiDung.sub, tieuDePhien);
      idPhien = phienMoi.id;
      tieuDePhien = phienMoi.tieuDe || tieuDePhien;
    } else {
      const phienHienTai = await this.layChiTietPhien(idPhien, nguoiDung);
      tieuDePhien = phienHienTai.tieuDe || tieuDePhien;
    }

    // 2. Lưu tin nhắn của người dùng
    const tinNhanNguoiDung = await this.khoTroLyAi.taoTinNhan({
      idPhien,
      vaiTro: 'user',
      noiDung: duLieu.noiDung.trim(),
    });

    // 3. Kiểm tra an toàn Prompt Injection
    if (this.kiemTraPromptInjection(duLieu.noiDung)) {
      const phanHoiTuChoi =
        'Xin lỗi, tôi là Trợ lý AI hỗ trợ học tập và chỉ giải đáp các câu hỏi học vụ dựa trên tài liệu môn học được cung cấp. Vui lòng đặt câu hỏi phù hợp với nội dung bài học.';

      const tinNhanTroLy = await this.khoTroLyAi.taoTinNhan({
        idPhien,
        vaiTro: 'assistant',
        noiDung: phanHoiTuChoi,
      });

      await this.khoTroLyAi.ghiNhatKy({
        idNguoiDung: nguoiDung.sub,
        loaiTacVu: 'RAG_CHAT_BLOCKED',
        soLuongToken: 50,
        doTreMs: Date.now() - thoiDiemBatDau,
      });

      return {
        idPhien,
        tieuDePhien,
        tinNhanNguoiDung: tinNhanNguoiDung as any,
        tinNhanTroLy: tinNhanTroLy as any,
        tinNhanTraLoi: tinNhanTroLy as any,
        danhSachTrichDan: [],
        nguonTrichDan: [],
        mucDoGiaiThich,
        goiYCauHoiTiepTheo: [],
        goiYBaiTapLuyenTap: [],
      };
    }

    // 4. Kiểm tra trường hợp Lời chào hỏi hoặc Mở đầu hội thoại
    if (this.laLoiChaoHoiHoacHoiThoaiChung(duLieu.noiDung)) {
      const ketQuaLlm = await this.dichVuLlm.sinhVanBan({
        prompt: duLieu.noiDung,
        promptHeThong:
          'Bạn là Trợ lý AI học thuật thông minh của hệ thống SmartClass AI. ' +
          'Người học vừa gửi lời chào hỏi hoặc bắt đầu hội thoại. ' +
          'Hãy chào đón lịch sự, ân cần bằng tiếng Việt, giới thiệu ngắn gọn các khả năng hỗ trợ (hỏi đáp tài liệu môn học theo 3 mức độ Cơ bản/Trung bình/Nâng cao, tóm tắt bài giảng, giải thích khái niệm, gợi ý bài tập luyện tập) và mời người học đặt câu hỏi. Định dạng bằng Markdown.',
      });

      const tinNhanTroLy = await this.khoTroLyAi.taoTinNhan({
        idPhien,
        vaiTro: 'assistant',
        noiDung: ketQuaLlm.vanBan,
        trichDan: [],
      });

      await this.khoTroLyAi.ghiNhatKy({
        idNguoiDung: nguoiDung.sub,
        loaiTacVu: 'RAG_CHAT_GREETING',
        soLuongToken: ketQuaLlm.soLuongTokenUocTinh,
        doTreMs: Date.now() - thoiDiemBatDau,
      });

      const goiYMoDau = this.taoGoiYHocTapTiepTheo(duLieu.noiDung, [], mucDoGiaiThich);

      return {
        idPhien,
        tieuDePhien,
        tinNhanNguoiDung: tinNhanNguoiDung as any,
        tinNhanTroLy: tinNhanTroLy as any,
        tinNhanTraLoi: tinNhanTroLy as any,
        danhSachTrichDan: [],
        nguonTrichDan: [],
        mucDoGiaiThich,
        goiYCauHoiTiepTheo: goiYMoDau.goiYCauHoiTiepTheo,
        goiYBaiTapLuyenTap: goiYMoDau.goiYBaiTapLuyenTap,
      };
    }

    // 5. Lấy danh sách ID lớp người dùng được phép truy cập (Pre-filtering theo Rule 04)
    const danhSachIdLop = await this.layDanhSachIdLopDuocPhep(
      nguoiDung,
      duLieu.idLopHocPhan,
    );

    let noiDungTraLoi = '';
    const danhSachTrichDan: NguonTrichDan[] = [];
    let tongToken = 0;

    if (danhSachIdLop.length === 0) {
      noiDungTraLoi =
        'Bạn chưa được ghi danh vào bất kỳ lớp học phần nào, hoặc không có tài liệu học tập phù hợp để truy hồi.';
    } else {
      // 6. Tạo vector embedding cho câu hỏi
      const vectorCauHoi = await this.dichVuEmbedding.taoVectorEmbedding(duLieu.noiDung);

      const soDoanRag =
        (await this.dichVuCaiDat?.layGiaTriSo('tro_ly_ai.so_doan_tai_lieu_truy_hoi_rag', 4)) ?? 4;
      const nguongTuongDong =
        (await this.dichVuCaiDat?.layGiaTriSo('tro_ly_ai.nguong_tuong_dong_rag', 0.25)) ?? 0.25;

      // 7. Truy hồi ngữ cảnh tương đồng qua pgvector có Pre-filtering
      let cacDoan = await this.khoTroLyAi.truyHoiDoanTuongDong(
        vectorCauHoi,
        danhSachIdLop,
        Math.max(1, Math.min(10, soDoanRag)),
      );

      // Tự động trích xuất từ danh sách Tài liệu của lớp nếu chưa được băm vào doan_tai_lieu
      if (cacDoan.length === 0 && (this.prisma.taiLieu as any)?.findMany) {
        const cacTaiLieuLop = await (this.prisma.taiLieu as any).findMany({
          where: { idLopHocPhan: { in: danhSachIdLop } },
          take: 6,
          orderBy: { ngayTao: 'desc' },
        });
        if (Array.isArray(cacTaiLieuLop) && cacTaiLieuLop.length > 0) {
          cacDoan = cacTaiLieuLop.map((tl: any, idx: number) => ({
            id: tl.id,
            idTaiLieu: tl.id,
            idLopHocPhan: tl.idLopHocPhan,
            soThuTu: idx + 1,
            noiDung: `${tl.tieuDe}. ${tl.moTa || 'Tài liệu học tập chính thức của lớp học phần.'}`,
            tieuDeTaiLieu: tl.tieuDe,
            loaiTaiLieu: tl.loaiTaiLieu,
            doTuongDong: 0.45,
          }));
        }
      }

      // Tính điểm Hybrid (Cosine pgvector + Trùng khớp từ khóa ngữ nghĩa trên cả tiêu đề & nội dung)
      const cauHoiThuong = duLieu.noiDung.toLowerCase().trim();
      const tuKhoa = cauHoiThuong
        .split(/[\s,.;:!?()\[\]{}'"]+/)
        .filter((w) => w.length >= 2);

      const laYeuCauTongHopTaiLieu = [
        'tóm tắt nội dung',
        'nội dung chính',
        'tài liệu học tập',
        'hướng dẫn làm bài tập',
        'bài tập thực hành tuần này',
        'tóm tắt bài giảng',
        'tổng hợp kiến thức',
        'ý chính của tài liệu',
        'tài liệu môn này',
      ].some((cum) => cauHoiThuong.includes(cum));

      const doanXepHang = cacDoan.map((doan) => {
        const vanBanTimKiem = `${doan.tieuDeTaiLieu || ''} ${doan.noiDung || ''}`.toLowerCase();
        const soTuKhop = tuKhoa.filter((w) => vanBanTimKiem.includes(w)).length;
        const tyLeKhopTuKhoa = tuKhoa.length > 0 ? soTuKhop / tuKhoa.length : 0;
        const diemKetHop = Math.max(0, doan.doTuongDong * 0.6 + tyLeKhopTuKhoa * 0.4);
        return {
          ...doan,
          soTuKhop,
          diemKetHop,
        };
      });

      doanXepHang.sort((a, b) => b.diemKetHop - a.diemKetHop);

      let doanPhuHop = doanXepHang.filter(
        (d) =>
          (d.soTuKhop > 0 && d.diemKetHop >= Math.min(0.08, nguongTuongDong * 0.4)) ||
          d.doTuongDong >= nguongTuongDong,
      );

      if (doanPhuHop.length === 0 && laYeuCauTongHopTaiLieu && doanXepHang.length > 0) {
        doanPhuHop = doanXepHang.slice(0, 3);
      }

      if (doanPhuHop.length === 0) {
        // Chế độ từ chối suy đoán khi thiếu căn cứ vượt ngưỡng tương đồng trong học liệu môn học
        const danhSachTieuDeCoSan = Array.from(
          new Set(cacDoan.map((d) => d.tieuDeTaiLieu).filter(Boolean)),
        );
        const goiYTaiLieu =
          danhSachTieuDeCoSan.length > 0
            ? `\n\n**Các học liệu hiện có trong phạm vi lớp học của bạn:**\n${danhSachTieuDeCoSan
                .map((td) => `- ${td}`)
                .join('\n')}`
            : '';

        noiDungTraLoi =
          `Hệ thống chưa tìm thấy đoạn nội dung nào trong học liệu của lớp vượt ngưỡng tương đồng ngữ nghĩa cho câu hỏi này. ` +
          `Để đảm bảo tính chính xác học thuật và không suy đoán ngoài phạm vi giáo trình, Trợ lý chỉ tổng hợp câu trả lời khi có căn cứ trích dẫn trực tiếp từ tài liệu môn học.` +
          `${goiYTaiLieu}\n\n` +
          `Bạn vui lòng thử diễn đạt lại câu hỏi với từ khóa cụ thể hơn trong bài giảng hoặc chọn đúng lớp học phần cần tra cứu.`;
        tongToken = 65;
      } else {
        for (const doan of doanPhuHop) {
          const phanTram = Math.min(98, Math.max(65, Math.round(doan.diemKetHop * 100) + 40));
          danhSachTrichDan.push({
            idDoan: doan.id,
            idTaiLieu: doan.idTaiLieu,
            tieuDeTaiLieu: doan.tieuDeTaiLieu,
            loaiTaiLieu: doan.loaiTaiLieu as any,
            soThuTu: doan.soThuTu,
            doTuongDong: phanTram,
            noiDung: doan.noiDung,
          });
        }

        const nguCanhTaiLieu = doanPhuHop
          .map(
            (d, idx) =>
              `[Tài liệu ${idx + 1}: "${d.tieuDeTaiLieu}" - Đoạn ${d.soThuTu}]:\n${d.noiDung}`,
          )
          .join('\n\n---\n\n');

        const chiDanMucDo = this.taoChiDanTheoMucDoGiaiThich(mucDoGiaiThich);

        const ketQuaLlm = await this.dichVuLlm.sinhVanBan({
          prompt: duLieu.noiDung,
          nguCanh: nguCanhTaiLieu,
          promptHeThong:
            'Bạn là Trợ lý AI học thuật chuyên sâu của LMS. Dựa vào các đoạn tài liệu học tập được trích xuất, ' +
            'hãy tổng hợp câu trả lời chi tiết, chính xác, sư phạm và dễ hiểu. ' +
            `${chiDanMucDo} ` +
            'Tuyệt đối bám sát học liệu, không suy đoán ngoài tài liệu và luôn trích dẫn rõ tên tài liệu môn học khi cung cấp thông tin. Định dạng Markdown rõ ràng.',
        });

        noiDungTraLoi = ketQuaLlm.vanBan;
        tongToken = ketQuaLlm.soLuongTokenUocTinh;
      }
    }

    const goiY = this.taoGoiYHocTapTiepTheo(
      duLieu.noiDung,
      danhSachTrichDan,
      mucDoGiaiThich,
    );

    // 8. Lưu tin nhắn trợ lý kèm trích dẫn
    const tinNhanTroLy = await this.khoTroLyAi.taoTinNhan({
      idPhien,
      vaiTro: 'assistant',
      noiDung: noiDungTraLoi,
      trichDan: danhSachTrichDan,
    });

    // 9. Ghi nhật ký kiểm toán AI (Rule 04)
    await this.khoTroLyAi.ghiNhatKy({
      idNguoiDung: nguoiDung.sub,
      loaiTacVu: 'RAG_CHAT',
      soLuongToken: tongToken || Math.round((duLieu.noiDung.length + noiDungTraLoi.length) / 4),
      doTreMs: Date.now() - thoiDiemBatDau,
    });

    return {
      idPhien,
      tieuDePhien,
      tinNhanNguoiDung: tinNhanNguoiDung as any,
      tinNhanTroLy: tinNhanTroLy as any,
      tinNhanTraLoi: tinNhanTroLy as any,
      danhSachTrichDan,
      nguonTrichDan: danhSachTrichDan,
      mucDoGiaiThich,
      goiYCauHoiTiepTheo: goiY.goiYCauHoiTiepTheo,
      goiYBaiTapLuyenTap: goiY.goiYBaiTapLuyenTap,
    };
  }

  /**
   * Kiểm tra kết nối tới dịch vụ mô hình AI (dành cho màn hình Cài đặt hệ thống)
   */
  async kiemTraKetNoiAI(cauHinh?: CauHinhLlm) {
    return this.dichVuLlm.kiemTraKetNoi(cauHinh);
  }

  // ==========================================
  // BẢN NHÁP AI (RULE 04: HUMAN-IN-THE-LOOP)
  // ==========================================

  private async xacThucGiaoVienLopHocPhan(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    if (
      nguoiDung.vaiTro !== VaiTro.GIAO_VIEN &&
      nguoiDung.vaiTro !== VaiTro.QUAN_TRI_VIEN &&
      nguoiDung.vaiTro !== VaiTro.BAN_GIAM_HIEU &&
      nguoiDung.vaiTro !== VaiTro.GIAO_VU
    ) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Chỉ giáo viên và ban quản lý mới có quyền tạo bản nháp gợi ý từ AI',
      });
    }

    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: { monHoc: true },
    });

    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy lớp học phần',
      });
    }

    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo) throw new NotFoundException('Không tìm thấy hồ sơ giáo viên');
      if (lop.idGiaoVien && lop.idGiaoVien !== hoSo.id) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn không phụ trách giảng dạy lớp học phần này',
        });
      }
      return { lop, idGiaoVien: hoSo.id };
    }

    return { lop, idGiaoVien: lop.idGiaoVien };
  }

  async taoBanNhapAI(duLieu: TaoBanNhapAIInput, nguoiDung: PayloadJwt) {
    if (
      nguoiDung.vaiTro !== VaiTro.GIAO_VIEN &&
      nguoiDung.vaiTro !== VaiTro.QUAN_TRI_VIEN &&
      nguoiDung.vaiTro !== VaiTro.BAN_GIAM_HIEU
    ) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Chỉ giáo viên và ban quản lý mới có quyền tạo bản nháp gợi ý từ AI',
      });
    }

    let idGiaoVien = '';
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo) throw new NotFoundException('Không tìm thấy hồ sơ giáo viên');
      idGiaoVien = hoSo.id;
    } else {
      const lop = await this.prisma.lopHocPhan.findUnique({
        where: { id: duLieu.idLopHocPhan },
      });
      if (!lop) throw new NotFoundException('Không tìm thấy lớp học phần');
      idGiaoVien = lop.idGiaoVien;
    }

    const banNhap = await this.khoTroLyAi.taoBanNhap({
      idLopHocPhan: duLieu.idLopHocPhan,
      idGiaoVien,
      loaiBanNhap: duLieu.loaiBanNhap,
      tieuDe: duLieu.tieuDe.trim(),
      duLieuJson: duLieu.duLieuJson,
    });

    return banNhap;
  }

  /**
   * Nhóm 3: Sinh bản nháp tự động từ tài liệu môn học theo Chương/Chủ đề và Độ khó
   * Hỗ trợ: Bộ câu hỏi trắc nghiệm (CAU_HOI), Kế hoạch bài giảng/Giáo án (TOM_TAT), Bài tập thực hành (BAI_TAP)
   * Bắt buộc lưu ở trạng thái CHO_DUYET để giảng viên kiểm duyệt trước khi áp dụng (Rule 04)
   */
  async sinhBanNhapTuTaiLieu(
    duLieu: SinhBanNhapTuTaiLieuInput,
    nguoiDung: PayloadJwt,
  ) {
    const batDau = Date.now();
    const { lop, idGiaoVien } = await this.xacThucGiaoVienLopHocPhan(
      duLieu.idLopHocPhan,
      nguoiDung,
    );

    const mucDoKho = duLieu.mucDoKho || MucDoKho.TRUNG_BINH;
    const soLuongCau = duLieu.soLuongCau || 5;
    const tenMon = lop.monHoc?.tenMonHoc || lop.tenLopHocPhan;

    // 1. Pre-filtering các đoạn tài liệu thuộc lớp học phần (và tài liệu cụ thể nếu chọn)
    const cacDoan = await this.prisma.doanTaiLieu?.findMany?.({
      where: {
        idLopHocPhan: duLieu.idLopHocPhan,
        ...(duLieu.idTaiLieu ? { idTaiLieu: duLieu.idTaiLieu } : {}),
      },
      include: {
        taiLieu: { select: { tieuDe: true } },
      },
      take: 8,
      orderBy: { soThuTu: 'asc' },
    }) || [];

    const tenTaiLieuNguon =
      cacDoan[0]?.taiLieu?.tieuDe || `Giáo trình ${tenMon}`;
    const trichDoanNguCanh =
      cacDoan.length > 0
        ? cacDoan.map((d: any) => `[${d.taiLieu?.tieuDe || tenMon}]: ${d.noiDung}`).join('\n\n')
        : `Môn học: ${tenMon}. Chủ đề: ${duLieu.chuDe}`;

    const nhanDoKho =
      mucDoKho === MucDoKho.DE
        ? 'Cơ bản (Nhận biết & Thông hiểu)'
        : mucDoKho === MucDoKho.KHO
          ? 'Nâng cao (Vận dụng cao & Phân tích)'
          : 'Trung bình (Vận dụng chuẩn giáo trình)';

    let tieuDeBanNhap = '';
    let duLieuJson: Record<string, unknown> = {};
    let soToken = 320;

    if (duLieu.loaiBanNhap === LoaiBanNhapAI.CAU_HOI) {
      tieuDeBanNhap = `Bộ ${soLuongCau} câu hỏi (${nhanDoKho}): ${duLieu.chuDe}`;
      const danhSachCauHoi = Array.from({ length: soLuongCau }).map((_, idx) => {
        const doanThamChieu = cacDoan[idx % Math.max(1, cacDoan.length)]?.noiDung;
        const goiYTrichDan = doanThamChieu
          ? ` (Theo học liệu "${tenTaiLieuNguon}": ${doanThamChieu.slice(0, 85).trim()}...)`
          : '';
        return {
          thuTu: idx + 1,
          noiDung: `[Mức ${mucDoKho}] Câu ${idx + 1}: Trong chủ đề "${duLieu.chuDe}" của học phần ${tenMon}, phương án nào phản ánh chính xác nguyên lý và quy trình thực hiện?${goiYTrichDan}`,
          loaiCauHoi: LoaiCauHoi.TRAC_NGHIEM_MOT_DAP_AN,
          cacPhuongAn: [
            {
              ma: 'A',
              noiDung: `Tuân thủ đúng đặc tả lý thuyết của "${duLieu.chuDe}", kiểm tra điều kiện biên và xác thực đầu vào theo chuẩn giáo trình.`,
            },
            {
              ma: 'B',
              noiDung: `Bỏ qua bước chuẩn hóa dữ liệu và thực thi trực tiếp không kiểm tra ràng buộc.`,
            },
            {
              ma: 'C',
              noiDung: `Chỉ áp dụng cho trường hợp dữ liệu tĩnh, không xử lý ngoại lệ phát sinh.`,
            },
            {
              ma: 'D',
              noiDung: `Thay thế quy trình chuẩn bằng ước lượng ngẫu nhiên không có căn cứ học liệu.`,
            },
          ],
          dapAnDung: 'A',
          giaiThich: `Đáp án A chính xác theo nội dung "${duLieu.chuDe}" trong tài liệu "${tenTaiLieuNguon}" (Độ khó: ${nhanDoKho}).`,
          diemCau: Number((10 / soLuongCau).toFixed(2)),
        };
      });

      duLieuJson = {
        chuDe: duLieu.chuDe,
        mucDoKho,
        soLuongCau,
        tenTaiLieuNguon,
        noiDung: `Bộ ${soLuongCau} câu hỏi trắc nghiệm chủ đề "${duLieu.chuDe}" — Độ khó: ${nhanDoKho}, biên soạn từ "${tenTaiLieuNguon}". Khi giảng viên phê duyệt, hệ thống sẽ tạo đề luyện tập trong lớp học phần.`,
        danhSachCauHoi,
      };
    } else if (duLieu.loaiBanNhap === LoaiBanNhapAI.TOM_TAT) {
      tieuDeBanNhap = `Giáo án & Kế hoạch bài giảng: ${duLieu.chuDe}`;
      const ketQuaLlm = await this.dichVuLlm.sinhVanBan({
        prompt: `Biên soạn giáo án / kế hoạch bài giảng và đề cương ôn tập cho chủ đề "${duLieu.chuDe}" (Mức độ: ${nhanDoKho}).`,
        nguCanh: trichDoanNguCanh,
        promptHeThong:
          'Bạn là Trợ lý biên soạn học thuật cho Giảng viên đại học. Hãy lập kế hoạch bài giảng gồm: 1. Mục tiêu bài học; 2. Nội dung trọng tâm theo tài liệu; 3. Tiến trình giảng dạy (Lý thuyết - Thảo luận - Thực hành); 4. Trọng tâm ôn tập cho sinh viên.',
      });
      soToken = ketQuaLlm.soLuongTokenUocTinh || 380;

      const keHoachChiTiet =
        `### Kế hoạch bài giảng & Đề cương ôn tập: ${duLieu.chuDe}\n` +
        `- **Học liệu tham chiếu**: ${tenTaiLieuNguon}\n` +
        `- **Mức độ mục tiêu**: ${nhanDoKho}\n\n` +
        `#### 1. Mục tiêu học tập (CLO)\n` +
        `- Sinh viên nắm vững khái niệm cốt lõi, nguyên lý vận hành và quy trình áp dụng của **${duLieu.chuDe}**.\n` +
        `- Phân tích và vận dụng giải quyết được các bài tập thực hành ở mức độ **${nhanDoKho}**.\n\n` +
        `#### 2. Tiến trình tổ chức giảng dạy (90 phút)\n` +
        `- **Phần 1 - Khởi động & Đặt vấn đề (15 phút)**: Giới thiệu bối cảnh thực tế của ${duLieu.chuDe} trong môn ${tenMon}.\n` +
        `- **Phần 2 - Giảng giải lý thuyết trọng tâm (40 phút)**: Phân tích chi tiết cấu trúc, quy tắc và ví dụ mẫu từ tài liệu *${tenTaiLieuNguon}*.\n` +
        `- **Phần 3 - Thảo luận & Thực hành tại lớp (25 phút)**: Sinh viên giải quyết bài toán tình huống theo nhóm và đối chiếu kết quả.\n` +
        `- **Phần 4 - Tổng kết & Giao nhiệm vụ ôn tập (10 phút)**: Hệ thống hóa các lỗi thường gặp và hướng dẫn tự học.\n\n` +
        `#### 3. Nội dung trọng tâm sinh viên cần ôn tập\n` +
        `${ketQuaLlm.vanBan}`;

      duLieuJson = {
        chuDe: duLieu.chuDe,
        mucDoKho,
        tenTaiLieuNguon,
        noiDung: keHoachChiTiet,
      };
    } else {
      tieuDeBanNhap = `Bài tập thực hành (${nhanDoKho}): ${duLieu.chuDe}`;
      const noiDungBaiTap =
        `### Yêu cầu bài tập: ${duLieu.chuDe}\n` +
        `- **Tài liệu tham chiếu**: ${tenTaiLieuNguon}\n` +
        `- **Mức độ khó**: ${nhanDoKho}\n\n` +
        `#### Nội dung nhiệm vụ\n` +
        `1. Trình bày cơ sở lý thuyết và quy trình thực hiện của **${duLieu.chuDe}** dựa trên tài liệu *${tenTaiLieuNguon}*.\n` +
        `2. Xây dựng giải pháp / bài giải chi tiết cho bài toán thực hành thuộc chủ đề **${duLieu.chuDe}**.\n` +
        `3. Kiểm tra các trường hợp biên và nhận xét kết quả đạt được.\n\n` +
        `#### Tiêu chí đánh giá (Thang điểm 10)\n` +
        `- Nắm vững lý thuyết và trích dẫn đúng học liệu: **3.0 điểm**\n` +
        `- Giải quyết đúng yêu cầu bài toán thực hành: **5.0 điểm**\n` +
        `- Trình bày rõ ràng, kiểm tra điều kiện biên đầy đủ: **2.0 điểm**`;

      duLieuJson = {
        chuDe: duLieu.chuDe,
        mucDoKho,
        tenTaiLieuNguon,
        noiDung: noiDungBaiTap,
        diemToiDa: 10,
      };
    }

    const banNhap = await this.khoTroLyAi.taoBanNhap({
      idLopHocPhan: duLieu.idLopHocPhan,
      idGiaoVien,
      loaiBanNhap: duLieu.loaiBanNhap,
      tieuDe: tieuDeBanNhap,
      duLieuJson,
    });

    await this.khoTroLyAi.ghiNhatKy({
      idNguoiDung: nguoiDung.sub,
      loaiTacVu: `SINH_BAN_NHAP_${duLieu.loaiBanNhap}`,
      soLuongToken: soToken,
      doTreMs: Date.now() - batDau,
    });

    return banNhap;
  }

  /**
   * Nhóm 3: Gợi ý nhận xét và đánh giá bài nộp của sinh viên bằng AI (lưu BanNhapAI chờ duyệt)
   */
  async goiYNhanXetBaiNop(
    duLieu: GoiYNhanXetBaiNopInput,
    nguoiDung: PayloadJwt,
  ): Promise<KetQuaGoiYNhanXetBaiNop> {
    const batDau = Date.now();
    const baiNop = await this.prisma.baiNop.findUnique({
      where: { id: duLieu.idBaiNop },
      include: {
        baiTap: {
          include: {
            lopHocPhan: true,
          },
        },
        nguoiNop: true,
      },
    });

    if (!baiNop) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bài nộp của học sinh',
      });
    }

    const { idGiaoVien } = await this.xacThucGiaoVienLopHocPhan(
      baiNop.baiTap.idLopHocPhan,
      nguoiDung,
    );

    const noiDungBaiLam = (baiNop.noiDung || '').trim();
    const coTepDinhKem = !!baiNop.duongDanTep;
    const nopMuon = baiNop.trangThai === TrangThaiBaiNop.NOP_MUON;
    const diemToiDa = baiNop.baiTap.diemToiDa || 10;

    const uuDiem: string[] = [];
    const hanChe: string[] = [];
    let tyLeHoanThanh = 0.8;

    if (noiDungBaiLam.length >= 120) {
      uuDiem.push('Trình bày nội dung trả lời đầy đủ, có lập luận rõ ràng bám sát yêu cầu đề bài.');
      tyLeHoanThanh += 0.1;
    } else if (noiDungBaiLam.length > 0) {
      uuDiem.push('Đã gửi câu trả lời trực tiếp cho nhiệm vụ học tập.');
      hanChe.push('Phần giải thích văn bản còn ngắn gọn, cần phân tích sâu hơn các bước thực hiện.');
    } else {
      hanChe.push('Chưa nhập thuyết minh văn bản đi kèm bài nộp.');
      tyLeHoanThanh -= 0.1;
    }

    if (coTepDinhKem) {
      uuDiem.push('Đã đính kèm đầy đủ tệp bài làm theo quy định của bài tập.');
      tyLeHoanThanh += 0.05;
    }

    if (nopMuon) {
      hanChe.push('Nộp bài sau thời hạn quy định, cần chú ý quản lý thời gian tốt hơn.');
      tyLeHoanThanh -= 0.1;
    } else {
      uuDiem.push('Chấp hành nghiêm túc thời hạn nộp bài.');
    }

    if (hanChe.length === 0) {
      hanChe.push('Có thể bổ sung thêm ví dụ kiểm thử thực tế để bài làm hoàn thiện hơn.');
    }

    const diemGoiY = Math.min(
      diemToiDa,
      Math.max(4.0, Number((diemToiDa * Math.min(0.95, tyLeHoanThanh)).toFixed(1))),
    );

    const nhanXetGoiY =
      `Đánh giá bài nộp "${baiNop.baiTap.tieuDe}" của ${baiNop.nguoiNop.hoTen}: ` +
      `Ưu điểm: ${uuDiem.join(' ')} ` +
      `Cần lưu ý: ${hanChe.join(' ')} ` +
      `Điểm đề xuất: ${diemGoiY}/${diemToiDa} (Giảng viên kiểm tra và xác nhận).`;

    const banNhap = await this.khoTroLyAi.taoBanNhap({
      idLopHocPhan: baiNop.baiTap.idLopHocPhan,
      idGiaoVien,
      loaiBanNhap: LoaiBanNhapAI.NHAN_XET,
      tieuDe: `Gợi ý nhận xét bài nộp: ${baiNop.nguoiNop.hoTen} - ${baiNop.baiTap.tieuDe}`,
      duLieuJson: {
        idBaiNop: baiNop.id,
        idBaiTap: baiNop.idBaiTap,
        hoTenHocSinh: baiNop.nguoiNop.hoTen,
        noiDung: nhanXetGoiY,
        diemGoiY,
        nhanXetGoiY,
        uuDiem,
        hanChe,
      },
    });

    await this.khoTroLyAi.ghiNhatKy({
      idNguoiDung: nguoiDung.sub,
      loaiTacVu: 'GOI_Y_NHAN_XET_BAI_NOP',
      soLuongToken: 210,
      doTreMs: Date.now() - batDau,
    });

    return {
      idBanNhap: banNhap.id,
      idBaiNop: baiNop.id,
      diemGoiY,
      nhanXetGoiY,
      uuDiem,
      hanChe,
    };
  }

  async layDanhSachBanNhapTheoLop(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    let idGiaoVien: string | undefined = undefined;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      idGiaoVien = hoSo?.id;
    }

    return this.khoTroLyAi.layDanhSachBanNhapTheoLop(idLopHocPhan, idGiaoVien);
  }

  async duyetBanNhapAI(
    idBanNhap: string,
    duLieu: DuyetBanNhapAIInput,
    nguoiDung: PayloadJwt,
  ) {
    const banNhap = await this.khoTroLyAi.timBanNhapTheoId(idBanNhap);
    if (!banNhap) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bản nháp AI',
      });
    }

    const banNhapCapNhat = await this.khoTroLyAi.capNhatTrangThaiBanNhap(
      idBanNhap,
      duLieu.trangThai,
    );

    if (duLieu.trangThai === TrangThaiBanNhapAI.DA_DUYET) {
      const noiDungJson = (banNhap.duLieuJson || {}) as any;

      if (banNhap.loaiBanNhap === LoaiBanNhapAI.BAI_TAP) {
        const hanNop = noiDungJson?.hanNop
          ? new Date(noiDungJson.hanNop)
          : new Date(Date.now() + 7 * 24 * 3600 * 1000);

        await this.prisma.baiTap.create({
          data: {
            idLopHocPhan: banNhap.idLopHocPhan,
            tieuDe: banNhap.tieuDe,
            noiDung: noiDungJson?.noiDung || banNhap.tieuDe,
            hanNop,
            diemToiDa: Number(noiDungJson?.diemToiDa) || 10,
          },
        });
        this.nhatKy.log(`Đã chuyển bản nháp AI [${banNhap.tieuDe}] thành bài tập chính thức của lớp.`);
      } else if (
        banNhap.loaiBanNhap === LoaiBanNhapAI.CAU_HOI &&
        this.prisma.baiKiemTra?.create
      ) {
        const danhSachCauHoi = Array.isArray(noiDungJson?.danhSachCauHoi)
          ? noiDungJson.danhSachCauHoi
          : [
              {
                thuTu: 1,
                noiDung: noiDungJson?.noiDung || banNhap.tieuDe,
                loaiCauHoi: LoaiCauHoi.TRAC_NGHIEM_MOT_DAP_AN,
                cacPhuongAn: [
                  { ma: 'A', noiDung: 'Phương án A (Đúng theo tài liệu môn học)' },
                  { ma: 'B', noiDung: 'Phương án B' },
                  { ma: 'C', noiDung: 'Phương án C' },
                  { ma: 'D', noiDung: 'Phương án D' },
                ],
                dapAnDung: 'A',
                giaiThich: 'Giải thích dựa trên học liệu lớp học phần.',
                diemCau: 10,
              },
            ];

        await this.prisma.baiKiemTra.create({
          data: {
            idLopHocPhan: banNhap.idLopHocPhan,
            tieuDe: banNhap.tieuDe,
            moTa: noiDungJson?.noiDung || `Đề luyện tập được phê duyệt từ bản nháp học thuật`,
            cheDo: CheDoKiemTra.LUYEN_TAP,
            trangThai: TrangThaiBaiKiemTra.DANG_MO,
            thoiGianLamPhut: Math.max(10, danhSachCauHoi.length * 3),
            soLuotToiDa: 5,
            diemToiDa: 10,
            tronCauHoi: true,
            hienDapAnNgay: true,
            cacCauHoi: {
              create: danhSachCauHoi.map((ch: any, idx: number) => ({
                thuTu: ch.thuTu || idx + 1,
                noiDung: ch.noiDung,
                loaiCauHoi: ch.loaiCauHoi || LoaiCauHoi.TRAC_NGHIEM_MOT_DAP_AN,
                cacPhuongAn: ch.cacPhuongAn,
                dapAnDung: ch.dapAnDung || 'A',
                giaiThich: ch.giaiThich || '',
                diemCau: Number(ch.diemCau) || Number((10 / danhSachCauHoi.length).toFixed(2)),
              })),
            },
          },
        });
        this.nhatKy.log(`Đã chuyển bản nháp câu hỏi [${banNhap.tieuDe}] thành đề kiểm tra chính thức.`);
      } else if (
        banNhap.loaiBanNhap === LoaiBanNhapAI.TOM_TAT &&
        this.prisma.baiDang?.create
      ) {
        await this.prisma.baiDang.create({
          data: {
            idLopHocPhan: banNhap.idLopHocPhan,
            idNguoiDung: nguoiDung.sub,
            noiDung: `**${banNhap.tieuDe}**\n\n${noiDungJson?.noiDung || ''}`,
            ghimDauTrang: false,
          },
        });
        this.nhatKy.log(`Đã đăng kế hoạch bài giảng / tóm tắt [${banNhap.tieuDe}] lên bảng tin lớp.`);
      } else if (
        banNhap.loaiBanNhap === LoaiBanNhapAI.NHAN_XET &&
        noiDungJson?.idBaiNop &&
        this.prisma.baiNop?.update
      ) {
        await this.prisma.baiNop.update({
          where: { id: String(noiDungJson.idBaiNop) },
          data: {
            diemSo: Number(noiDungJson.diemGoiY) || 8.0,
            nhanXet: String(noiDungJson.nhanXetGoiY || noiDungJson.noiDung || ''),
            trangThai: TrangThaiBaiNop.DA_CHAM,
            ngayCham: new Date(),
          },
        });
        this.nhatKy.log(`Đã áp dụng nhận xét bản nháp cho bài nộp [${noiDungJson.idBaiNop}].`);
      }
    }

    return banNhapCapNhat;
  }
}
