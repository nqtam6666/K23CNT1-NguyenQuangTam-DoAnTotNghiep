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
  VaiTro,
} from '@lms/chung';

@Injectable()
export class DichVuPhongHoc {
  private readonly logger = new Logger(DichVuPhongHoc.name);

  constructor(
    private readonly khoPhongHoc: KhoPhongHoc,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Cấp Token truy cập ngắn hạn (TTL = 120 phút) cho phòng học LiveKit
   * Kiểm tra quyền nghiêm ngặt chống IDOR (chỉ thành viên lớp mới được vào)
   */
  async taoTokenTruyCap(
    idLopHocPhan: string,
    nguoiDung: PayloadJwt,
    idBuoiHoc?: string,
  ): Promise<KetQuaTokenLiveKit> {
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

    // 2. Kiểm soát phân quyền & chống IDOR
    let laChuTri = false;

    if (
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.GIAO_VU
    ) {
      laChuTri = true;
    } else if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      // Giáo viên phải là người trực tiếp giảng dạy lớp này
      if (lopHocPhan.giaoVien?.idNguoiDung !== nguoiDung.id) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep:
            'Bạn không phải giáo viên phụ trách lớp học phần này (Kiểm soát chống IDOR)',
        });
      }
      laChuTri = true;
    } else if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      // Học sinh phải có bản ghi ghi danh hợp lệ
      const hoSoHocSinh = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung: nguoiDung.id },
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
            'Bạn chưa ghi danh vào lớp học phần này nên không thể vào phòng học (Kiểm soát chống IDOR)',
        });
      }
      laChuTri = false;
    } else {
      // Phụ huynh hoặc vai trò khác không được trực tiếp tham gia phòng
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
      this.configService.get<string>('LIVEKIT_API_SECRET') ||
      'secret_key_livekit_lms_2026';
    const urlMayChuLiveKit =
      this.configService.get<string>('LIVEKIT_URL') || 'ws://localhost:7880';

    const at = new AccessToken(apiKey, apiSecret, {
      identity: nguoiDung.id,
      name: nguoiDung.hoTen,
      ttl: '2h',
      metadata: JSON.stringify({
        idNguoiDung: nguoiDung.id,
        hoTen: nguoiDung.hoTen,
        vaiTro: nguoiDung.vaiTro,
        laChuTri,
      }),
    });

    at.addGrant({
      roomJoin: true,
      room: phong.tenPhong,
      canPublish: true, // Cả giáo viên và học sinh đều có quyền bật mic/cam
      canSubscribe: true,
      canPublishData: true, // Quyền chat trong phòng
      roomAdmin: laChuTri, // Chỉ Host mới có quyền quản trị phòng LiveKit
    });

    const token = await at.toJwt();

    // 5. Nếu có buổi học cụ thể -> ghi nhật ký vào phòng trước (cho trường hợp không dùng webhook)
    if (idBuoiHoc) {
      const buoiHoc = await this.prisma.buoiHoc.findUnique({
        where: { id: idBuoiHoc },
      });
      if (buoiHoc) {
        await this.khoPhongHoc.ghiNhatKyVao(idBuoiHoc, nguoiDung.id);
        // Tự động điểm danh nếu là học sinh
        if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
          const hoSo = await this.prisma.hoSoHocSinh.findUnique({
            where: { idNguoiDung: nguoiDung.id },
          });
          if (hoSo) {
            await this.khoPhongHoc.diemDanhHocSinh(
              idBuoiHoc,
              hoSo.id,
              TrangThaiDiemDanh.CO_MAT,
              'Tham gia phòng học trực tuyến LiveKit',
            );
          }
        }
      }
    }

    this.logger.log(
      `Đã cấp LiveKit token thành công cho: ${nguoiDung.hoTen} (${nguoiDung.vaiTro}) vào phòng: ${phong.tenPhong}`,
    );

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
  async batTatPhongHoc(
    idLopHocPhan: string,
    dangMo: boolean,
    nguoiDung: PayloadJwt,
  ) {
    const phong = await this.khoPhongHoc.timPhongTheoLop(idLopHocPhan);
    if (!phong) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Phòng học trực tuyến chưa được khởi tạo',
      });
    }

    // Kiểm tra quyền: Giáo viên phụ trách hoặc Admin/Giáo vụ
    const laAdminHoacGiaoVu =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienPhuTrach =
      phong.lopHocPhan?.giaoVien?.idNguoiDung === nguoiDung.id;

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
   * Xác thực chữ ký số bằng WebhookReceiver
   */
  async xuLyWebhook(authorizationHeader: string, bodyRaw: string | Buffer) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || 'devkey';
    const apiSecret =
      this.configService.get<string>('LIVEKIT_API_SECRET') ||
      'secret_key_livekit_lms_2026';

    const receiver = new WebhookReceiver(apiKey, apiSecret);
    let event: any;

    try {
      const bodyStr = Buffer.isBuffer(bodyRaw) ? bodyRaw.toString('utf-8') : bodyRaw;
      event = await receiver.receive(bodyStr, authorizationHeader);
    } catch (err: any) {
      this.logger.error(`Xác thực chữ ký Webhook LiveKit thất bại: ${err.message}`);
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Chữ ký Webhook LiveKit không hợp lệ',
      });
    }

    const tenPhong = event.room?.name;
    const suKien = event.event;

    this.logger.log(`LiveKit Webhook nhận sự kiện: ${suKien} cho phòng: ${tenPhong}`);

    if (!tenPhong) return { thanhCong: true };

    const phong = await this.khoPhongHoc.timTheoTenPhong(tenPhong);
    if (!phong) return { thanhCong: true };

    const buoiHocHienTai = await this.khoPhongHoc.timBuoiHocHienTai(
      phong.idLopHocPhan,
    );

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

          // Tự động điểm danh có mặt nếu là học sinh
          const hoSo = await this.prisma.hoSoHocSinh.findUnique({
            where: { idNguoiDung },
          });
          if (hoSo) {
            await this.khoPhongHoc.diemDanhHocSinh(
              buoiHocHienTai.id,
              hoSo.id,
              TrangThaiDiemDanh.CO_MAT,
              'Có mặt qua phòng học LiveKit',
            );
          }
        }
        break;

      case 'participant_left':
        if (event.participant?.identity && buoiHocHienTai) {
          await this.khoPhongHoc.ghiNhatKyRoi(
            buoiHocHienTai.id,
            event.participant.identity,
          );
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
  async layBaoCaoBuoiHoc(
    idLopHocPhan: string,
    idBuoiHoc: string,
    nguoiDung: PayloadJwt,
  ) {
    // 1. Kiểm tra quyền truy cập lớp học phần
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

    // 2. Chống IDOR: Học sinh/Phụ huynh chỉ xem nếu thuộc lớp
    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung: nguoiDung.id },
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

    const nhatKy = await this.khoPhongHoc.layNhatKyTheoBuoi(idBuoiHoc);
    const diemDanh = await this.khoPhongHoc.layDanhSachDiemDanh(idBuoiHoc);

    return {
      idBuoiHoc,
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
}
