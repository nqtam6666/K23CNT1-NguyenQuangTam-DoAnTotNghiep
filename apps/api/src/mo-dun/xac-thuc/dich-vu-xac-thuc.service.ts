import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import {
  DangKyDto,
  DangNhapDto,
  DoiMatKhauDto,
  LamMoiTokenDto,
  KetQuaXacThuc,
  MaLoiNghiepVu,
  PayloadJwt,
  VaiTro,
} from '@lms/chung';
import { KhoNguoiDung, CauHinhBaoMatHeThong } from '../nguoi-dung/kho-nguoi-dung.repository';

interface TrangThaiDemSai {
  cacLanSaiMs: number[];
  khoaDenLucMs: number;
}

@Injectable()
export class DichVuXacThuc {
  private readonly boDemSaiTheoEmail = new Map<string, TrangThaiDemSai>();
  private readonly boDemThuTheoIp = new Map<string, number[]>();

  constructor(
    private readonly khoNguoiDung: KhoNguoiDung,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async layCauHinhBaoMat(): Promise<CauHinhBaoMatHeThong> {
    if (this.khoNguoiDung.layCauHinhBaoMat) {
      return this.khoNguoiDung.layCauHinhBaoMat();
    }
    return {
      choPhepTuDangKy: true,
      thoiGianPhienGiay: 86400,
      soLanSaiToiDa: 5,
      cuaSoDemSaiPhut: 15,
      thoiGianKhoaTamPhut: 15,
      gioiHanDangNhapTheoIp: 100,
      cuaSoGioiHanIpPhut: 15,
      doDaiMatKhauToiThieu: 8,
      matKhauBatBuocChuVaSo: true,
    };
  }

  private kiemTraDoManhMatKhau(matKhau: string, cauHinh: CauHinhBaoMatHeThong) {
    if (matKhau.length < cauHinh.doDaiMatKhauToiThieu) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: `Mật khẩu phải có độ dài tối thiểu ${cauHinh.doDaiMatKhauToiThieu} ký tự theo chính sách bảo mật của trường.`,
      });
    }

    if (cauHinh.matKhauBatBuocChuVaSo) {
      const coChu = /[a-zA-Z]/.test(matKhau);
      const coSo = /[0-9]/.test(matKhau);
      if (!coChu || !coSo) {
        throw new BadRequestException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
          thongDiep: 'Mật khẩu phải bao gồm cả chữ cái và chữ số.',
        });
      }
    }
  }

  private kiemTraGioiHanTruocDangNhap(
    email: string,
    diaChiIp: string | undefined,
    cauHinh: CauHinhBaoMatHeThong,
  ) {
    const bayGio = Date.now();
    const khoaEmail = email.trim().toLowerCase();

    // 1. Kiểm tra khóa tạm thời theo từng tài khoản (chống Brute Force)
    const trangThaiEmail = this.boDemSaiTheoEmail.get(khoaEmail);
    if (trangThaiEmail && trangThaiEmail.khoaDenLucMs > bayGio) {
      const soPhutConLai = Math.max(
        1,
        Math.ceil((trangThaiEmail.khoaDenLucMs - bayGio) / (60 * 1000)),
      );
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_KHOAN_BI_KHOA,
        thongDiep: `Tài khoản đang tạm khóa do nhập sai mật khẩu quá ${cauHinh.soLanSaiToiDa} lần. Vui lòng thử lại sau ${soPhutConLai} phút.`,
      });
    }

    // 2. Kiểm tra tần suất thử đăng nhập theo địa chỉ IP (đặt ngưỡng cao cho phòng máy trường học)
    if (diaChiIp) {
      const cuaSoIpMs = cauHinh.cuaSoGioiHanIpPhut * 60 * 1000;
      const danhSachLanThu = (this.boDemThuTheoIp.get(diaChiIp) || []).filter(
        (ts) => bayGio - ts < cuaSoIpMs,
      );
      if (danhSachLanThu.length >= cauHinh.gioiHanDangNhapTheoIp) {
        throw new UnauthorizedException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.YEU_CAU_KHONG_HOP_LE,
          thongDiep: `Quá nhiều lượt thử đăng nhập từ địa chỉ mạng hiện tại. Vui lòng đợi vài phút rồi thử lại.`,
        });
      }
      danhSachLanThu.push(bayGio);
      this.boDemThuTheoIp.set(diaChiIp, danhSachLanThu);
    }
  }

  private ghiNhanDangNhapSai(email: string, cauHinh: CauHinhBaoMatHeThong) {
    const bayGio = Date.now();
    const khoaEmail = email.trim().toLowerCase();
    const cuaSoMs = cauHinh.cuaSoDemSaiPhut * 60 * 1000;
    const hienTai = this.boDemSaiTheoEmail.get(khoaEmail) || {
      cacLanSaiMs: [],
      khoaDenLucMs: 0,
    };

    const cacLanSaiMoi = hienTai.cacLanSaiMs.filter((ts) => bayGio - ts < cuaSoMs);
    cacLanSaiMoi.push(bayGio);

    let khoaDenLucMs = 0;
    if (cacLanSaiMoi.length >= cauHinh.soLanSaiToiDa) {
      khoaDenLucMs = bayGio + cauHinh.thoiGianKhoaTamPhut * 60 * 1000;
    }

    this.boDemSaiTheoEmail.set(khoaEmail, {
      cacLanSaiMs: cacLanSaiMoi,
      khoaDenLucMs,
    });
  }

  private xoaDemDangNhapSai(email: string) {
    this.boDemSaiTheoEmail.delete(email.trim().toLowerCase());
  }

  /**
   * Đăng ký tài khoản mới với mật khẩu mã hóa Argon2id
   */
  async dangKy(
    duLieu: DangKyDto,
    thongTinThietBi?: string,
    diaChiIp?: string,
  ): Promise<KetQuaXacThuc> {
    const cauHinhBaoMat = await this.layCauHinhBaoMat();

    if (!cauHinhBaoMat.choPhepTuDangKy) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep:
          'Cổng tự đăng ký tài khoản hiện đang đóng. Vui lòng liên hệ Phòng Đào tạo hoặc Quản trị viên để được cấp tài khoản.',
      });
    }

    this.kiemTraDoManhMatKhau(duLieu.matKhau, cauHinhBaoMat);

    const nguoiDungTonTai = await this.khoNguoiDung.timTheoEmail(duLieu.email);
    if (nguoiDungTonTai) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.EMAIL_DA_TON_TAI,
        thongDiep: 'Địa chỉ email này đã được sử dụng trong hệ thống',
      });
    }

    const matKhauBăm = await argon2.hash(duLieu.matKhau, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    const nguoiDungMoi = await this.khoNguoiDung.taoNguoiDung({
      email: duLieu.email,
      matKhau: matKhauBăm,
      hoTen: duLieu.hoTen,
      soDienThoai: duLieu.soDienThoai,
      vaiTro: VaiTro.HOC_SINH,
    });

    return this.taoCapToken(
      nguoiDungMoi.id,
      nguoiDungMoi.email,
      nguoiDungMoi.hoTen,
      nguoiDungMoi.vaiTro as VaiTro,
      thongTinThietBi,
      diaChiIp,
      nguoiDungMoi.anhDaiDien,
    );
  }

  /**
   * Xác thực đăng nhập bằng email và mật khẩu
   */
  async dangNhap(
    duLieu: DangNhapDto,
    thongTinThietBi?: string,
    diaChiIp?: string,
  ): Promise<KetQuaXacThuc> {
    const cauHinhBaoMat = await this.layCauHinhBaoMat();
    this.kiemTraGioiHanTruocDangNhap(duLieu.email, diaChiIp, cauHinhBaoMat);

    const nguoiDung = await this.khoNguoiDung.timTheoEmail(duLieu.email);
    if (!nguoiDung) {
      this.ghiNhanDangNhapSai(duLieu.email, cauHinhBaoMat);
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.MAT_KHAU_KHONG_CHINH_XAC,
        thongDiep: 'Email hoặc mật khẩu không chính xác',
      });
    }

    if (!nguoiDung.kichHoat || nguoiDung.ngayXoa) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_KHOAN_BI_KHOA,
        thongDiep: 'Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động',
      });
    }

    const khopMatKhau = await argon2.verify(nguoiDung.matKhau, duLieu.matKhau);

    if (!khopMatKhau) {
      this.ghiNhanDangNhapSai(duLieu.email, cauHinhBaoMat);
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.MAT_KHAU_KHONG_CHINH_XAC,
        thongDiep: 'Email hoặc mật khẩu không chính xác',
      });
    }

    this.xoaDemDangNhapSai(duLieu.email);

    return this.taoCapToken(
      nguoiDung.id,
      nguoiDung.email,
      nguoiDung.hoTen,
      nguoiDung.vaiTro as VaiTro,
      thongTinThietBi,
      diaChiIp,
      nguoiDung.anhDaiDien,
    );
  }

  /**
   * Làm mới Access Token và xoay vòng Refresh Token (Refresh Token Rotation)
   */
  async lamMoiToken(
    duLieu: LamMoiTokenDto,
    thongTinThietBi?: string,
    diaChiIp?: string,
  ): Promise<KetQuaXacThuc> {
    if (!duLieu?.refreshToken) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TOKEN_KHONG_HOP_LE,
        thongDiep: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ',
      });
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(duLieu.refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'chuoi_bi_mat_refresh_token_lms_sieu_bao_mat_2026_abc',
      });
    } catch {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TOKEN_KHONG_HOP_LE,
        thongDiep: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ',
      });
    }

    const phien = await this.khoNguoiDung.timPhienTheoId(payload.phienId);
    if (!phien || phien.daThuHoi || new Date() > phien.hetHanLuc) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TOKEN_HET_HAN,
        thongDiep: 'Phiên làm việc đã bị thu hồi hoặc hết hạn',
      });
    }

    // Thu hồi refresh token cũ để chống replay attack
    await this.khoNguoiDung.thuHoiPhien(phien.id);

    const nguoiDung = await this.khoNguoiDung.timTheoId(phien.idNguoiDung);
    if (!nguoiDung || !nguoiDung.kichHoat || nguoiDung.ngayXoa) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_KHOAN_BI_KHOA,
        thongDiep: 'Tài khoản không hợp lệ',
      });
    }

    return this.taoCapToken(
      nguoiDung.id,
      nguoiDung.email,
      nguoiDung.hoTen,
      nguoiDung.vaiTro as VaiTro,
      thongTinThietBi,
      diaChiIp,
      nguoiDung.anhDaiDien,
    );
  }

  /**
   * Đổi mật khẩu tài khoản
   */
  async doiMatKhau(idNguoiDung: string, duLieu: DoiMatKhauDto): Promise<void> {
    const cauHinhBaoMat = await this.layCauHinhBaoMat();
    this.kiemTraDoManhMatKhau(duLieu.matKhauMoi, cauHinhBaoMat);

    const nguoiDung = await this.khoNguoiDung.timTheoId(idNguoiDung);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy người dùng',
      });
    }

    const khop = await argon2.verify(nguoiDung.matKhau, duLieu.matKhauHienTai);
    if (!khop) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.MAT_KHAU_KHONG_CHINH_XAC,
        thongDiep: 'Mật khẩu hiện tại không chính xác',
      });
    }

    const matKhauMoiBăm = await argon2.hash(duLieu.matKhauMoi, {
      type: argon2.argon2id,
    });

    await this.khoNguoiDung.capNhatNguoiDung(idNguoiDung, {
      matKhau: matKhauMoiBăm,
    });

    // Thu hồi toàn bộ phiên đăng nhập cũ sau khi đổi mật khẩu thành công
    await this.khoNguoiDung.thuHoiTatCaPhienCuaNguoiDung(idNguoiDung);
  }

  /**
   * Đăng xuất và thu hồi phiên làm việc trong cơ sở dữ liệu
   */
  async dangXuat(refreshToken: string): Promise<void> {
    const phienId = this.giaiMaPhienIdTuRefreshToken(refreshToken);
    if (phienId) {
      await this.khoNguoiDung.thuHoiPhien(phienId);
    }
  }

  private giaiMaPhienIdTuRefreshToken(refreshToken?: string): string | undefined {
    if (!refreshToken) return undefined;
    try {
      const payload: any = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'chuoi_bi_mat_refresh_token_lms_sieu_bao_mat_2026_abc',
      });
      return payload?.phienId;
    } catch {
      return undefined;
    }
  }

  /**
   * Lấy danh sách thiết bị / phiên đang đăng nhập của người dùng hiện tại
   */
  async layDanhSachPhienDangNhap(idNguoiDung: string, refreshTokenHienTai?: string) {
    const phienHienTaiId = this.giaiMaPhienIdTuRefreshToken(refreshTokenHienTai);
    const danhSach = (await this.khoNguoiDung.layDanhSachPhienDangNhap?.(idNguoiDung)) || [];
    return danhSach.map((phien) => ({
      ...phien,
      laThietBiHienTai: Boolean(phienHienTaiId && phien.id === phienHienTaiId),
    }));
  }

  /**
   * Thu hồi một phiên đăng nhập từ xa (Chống IDOR: chỉ thu hồi phiên thuộc về chính người dùng đó)
   */
  async thuHoiMotPhien(idNguoiDung: string, idPhien: string) {
    const soLuong = await this.khoNguoiDung.thuHoiPhienCuaNguoiDung?.(idPhien, idNguoiDung);
    if (!soLuong) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy phiên đăng nhập hoặc thiết bị đã được đăng xuất',
      });
    }
    return { thanhCong: true, thongDiep: 'Đã thu hồi phiên đăng nhập trên thiết bị' };
  }

  /**
   * Đăng xuất khỏi tất cả các thiết bị khác (giữ lại thiết bị hiện tại nếu có)
   */
  async dangXuatTatCaThietBiKhac(idNguoiDung: string, refreshTokenHienTai?: string) {
    const phienHienTaiId = this.giaiMaPhienIdTuRefreshToken(refreshTokenHienTai);
    const ketQua = await this.khoNguoiDung.thuHoiTatCaPhienCuaNguoiDung(
      idNguoiDung,
      phienHienTaiId,
    );
    return {
      thanhCong: true,
      soLuongThuHoi: ketQua?.count ?? 0,
      thongDiep: 'Đã đăng xuất khỏi tất cả các thiết bị khác',
    };
  }

  /**
   * Lấy thông tin hồ sơ hiện tại mới nhất từ cơ sở dữ liệu
   */
  async layHoSoHienTai(idNguoiDung: string) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(idNguoiDung);
    if (!nguoiDung) return null;
    return {
      id: nguoiDung.id,
      sub: nguoiDung.id,
      email: nguoiDung.email,
      hoTen: nguoiDung.hoTen,
      vaiTro: nguoiDung.vaiTro as VaiTro,
      soDienThoai: nguoiDung.soDienThoai,
      anhDaiDien: nguoiDung.anhDaiDien,
    };
  }

  /**
   * Sinh cặp JWT Access Token và Refresh Token dựa theo cấu hình THOI_GIAN_PHIEN_GIAY
   */
  private async taoCapToken(
    idNguoiDung: string,
    email: string,
    hoTen: string,
    vaiTro: VaiTro,
    thongTinThietBi?: string,
    diaChiIp?: string,
    anhDaiDien?: string | null,
  ): Promise<KetQuaXacThuc> {
    const thoiGianPhienGiay =
      (await this.khoNguoiDung.layThoiGianPhienGiay?.()) ?? 86400;
    const thoiGianRefreshGiay = Math.max(thoiGianPhienGiay * 2, 7 * 24 * 60 * 60);

    const payload: PayloadJwt = {
      sub: idNguoiDung,
      id: idNguoiDung,
      email,
      hoTen,
      vaiTro,
      anhDaiDien: anhDaiDien ?? null,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        'chuoi_bi_mat_access_token_lms_sieu_bao_mat_2026_xyz',
      expiresIn: thoiGianPhienGiay,
    });

    const hetHanLuc = new Date(Date.now() + thoiGianRefreshGiay * 1000);

    const phienMoi = await this.khoNguoiDung.taoPhienDangNhap({
      nguoiDung: { connect: { id: idNguoiDung } },
      refreshTokenHash: 'dang_sinh',
      thongTinThietBi,
      diaChiIp,
      hetHanLuc,
    });

    const refreshToken = this.jwtService.sign(
      { phienId: phienMoi.id, idNguoiDung },
      {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'chuoi_bi_mat_refresh_token_lms_sieu_bao_mat_2026_abc',
        expiresIn: thoiGianRefreshGiay,
      },
    );

    const refreshTokenHash = await argon2.hash(refreshToken);
    if (this.khoNguoiDung.capNhatPhienDangNhap) {
      await this.khoNguoiDung.capNhatPhienDangNhap(phienMoi.id, {
        refreshTokenHash,
      });
    }
    await this.khoNguoiDung.capNhatNguoiDung(idNguoiDung, {});

    return {
      accessToken,
      refreshToken,
      thoiGianPhienGiay,
      nguoiDung: {
        id: idNguoiDung,
        email,
        hoTen,
        vaiTro,
        anhDaiDien: anhDaiDien ?? null,
      },
    };
  }
}
