import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, WebhookReceiver } from 'livekit-server-sdk';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { KhoPhongHoc } from './kho-phong-hoc.repository';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';
import { chuanHoaVectorKhuonMat, doiSoatVectorKhuonMat } from './tien-ich-khuon-mat';
import {
  KetQuaTokenLiveKit,
  PayloadJwt,
  PhuongThucDiemDanh,
  TrangThaiBuoiHoc,
  TrangThaiDiemDanh,
  TrangThaiDonXinNghi,
  VaiTro,
  DiemDanhHangLoatInput,
  TaoDonXinNghiInput,
  DuyetDonXinNghiInput,
  DangKyKhuonMatInput,
  BatTatDiemDanhKhuonMatInput,
  DiemDanhKhuonMatInput,
  DiemDanhKhuonMatLopInput,
  ThongKeChuyenCanLop,
  ChiTietChuyenCanHocSinh,
  HoSoKhuonMat,
  MucDuLieuKhuonMatLop,
  KetQuaDiemDanhKhuonMat,
} from '@lms/chung';

@Injectable()
export class DichVuPhongHoc {
  private readonly logger = new Logger(DichVuPhongHoc.name);

  constructor(
    private readonly khoPhongHoc: KhoPhongHoc,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Optional() private readonly dichVuCaiDat?: DichVuCaiDatService,
  ) {}

  private layIdNguoiDung(nguoiDung: PayloadJwt): string {
    return nguoiDung.sub || (nguoiDung as any).id;
  }

  private laQuanTriHoacGiaoVu(vaiTro: VaiTro): boolean {
    return vaiTro === VaiTro.QUAN_TRI_VIEN || vaiTro === VaiTro.GIAO_VU;
  }

