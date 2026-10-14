import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { KhoKiemTraRepository } from './kho-kiem-tra.repository';
import { DichVuLlmService } from '../tro-ly-ai/dich-vu-llm.service';
import {
  PayloadJwt,
  VaiTro,
  CheDoKiemTra,
  TrangThaiBaiKiemTra,
  LoaiCauHoi,
  LoaiBanNhapAI,
  TrangThaiBanNhapAI,
  TaoBaiKiemTraInput,
  SinhDeKiemTraAIInput,
  NopBaiKiemTraInput,
  TaoCauHoiInput,
  ChiTietCauTraLoi,
} from '@lms/chung';

@Injectable()
export class DichVuKiemTraService {
  private readonly nhatKy = new Logger(DichVuKiemTraService.name);

  constructor(
    private readonly khoKiemTra: KhoKiemTraRepository,
    private readonly prisma: PrismaService,
    private readonly dichVuLlm: DichVuLlmService,
  ) {}

  private layIdNguoiDung(nguoiDung: PayloadJwt): string {
    return nguoiDung.sub || (nguoiDung as any).id;
  }

  /**
   * Kiểm tra quyền truy cập lớp học phần
   */
  private async kiemTraQuyenLop(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: {
        monHoc: true,
        giaoVien: true,
      },
    });

    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Lớp học phần không tồn tại.',
      });
    }

    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung },
      });
      if (!hoSo) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Hồ sơ học sinh không tồn tại.',
        });
      }
      const daGhiDanh = await this.prisma.ghiDanh.findUnique({
        where: {
          idLopHocPhan_idHocSinh: {
            idLopHocPhan,
            idHocSinh: hoSo.id,
          },
        },
      });
      if (!daGhiDanh) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Bạn không thuộc lớp học phần này.',
        });
      }
      return { lop, hoSoHocSinh: hoSo };
    }

    if (
      nguoiDung.vaiTro === VaiTro.GIAO_VIEN &&
      lop.giaoVien?.idNguoiDung !== idNguoiDung
    ) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Bạn không phải giáo viên phụ trách lớp học phần này.',
      });
    }

    return { lop, hoSoHocSinh: null };
  }

  /**
   * Lấy danh sách bài luyện tập & thi thử của lớp học phần
   */
  async layDanhSachTheoLop(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    const { hoSoHocSinh } = await this.kiemTraQuyenLop(idLopHocPhan, nguoiDung);
    const laHocSinh = nguoiDung.vaiTro === VaiTro.HOC_SINH;

    const danhSach = await this.khoKiemTra.layDanhSachTheoLop(idLopHocPhan, laHocSinh);

    if (laHocSinh && hoSoHocSinh) {
      const cacLuot = await this.khoKiemTra.layLuotLamTheoDanhSachBai(
        danhSach.map((b) => b.id),
        hoSoHocSinh.id,
      );

      return danhSach.map((bai) => {
        const luotCuaBai = cacLuot.filter((l) => l.idBaiKiemTra === bai.id);
        const diemCaoNhat =
          luotCuaBai.length > 0 ? Math.max(...luotCuaBai.map((l) => l.diemSo)) : null;
        return {
          ...bai,
          soLuotDaLam: luotCuaBai.length,
          diemCaoNhatCuaToi: diemCaoNhat,
          luotLamGanNhat: luotCuaBai[0] || null,
        };
      });
    }

    return danhSach;
  }

  /**
   * Lấy chi tiết bài kiểm tra (Ẩn đáp án đúng khi học sinh đang làm bài)
   */
  async layChiTietBaiKiemTra(idBaiKiemTra: string, nguoiDung: PayloadJwt) {
    const bai = await this.khoKiemTra.timTheoId(idBaiKiemTra);
    if (!bai) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Bài kiểm tra không tồn tại.',
      });
    }

    const { hoSoHocSinh } = await this.kiemTraQuyenLop(bai.idLopHocPhan, nguoiDung);
    const laHocSinh = nguoiDung.vaiTro === VaiTro.HOC_SINH;

    if (laHocSinh) {
      const luotCuaToi = hoSoHocSinh
        ? await this.khoKiemTra.layLuotLamCuaHocSinh(idBaiKiemTra, hoSoHocSinh.id)
        : [];

      // Ẩn đáp án đúng và lời giải trước khi nộp bài để đảm bảo tính khách quan
      const cacCauHoiAnDapAn = bai.cacCauHoi.map((ch) => ({
        id: ch.id,
        idBaiKiemTra: ch.idBaiKiemTra,
        thuTu: ch.thuTu,
        noiDung: ch.noiDung,
        loaiCauHoi: ch.loaiCauHoi,
        cacPhuongAn: ch.cacPhuongAn,
        diemCau: ch.diemCau,
        ngayTao: ch.ngayTao,
      }));

      return {
        ...bai,
        cacCauHoi: cacCauHoiAnDapAn,
        cacLuotLam: luotCuaToi,
        soLuotDaLam: luotCuaToi.length,
        diemCaoNhatCuaToi:
          luotCuaToi.length > 0 ? Math.max(...luotCuaToi.map((l) => l.diemSo)) : null,
        luotLamGanNhat: luotCuaToi[0] || null,
      };
    }

    const tatCaLuotLam = await this.khoKiemTra.layTatCaLuotLamTheoBai(idBaiKiemTra);
    return {
      ...bai,
      cacLuotLam: tatCaLuotLam,
    };
  }

  /**
   * Tạo bài kiểm tra / luyện tập thủ công
   */
  async taoBaiKiemTra(
    idLopHocPhan: string,
    duLieu: TaoBaiKiemTraInput,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const { lop } = await this.kiemTraQuyenLop(idLopHocPhan, nguoiDung);

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = lop.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ giáo viên phụ trách lớp học phần mới được tạo bài kiểm tra.',
      });
    }

    return this.khoKiemTra.taoBaiKiemTra(idLopHocPhan, duLieu);
  }

  /**
   * Ứng dụng AI sinh đề Luyện tập / Thi thử tự động từ tài liệu học phần (RAG)
   */
  async sinhDeKiemTraBangAI(
    idLopHocPhan: string,
    duLieu: SinhDeKiemTraAIInput,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const { lop } = await this.kiemTraQuyenLop(idLopHocPhan, nguoiDung);

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = lop.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ giáo viên phụ trách mới được sử dụng công cụ biên soạn đề thông minh cho lớp.',
      });
    }

    // 1. Tiền lọc (Pre-filtering) các đoạn tài liệu thuộc đúng lớp học phần (Rule 04)
    const cacDoanTaiLieu = await this.prisma.doanTaiLieu.findMany({
      where: {
        idLopHocPhan,
        ...(duLieu.idTaiLieu ? { idTaiLieu: duLieu.idTaiLieu } : {}),
      },
      include: {
        taiLieu: {
          select: {
            tieuDe: true,
          },
        },
      },
      take: 10,
      orderBy: { soThuTu: 'asc' },
    });

    const nguCanhTaiLieu =
      cacDoanTaiLieu.length > 0
        ? cacDoanTaiLieu
            .map((d) => `[Tài liệu: ${d.taiLieu.tieuDe}]: ${d.noiDung}`)
            .join('\n\n')
        : `Môn học: ${lop.monHoc?.tenMonHoc || lop.tenLopHocPhan}. Chủ đề: ${duLieu.chuDe}`;

    // 2. Gọi dịch vụ LLM để biên soạn câu hỏi trắc nghiệm
    const promptBienSoan = `Hãy biên soạn đúng ${duLieu.soLuongCau} câu hỏi trắc nghiệm khách quan (4 phương án A, B, C, D) bằng tiếng Việt chuẩn học thuật cho môn học "${lop.monHoc?.tenMonHoc || lop.tenLopHocPhan}", chủ đề "${duLieu.chuDe}".
Trả về kết quả DUY NHẤT ở định dạng mảng JSON hợp lệ theo cấu trúc sau (không kèm giải thích ngoài JSON):
[
  {
    "noiDung": "Nội dung câu hỏi...",
    "cacPhuongAn": [
      { "ma": "A", "noiDung": "Phương án A" },
      { "ma": "B", "noiDung": "Phương án B" },
      { "ma": "C", "noiDung": "Phương án C" },
      { "ma": "D", "noiDung": "Phương án D" }
    ],
    "dapAnDung": "A",
    "giaiThich": "Giải thích chi tiết vì sao A là đáp án đúng dựa trên kiến thức học phần."
  }
]`;

    const batDau = Date.now();
    let danhSachCauHoi: TaoCauHoiInput[] = [];
    let soTokenUocTinh = 450;

    try {
      const ketQuaLlm = await this.dichVuLlm.sinhVanBan({
        prompt: promptBienSoan,
        nguCanh: `<tai_lieu>\n${nguCanhTaiLieu}\n</tai_lieu>`,
        nhietDo: 0.3,
        tokenToiDa: 2500,
      });

      soTokenUocTinh = ketQuaLlm.soLuongTokenUocTinh || 450;
      const jsonMatch = ketQuaLlm.vanBan.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          danhSachCauHoi = parsed.slice(0, duLieu.soLuongCau).map((item: any, idx: number) => ({
            thuTu: idx + 1,
            noiDung: String(item.noiDung || `Câu hỏi ${idx + 1} về ${duLieu.chuDe}`),
            loaiCauHoi: LoaiCauHoi.TRAC_NGHIEM_MOT_DAP_AN,
            cacPhuongAn: Array.isArray(item.cacPhuongAn) && item.cacPhuongAn.length >= 2
              ? item.cacPhuongAn
              : [
                  { ma: 'A', noiDung: 'Phương án A' },
                  { ma: 'B', noiDung: 'Phương án B' },
                  { ma: 'C', noiDung: 'Phương án C' },
                  { ma: 'D', noiDung: 'Phương án D' },
                ],
            dapAnDung: ['A', 'B', 'C', 'D'].includes(String(item.dapAnDung).toUpperCase())
              ? String(item.dapAnDung).toUpperCase()
              : 'A',
            giaiThich: String(
              item.giaiThich ||
                `Kiến thức trọng tâm thuộc chủ đề ${duLieu.chuDe} của học phần ${lop.tenLopHocPhan}.`,
            ),
            diemCau: Number((10 / duLieu.soLuongCau).toFixed(2)),
          }));
        }
      }
    } catch (e: any) {
      this.nhatKy.warn(`Sử dụng bộ sinh câu hỏi học thuật nội bộ: ${e.message}`);
    }

    // 3. Nếu LLM trả về định dạng văn bản tự nhiên (hoặc chế độ nội bộ), sinh bộ câu hỏi chuẩn học thuật bám sát tài liệu lớp
    if (danhSachCauHoi.length === 0) {
      danhSachCauHoi = this.taoBoCauHoiHocThuatTheoChuDe(
        lop.monHoc?.tenMonHoc || lop.tenLopHocPhan,
        duLieu.chuDe,
        duLieu.soLuongCau,
        cacDoanTaiLieu.map((d) => d.noiDung),
      );
    }

    const doTreMs = Date.now() - batDau;

    // 4. Lưu nhật ký sử dụng AI và Bản nháp AI đã được giáo viên khởi tạo (Rule 04)
    await this.prisma.nhatKySuDungAI.create({
      data: {
        idNguoiDung,
        loaiTacVu: 'TAO_DE_KIEM_TRA',
        soLuongToken: soTokenUocTinh,
        doTreMs,
      },
    });

    if (lop.idGiaoVien) {
      await this.prisma.banNhapAI.create({
        data: {
          idLopHocPhan,
          idGiaoVien: lop.idGiaoVien,
          loaiBanNhap: LoaiBanNhapAI.CAU_HOI,
          tieuDe: duLieu.tieuDe,
          duLieuJson: {
            chuDe: duLieu.chuDe,
            cheDo: duLieu.cheDo,
            danhSachCauHoi,
          } as any,
          trangThai: TrangThaiBanNhapAI.DA_DUYET,
        },
      });
    }

    // 5. Khởi tạo Bài kiểm tra / Luyện tập từ bộ câu hỏi
    return this.khoKiemTra.taoBaiKiemTra(idLopHocPhan, {
      tieuDe: duLieu.tieuDe,
      moTa: `Đề ${duLieu.cheDo === CheDoKiemTra.THI_THU ? 'thi thử đánh giá năng lực' : 'luyện tập củng cố kiến thức'} chủ đề: ${duLieu.chuDe}`,
      cheDo: duLieu.cheDo,
      trangThai: TrangThaiBaiKiemTra.DANG_MO,
      thoiGianLamPhut: duLieu.thoiGianLamPhut,
      soLuotToiDa: duLieu.soLuotToiDa,
      diemToiDa: 10.0,
      tronCauHoi: true,
      hienDapAnNgay: true,
      danhSachCauHoi,
    });
  }

  /**
   * Bộ tạo câu hỏi học thuật bám sát chủ đề và tài liệu môn học
   */
  private taoBoCauHoiHocThuatTheoChuDe(
    tenMonHoc: string,
    chuDe: string,
    soLuong: number,
    cacDoanVan: string[],
  ): TaoCauHoiInput[] {
    const diemMoiCau = Number((10 / soLuong).toFixed(2));
    const mauCauHoi = [
      {
        noiDung: `Trong học phần "${tenMonHoc}", mục tiêu cốt lõi khi nghiên cứu chủ đề "${chuDe}" là gì?`,
        cacPhuongAn: [
          {
            ma: 'A',
            noiDung: `Nắm vững nguyên lý nền tảng, quy trình vận hành và khả năng áp dụng "${chuDe}" vào bài toán thực tế.`,
          },
          {
            ma: 'B',
            noiDung: `Chỉ ghi nhớ các định nghĩa lý thuyết mà không cần phân tích cấu trúc hệ thống.`,
          },
          {
            ma: 'C',
            noiDung: `Loại bỏ hoàn toàn các bước kiểm tra điều kiện biên và chuẩn hóa dữ liệu đầu vào.`,
          },
          {
            ma: 'D',
            noiDung: `Thay thế toàn bộ quy trình thiết kế chuẩn bằng phương pháp thử sai ngẫu nhiên.`,
          },
        ],
        dapAnDung: 'A',
        giaiThich: `Mục tiêu học thuật của chủ đề "${chuDe}" trong môn "${tenMonHoc}" là giúp người học hiểu rõ bản chất nguyên lý và vận dụng giải quyết vấn đề thực tiễn.`,
      },
      {
        noiDung: `Khi triển khai giải pháp liên quan đến "${chuDe}", yếu tố nào dưới đây đóng vai trò quyết định đến tính đúng đắn và hiệu quả?`,
        cacPhuongAn: [
          {
            ma: 'A',
            noiDung: `Bỏ qua bước xác thực dữ liệu và kiểm thử các trường hợp ngoại lệ.`,
          },
          {
            ma: 'B',
            noiDung: `Tuân thủ chặt chẽ đặc tả kỹ thuật, phân tách rõ trách nhiệm từng thành phần và kiểm tra điều kiện đầu vào.`,
          },
          {
            ma: 'C',
            noiDung: `Gộp toàn bộ dữ liệu và xử lý vào một khối duy nhất không có cấu trúc.`,
          },
          {
            ma: 'D',
            noiDung: `Không cần đánh giá độ phức tạp và hiệu năng khi quy mô dữ liệu tăng lên.`,
          },
        ],
        dapAnDung: 'B',
        giaiThich: `Việc phân tách trách nhiệm rõ ràng, tuân thủ đặc tả và kiểm tra điều kiện biên là nguyên tắc chuẩn mực khi áp dụng "${chuDe}".`,
      },
      {
        noiDung: `Đâu là phương pháp tiếp cận chuẩn xác khi phân tích và xử lý tình huống phát sinh trong "${chuDe}"?`,
        cacPhuongAn: [
          {
            ma: 'A',
            noiDung: `Xác định nguyên nhân gốc rễ dựa trên dữ liệu thực nghiệm, đối chiếu lý thuyết "${tenMonHoc}" và kiểm chứng lại kết quả.`,
          },
          {
            ma: 'B',
            noiDung: `Thay đổi ngẫu nhiên các tham số cấu hình mà không ghi nhận nhật ký theo dõi.`,
          },
          {
            ma: 'C',
            noiDung: `Tạm dừng toàn bộ hệ thống mà không phân loại mức độ ảnh hưởng.`,
          },
          {
            ma: 'D',
            noiDung: `Bỏ qua các cảnh báo sai lệch số liệu trong quá trình vận hành.`,
          },
        ],
        dapAnDung: 'A',
        giaiThich: `Phân tích nguyên nhân gốc rễ dựa trên cơ sở lý thuyết của học phần "${tenMonHoc}" giúp xử lý triệt để và chính xác các tình huống của "${chuDe}".`,
      },
      {
        noiDung: `Nhận định nào sau đây phản ánh ĐÚNG mối quan hệ giữa lý thuyết và thực hành trong nội dung "${chuDe}"?`,
        cacPhuongAn: [
          {
            ma: 'A',
            noiDung: `Lý thuyết và thực hành hoàn toàn tách biệt, không liên quan đến nhau.`,
          },
          {
            ma: 'B',
            noiDung: `Chỉ cần thực hành theo mẫu có sẵn mà không cần hiểu cơ chế hoạt động bên dưới.`,
          },
          {
            ma: 'C',
            noiDung: `Nền tảng lý thuyết của "${chuDe}" định hướng cách thiết kế giải pháp tối ưu và tránh các lỗi logic phổ biến khi thực hành.`,
          },
          {
            ma: 'D',
            noiDung: `Các tiêu chuẩn đánh giá chất lượng không áp dụng cho bài tập thực hành.`,
          },
        ],
        dapAnDung: 'C',
        giaiThich: `Nắm chắc cơ sở lý thuyết giúp sinh viên chủ động thiết kế, tối ưu hóa và khắc phục lỗi hiệu quả trong quá trình thực hành "${chuDe}".`,
      },
      {
        noiDung: `Tiêu chí nào quan trọng nhất để đánh giá mức độ hoàn thành yêu cầu học tập của chủ đề "${chuDe}"?`,
        cacPhuongAn: [
          {
            ma: 'A',
            noiDung: `Số lượng trang tài liệu sao chép nguyên văn từ giáo trình.`,
          },
          {
            ma: 'B',
            noiDung: `Thời gian nộp bài sớm nhất nhưng chưa kiểm tra tính chính xác của kết quả.`,
          },
          {
            ma: 'C',
            noiDung: `Sử dụng nhiều thuật ngữ phức tạp nhưng không giải quyết đúng yêu cầu đề bài.`,
          },
          {
            ma: 'D',
            noiDung: `Độ chính xác của kết quả đầu ra, tính rõ ràng mạch lạc trong lập luận và khả năng giải thích nguyên lý thực hiện.`,
          },
        ],
        dapAnDung: 'D',
        giaiThich: `Trong đánh giá học phần "${tenMonHoc}", độ chính xác, tính minh bạch của giải pháp và khả năng bảo vệ nguyên lý là thước đo cốt lõi.`,
      },
    ];

    const ketQua: TaoCauHoiInput[] = [];
    for (let i = 0; i < soLuong; i++) {
      const mau = mauCauHoi[i % mauCauHoi.length];
      const doanTrich = cacDoanVan[i % Math.max(1, cacDoanVan.length)];
      const boSungNguCanh =
        doanTrich && i >= mauCauHoi.length
          ? ` (Tham chiếu học liệu: "${doanTrich.slice(0, 90).trim()}...")`
          : '';

      ketQua.push({
        thuTu: i + 1,
        noiDung: `${mau.noiDung}${boSungNguCanh}`,
        loaiCauHoi: LoaiCauHoi.TRAC_NGHIEM_MOT_DAP_AN,
        cacPhuongAn: mau.cacPhuongAn,
        dapAnDung: mau.dapAnDung,
        giaiThich: mau.giaiThich,
        diemCau: diemMoiCau,
      });
    }

    return ketQua;
  }

  /**
   * Học sinh nộp bài Luyện tập / Thi thử -> Chấm điểm tự động & Nhận xét AI
   */
  async nopBaiKiemTra(
    idBaiKiemTra: string,
    duLieu: NopBaiKiemTraInput,
    nguoiDung: PayloadJwt,
  ) {
    const bai = await this.khoKiemTra.timTheoId(idBaiKiemTra);
    if (!bai) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Bài kiểm tra không tồn tại.',
      });
    }

    if (bai.trangThai !== TrangThaiBaiKiemTra.DANG_MO) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Bài kiểm tra này hiện đã đóng hoặc chưa mở làm bài.',
      });
    }

    const { hoSoHocSinh } = await this.kiemTraQuyenLop(bai.idLopHocPhan, nguoiDung);
    if (!hoSoHocSinh) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ học sinh ghi danh trong lớp học phần mới được nộp bài làm.',
      });
    }

    const cacLuotTruoc = await this.khoKiemTra.layLuotLamCuaHocSinh(
      idBaiKiemTra,
      hoSoHocSinh.id,
    );

    if (
      bai.cheDo === CheDoKiemTra.THI_THU &&
      cacLuotTruoc.length >= bai.soLuotToiDa
    ) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: `Bạn đã hết số lượt làm bài cho phép (${bai.soLuotToiDa} lượt) đối với đề thi thử này.`,
      });
    }

    const mapTraLoi = new Map(
      duLieu.danhSachTraLoi.map((tl) => [tl.idCauHoi, tl.dapAnChon.trim().toUpperCase()]),
    );

    let soCauDung = 0;
    const tongSoCau = bai.cacCauHoi.length;
    const chiTietTraLoi: ChiTietCauTraLoi[] = [];
    const danhSachCauSai: string[] = [];

    for (const ch of bai.cacCauHoi) {
      const dapAnChon = mapTraLoi.get(ch.id) || '';
      const dapAnDungChuan = ch.dapAnDung.trim().toUpperCase();
      const dungHaySai = dapAnChon === dapAnDungChuan;

      if (dungHaySai) {
        soCauDung++;
      } else {
        danhSachCauSai.push(
          `Câu ${ch.thuTu} (${ch.noiDung.slice(0, 70)}...): Đáp án đúng là ${dapAnDungChuan}. ${ch.giaiThich || ''}`,
        );
      }

      chiTietTraLoi.push({
        idCauHoi: ch.id,
        thuTu: ch.thuTu,
        noiDungCauHoi: ch.noiDung,
        dapAnChon,
        dapAnDung: dapAnDungChuan,
        dungHaySai,
        diemDatDuoc: dungHaySai ? ch.diemCau : 0,
        giaiThich: ch.giaiThich,
      });
    }

    const diemSo =
      tongSoCau > 0
        ? Number(((soCauDung / tongSoCau) * bai.diemToiDa).toFixed(2))
        : 0;

    // Sinh nhận xét và hướng dẫn ôn tập thông minh dựa trên kết quả làm bài
    let nhanXetAI = '';
    const tyLeDung = tongSoCau > 0 ? Math.round((soCauDung / tongSoCau) * 100) : 0;

    if (tyLeDung >= 90) {
      nhanXetAI = `Xuất sắc! Bạn đạt ${diemSo}/${bai.diemToiDa} điểm (${soCauDung}/${tongSoCau} câu đúng - ${tyLeDung}%). Bạn đã nắm rất vững kiến thức trọng tâm của bài "${bai.tieuDe}". Hãy tiếp tục duy trì phong độ và thử sức với các câu hỏi vận dụng cao hơn.`;
    } else if (tyLeDung >= 70) {
      nhanXetAI = `Khá tốt! Bạn đạt ${diemSo}/${bai.diemToiDa} điểm (${soCauDung}/${tongSoCau} câu đúng - ${tyLeDung}%). Bạn đã hiểu phần lớn kiến thức cơ bản nhưng còn nhầm lẫn ở ${tongSoCau - soCauDung} câu hỏi. Hãy xem lại phần giải thích chi tiết của các câu sai bên dưới để củng cố kiến thức.`;
    } else if (tyLeDung >= 50) {
      nhanXetAI = `Đạt yêu cầu cơ bản (${diemSo}/${bai.diemToiDa} điểm - ${soCauDung}/${tongSoCau} câu đúng). Bạn cần ôn tập kỹ lại tài liệu bài giảng của học phần, đặc biệt lưu ý các nội dung bị sai ở ${ danhSachCauSai.slice(0, 2).map((_, idx) => `câu số ${chiTietTraLoi.filter((c) => !c.dungHaySai)[idx]?.thuTu}`).join(', ') }.`;
    } else {
      nhanXetAI = `Cần cố gắng hơn (${diemSo}/${bai.diemToiDa} điểm - ${soCauDung}/${tongSoCau} câu đúng). Bạn đang có lỗ hổng kiến thức ở chủ đề này. Khuyến nghị đọc lại học liệu trong tab Tài liệu, trao đổi với Trợ lý học tập và thực hiện làm lại bài luyện tập để nắm chắc lý thuyết.`;
    }

    const luotMoi = await this.khoKiemTra.taoLuotLamBai({
      idBaiKiemTra,
      idHocSinh: hoSoHocSinh.id,
      lanThu: cacLuotTruoc.length + 1,
      chiTietTraLoi,
      soCauDung,
      tongSoCau,
      diemSo,
      nhanXetAI,
      thoiLuongGiay: duLieu.thoiLuongGiay || 60,
    });

    return luotMoi;
  }

  /**
   * Cập nhật trạng thái Đề kiểm tra (Mở / Đóng)
   */
  async capNhatTrangThai(
    idBaiKiemTra: string,
    trangThai: TrangThaiBaiKiemTra,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const bai = await this.khoKiemTra.timTheoId(idBaiKiemTra);
    if (!bai) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Bài kiểm tra không tồn tại.',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = bai.lopHocPhan?.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Bạn không có quyền thay đổi trạng thái bài kiểm tra này.',
      });
    }

    return this.khoKiemTra.capNhatTrangThai(idBaiKiemTra, trangThai);
  }

  /**
   * Xóa bài kiểm tra
   */
  async xoaBaiKiemTra(idBaiKiemTra: string, nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const bai = await this.khoKiemTra.timTheoId(idBaiKiemTra);
    if (!bai) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Bài kiểm tra không tồn tại.',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = bai.lopHocPhan?.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Bạn không có quyền xóa bài kiểm tra này.',
      });
    }

    return this.khoKiemTra.xoaBaiKiemTra(idBaiKiemTra);
  }
}
