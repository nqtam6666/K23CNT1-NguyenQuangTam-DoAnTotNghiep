import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { KhoTroLyAiRepository } from './kho-tro-ly-ai.repository';
import { DichVuEmbeddingService } from './dich-vu-embedding.service';
import {
  PayloadJwt,
  VaiTro,
  LoaiBanNhapAI,
  TrangThaiBanNhapAI,
  GuiTinNhanTroLyInput,
  TaoBanNhapAIInput,
  DuyetBanNhapAIInput,
  NguonTrichDan,
  KetQuaHoiDapAI,
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
    private readonly prisma: PrismaService,
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

    // Kiểm tra quyền: Admin hoặc Giáo viên phụ trách lớp
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

    // Đọc nội dung tệp từ ổ đĩa
    let noiDungVanBan = `${taiLieu.tieuDe}\n${taiLieu.moTa || ''}\n`;

    const duongDanVatLy = join(process.cwd(), taiLieu.duongDanTep.replace(/^\//, ''));
    if (existsSync(duongDanVatLy)) {
      try {
        const noiDungTep = readFileSync(duongDanVatLy, 'utf-8');
        // Lọc chuỗi có ý nghĩa
        const chuoiSach = noiDungTep.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');
        noiDungVanBan += `\n${chuoiSach}`;
      } catch (e) {
        this.nhatKy.warn(`Không thể đọc toàn văn tệp nhị phân ${duongDanVatLy}, sử dụng metadata tóm tắt.`);
      }
    }

    // Chia đoạn
    const cacDoan = this.dichVuEmbedding.tachDoanVanBan(noiDungVanBan, 600, 120);

    // Xóa các đoạn cũ của tài liệu này (nếu đã từng nạp)
    await this.khoTroLyAi.xoaDoanTheoTaiLieu(idTaiLieu);

    // Tính vector và lưu vào pgvector
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

    // Nếu không truyền idLopYeuCau, tìm tất cả lớp người dùng tham gia
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
   * Pipeline hỏi đáp Trợ lý AI có lọc quyền (Pre-filtering RAG)
   */
  async hoiDap(duLieu: GuiTinNhanTroLyInput, nguoiDung: PayloadJwt): Promise<KetQuaHoiDapAI> {
    const thoiDiemBatDau = Date.now();

    // 1. Quản lý phiên hội thoại
    let idPhien = duLieu.idPhien;
    if (!idPhien) {
      const tieuDePhien =
        duLieu.noiDung.length > 40
          ? `${duLieu.noiDung.slice(0, 40)}...`
          : duLieu.noiDung;
      const phienMoi = await this.khoTroLyAi.taoPhien(nguoiDung.sub, tieuDePhien);
      idPhien = phienMoi.id;
    } else {
      await this.layChiTietPhien(idPhien, nguoiDung);
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
        tinNhanNguoiDung: tinNhanNguoiDung as any,
        tinNhanTroLy: tinNhanTroLy as any,
        danhSachTrichDan: [],
      };
    }

    // 4. Lấy danh sách ID lớp người dùng được phép truy cập (Pre-filtering)
    const danhSachIdLop = await this.layDanhSachIdLopDuocPhep(
      nguoiDung,
      duLieu.idLopHocPhan,
    );

    let noiDungTraLoi = '';
    const danhSachTrichDan: NguonTrichDan[] = [];

    if (danhSachIdLop.length === 0) {
      noiDungTraLoi =
        'Bạn chưa được ghi danh vào bất kỳ lớp học phần nào, hoặc không có tài liệu học tập phù hợp để truy hồi.';
    } else {
      // 5. Tạo vector embedding cho câu hỏi
      const vectorCauHoi = await this.dichVuEmbedding.taoVectorEmbedding(duLieu.noiDung);

      // 6. Truy hồi ngữ cảnh tương đồng qua pgvector có Pre-filtering
      const cacDoan = await this.khoTroLyAi.truyHoiDoanTuongDong(
        vectorCauHoi,
        danhSachIdLop,
        4,
      );

      // Tính điểm Hybrid (Cosine pgvector + Trùng khớp từ khóa ngữ nghĩa)
      const tuKhoa = duLieu.noiDung
        .toLowerCase()
        .split(/[\s,.;:!?()\[\]{}'"]+/)
        .filter((w) => w.length >= 2);

      const doanXepHang = cacDoan.map((doan) => {
        const noiDungThuong = doan.noiDung.toLowerCase();
        const soTuKhop = tuKhoa.filter((w) => noiDungThuong.includes(w)).length;
        const tyLeKhopTuKhoa = tuKhoa.length > 0 ? soTuKhop / tuKhoa.length : 0;
        const diemKetHop = Math.max(0, doan.doTuongDong * 0.6 + tyLeKhopTuKhoa * 0.4);
        return {
          ...doan,
          soTuKhop,
          diemKetHop,
        };
      });

      // Sắp xếp theo điểm kết hợp giảm dần
      doanXepHang.sort((a, b) => b.diemKetHop - a.diemKetHop);

      // Ngưỡng phù hợp: có ít nhất 1 từ khóa trùng khớp hoặc điểm tương đồng vector cao
      const doanPhuHop = doanXepHang.filter(
        (d) => (d.soTuKhop > 0 && d.diemKetHop >= 0.1) || d.doTuongDong >= 0.25,
      );

      if (doanPhuHop.length === 0) {
        noiDungTraLoi =
          'Tôi không tìm thấy thông tin này trong tài liệu học tập của lớp học phần. Bạn vui lòng tra cứu thêm giáo trình hoặc trao đổi trực tiếp với giáo viên phụ trách nhé!';
      } else {
        // Thu thập nguồn trích dẫn
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

        // Tổng hợp câu trả lời dựa trên ngữ cảnh được trích xuất
        const doanChinh = doanPhuHop[0];
        noiDungTraLoi = `Dựa trên tài liệu **"${doanChinh.tieuDeTaiLieu}"** của lớp học:\n\n${doanChinh.noiDung}\n\n`;

        if (doanPhuHop.length > 1) {
          const doanBoSung = doanPhuHop[1];
          noiDungTraLoi += `**Thông tin bổ sung:**\n${doanBoSung.noiDung}\n\n`;
        }

        noiDungTraLoi += `Hy vọng câu trả lời trên giúp ích cho bạn trong quá trình ôn tập và làm bài!`;
      }
    }

    // 7. Lưu tin nhắn trợ lý kèm trích dẫn
    const tinNhanTroLy = await this.khoTroLyAi.taoTinNhan({
      idPhien,
      vaiTro: 'assistant',
      noiDung: noiDungTraLoi,
      trichDan: danhSachTrichDan,
    });

    // 8. Ghi nhật ký kiểm toán AI
    await this.khoTroLyAi.ghiNhatKy({
      idNguoiDung: nguoiDung.sub,
      loaiTacVu: 'RAG_CHAT',
      soLuongToken: Math.round((duLieu.noiDung.length + noiDungTraLoi.length) / 4),
      doTreMs: Date.now() - thoiDiemBatDau,
    });

    return {
      idPhien,
      tinNhanNguoiDung: tinNhanNguoiDung as any,
      tinNhanTroLy: tinNhanTroLy as any,
      danhSachTrichDan,
    };
  }

  // ==========================================
  // BẢN NHÁP AI (RULE 04: HUMAN-IN-THE-LOOP)
  // ==========================================

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

    // Human-in-the-loop: Nếu giáo viên DUYỆT bản nháp bài tập -> tự động tạo bài tập chính thức
    if (
      duLieu.trangThai === TrangThaiBanNhapAI.DA_DUYET &&
      banNhap.loaiBanNhap === LoaiBanNhapAI.BAI_TAP
    ) {
      const noiDungJson = banNhap.duLieuJson as any;
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
    }

    return banNhapCapNhat;
  }
}