  private kiemTraQuyenQuanLyLop(
    idNguoiDungGiaoVien: string | undefined,
    nguoiDung: PayloadJwt,
    thongDiepLoi: string,
  ): void {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const laQuanTri = this.laQuanTriHoacGiaoVu(nguoiDung.vaiTro);
    const laGiaoVienLop = Boolean(idNguoiDungGiaoVien && idNguoiDungGiaoVien === idNguoiDung);

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: thongDiepLoi,
      });
    }
  }

  private tinhTrangThaiVaDiMuon(thoiGianBDBuoiHoc: Date | string, soPhutChoPhepTre: number) {
    const phutTre =
      (Date.now() - new Date(thoiGianBDBuoiHoc).getTime()) / (60 * 1000);
    const trangThai =
      phutTre > soPhutChoPhepTre ? TrangThaiDiemDanh.DI_MUON : TrangThaiDiemDanh.CO_MAT;
    return {
      trangThai,
      phutTre: Math.max(0, Math.round(phutTre)),
    };
  }

  private async ghiNhatKyKhuonMat(
    idNguoiDung: string,
    hanhDong: string,
    idThucThe: string,
    chiTiet: Record<string, unknown>,
  ): Promise<void> {
    if (!this.prisma.nhatKyHeThong?.create) {
      return;
    }

    try {
      await this.prisma.nhatKyHeThong.create({
        data: {
          idNguoiDung,
          hanhDong,
          thucThe: 'DuLieuKhuonMat',
          idThucThe,
          chiTiet: chiTiet as any,
        },
      });
    } catch {
      // Không chặn luồng chính nếu bảng nhật ký chưa sẵn sàng
    }
  }

  /**
   * Cấp Token truy cập ngắn hạn (TTL theo cài đặt phong_hoc.thoi_han_token_phut) cho phòng học LiveKit
   */
  async taoTokenTruyCap(
    idLopHocPhan: string,
    nguoiDung: PayloadJwt,
    idBuoiHoc?: string,
  ): Promise<KetQuaTokenLiveKit> {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);

    // 1. Kiểm tra lớp học phần tồn tại
    const lopHocPhan = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: {
        giaoVien: true,
        phongTrucTuyen: true,
      },
    });

    if (!lopHocPhan) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Lớp học phần không tồn tại trên hệ thống',
      });
    }

    // 2. Kiểm soát phân quyền thành viên lớp
    let laChuTri = false;

    if (
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU ||
      nguoiDung.vaiTro === VaiTro.GIAO_VU
    ) {
      laChuTri = true;
    } else if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      if (lopHocPhan.giaoVien?.idNguoiDung !== idNguoiDung) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Bạn không phải giáo viên phụ trách lớp học phần này.',
        });
      }
      laChuTri = true;
    } else if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSoHocSinh = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung },
      });

      if (!hoSoHocSinh) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Hồ sơ học sinh không tồn tại',
        });
      }

      const daGhiDanh = await this.prisma.ghiDanh.findUnique({
        where: {
          idLopHocPhan_idHocSinh: {
            idLopHocPhan,
            idHocSinh: hoSoHocSinh.id,
          },
        },
      });

      if (!daGhiDanh) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep:
            'Bạn chưa ghi danh vào lớp học phần này nên không thể tham gia phòng học.',
        });
      }
      laChuTri = false;
    } else {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Vai trò của bạn không được phép tham gia phòng học trực tuyến',
      });
    }

    // 3. Đảm bảo bản ghi PhongTrucTuyen tồn tại trong CSDL
    let phong = lopHocPhan.phongTrucTuyen;
    if (!phong) {
      const tenPhongChuan = `LHP_${lopHocPhan.maLopHocPhan}`;
      phong = await this.khoPhongHoc.taoPhong(idLopHocPhan, tenPhongChuan, true);
    }

    // 4. Khởi tạo AccessToken LiveKit với phân quyền tương ứng
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || 'devkey';
    const apiSecret =
      this.configService.get<string>('LIVEKIT_API_SECRET') || 'secret_key_livekit_lms_2026';
    const urlMayChuLiveKit = this.configService.get<string>('LIVEKIT_URL') || 'ws://localhost:7880';

    const soPhutTtl =
      (await this.dichVuCaiDat?.layGiaTriSo('phong_hoc.thoi_han_token_phut', 120)) ?? 120;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: idNguoiDung,
      name: nguoiDung.hoTen,
      ttl: `${Math.max(30, Math.min(360, soPhutTtl))}m`,
      metadata: JSON.stringify({
        idNguoiDung,
        hoTen: nguoiDung.hoTen,
        vaiTro: nguoiDung.vaiTro,
        laChuTri,
      }),
    });

    at.addGrant({
      roomJoin: true,
      room: phong.tenPhong,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: laChuTri,
    });

    const token = await at.toJwt();

    // 5. Nếu có buổi học cụ thể -> ghi nhật ký vào phòng trước
    if (idBuoiHoc) {
      const buoiHoc = await this.prisma.buoiHoc.findUnique({
        where: { id: idBuoiHoc },
      });
      if (buoiHoc) {
        await this.khoPhongHoc.ghiNhatKyVao(idBuoiHoc, idNguoiDung);
        if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
          const hoSo = await this.prisma.hoSoHocSinh.findUnique({
            where: { idNguoiDung },
          });
          if (hoSo) {
            await this.khoPhongHoc.diemDanhHocSinh(
              idBuoiHoc,
              hoSo.id,
              TrangThaiDiemDanh.CO_MAT,
              'Tham gia phòng học trực tuyến',
              PhuongThucDiemDanh.TRUC_TUYEN,
            );
          }
        }
      }
    }

    return {
      token,
      urlMayChuLiveKit,
      tenPhong: phong.tenPhong,
      tenNguoiDung: nguoiDung.hoTen,
      vaiTroTrongPhong: laChuTri ? 'CHU_TRI' : 'THAM_GIA',
      thoiHanGiay: 7200,
    };
  }

  /**
   * Bật / Tắt trạng thái mở phòng học
   */
  async batTatPhongHoc(idLopHocPhan: string, dangMo: boolean, nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const phong = await this.khoPhongHoc.timPhongTheoLop(idLopHocPhan);
    if (!phong) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Phòng học trực tuyến chưa được khởi tạo',
      });
    }

    const laAdminHoacGiaoVu =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienPhuTrach = phong.lopHocPhan?.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laAdminHoacGiaoVu && !laGiaoVienPhuTrach) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Bạn không có quyền thay đổi trạng thái phòng học này',
      });
    }

    return this.khoPhongHoc.capNhatTrangThai(phong.id, dangMo);
  }

  /**
   * Xử lý Webhook tự động từ LiveKit Server
   */
  async xuLyWebhook(authorizationHeader: string, bodyRaw: string | Buffer) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || 'devkey';
    const apiSecret =
      this.configService.get<string>('LIVEKIT_API_SECRET') || 'secret_key_livekit_lms_2026';

    const receiver = new WebhookReceiver(apiKey, apiSecret);
    let event: any;

    try {
      const bodyStr = Buffer.isBuffer(bodyRaw) ? bodyRaw.toString('utf-8') : bodyRaw;
      event = await receiver.receive(bodyStr, authorizationHeader);
    } catch (err: any) {
      this.logger.error(`Xác thực chữ ký Webhook LiveKit thất bại: ${err.message}`);
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Chữ ký Webhook không hợp lệ',
      });
    }

    const tenPhong = event.room?.name;
    const suKien = event.event;

    if (!tenPhong) return { thanhCong: true };

    const phong = await this.khoPhongHoc.timTheoTenPhong(tenPhong);
    if (!phong) return { thanhCong: true };

    const buoiHocHienTai = await this.khoPhongHoc.timBuoiHocHienTai(phong.idLopHocPhan);

    switch (suKien) {
      case 'room_started':
        await this.khoPhongHoc.capNhatTrangThai(phong.id, true);
        if (buoiHocHienTai) {
          await this.khoPhongHoc.capNhatTrangThaiBuoiHoc(
            buoiHocHienTai.id,
            TrangThaiBuoiHoc.DANG_DIEN_RA,
          );
        }
        break;

      case 'room_finished':
        await this.khoPhongHoc.capNhatTrangThai(phong.id, false);
        if (buoiHocHienTai) {
          await this.khoPhongHoc.capNhatTrangThaiBuoiHoc(
            buoiHocHienTai.id,
            TrangThaiBuoiHoc.DA_KET_THUC,
          );
        }
        break;

      case 'participant_joined':
        if (event.participant?.identity && buoiHocHienTai) {
          const idNguoiDung = event.participant.identity;
          await this.khoPhongHoc.ghiNhatKyVao(buoiHocHienTai.id, idNguoiDung);

          const hoSo = await this.prisma.hoSoHocSinh.findUnique({
            where: { idNguoiDung },
          });
          if (hoSo) {
            await this.khoPhongHoc.diemDanhHocSinh(
              buoiHocHienTai.id,
              hoSo.id,
              TrangThaiDiemDanh.CO_MAT,
              'Có mặt qua phòng học trực tuyến',
              PhuongThucDiemDanh.TRUC_TUYEN,
            );
          }
        }
        break;

      case 'participant_left':
        if (event.participant?.identity && buoiHocHienTai) {
          await this.khoPhongHoc.ghiNhatKyRoi(buoiHocHienTai.id, event.participant.identity);
        }
        break;

      default:
        break;
    }

    return { thanhCong: true, suKien, tenPhong };
  }

  /**
   * Lấy báo cáo điểm danh và nhật ký tham gia của buổi học
   */
  async layBaoCaoBuoiHoc(idLopHocPhan: string, idBuoiHoc: string, nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const lopHocPhan = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: {
        giaoVien: true,
      },
    });

    if (!lopHocPhan) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Lớp học phần không tồn tại',
      });
    }

    let idHocSinhCaNhan: string | null = null;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      this.kiemTraQuyenQuanLyLop(
        lopHocPhan.giaoVien?.idNguoiDung,
        nguoiDung,
        'Bạn không có quyền xem báo cáo điểm danh của lớp học phần này.',
      );
    } else if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung },
      });
      if (!hoSo) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Bạn không có quyền truy cập',
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
          thongDiep: 'Bạn không thuộc lớp học phần này',
        });
      }
      idHocSinhCaNhan = hoSo.id;
    }

    const buoiHoc = await this.prisma.buoiHoc.findUnique({
      where: { id: idBuoiHoc },
    });
    const nhatKy = await this.khoPhongHoc.layNhatKyTheoBuoi(idBuoiHoc);
    const diemDanh = await this.khoPhongHoc.layDanhSachDiemDanh(idBuoiHoc);

    const danhSachNhatKy = idHocSinhCaNhan
      ? nhatKy.filter((nk: any) => nk.idNguoiDung === idNguoiDung)
      : nhatKy;
    const danhSachDiemDanh = idHocSinhCaNhan
      ? diemDanh.filter((dd: any) => dd.idHocSinh === idHocSinhCaNhan)
      : diemDanh;

    return {
      idBuoiHoc,
      buoiHoc,
      danhSachNhatKy,
      danhSachDiemDanh,
    };
  }

  /**
   * Điểm danh thủ công hoặc sửa đổi trạng thái điểm danh
   */
  async diemDanhThuCong(
    idBuoiHoc: string,
    idHocSinh: string,
    trangThai: TrangThaiDiemDanh,
    ghiChu: string | undefined,
    nguoiDung: PayloadJwt,
  ) {
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(idBuoiHoc);
    if (!buoiHoc) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không tồn tại',
      });
    }

    this.kiemTraQuyenQuanLyLop(
      buoiHoc.lopHocPhan?.giaoVien?.idNguoiDung,
      nguoiDung,
      'Chỉ giáo viên phụ trách lớp học phần mới được phép điểm danh.',
    );

    const daGhiDanh = await this.prisma.ghiDanh.findUnique({
      where: {
        idLopHocPhan_idHocSinh: {
          idLopHocPhan: buoiHoc.idLopHocPhan,
          idHocSinh,
        },
      },
    });
    if (!daGhiDanh) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Học sinh không thuộc danh sách ghi danh của lớp học phần này',
      });
    }

    return this.khoPhongHoc.diemDanhHocSinh(
      idBuoiHoc,
      idHocSinh,
      trangThai,
      ghiChu,
      PhuongThucDiemDanh.THU_CONG,
    );
  }

  /**
   * Điểm danh hàng loạt cho toàn bộ lớp học trong buổi học
   */
  async diemDanhHangLoat(
    idBuoiHoc: string,
    danhSach: DiemDanhHangLoatInput['danhSachDiemDanh'],
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(idBuoiHoc);
    if (!buoiHoc) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không tồn tại',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = buoiHoc.lopHocPhan?.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ giáo viên phụ trách lớp học phần mới được phép điểm danh.',
      });
    }

    const ketQua = await this.prisma.$transaction(
      danhSach.map((muc) =>
        this.prisma.banGhiDiemDanh.upsert({
          where: {
            idBuoiHoc_idHocSinh: {
              idBuoiHoc,
              idHocSinh: muc.idHocSinh,
            },
          },
          update: {
            trangThai: muc.trangThai as TrangThaiDiemDanh,
            ghiChu: muc.ghiChu,
            phuongThuc: PhuongThucDiemDanh.THU_CONG,
            doTinCay: null,
            ngayDiemDanh: new Date(),
          },
          create: {
            idBuoiHoc,
            idHocSinh: muc.idHocSinh,
            trangThai: muc.trangThai as TrangThaiDiemDanh,
            ghiChu: muc.ghiChu,
            phuongThuc: PhuongThucDiemDanh.THU_CONG,
            doTinCay: null,
          },
        }),
      ),
    );

    return {
      soLuongCapNhat: ketQua.length,
      idBuoiHoc,
    };
  }

  /**
   * Mở phiên điểm danh thông minh bằng Mã số (PIN 6 chữ số có thời hạn)
   */
  async moMaDiemDanhThongMinh(
    idBuoiHoc: string,
    thoiHanPhut: number,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(idBuoiHoc);
    if (!buoiHoc) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không tồn tại',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = buoiHoc.lopHocPhan?.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ giáo viên phụ trách mới được mở phiên điểm danh thông minh.',
      });
    }

    const maNgauNhien = Math.floor(100000 + Math.random() * 900000).toString();
    const hanMa = new Date(Date.now() + thoiHanPhut * 60 * 1000);

    return this.khoPhongHoc.capNhatMaDiemDanh(idBuoiHoc, maNgauNhien, hanMa);
  }

  /**
   * Đóng mã điểm danh thông minh của buổi học
   */
  async dongMaDiemDanhThongMinh(idBuoiHoc: string, nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(idBuoiHoc);
    if (!buoiHoc) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không tồn tại',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = buoiHoc.lopHocPhan?.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Bạn không có quyền đóng phiên điểm danh.',
      });
    }

    return this.khoPhongHoc.capNhatMaDiemDanh(idBuoiHoc, null, null);
  }

  /**
   * Học sinh tự điểm danh bằng Mã PIN thông minh
   */
  async diemDanhBangMaThongMinh(
    idBuoiHoc: string,
    maNhap: string,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(idBuoiHoc);
    if (!buoiHoc) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không tồn tại',
      });
    }

    const hoSo = await this.prisma.hoSoHocSinh.findUnique({
      where: { idNguoiDung },
    });
    if (!hoSo) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ tài khoản học sinh mới có thể tự điểm danh bằng mã.',
      });
    }

    const daGhiDanh = await this.prisma.ghiDanh.findUnique({
      where: {
        idLopHocPhan_idHocSinh: {
          idLopHocPhan: buoiHoc.idLopHocPhan,
          idHocSinh: hoSo.id,
        },
      },
    });
    if (!daGhiDanh) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Bạn không thuộc danh sách lớp học phần này.',
      });
    }

    if (!buoiHoc.maDiemDanh || !buoiHoc.hanMaDiemDanh) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Giảng viên hiện chưa mở mã điểm danh cho buổi học này.',
      });
    }

    if (new Date() > new Date(buoiHoc.hanMaDiemDanh)) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Mã điểm danh đã hết hiệu lực. Vui lòng báo giảng viên điểm danh bổ sung.',
      });
    }

    if (buoiHoc.maDiemDanh.trim() !== maNhap.trim()) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Mã điểm danh không chính xác. Vui lòng kiểm tra lại.',
      });
    }

    return this.khoPhongHoc.diemDanhHocSinh(
      idBuoiHoc,
      hoSo.id,
      TrangThaiDiemDanh.CO_MAT,
      'Điểm danh thông minh bằng mã phiên',
      PhuongThucDiemDanh.MA_PIN,
    );
  }

  /**
   * Đồng bộ điểm danh thông minh tự động từ dữ liệu tham gia phòng học trực tuyến & đơn nghỉ phép
   */
  async dongBoDiemDanhThongMinh(idBuoiHoc: string, nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(idBuoiHoc);
    if (!buoiHoc) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không tồn tại',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = buoiHoc.lopHocPhan?.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ giáo viên phụ trách mới được đồng bộ điểm danh.',
      });
    }

    const danhSachGhiDanh = await this.prisma.ghiDanh.findMany({
      where: { idLopHocPhan: buoiHoc.idLopHocPhan },
      include: {
        hocSinh: true,
      },
    });

    const nhatKyBuoi = await this.prisma.nhatKyThamGia.findMany({
      where: { idBuoiHoc },
    });

    const donNghiDaDuyet = await this.prisma.donXinNghi.findMany({
      where: {
        idBuoiHoc,
        trangThai: TrangThaiDonXinNghi.DA_DUYET,
      },
    });

    const banGhiHienCo = await this.prisma.banGhiDiemDanh.findMany({
      where: { idBuoiHoc },
    });
    const mapHienCo = new Map(banGhiHienCo.map((b) => [b.idHocSinh, b]));

    const soPhutChoPhepTre =
      (await this.dichVuCaiDat?.layGiaTriSo('diem_danh.so_phut_tinh_di_muon', 15)) ?? 15;

    let soCoMat = 0;
    let soDiMuon = 0;
    let soVangCoPhep = 0;
    let soVangKhongPhep = 0;

    for (const gd of danhSachGhiDanh) {
      const idHocSinh = gd.idHocSinh;
      const idUserHS = gd.hocSinh.idNguoiDung;

      // Kiểm tra đơn xin nghỉ đã duyệt
      const coDonDuyet = donNghiDaDuyet.some((d) => d.idNguoiDung === idUserHS);
      if (coDonDuyet) {
        await this.khoPhongHoc.diemDanhHocSinh(
          idBuoiHoc,
          idHocSinh,
          TrangThaiDiemDanh.VANG_CO_PHEP,
          'Đã duyệt đơn xin nghỉ phép',
          PhuongThucDiemDanh.DON_XIN_NGHI,
        );
        soVangCoPhep++;
        continue;
      }

      // Kiểm tra nhật ký tham gia phòng trực tuyến
      const cacLuotVao = nhatKyBuoi.filter((nk) => nk.idNguoiDung === idUserHS);
      if (cacLuotVao.length > 0) {
        // Kiểm tra xem lần vào đầu tiên có trễ hơn ngưỡng cấu hình so với giờ bắt đầu không
        const lanVaoDau = cacLuotVao.reduce((min, cur) =>
          cur.thoiGianVao < min.thoiGianVao ? cur : min,
        );
        const phutTre =
          (new Date(lanVaoDau.thoiGianVao).getTime() - new Date(buoiHoc.thoiGianBD).getTime()) /
          (60 * 1000);

        if (phutTre > soPhutChoPhepTre) {
          await this.khoPhongHoc.diemDanhHocSinh(
            idBuoiHoc,
            idHocSinh,
            TrangThaiDiemDanh.DI_MUON,
            `Vào phòng trực tuyến muộn ${Math.round(phutTre)} phút`,
            PhuongThucDiemDanh.TRUC_TUYEN,
          );
          soDiMuon++;
        } else {
          await this.khoPhongHoc.diemDanhHocSinh(
            idBuoiHoc,
            idHocSinh,
            TrangThaiDiemDanh.CO_MAT,
            'Hiện diện đầy đủ trên phòng học trực tuyến',
            PhuongThucDiemDanh.TRUC_TUYEN,
          );
          soCoMat++;
        }
        continue;
      }

      // Nếu đã điểm danh bằng mã PIN, khuôn mặt hoặc thủ công trước đó thì giữ nguyên
      const hienCo = mapHienCo.get(idHocSinh);
      if (hienCo) {
        if (hienCo.trangThai === TrangThaiDiemDanh.CO_MAT) soCoMat++;
        else if (hienCo.trangThai === TrangThaiDiemDanh.DI_MUON) soDiMuon++;
        else if (hienCo.trangThai === TrangThaiDiemDanh.VANG_CO_PHEP) soVangCoPhep++;
        else soVangKhongPhep++;
        continue;
      }

      // Mặc định ghi nhận vắng không phép nếu chưa có dữ liệu tham gia
      await this.khoPhongHoc.diemDanhHocSinh(
        idBuoiHoc,
        idHocSinh,
        TrangThaiDiemDanh.VANG_KHONG_PHEP,
        'Chưa ghi nhận tham gia buổi học',
        PhuongThucDiemDanh.THU_CONG,
      );
      soVangKhongPhep++;
    }

    return {
      idBuoiHoc,
      tongSoHocSinh: danhSachGhiDanh.length,
      soCoMat,
      soDiMuon,
      soVangCoPhep,
      soVangKhongPhep,
    };
  }

  /**
   * Gửi đơn xin nghỉ phép cho buổi học
   */
  async guiDonXinNghi(
    idLopHocPhan: string,
    duLieu: TaoDonXinNghiInput,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(duLieu.idBuoiHoc);
    if (!buoiHoc || buoiHoc.idLopHocPhan !== idLopHocPhan) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không thuộc lớp học phần này.',
      });
    }

    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung },
      });
      if (!hoSo) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Hồ sơ học sinh chưa được khởi tạo.',
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
          thongDiep: 'Bạn không thuộc danh sách lớp học phần này.',
        });
      }
    } else if (nguoiDung.vaiTro === VaiTro.PHU_HUYNH) {
      const lienKet = await this.prisma.phuHuynhHocSinh.findMany({
        where: { idPhuHuynh: idNguoiDung },
        select: { idHocSinh: true },
      });
      const dsIdHocSinh = lienKet.map((lk) => lk.idHocSinh);
      if (dsIdHocSinh.length === 0) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Tài khoản phụ huynh chưa được liên kết với học sinh nào.',
        });
      }
      const coConTrongLop = await this.prisma.ghiDanh.findFirst({
        where: {
          idLopHocPhan,
          idHocSinh: { in: dsIdHocSinh },
        },
      });
      if (!coConTrongLop) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Học sinh liên kết không thuộc lớp học phần này.',
        });
      }
    }

    return this.khoPhongHoc.taoDonXinNghi(
      duLieu.idBuoiHoc,
      idNguoiDung,
      duLieu.lyDo,
      duLieu.minhChung,
    );
  }

  /**
   * Lấy danh sách đơn xin nghỉ phép của lớp học phần
   */
  async layDanhSachDonXinNghi(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const chiLayCuaMinh = nguoiDung.vaiTro === VaiTro.HOC_SINH;
    return this.khoPhongHoc.layDonXinNghiTheoLop(
      idLopHocPhan,
      chiLayCuaMinh ? idNguoiDung : undefined,
    );
  }

  /**
   * Giáo viên duyệt hoặc từ chối đơn xin nghỉ phép
   */
  async duyetDonXinNghi(
    idDon: string,
    duLieu: DuyetDonXinNghiInput,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const don = await this.khoPhongHoc.timDonXinNghiTheoId(idDon);
    if (!don) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Đơn xin nghỉ không tồn tại.',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = don.buoiHoc?.lopHocPhan?.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ giáo viên phụ trách lớp học phần mới được duyệt đơn xin nghỉ.',
      });
    }

    const capNhat = await this.khoPhongHoc.capNhatDonXinNghi(
      idDon,
      duLieu.trangThai as TrangThaiDonXinNghi,
      duLieu.phanHoi,
    );

    // Nếu duyệt đơn, tự động cập nhật trạng thái điểm danh buổi đó thành VANG_CO_PHEP
    if (
      duLieu.trangThai === TrangThaiDonXinNghi.DA_DUYET &&
      don.nguoiGui?.hoSoHocSinh?.id
    ) {
      await this.khoPhongHoc.diemDanhHocSinh(
        don.idBuoiHoc,
        don.nguoiGui.hoSoHocSinh.id,
        TrangThaiDiemDanh.VANG_CO_PHEP,
        `Đơn xin nghỉ đã duyệt: ${don.lyDo.slice(0, 100)}`,
        PhuongThucDiemDanh.DON_XIN_NGHI,
      );
    }

    return capNhat;
  }

  /**
   * Thống kê chuyên cần toàn lớp học phần & Cảnh báo nguy cơ cấm thi thông minh
   */
  async layThongKeChuyenCanLop(
    idLopHocPhan: string,
    nguoiDung: PayloadJwt,
  ): Promise<ThongKeChuyenCanLop> {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: {
        giaoVien: {
          select: {
            idNguoiDung: true,
          },
        },
        cacBuoiHoc: {
          include: {
            banGhiDiemDanh: true,
          },
          orderBy: { thoiGianBD: 'asc' },
        },
        danhSachGhiDanh: {
          include: {
            hocSinh: {
              include: {
                nguoiDung: {
                  select: {
                    id: true,
                    hoTen: true,
                    email: true,
                    anhDaiDien: true,
                  },
                },
                lopHanhChinh: {
                  select: {
                    maLop: true,
                    tenLop: true,
                  },
                },
              },
            },
          },
          orderBy: {
            hocSinh: { maHocSinh: 'asc' },
          },
        },
      },
    });

    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Lớp học phần không tồn tại',
      });
    }

    let danhSachGhiDanhLoc = lop.danhSachGhiDanh;
    let laVaiTroQuanLyLop = this.laQuanTriHoacGiaoVu(nguoiDung.vaiTro);

    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      this.kiemTraQuyenQuanLyLop(
        lop.giaoVien?.idNguoiDung,
        nguoiDung,
        'Chỉ giáo viên phụ trách lớp học phần mới được xem thống kê chuyên cần.',
      );
      laVaiTroQuanLyLop = true;
    } else if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung },
      });
      if (!hoSo) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Bạn không có quyền truy cập lớp học phần này.',
        });
      }
      danhSachGhiDanhLoc = lop.danhSachGhiDanh.filter((gd) => gd.idHocSinh === hoSo.id);
      if (danhSachGhiDanhLoc.length === 0) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Bạn không thuộc danh sách lớp học phần này.',
        });
      }
    } else if (nguoiDung.vaiTro === VaiTro.PHU_HUYNH) {
      const lienKet = await this.prisma.phuHuynhHocSinh.findMany({
        where: { idPhuHuynh: idNguoiDung },
        select: { idHocSinh: true },
      });
      const dsIdCon = new Set(lienKet.map((lk) => lk.idHocSinh));
      danhSachGhiDanhLoc = lop.danhSachGhiDanh.filter((gd) => dsIdCon.has(gd.idHocSinh));
      if (danhSachGhiDanhLoc.length === 0) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Học sinh liên kết không thuộc lớp học phần này.',
        });
      }
    }

    const soDonChoDuyet = laVaiTroQuanLyLop
      ? await this.prisma.donXinNghi.count({
          where: {
            buoiHoc: { idLopHocPhan },
            trangThai: TrangThaiDonXinNghi.CHO_DUYET,
          },
        })
      : 0;

    const nguongBuoiVangCamThi =
      (await this.dichVuCaiDat?.layGiaTriSo('diem_danh.nguong_buoi_vang_cam_thi', 3)) ?? 3;
    const nguongPhanTramCamThi =
      (await this.dichVuCaiDat?.layGiaTriSo(
        'diem_danh.nguong_phan_tram_chuyen_can_cam_thi',
        70,
      )) ?? 70;
    const diemTruVangKhongPhep =
      (await this.dichVuCaiDat?.layGiaTriSo('diem_danh.diem_tru_vang_khong_phep', 2.0)) ?? 2.0;
    const diemTruDiMuonHoacCoPhep =
      (await this.dichVuCaiDat?.layGiaTriSo(
        'diem_danh.diem_tru_di_muon_hoac_co_phep',
        0.5,
      )) ?? 0.5;

    const tongSoBuoiHoc = lop.cacBuoiHoc.length;
    const cacBuoiCoDiemDanh = lop.cacBuoiHoc.filter((b) => b.banGhiDiemDanh.length > 0);
    const soBuoiDaToChuc = cacBuoiCoDiemDanh.length;

    const danhSachHocSinh: ChiTietChuyenCanHocSinh[] = danhSachGhiDanhLoc.map((gd) => {
      const hs = gd.hocSinh;
      let soBuoiCoMat = 0;
      let soBuoiDiMuon = 0;
      let soBuoiVangCoPhep = 0;
      let soBuoiVangKhongPhep = 0;

      for (const buoi of lop.cacBuoiHoc) {
        const bg = buoi.banGhiDiemDanh.find((d) => d.idHocSinh === hs.id);
        if (!bg) continue;
        if (bg.trangThai === TrangThaiDiemDanh.CO_MAT) soBuoiCoMat++;
        else if (bg.trangThai === TrangThaiDiemDanh.DI_MUON) soBuoiDiMuon++;
        else if (bg.trangThai === TrangThaiDiemDanh.VANG_CO_PHEP) soBuoiVangCoPhep++;
        else if (bg.trangThai === TrangThaiDiemDanh.VANG_KHONG_PHEP) soBuoiVangKhongPhep++;
      }

      const tongSoBuoiDaDiemDanh =
        soBuoiCoMat + soBuoiDiMuon + soBuoiVangCoPhep + soBuoiVangKhongPhep;

      const tyLeChuyenCan =
        tongSoBuoiDaDiemDanh > 0
          ? Math.round(
              ((soBuoiCoMat + soBuoiDiMuon * 0.5 + soBuoiVangCoPhep * 0.5) /
                tongSoBuoiDaDiemDanh) *
                100,
            )
          : 100;

      // Quy đổi điểm chuyên cần dự kiến thang 10 theo cài đặt hệ thống
      const diemTru =
        soBuoiVangKhongPhep * diemTruVangKhongPhep +
        soBuoiDiMuon * diemTruDiMuonHoacCoPhep +
        soBuoiVangCoPhep * diemTruDiMuonHoacCoPhep;
      const diemChuyenCanDuKien = Number(Math.max(0, Math.min(10, 10 - diemTru)).toFixed(1));

      let mucCanhBao: 'AN_TOAN' | 'LUU_Y' | 'NGUY_CO_CAM_THI' = 'AN_TOAN';
      let nhanXetChuyenCan = 'Chuyên cần tốt, duy trì tham gia đầy đủ các buổi học.';

      if (
        soBuoiVangKhongPhep >= nguongBuoiVangCamThi ||
        (tongSoBuoiDaDiemDanh >= 3 && tyLeChuyenCan < nguongPhanTramCamThi)
      ) {
        mucCanhBao = 'NGUY_CO_CAM_THI';
        nhanXetChuyenCan = `Cảnh báo học vụ: Vắng không phép ${soBuoiVangKhongPhep} buổi (Tỷ lệ chuyên cần ${tyLeChuyenCan}%), nguy cơ không đủ điều kiện dự thi kết thúc học phần.`;
      } else if (soBuoiVangKhongPhep >= 1 || soBuoiDiMuon >= 2 || tyLeChuyenCan < 85) {
        mucCanhBao = 'LUU_Y';
        nhanXetChuyenCan = `Cần lưu ý: Đã vắng ${soBuoiVangKhongPhep} buổi không phép và đi muộn ${soBuoiDiMuon} buổi. Cần đi học đúng giờ hơn.`;
      }

      return {
        idHocSinh: hs.id,
        maHocSinh: hs.maHocSinh,
        hoTen: hs.nguoiDung.hoTen,
        email: hs.nguoiDung.email,
        anhDaiDien: hs.nguoiDung.anhDaiDien,
        lopHanhChinh: hs.lopHanhChinh?.maLop || null,
        soBuoiCoMat,
        soBuoiDiMuon,
        soBuoiVangCoPhep,
        soBuoiVangKhongPhep,
        tongSoBuoiDaDiemDanh,
        tyLeChuyenCan,
        diemChuyenCanDuKien,
        mucCanhBao,
        nhanXetChuyenCan,
      };
    });

    const tyLeChuyenCanTrungBinh =
      danhSachHocSinh.length > 0
        ? Math.round(
            danhSachHocSinh.reduce((acc, hs) => acc + hs.tyLeChuyenCan, 0) /
              danhSachHocSinh.length,
          )
        : 100;

    const soHocSinhNguyCoCamThi = danhSachHocSinh.filter(
      (hs) => hs.mucCanhBao === 'NGUY_CO_CAM_THI',
    ).length;

    return {
      idLopHocPhan,
      tongSoBuoiHoc,
      soBuoiDaToChuc,
      tyLeChuyenCanTrungBinh,
      soHocSinhNguyCoCamThi,
      soDonXinNghiChoDuyet: soDonChoDuyet,
      danhSachHocSinh,
    };
  }

  // ==========================================
  // ĐIỂM DANH BẰNG KHUÔN MẶT
  // ==========================================

  /**
   * Lấy trạng thái đăng ký dữ liệu khuôn mặt cá nhân (không trả vector thô)
   */
  async layHoSoKhuonMatCaNhan(nguoiDung: PayloadJwt): Promise<HoSoKhuonMat> {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const banGhi = await this.khoPhongHoc.timDuLieuKhuonMatTheoNguoiDung(idNguoiDung);

    if (!banGhi || !banGhi.kichHoat) {
      return {
        daDangKy: false,
        soMauChup: 0,
        diemChatLuong: null,
        kichHoat: false,
        ngayDangKy: null,
        ngayCapNhat: null,
      };
    }

    return {
      daDangKy: true,
      soMauChup: banGhi.soMauChup,
      diemChatLuong: banGhi.diemChatLuong ?? null,
      kichHoat: banGhi.kichHoat,
      ngayDangKy: banGhi.ngayDangKy,
      ngayCapNhat: banGhi.ngayCapNhat,
    };
  }

  /**
   * Đăng ký hoặc cập nhật mẫu đặc trưng khuôn mặt cá nhân
   */
  async dangKyKhuonMat(duLieu: DangKyKhuonMatInput, nguoiDung: PayloadJwt): Promise<HoSoKhuonMat> {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    let vectorChuanHoa: number[];
    try {
      vectorChuanHoa = chuanHoaVectorKhuonMat(duLieu.vectorKhuonMat);
    } catch {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Dữ liệu khuôn mặt không hợp lệ. Vui lòng chụp lại nơi đủ ánh sáng.',
      });
    }

    const banGhi = await this.khoPhongHoc.luuDuLieuKhuonMat(
      idNguoiDung,
      vectorChuanHoa,
      duLieu.soMauChup,
      duLieu.diemChatLuong,
    );

    await this.ghiNhatKyKhuonMat(idNguoiDung, 'DANG_KY_KHUON_MAT', banGhi.id, {
      soMauChup: banGhi.soMauChup,
      diemChatLuong: banGhi.diemChatLuong,
    });

    return {
      daDangKy: true,
      soMauChup: banGhi.soMauChup,
      diemChatLuong: banGhi.diemChatLuong ?? null,
      kichHoat: banGhi.kichHoat,
      ngayDangKy: banGhi.ngayDangKy,
      ngayCapNhat: banGhi.ngayCapNhat,
    };
  }

  /**
   * Xóa dữ liệu khuôn mặt cá nhân theo yêu cầu người dùng
   */
  async xoaHoSoKhuonMatCaNhan(nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const daXoa = await this.khoPhongHoc.xoaDuLieuKhuonMat(idNguoiDung);
    if (daXoa) {
      await this.ghiNhatKyKhuonMat(idNguoiDung, 'XOA_KHUON_MAT', daXoa.id, {
        daXoa: true,
      });
    }

    return {
      daXoa: Boolean(daXoa),
    };
  }

  /**
   * Giáo viên bật hoặc tắt phiên điểm danh khuôn mặt cho buổi học
   */
  async batTatDiemDanhKhuonMat(
    idBuoiHoc: string,
    duLieu: BatTatDiemDanhKhuonMatInput,
    nguoiDung: PayloadJwt,
  ) {
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(idBuoiHoc);
    if (!buoiHoc) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không tồn tại',
      });
    }

    this.kiemTraQuyenQuanLyLop(
      buoiHoc.lopHocPhan?.giaoVien?.idNguoiDung,
      nguoiDung,
      'Chỉ giáo viên phụ trách lớp học phần mới được điều khiển phiên điểm danh khuôn mặt.',
    );

    const han = duLieu.batDiemDanhKhuonMat
      ? new Date(Date.now() + duLieu.thoiHanPhut * 60 * 1000)
      : null;

    return this.khoPhongHoc.capNhatTrangThaiDiemDanhKhuonMat(
      idBuoiHoc,
      duLieu.batDiemDanhKhuonMat,
      han,
    );
  }

  /**
   * Học sinh tự điểm danh bằng khuôn mặt kèm kiểm tra ngưỡng khớp và đi muộn
   */
  async diemDanhBangKhuonMat(
    idBuoiHoc: string,
    duLieu: DiemDanhKhuonMatInput,
    nguoiDung: PayloadJwt,
  ): Promise<KetQuaDiemDanhKhuonMat> {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(idBuoiHoc);
    if (!buoiHoc) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không tồn tại',
      });
    }

    const hoSo = await this.prisma.hoSoHocSinh.findUnique({
      where: { idNguoiDung },
    });
    if (!hoSo) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ tài khoản học sinh mới có thể tự điểm danh bằng khuôn mặt.',
      });
    }

    const daGhiDanh = await this.prisma.ghiDanh.findUnique({
      where: {
        idLopHocPhan_idHocSinh: {
          idLopHocPhan: buoiHoc.idLopHocPhan,
          idHocSinh: hoSo.id,
        },
      },
    });
    if (!daGhiDanh) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Bạn không thuộc danh sách lớp học phần này.',
      });
    }

    if (!buoiHoc.batDiemDanhKhuonMat || !buoiHoc.hanDiemDanhKhuonMat) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Giảng viên chưa mở điểm danh bằng khuôn mặt cho buổi học này.',
      });
    }

    if (new Date() > new Date(buoiHoc.hanDiemDanhKhuonMat)) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Phiên điểm danh khuôn mặt đã hết thời hạn. Vui lòng liên hệ giảng viên.',
      });
    }

    const duLieuMau = await this.khoPhongHoc.timDuLieuKhuonMatTheoNguoiDung(idNguoiDung);
    if (!duLieuMau || !duLieuMau.kichHoat || !Array.isArray(duLieuMau.vectorDacTrung)) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Bạn chưa đăng ký mẫu khuôn mặt trong hồ sơ cá nhân.',
      });
    }

    const nguongKhop =
      (await this.dichVuCaiDat?.layGiaTriSo('diem_danh.nguong_khop_khuon_mat', 0.78)) ?? 0.78;
    const soPhutChoPhepTre =
      (await this.dichVuCaiDat?.layGiaTriSo('diem_danh.so_phut_tinh_di_muon', 15)) ?? 15;

    let ketQuaDoiSoat: { khoangCach: number; doTuongDongCosine: number; doTuongDong: number };
    try {
      ketQuaDoiSoat = doiSoatVectorKhuonMat(
        duLieu.vectorKhuonMat,
        duLieuMau.vectorDacTrung as number[],
      );
    } catch {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Dữ liệu đối soát khuôn mặt không hợp lệ.',
      });
    }

    const khop = ketQuaDoiSoat.doTuongDong >= nguongKhop;
    await this.ghiNhatKyKhuonMat(idNguoiDung, 'DOI_SOAT_KHUON_MAT', idBuoiHoc, {
      khop,
      doTinCay: ketQuaDoiSoat.doTuongDong,
      nguongKhop,
      idBuoiHoc,
    });

    if (!khop) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: `Khuôn mặt chưa khớp (độ tin cậy ${Math.round(ketQuaDoiSoat.doTuongDong * 100)}%, yêu cầu tối thiểu ${Math.round(nguongKhop * 100)}%). Vui lòng nhìn thẳng vào camera nơi đủ ánh sáng và thử lại.`,
      });
    }

    const { trangThai, phutTre } = this.tinhTrangThaiVaDiMuon(
      buoiHoc.thoiGianBD,
      soPhutChoPhepTre,
    );
    const ghiChu =
      trangThai === TrangThaiDiemDanh.DI_MUON
        ? `Điểm danh khuôn mặt (muộn ${phutTre} phút, khớp ${Math.round(ketQuaDoiSoat.doTuongDong * 100)}%)`
        : `Điểm danh khuôn mặt hợp lệ (khớp ${Math.round(ketQuaDoiSoat.doTuongDong * 100)}%)`;

    const banGhi = await this.khoPhongHoc.diemDanhHocSinh(
      idBuoiHoc,
      hoSo.id,
      trangThai,
      ghiChu,
      PhuongThucDiemDanh.KHUON_MAT,
      ketQuaDoiSoat.doTuongDong,
    );

    return {
      banGhi: {
        ...(banGhi as any),
        trangThai: banGhi.trangThai as TrangThaiDiemDanh,
        phuongThuc: PhuongThucDiemDanh.KHUON_MAT,
        doTinCay: ketQuaDoiSoat.doTuongDong,
      },
      doTuongDong: ketQuaDoiSoat.doTuongDong,
      khoangCach: ketQuaDoiSoat.khoangCach,
      trangThai: banGhi.trangThai as TrangThaiDiemDanh,
      thongDiep: ghiChu,
    };
  }

  /**
   * Giáo viên lấy danh sách mẫu khuôn mặt của học sinh trong lớp để đối soát camera lớp học
   */
  async layDanhSachKhuonMatLop(
    idLopHocPhan: string,
    nguoiDung: PayloadJwt,
  ): Promise<MucDuLieuKhuonMatLop[]> {
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: {
        giaoVien: {
          select: { idNguoiDung: true },
        },
      },
    });
    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Lớp học phần không tồn tại',
      });
    }

    this.kiemTraQuyenQuanLyLop(
      lop.giaoVien?.idNguoiDung,
      nguoiDung,
      'Chỉ giáo viên phụ trách lớp học phần mới được truy cập dữ liệu điểm danh của lớp.',
    );

    const danhSachGhiDanh = await this.khoPhongHoc.layDanhSachKhuonMatTheoLop(idLopHocPhan);
    const ketQua: MucDuLieuKhuonMatLop[] = [];

    for (const gd of danhSachGhiDanh) {
      const hs = gd.hocSinh;
      const vector = hs?.nguoiDung?.duLieuKhuonMat?.vectorDacTrung;
      if (!hs || !Array.isArray(vector) || vector.length !== 128) {
        continue;
      }
      ketQua.push({
        idHocSinh: hs.id,
        idNguoiDung: hs.nguoiDung.id,
        maHocSinh: hs.maHocSinh,
        hoTen: hs.nguoiDung.hoTen,
        anhDaiDien: hs.nguoiDung.anhDaiDien,
        vectorKhuonMat: vector as number[],
      });
    }

    return ketQua;
  }

  /**
   * Giáo viên ghi nhận hàng loạt kết quả nhận diện khuôn mặt từ camera lớp học
   */
  async diemDanhKhuonMatTheoLop(
    idBuoiHoc: string,
    duLieu: DiemDanhKhuonMatLopInput,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const buoiHoc = await this.khoPhongHoc.timBuoiHocTheoId(idBuoiHoc);
    if (!buoiHoc) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Buổi học không tồn tại',
      });
    }

    this.kiemTraQuyenQuanLyLop(
      buoiHoc.lopHocPhan?.giaoVien?.idNguoiDung,
      nguoiDung,
      'Chỉ giáo viên phụ trách lớp học phần mới được xác nhận điểm danh khuôn mặt cho lớp.',
    );

    const nguongKhop =
      (await this.dichVuCaiDat?.layGiaTriSo('diem_danh.nguong_khop_khuon_mat', 0.78)) ?? 0.78;
    const soPhutChoPhepTre =
      (await this.dichVuCaiDat?.layGiaTriSo('diem_danh.so_phut_tinh_di_muon', 15)) ?? 15;

    const danhSachGhiDanh = await this.prisma.ghiDanh.findMany({
      where: { idLopHocPhan: buoiHoc.idLopHocPhan },
      select: { idHocSinh: true },
    });
    const tapHocSinhLop = new Set(danhSachGhiDanh.map((gd) => gd.idHocSinh));

    const mucHopLe = duLieu.danhSachNhanDien.filter(
      (muc) => tapHocSinhLop.has(muc.idHocSinh) && muc.doTinCay >= nguongKhop,
    );

    if (mucHopLe.length === 0) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: `Không có học sinh hợp lệ đạt ngưỡng độ tin cậy tối thiểu (${Math.round(nguongKhop * 100)}%).`,
      });
    }

    const { trangThai, phutTre } = this.tinhTrangThaiVaDiMuon(
      buoiHoc.thoiGianBD,
      soPhutChoPhepTre,
    );

    const daLuu = [];
    for (const muc of mucHopLe) {
      const doTinCayLamTron = Number(muc.doTinCay.toFixed(4));
      const ghiChu =
        trangThai === TrangThaiDiemDanh.DI_MUON
          ? `Điểm danh camera lớp (muộn ${phutTre} phút, khớp ${Math.round(doTinCayLamTron * 100)}%)`
          : `Điểm danh camera lớp (khớp ${Math.round(doTinCayLamTron * 100)}%)`;

      const banGhi = await this.khoPhongHoc.diemDanhHocSinh(
        idBuoiHoc,
        muc.idHocSinh,
        trangThai,
        ghiChu,
        PhuongThucDiemDanh.KHUON_MAT,
        doTinCayLamTron,
      );
      daLuu.push(banGhi);
    }

    await this.ghiNhatKyKhuonMat(idNguoiDung, 'DIEM_DANH_KHUON_MAT_LOP', idBuoiHoc, {
      idBuoiHoc,
      soLuongXacNhan: daLuu.length,
      trangThaiApDung: trangThai,
    });

    return {
      idBuoiHoc,
      soLuongCapNhat: daLuu.length,
      trangThaiApDung: trangThai,
    };
  }
}

