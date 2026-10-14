import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, WebhookReceiver } from 'livekit-server-sdk';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { KhoPhongHoc } from './kho-phong-hoc.repository';
import {
  KetQuaTokenLiveKit,
  PayloadJwt,
  TrangThaiBuoiHoc,
  TrangThaiDiemDanh,
  TrangThaiDonXinNghi,
  VaiTro,
  DiemDanhHangLoatInput,
  TaoDonXinNghiInput,
  DuyetDonXinNghiInput,
  ThongKeChuyenCanLop,
  ChiTietChuyenCanHocSinh,
} from '@lms/chung';

@Injectable()
export class DichVuPhongHoc {
  private readonly logger = new Logger(DichVuPhongHoc.name);

  constructor(
    private readonly khoPhongHoc: KhoPhongHoc,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private layIdNguoiDung(nguoiDung: PayloadJwt): string {
    return nguoiDung.sub || (nguoiDung as any).id;
  }

  /**
   * Cấp Token truy cập ngắn hạn (TTL = 120 phút) cho phòng học LiveKit
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

    const at = new AccessToken(apiKey, apiSecret, {
      identity: idNguoiDung,
      name: nguoiDung.hoTen,
      ttl: '2h',
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

    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
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
    }

    const buoiHoc = await this.prisma.buoiHoc.findUnique({
      where: { id: idBuoiHoc },
    });
    const nhatKy = await this.khoPhongHoc.layNhatKyTheoBuoi(idBuoiHoc);
    const diemDanh = await this.khoPhongHoc.layDanhSachDiemDanh(idBuoiHoc);

    return {
      idBuoiHoc,
      buoiHoc,
      danhSachNhatKy: nhatKy,
      danhSachDiemDanh: diemDanh,
    };
  }

  /**
   * Điểm danh thủ công hoặc sửa đổi trạng thái điểm danh
   */
  async diemDanhThuCong(
    idBuoiHoc: string,
    idHocSinh: string,
    trangThai: TrangThaiDiemDanh,
    ghiChu?: string,
  ) {
    return this.khoPhongHoc.diemDanhHocSinh(idBuoiHoc, idHocSinh, trangThai, ghiChu);
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
            ngayDiemDanh: new Date(),
          },
          create: {
            idBuoiHoc,
            idHocSinh: muc.idHocSinh,
            trangThai: muc.trangThai as TrangThaiDiemDanh,
            ghiChu: muc.ghiChu,
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
        );
        soVangCoPhep++;
        continue;
      }

      // Kiểm tra nhật ký tham gia phòng trực tuyến
      const cacLuotVao = nhatKyBuoi.filter((nk) => nk.idNguoiDung === idUserHS);
      if (cacLuotVao.length > 0) {
        // Kiểm tra xem lần vào đầu tiên có trễ hơn 15 phút so với giờ bắt đầu không
        const lanVaoDau = cacLuotVao.reduce((min, cur) =>
          cur.thoiGianVao < min.thoiGianVao ? cur : min,
        );
        const phutTre =
          (new Date(lanVaoDau.thoiGianVao).getTime() - new Date(buoiHoc.thoiGianBD).getTime()) /
          (60 * 1000);

        if (phutTre > 15) {
          await this.khoPhongHoc.diemDanhHocSinh(
            idBuoiHoc,
            idHocSinh,
            TrangThaiDiemDanh.DI_MUON,
            `Vào phòng trực tuyến muộn ${Math.round(phutTre)} phút`,
          );
          soDiMuon++;
        } else {
          await this.khoPhongHoc.diemDanhHocSinh(
            idBuoiHoc,
            idHocSinh,
            TrangThaiDiemDanh.CO_MAT,
            'Hiện diện đầy đủ trên phòng học trực tuyến',
          );
          soCoMat++;
        }
        continue;
      }

      // Nếu đã điểm danh bằng mã PIN hoặc thủ công trước đó thì giữ nguyên
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
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: {
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

    const soDonChoDuyet = await this.prisma.donXinNghi.count({
      where: {
        buoiHoc: { idLopHocPhan },
        trangThai: TrangThaiDonXinNghi.CHO_DUYET,
      },
    });

    const tongSoBuoiHoc = lop.cacBuoiHoc.length;
    const cacBuoiCoDiemDanh = lop.cacBuoiHoc.filter((b) => b.banGhiDiemDanh.length > 0);
    const soBuoiDaToChuc = cacBuoiCoDiemDanh.length;

    const danhSachHocSinh: ChiTietChuyenCanHocSinh[] = lop.danhSachGhiDanh.map((gd) => {
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

      // Quy đổi điểm chuyên cần dự kiến thang 10
      const diemTru =
        soBuoiVangKhongPhep * 2.0 + soBuoiDiMuon * 0.5 + soBuoiVangCoPhep * 0.5;
      const diemChuyenCanDuKien = Number(Math.max(0, Math.min(10, 10 - diemTru)).toFixed(1));

      let mucCanhBao: 'AN_TOAN' | 'LUU_Y' | 'NGUY_CO_CAM_THI' = 'AN_TOAN';
      let nhanXetChuyenCan = 'Chuyên cần tốt, duy trì tham gia đầy đủ các buổi học.';

      if (soBuoiVangKhongPhep >= 3 || (tongSoBuoiDaDiemDanh >= 3 && tyLeChuyenCan < 70)) {
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
}

