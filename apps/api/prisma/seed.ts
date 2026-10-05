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

  // 1b. Ban giám hiệu
  const banGiamHieu = await prisma.nguoiDung.upsert({
    where: { email: 'bangiamhieu@lms.edu.vn' },
    update: {
      hoTen: 'Phạm Thị Hiệu Trưởng',
      matKhau: matKhauHash,
      vaiTro: VaiTro.BAN_GIAM_HIEU,
      kichHoat: true,
    },
    create: {
      email: 'bangiamhieu@lms.edu.vn',
      matKhau: matKhauHash,
      hoTen: 'Phạm Thị Hiệu Trưởng',
      soDienThoai: '0909876543',
      vaiTro: VaiTro.BAN_GIAM_HIEU,
      kichHoat: true,
    },
  });
  console.log('✓ Ban giám hiệu:', banGiamHieu.hoTen, banGiamHieu.email);

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

  // 9. Lớp học phần
  const lopHocPhanToan = await prisma.lopHocPhan.upsert({
    where: { maLopHocPhan: 'LHP-TOAN10-01' },
    update: {
      tenLopHocPhan: 'Toán học 10 - Nhóm 01',
      idMonHoc: monToan.id,
      idHocKy: hocKy.id,
      idGiaoVien: hoSoGiaoVien.id,
      kichHoat: true,
    },
    create: {
      maLopHocPhan: 'LHP-TOAN10-01',
      tenLopHocPhan: 'Toán học 10 - Nhóm 01',
      idMonHoc: monToan.id,
      idHocKy: hocKy.id,
      idGiaoVien: hoSoGiaoVien.id,
      maThamGia: 'TOAN101',
      kichHoat: true,
      moTa: 'Lớp học phần Toán học nâng cao khối 10',
    },
  });

  const lopHocPhanTin = await prisma.lopHocPhan.upsert({
    where: { maLopHocPhan: 'LHP-TIN10-01' },
    update: {
      tenLopHocPhan: 'Tin học 10 - Lập trình Python',
      idMonHoc: monTin.id,
      idHocKy: hocKy.id,
      idGiaoVien: hoSoGiaoVien.id,
      kichHoat: true,
    },
    create: {
      maLopHocPhan: 'LHP-TIN10-01',
      tenLopHocPhan: 'Tin học 10 - Lập trình Python',
      idMonHoc: monTin.id,
      idHocKy: hocKy.id,
      idGiaoVien: hoSoGiaoVien.id,
      maThamGia: 'PYTHON1',
      kichHoat: true,
      moTa: 'Lớp học phần lập trình Python cơ bản và nâng cao',
    },
  });
  console.log('✓ Lớp học phần:', lopHocPhanToan.tenLopHocPhan, ',', lopHocPhanTin.tenLopHocPhan);

  // 10. Ghi danh học sinh vào lớp học phần
  await prisma.ghiDanh.upsert({
    where: {
      idLopHocPhan_idHocSinh: {
        idLopHocPhan: lopHocPhanToan.id,
        idHocSinh: hoSoHocSinh.id,
      },
    },
    update: {},
    create: {
      idLopHocPhan: lopHocPhanToan.id,
      idHocSinh: hoSoHocSinh.id,
    },
  });

  await prisma.ghiDanh.upsert({
    where: {
      idLopHocPhan_idHocSinh: {
        idLopHocPhan: lopHocPhanTin.id,
        idHocSinh: hoSoHocSinh.id,
      },
    },
    update: {},
    create: {
      idLopHocPhan: lopHocPhanTin.id,
      idHocSinh: hoSoHocSinh.id,
    },
  });
  console.log('✓ Ghi danh học sinh vào 2 lớp học phần');

  // 11. Buổi học hôm nay và quá khứ
  const homNay = new Date();
  const buoiHocHomNay = await prisma.buoiHoc.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {
      chuDe: 'Phương trình bậc hai và đồ thị parabol',
      thoiGianBD: new Date(homNay.getFullYear(), homNay.getMonth(), homNay.getDate(), 8, 0, 0),
      thoiGianKT: new Date(homNay.getFullYear(), homNay.getMonth(), homNay.getDate(), 10, 0, 0),
    },
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      idLopHocPhan: lopHocPhanToan.id,
      chuDe: 'Phương trình bậc hai và đồ thị parabol',
      thoiGianBD: new Date(homNay.getFullYear(), homNay.getMonth(), homNay.getDate(), 8, 0, 0),
      thoiGianKT: new Date(homNay.getFullYear(), homNay.getMonth(), homNay.getDate(), 10, 0, 0),
    },
  });

  // Tạo các buổi học và điểm danh 7 ngày qua để có biểu đồ chuyên cần sinh động
  for (let i = 1; i <= 6; i++) {
    const ngayQua = new Date();
    ngayQua.setDate(ngayQua.getDate() - i);
    const idBuoi = `00000000-0000-0000-0000-00000000001${i}`;

    const buoiHocQua = await prisma.buoiHoc.upsert({
      where: { id: idBuoi },
      update: {
        thoiGianBD: new Date(ngayQua.getFullYear(), ngayQua.getMonth(), ngayQua.getDate(), 8, 0, 0),
        thoiGianKT: new Date(ngayQua.getFullYear(), ngayQua.getMonth(), ngayQua.getDate(), 10, 0, 0),
      },
      create: {
        id: idBuoi,
        idLopHocPhan: lopHocPhanToan.id,
        chuDe: `Bài học ôn tập chuyên đề ngày -${i}`,
        thoiGianBD: new Date(ngayQua.getFullYear(), ngayQua.getMonth(), ngayQua.getDate(), 8, 0, 0),
        thoiGianKT: new Date(ngayQua.getFullYear(), ngayQua.getMonth(), ngayQua.getDate(), 10, 0, 0),
      },
    });

    await prisma.banGhiDiemDanh.upsert({
      where: {
        idBuoiHoc_idHocSinh: {
          idBuoiHoc: buoiHocQua.id,
          idHocSinh: hoSoHocSinh.id,
        },
      },
      update: {
        trangThai: i === 3 ? 'VANG_CO_PHEP' : 'CO_MAT',
        ngayDiemDanh: ngayQua,
      },
      create: {
        idBuoiHoc: buoiHocQua.id,
        idHocSinh: hoSoHocSinh.id,
        trangThai: i === 3 ? 'VANG_CO_PHEP' : 'CO_MAT',
        ngayDiemDanh: ngayQua,
      },
    });
  }
  console.log('✓ Buổi học hôm nay & dữ liệu điểm danh 7 ngày');

  // 12. Bài tập & Bài nộp chờ chấm
  const hanNopSapToi = new Date();
  hanNopSapToi.setDate(hanNopSapToi.getDate() + 4);

  const baiTapToan = await prisma.baiTap.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {
      tieuDe: 'Bài tập tuần 4: Bất phương trình bậc nhất và bậc hai',
      hanNop: hanNopSapToi,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      idLopHocPhan: lopHocPhanToan.id,
      tieuDe: 'Bài tập tuần 4: Bất phương trình bậc nhất và bậc hai',
      noiDung: 'Giải các bài tập trong file đính kèm và trình bày lời giải chi tiết.',
      hanNop: hanNopSapToi,
      diemToiDa: 10,
    },
  });

  const hanNopQua = new Date();
  hanNopQua.setDate(hanNopQua.getDate() - 2);

  const baiTapChoCham = await prisma.baiTap.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: {
      tieuDe: 'Bài tập tuần 3: Đồ thị hàm số và ứng dụng thực tế',
      hanNop: hanNopQua,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000021',
      idLopHocPhan: lopHocPhanToan.id,
      tieuDe: 'Bài tập tuần 3: Đồ thị hàm số và ứng dụng thực tế',
      noiDung: 'Vẽ đồ thị và xác định các điểm cực trị.',
      hanNop: hanNopQua,
      diemToiDa: 10,
    },
  });

  await prisma.baiNop.upsert({
    where: {
      idBaiTap_idNguoiDung: {
        idBaiTap: baiTapChoCham.id,
        idNguoiDung: hocSinh.id,
      },
    },
    update: {
      trangThai: 'DA_NOP',
    },
    create: {
      idBaiTap: baiTapChoCham.id,
      idNguoiDung: hocSinh.id,
      noiDung: 'Em xin nộp bài giải tuần 3 ạ.',
      trangThai: 'DA_NOP',
    },
  });
  console.log('✓ Bài tập tuần & Bài nộp chờ giáo viên chấm');

  // 13. Đơn xin nghỉ chờ duyệt
  await prisma.donXinNghi.upsert({
    where: { id: '00000000-0000-0000-0000-000000000030' },
    update: {
      trangThai: 'CHO_DUYET',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000030',
      idBuoiHoc: buoiHocHomNay.id,
      idNguoiDung: hocSinh.id,
      lyDo: 'Em bị sốt xuất huyết cần đi khám bệnh viện.',
      trangThai: 'CHO_DUYET',
    },
  });
  console.log('✓ Đơn xin nghỉ chờ giáo viên duyệt');

  // 14. Bản nháp AI chờ duyệt
  await prisma.banNhapAI.upsert({
    where: { id: '00000000-0000-0000-0000-000000000040' },
    update: {
      trangThai: 'CHO_DUYET',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000040',
      idLopHocPhan: lopHocPhanToan.id,
      idGiaoVien: hoSoGiaoVien.id,
      loaiBanNhap: 'CAU_HOI',
      tieuDe: 'Bộ 5 câu hỏi trắc nghiệm Phương trình bậc hai do AI gợi ý',
      duLieuJson: {
        soCauHoi: 5,
        doKho: 'Trung bình',
      },
      trangThai: 'CHO_DUYET',
    },
  });
  console.log('✓ Bản nháp AI chờ duyệt');

  // 15. Cột điểm và Điểm số cho học sinh
  const cotDiem = await prisma.cotDiem.upsert({
    where: { id: '00000000-0000-0000-0000-000000000050' },
    update: { tenCotDiem: 'Kiểm tra 15 phút (Đại số)', heSo: 1.0 },
    create: {
      id: '00000000-0000-0000-0000-000000000050',
      idLopHocPhan: lopHocPhanToan.id,
      tenCotDiem: 'Kiểm tra 15 phút (Đại số)',
      heSo: 1.0,
    },
  });

  await prisma.diemSo.upsert({
    where: {
      idCotDiem_idHocSinh: {
        idCotDiem: cotDiem.id,
        idHocSinh: hoSoHocSinh.id,
      },
    },
    update: { giaTri: 9.5 },
    create: {
      idCotDiem: cotDiem.id,
      idHocSinh: hoSoHocSinh.id,
      giaTri: 9.5,
      ghiChu: 'Làm bài xuất sắc, trình bày mạch lạc',
    },
  });
  console.log('✓ Cột điểm và Điểm số mới của học sinh');

  // 16. Nhật ký hệ thống mẫu
  const danhSachNhatKy = [
    {
      id: '00000000-0000-0000-0000-000000000060',
      idNguoiDung: admin.id,
      hanhDong: 'DANG_NHAP_THANH_CONG',
      thucThe: 'NguoiDung',
      idThucThe: admin.id,
      diaChiIp: '127.0.0.1',
      chiTiet: { thietBi: 'Chrome Windows' },
    },
    {
      id: '00000000-0000-0000-0000-000000000061',
      idNguoiDung: giaoVu.id,
      hanhDong: 'NHAP_EXCEL_GHI_DANH',
      thucThe: 'GhiDanh',
      idThucThe: lopHocPhanToan.id,
      diaChiIp: '127.0.0.1',
      chiTiet: { soBanGhi: 35, tepTin: 'danh-sach-10a1.xlsx' },
    },
    {
      id: '00000000-0000-0000-0000-000000000062',
      idNguoiDung: giaoVien.id,
      hanhDong: 'TAO_BAI_TAP',
      thucThe: 'BaiTap',
      idThucThe: baiTapToan.id,
      diaChiIp: '127.0.0.1',
      chiTiet: { tieuDe: baiTapToan.tieuDe },
    },
  ];

  for (const nk of danhSachNhatKy) {
    await prisma.nhatKyHeThong.upsert({
      where: { id: nk.id },
      update: {},
      create: nk,
    });
  }
  console.log('✓ Nhật ký kiểm toán hệ thống mẫu');

  // 17. Cài đặt hệ thống mặc định (Settings)
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
      giaTri: 'Trường Đại học Nguyễn Trãi',
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
      khoa: 'URL_LOGO',
      giaTri: '',
      nhom: 'GIAO_DIEN',
      moTa: 'Đường dẫn ảnh Logo hệ thống',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'URL_FAVICON',
      giaTri: '/favicon.ico',
      nhom: 'GIAO_DIEN',
      moTa: 'Đường dẫn Favicon trình duyệt',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'URL_ICON',
      giaTri: '',
      nhom: 'GIAO_DIEN',
      moTa: 'Đường dẫn Biểu tượng thu gọn (App Icon)',
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
    {
      khoa: 'AI_NHA_CUNG_CAP',
      giaTri: 'gemini',
      nhom: 'TRI_TUE_NHAN_TAO',
      moTa: 'Nhà cung cấp mô hình trí tuệ nhân tạo (gemini, groq, openai, ollama, tuy_chon)',
      kieuDuLieu: 'CHUOI',
      congKhai: false,
    },
    {
      khoa: 'AI_API_KEY',
      giaTri: '',
      nhom: 'TRI_TUE_NHAN_TAO',
      moTa: 'Mã khóa API bí mật của nhà cung cấp AI (Google Gemini, OpenAI, Groq)',
      kieuDuLieu: 'CHUOI',
      congKhai: false,
    },
    {
      khoa: 'AI_MODEL',
      giaTri: 'gemini-1.5-flash',
      nhom: 'TRI_TUE_NHAN_TAO',
      moTa: 'Tên mô hình ngôn ngữ lớn (ví dụ: gemini-1.5-flash, llama-3.3-70b-versatile, gpt-4o-mini)',
      kieuDuLieu: 'CHUOI',
      congKhai: false,
    },
    {
      khoa: 'AI_BASE_URL',
      giaTri: '',
      nhom: 'TRI_TUE_NHAN_TAO',
      moTa: 'Địa chỉ máy chủ API tùy biến (dành cho Ollama hoặc máy chủ tương thích OpenAI)',
      kieuDuLieu: 'CHUOI',
      congKhai: false,
    },
    {
      khoa: 'AI_PROMPT_HE_THONG',
      giaTri:
        'Bạn là Trợ lý AI học thuật thông minh của Hệ thống LMS Trường học. Nhiệm vụ của bạn là hỗ trợ sinh viên và giáo viên một cách lịch sự, sư phạm, chính xác bằng tiếng Việt. Nếu có tài liệu lớp học được cung cấp, hãy ưu tiên trích dẫn và giải thích kỹ càng theo nội dung đó. Nếu không có tài liệu cụ thể, hãy hướng dẫn kiến thức nền tảng và khuyên người học trao đổi thêm với giáo viên phụ trách.',
      nhom: 'TRI_TUE_NHAN_TAO',
      moTa: 'Chỉ dẫn hệ thống cốt lõi (System Instruction) định hình văn phong và vai trò của Trợ lý AI',
      kieuDuLieu: 'CHUOI',
      congKhai: false,
    },
    {
      khoa: 'AI_NHIET_DO',
      giaTri: '0.7',
      nhom: 'TRI_TUE_NHAN_TAO',
      moTa: 'Nhiệt độ sáng tạo (Temperature: 0.0 - 1.0)',
      kieuDuLieu: 'SO',
      congKhai: false,
    },
    {
      khoa: 'AI_TOKEN_TOI_DA',
      giaTri: '1024',
      nhom: 'TRI_TUE_NHAN_TAO',
      moTa: 'Giới hạn số lượng token tối đa trong phản hồi',
      kieuDuLieu: 'SO',
      congKhai: false,
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
