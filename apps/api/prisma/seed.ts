import { PrismaClient, VaiTro } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bắt đầu gieo mầm dữ liệu chuẩn mực (UTF-8 tiếng Việt) ---');

  // Mật khẩu mặc định: MatKhau@123
  const matKhauHash = await argon2.hash('MatKhau@123', {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

  // 1. Quản trị viên
  const admin = await prisma.nguoiDung.upsert({
    where: { email: 'admin@lms.edu.vn' },
    update: {
      hoTen: 'Quản Trị Viên Hệ Thống',
      matKhau: matKhauHash,
      vaiTro: VaiTro.QUAN_TRI_VIEN,
      kichHoat: true,
    },
    create: {
      email: 'admin@lms.edu.vn',
      matKhau: matKhauHash,
      hoTen: 'Quản Trị Viên Hệ Thống',
      soDienThoai: '0901234567',
      vaiTro: VaiTro.QUAN_TRI_VIEN,
      kichHoat: true,
    },
  });
  console.log('✓ Quản trị viên:', admin.hoTen, admin.email);

  // 2. Cán bộ Giáo vụ
  const giaoVu = await prisma.nguoiDung.upsert({
    where: { email: 'giaovu@lms.edu.vn' },
    update: {
      hoTen: 'Nguyễn Thị Giáo Vụ',
      matKhau: matKhauHash,
      vaiTro: VaiTro.GIAO_VU,
      kichHoat: true,
    },
    create: {
      email: 'giaovu@lms.edu.vn',
      matKhau: matKhauHash,
      hoTen: 'Nguyễn Thị Giáo Vụ',
      soDienThoai: '0912345678',
      vaiTro: VaiTro.GIAO_VU,
      kichHoat: true,
    },
  });
  console.log('✓ Giáo vụ:', giaoVu.hoTen, giaoVu.email);

  // 3. Giáo viên
  const giaoVien = await prisma.nguoiDung.upsert({
    where: { email: 'giaovien1@lms.edu.vn' },
    update: {
      hoTen: 'Trần Văn Giáo Viên',
      matKhau: matKhauHash,
      vaiTro: VaiTro.GIAO_VIEN,
      kichHoat: true,
    },
    create: {
      email: 'giaovien1@lms.edu.vn',
      matKhau: matKhauHash,
      hoTen: 'Trần Văn Giáo Viên',
      soDienThoai: '0923456789',
      vaiTro: VaiTro.GIAO_VIEN,
      kichHoat: true,
    },
  });

  const hoSoGiaoVien = await prisma.hoSoGiaoVien.upsert({
    where: { idNguoiDung: giaoVien.id },
    update: {
      maGiaoVien: 'GV-001',
      hocVi: 'Thạc sĩ',
      chuyenMon: 'Toán học & Tin học',
    },
    create: {
      idNguoiDung: giaoVien.id,
      maGiaoVien: 'GV-001',
      hocVi: 'Thạc sĩ',
      chuyenMon: 'Toán học & Tin học',
    },
  });
  console.log('✓ Giáo viên:', giaoVien.hoTen, hoSoGiaoVien.maGiaoVien);

  // 4. Năm học & Học kỳ
  const namHoc = await prisma.namHoc.upsert({
    where: { tenNamHoc: '2025-2026' },
    update: { hienTai: true },
    create: {
      tenNamHoc: '2025-2026',
      hienTai: true,
    },
  });

  const hocKy = await prisma.hocKy.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      tenHocKy: 'Học kỳ 1 (2025-2026)',
      idNamHoc: namHoc.id,
      hienTai: true,
      ngayBatDau: new Date('2025-09-05'),
      ngayKetThuc: new Date('2026-01-15'),
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      tenHocKy: 'Học kỳ 1 (2025-2026)',
      idNamHoc: namHoc.id,
      hienTai: true,
      ngayBatDau: new Date('2025-09-05'),
      ngayKetThuc: new Date('2026-01-15'),
    },
  });
  console.log('✓ Năm học:', namHoc.tenNamHoc, hocKy.tenHocKy);

  // 5. Lớp hành chính (Lớp sinh hoạt)
  const lopHanhChinh = await prisma.lopHanhChinh.upsert({
    where: { maLop: '10A1' },
    update: {
      tenLop: 'Lớp 10A1 Chuyên Tin',
      khoiLop: 10,
      idGiaoVienCN: hoSoGiaoVien.id,
    },
    create: {
      maLop: '10A1',
      tenLop: 'Lớp 10A1 Chuyên Tin',
      khoiLop: 10,
      idGiaoVienCN: hoSoGiaoVien.id,
    },
  });
  console.log('✓ Lớp sinh hoạt:', lopHanhChinh.tenLop);

  // 6. Môn học
  const monToan = await prisma.monHoc.upsert({
    where: { maMonHoc: 'TOAN10' },
    update: {
      tenMonHoc: 'Toán học 10 Đại số & Hình học',
      soTinChi: 4,
    },
    create: {
      maMonHoc: 'TOAN10',
      tenMonHoc: 'Toán học 10 Đại số & Hình học',
      soTinChi: 4,
    },
  });

  const monTin = await prisma.monHoc.upsert({
    where: { maMonHoc: 'TIN10' },
    update: {
      tenMonHoc: 'Tin học 10 Lập trình Python',
      soTinChi: 3,
    },
    create: {
      maMonHoc: 'TIN10',
      tenMonHoc: 'Tin học 10 Lập trình Python',
      soTinChi: 3,
    },
  });
  console.log('✓ Môn học:', monToan.tenMonHoc, ',', monTin.tenMonHoc);

  // 7. Học sinh
  const hocSinh = await prisma.nguoiDung.upsert({
    where: { email: 'hocsinh1@lms.edu.vn' },
    update: {
      hoTen: 'Lê Hoàng Học Sinh',
      matKhau: matKhauHash,
      vaiTro: VaiTro.HOC_SINH,
      kichHoat: true,
    },
    create: {
      email: 'hocsinh1@lms.edu.vn',
      matKhau: matKhauHash,
      hoTen: 'Lê Hoàng Học Sinh',
      soDienThoai: '0934567890',
      vaiTro: VaiTro.HOC_SINH,
      kichHoat: true,
    },
  });

  const hoSoHocSinh = await prisma.hoSoHocSinh.upsert({
    where: { idNguoiDung: hocSinh.id },
    update: {
      maHocSinh: 'HS-2025-001',
      idLopHanhChinh: lopHanhChinh.id,
      diaChi: 'Hà Nội, Việt Nam',
      ngaySinh: new Date('2010-05-15'),
    },
    create: {
      idNguoiDung: hocSinh.id,
      maHocSinh: 'HS-2025-001',
      idLopHanhChinh: lopHanhChinh.id,
      diaChi: 'Hà Nội, Việt Nam',
      ngaySinh: new Date('2010-05-15'),
    },
  });
  console.log('✓ Học sinh:', hocSinh.hoTen, hoSoHocSinh.maHocSinh);

  // 8. Phụ huynh
  const phuHuynh = await prisma.nguoiDung.upsert({
    where: { email: 'phuhuynh1@lms.edu.vn' },
    update: {
      hoTen: 'Phạm Văn Phụ Huynh',
      matKhau: matKhauHash,
      vaiTro: VaiTro.PHU_HUYNH,
      kichHoat: true,
    },
    create: {
      email: 'phuhuynh1@lms.edu.vn',
      matKhau: matKhauHash,
      hoTen: 'Phạm Văn Phụ Huynh',
      soDienThoai: '0945678901',
      vaiTro: VaiTro.PHU_HUYNH,
      kichHoat: true,
    },
  });

  await prisma.phuHuynhHocSinh.upsert({
    where: {
      idPhuHuynh_idHocSinh: {
        idPhuHuynh: phuHuynh.id,
        idHocSinh: hoSoHocSinh.id,
      },
    },
    update: {
      moiQuanHe: 'Bố',
    },
    create: {
      idPhuHuynh: phuHuynh.id,
      idHocSinh: hoSoHocSinh.id,
      moiQuanHe: 'Bố',
    },
  });
  console.log('✓ Phụ huynh:', phuHuynh.hoTen, 'liên kết với học sinh:', hocSinh.hoTen);

  // 9. Cài đặt hệ thống mặc định (Settings)
  const danhSachCaiDatMacDinh = [
    {
      khoa: 'TEN_HE_THONG',
      giaTri: 'LMS Trường Học',
      nhom: 'CHUNG',
      moTa: 'Tên hiển thị thương hiệu của toàn hệ thống',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'KHAU_HIEU',
      giaTri: 'Hệ thống Quản lý Học tập Thế hệ Mới',
      nhom: 'CHUNG',
      moTa: 'Khẩu hiệu / Slogan hiển thị ở đầu trang và banner',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'TEN_TRUONG',
      giaTri: 'Trường Đại học Công nghệ',
      nhom: 'CHUNG',
      moTa: 'Tên cơ sở giáo dục hoặc viện đào tạo',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'TAC_GIA',
      giaTri: 'Nguyễn Quang Tâm',
      nhom: 'CHUNG',
      moTa: 'Tác giả / Sinh viên thực hiện đồ án',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'MA_LOP_KHOA',
      giaTri: 'K23CNT1',
      nhom: 'CHUNG',
      moTa: 'Lớp sinh hoạt / Khóa học của tác giả',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'MSSV',
      giaTri: '2310900093',
      nhom: 'CHUNG',
      moTa: 'Mã số sinh viên thực hiện đồ án',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'EMAIL_LIEN_HE',
      giaTri: 'nguyenquangtam179@gmail.com',
      nhom: 'LIEN_HE',
      moTa: 'Hòm thư điện tử tiếp nhận liên hệ và hỗ trợ',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'SO_DIEN_THOAI',
      giaTri: '0987654321',
      nhom: 'LIEN_HE',
      moTa: 'Số điện thoại hotline hỗ trợ kỹ thuật',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'BANNER_TIEU_DE',
      giaTri: 'Nền tảng Học tập Toàn diện Tích hợp Phòng học LiveKit & Trợ lý AI',
      nhom: 'GIAO_DIEN',
      moTa: 'Tiêu đề chính trên trang bìa (Landing page)',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'BANNER_MO_TA',
      giaTri:
        'Đồ án tốt nghiệp chuyên ngành Công nghệ Thông tin (K23CNT1 - Sinh viên Nguyễn Quang Tâm). Tối ưu hóa trải nghiệm giảng dạy trực tuyến, quản lý học vụ và hỗ trợ học tập thông minh.',
      nhom: 'GIAO_DIEN',
      moTa: 'Đoạn giới thiệu tóm tắt bên dưới tiêu đề trang chủ',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'CHO_PHEP_DANG_KY',
      giaTri: 'true',
      nhom: 'HOC_VU',
      moTa: 'Cho phép người dùng tự đăng ký tài khoản mới trên giao diện khách',
      kieuDuLieu: 'LOGIC',
      congKhai: true,
    },
    {
      khoa: 'THONG_BAO_CHUNG',
      giaTri: 'Chào mừng bạn đến với Hệ thống Quản lý Học tập LMS Trường học!',
      nhom: 'CHUNG',
      moTa: 'Thông báo ghim trên toàn hệ thống',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
  ];

  for (const cd of danhSachCaiDatMacDinh) {
    await prisma.caiDatHeThong.upsert({
      where: { khoa: cd.khoa },
      update: {
        giaTri: cd.giaTri,
        nhom: cd.nhom,
        moTa: cd.moTa,
        kieuDuLieu: cd.kieuDuLieu,
        congKhai: cd.congKhai,
      },
      create: cd,
    });
  }
  console.log(`✓ Đã nạp ${danhSachCaiDatMacDinh.length} thiết lập cài đặt hệ thống mẫu.`);

  console.log('--- Hoàn thành gieo mầm dữ liệu chuẩn mực ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
