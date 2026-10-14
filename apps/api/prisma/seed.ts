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
      giaTri: 'SmartClass AI',
      nhom: 'CHUNG',
      moTa: 'Tên hiển thị thương hiệu của toàn hệ thống',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'KHAU_HIEU',
      giaTri: 'Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo',
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
      giaTri: 'SmartClass AI – Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo',
      nhom: 'GIAO_DIEN',
      moTa: 'Tiêu đề chính trên trang bìa (Landing page)',
      kieuDuLieu: 'CHUOI',
      congKhai: true,
    },
    {
      khoa: 'BANNER_MO_TA',
      giaTri:
        'Nghiên cứu, thiết kế và phát triển hệ thống lớp học số tích hợp trí tuệ nhân tạo SmartClass AI: Điểm danh thông minh, luyện tập, thi thử và quản lý kết quả học phần (K23CNT1 - Nguyễn Quang Tâm).',
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
      giaTri: '',
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
      giaTri: 'Chào mừng bạn đến với Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo SmartClass AI!',
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
        'Bạn là Trợ lý AI học thuật thông minh của Hệ thống Lớp học số SmartClass AI. Nhiệm vụ của bạn là hỗ trợ sinh viên và giáo viên một cách lịch sự, sư phạm, chính xác bằng tiếng Việt. Nếu có tài liệu lớp học được cung cấp, hãy ưu tiên trích dẫn và giải thích kỹ càng theo nội dung đó. Nếu không có tài liệu cụ thể, hãy hướng dẫn kiến thức nền tảng và khuyên người học trao đổi thêm với giáo viên phụ trách.',
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

  const khoaKhongGhiDeNeuDaCo = new Set(['URL_LOGO', 'URL_FAVICON', 'URL_ICON', 'AI_API_KEY', 'AI_BASE_URL']);
  for (const cd of danhSachCaiDatMacDinh) {
    const hienTai = await prisma.caiDatHeThong.findUnique({ where: { khoa: cd.khoa } });
    const giuNguyenGiaTri =
      hienTai && khoaKhongGhiDeNeuDaCo.has(cd.khoa) && hienTai.giaTri && hienTai.giaTri.trim() !== '';

    await prisma.caiDatHeThong.upsert({
      where: { khoa: cd.khoa },
      update: {
        ...(giuNguyenGiaTri ? {} : { giaTri: cd.giaTri }),
        nhom: cd.nhom,
        moTa: cd.moTa,
        kieuDuLieu: cd.kieuDuLieu,
        congKhai: cd.congKhai,
      },
      create: cd,
    });
  }
  console.log(`✓ Đã nạp ${danhSachCaiDatMacDinh.length} thiết lập cài đặt hệ thống mẫu.`);

  // 18. Dữ liệu Luyện tập & Thi thử (SmartClass AI)
  const deLuyenTapToan = await prisma.baiKiemTra.upsert({
    where: { id: '00000000-0000-0000-0000-000000000081' },
    update: {
      tieuDe: 'Luyện tập Chương 2: Hàm số bậc hai và Đồ thị Parabol',
      trangThai: 'DANG_MO',
      thoiGianLamPhut: 15,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000081',
      idLopHocPhan: lopHocPhanToan.id,
      tieuDe: 'Luyện tập Chương 2: Hàm số bậc hai và Đồ thị Parabol',
      moTa: 'Bộ câu hỏi ôn tập củng cố kiến thức về đỉnh parabol, trục đối xứng và xét dấu tam thức bậc hai.',
      cheDo: 'LUYEN_TAP',
      thoiGianLamPhut: 15,
      soLuotToiDa: 10,
      diemToiDa: 10,
      trangThai: 'DANG_MO',
    },
  });

  const deThiThuToan = await prisma.baiKiemTra.upsert({
    where: { id: '00000000-0000-0000-0000-000000000082' },
    update: {
      tieuDe: 'Đề Thi thử Giữa học kỳ 1 - Đại số & Hình học 10',
      trangThai: 'DANG_MO',
      thoiGianLamPhut: 30,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000082',
      idLopHocPhan: lopHocPhanToan.id,
      tieuDe: 'Đề Thi thử Giữa học kỳ 1 - Đại số & Hình học 10',
      moTa: 'Đề thi thử đánh giá năng lực giữa học kỳ có tính điểm thành phần.',
      cheDo: 'THI_THU',
      thoiGianLamPhut: 30,
      soLuotToiDa: 1,
      diemToiDa: 10,
      trangThai: 'DANG_MO',
    },
  });

  const cacCauHoiMau = [
    {
      id: '00000000-0000-0000-0000-000000000801',
      idBaiKiemTra: deLuyenTapToan.id,
      noiDung: 'Cho hàm số bậc hai y = x² - 4x + 3. Tọa độ đỉnh I của đồ thị Parabol là:',
      cacPhuongAn: [
        { ma: 'A', noiDung: 'I(2; -1)' },
        { ma: 'B', noiDung: 'I(-2; 15)' },
        { ma: 'C', noiDung: 'I(4; 3)' },
        { ma: 'D', noiDung: 'I(2; 1)' },
      ],
      dapAnDung: 'A',
      giaiThich: 'Hoành độ đỉnh x = -b/(2a) = 4/2 = 2. Tung độ đỉnh y = 2² - 4(2) + 3 = -1. Vậy I(2; -1).',
      thuTu: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000802',
      idBaiKiemTra: deLuyenTapToan.id,
      noiDung: 'Trục đối xứng của đồ thị hàm số y = 2x² + 6x - 5 là đường thẳng nào sau đây?',
      cacPhuongAn: [
        { ma: 'A', noiDung: 'x = -3/2' },
        { ma: 'B', noiDung: 'x = 3/2' },
        { ma: 'C', noiDung: 'x = -3' },
        { ma: 'D', noiDung: 'y = -3/2' },
      ],
      dapAnDung: 'A',
      giaiThich: 'Trục đối xứng của parabol y = ax² + bx + c là đường thẳng x = -b/(2a) = -6/(2*2) = -3/2.',
      thuTu: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000803',
      idBaiKiemTra: deLuyenTapToan.id,
      noiDung: 'Tam thức bậc hai f(x) = x² - 5x + 6 nhận giá trị âm trong khoảng nào?',
      cacPhuongAn: [
        { ma: 'A', noiDung: '(2; 3)' },
        { ma: 'B', noiDung: '(-∞; 2)' },
        { ma: 'C', noiDung: '(3; +∞)' },
        { ma: 'D', noiDung: '(-3; -2)' },
      ],
      dapAnDung: 'A',
      giaiThich: 'Phương trình x² - 5x + 6 = 0 có 2 nghiệm x = 2 và x = 3. Do hệ số a = 1 > 0 nên f(x) < 0 trong khoảng (2; 3).',
      thuTu: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000811',
      idBaiKiemTra: deThiThuToan.id,
      noiDung: 'Điều kiện cần và đủ để phương trình bậc hai ax² + bx + c = 0 (a ≠ 0) có hai nghiệm phân biệt là:',
      cacPhuongAn: [
        { ma: 'A', noiDung: 'Δ = b² - 4ac > 0' },
        { ma: 'B', noiDung: 'Δ = b² - 4ac ≥ 0' },
        { ma: 'C', noiDung: 'Δ = b² - 4ac = 0' },
        { ma: 'D', noiDung: 'Δ = b² - 4ac < 0' },
      ],
      dapAnDung: 'A',
      giaiThich: 'Phương trình bậc hai có hai nghiệm thực phân biệt khi và chỉ khi biệt thức Δ = b² - 4ac > 0.',
      thuTu: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000812',
      idBaiKiemTra: deThiThuToan.id,
      noiDung: 'Theo định lý Vi-ét, nếu phương trình x² - 7x + 10 = 0 có hai nghiệm x₁, x₂ thì tổng x₁ + x₂ bằng:',
      cacPhuongAn: [
        { ma: 'A', noiDung: '7' },
        { ma: 'B', noiDung: '-7' },
        { ma: 'C', noiDung: '10' },
        { ma: 'D', noiDung: '-10' },
      ],
      dapAnDung: 'A',
      giaiThich: 'Theo hệ thức Vi-ét: x₁ + x₂ = -b/a = 7/1 = 7 và x₁.x₂ = c/a = 10.',
      thuTu: 2,
    },
  ];

  for (const ch of cacCauHoiMau) {
    await prisma.cauHoi.upsert({
      where: { id: ch.id },
      update: {
        noiDung: ch.noiDung,
        cacPhuongAn: ch.cacPhuongAn,
        dapAnDung: ch.dapAnDung,
        giaiThich: ch.giaiThich,
        thuTu: ch.thuTu,
      },
      create: ch,
    });
  }

  await prisma.luotLamBai.upsert({
    where: { id: '00000000-0000-0000-0000-000000000850' },
    update: {
      diemSo: 8.5,
      soCauDung: 2,
      tongSoCau: 2,
      trangThai: 'DA_CHAM',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000850',
      idBaiKiemTra: deThiThuToan.id,
      idHocSinh: hoSoHocSinh.id,
      thoiGianNop: new Date(),
      thoiLuongGiay: 480,
      chiTietTraLoi: [
        {
          idCauHoi: '00000000-0000-0000-0000-000000000811',
          thuTu: 1,
          noiDungCauHoi: 'Điều kiện cần và đủ để phương trình bậc hai ax² + bx + c = 0 (a ≠ 0) có hai nghiệm phân biệt là:',
          dapAnChon: 'A',
          dapAnDung: 'A',
          dungHaySai: true,
          diemDatDuoc: 5,
        },
        {
          idCauHoi: '00000000-0000-0000-0000-000000000812',
          thuTu: 2,
          noiDungCauHoi: 'Theo định lý Vi-ét, nếu phương trình x² - 7x + 10 = 0 có hai nghiệm x₁, x₂ thì tổng x₁ + x₂ bằng:',
          dapAnChon: 'A',
          dapAnDung: 'A',
          dungHaySai: true,
          diemDatDuoc: 5,
        },
      ],
      soCauDung: 2,
      tongSoCau: 2,
      diemSo: 8.5,
      nhanXetAI:
        'Kết quả bài làm rất tốt! Bạn nắm vững định lý Vi-ét và điều kiện nghiệm của phương trình bậc hai. Hãy tiếp tục rèn luyện thêm các bài toán chứa tham số m.',
      trangThai: 'DA_CHAM',
    },
  });
  console.log('✓ Dữ liệu Luyện tập & Thi thử mẫu (SmartClass AI)');

  // 19. Dữ liệu Quản lý kết quả học phần (CotDiem & DiemSo)
  const cacCotDiemMau = [
    {
      id: '00000000-0000-0000-0000-000000000901',
      idLopHocPhan: lopHocPhanToan.id,
      tenCotDiem: 'Chuyên cần',
      heSo: 1,
      giaTriMau: 9.2,
    },
    {
      id: '00000000-0000-0000-0000-000000000902',
      idLopHocPhan: lopHocPhanToan.id,
      tenCotDiem: 'Luyện tập & Bài tập',
      heSo: 2,
      giaTriMau: 8.5,
    },
    {
      id: '00000000-0000-0000-0000-000000000903',
      idLopHocPhan: lopHocPhanToan.id,
      tenCotDiem: 'Giữa kỳ (Thi thử)',
      heSo: 3,
      giaTriMau: 8.5,
    },
    {
      id: '00000000-0000-0000-0000-000000000904',
      idLopHocPhan: lopHocPhanToan.id,
      tenCotDiem: 'Cuối kỳ',
      heSo: 4,
      giaTriMau: 9.0,
    },
  ];

  for (const cd of cacCotDiemMau) {
    const cot = await prisma.cotDiem.upsert({
      where: { id: cd.id },
      update: { tenCotDiem: cd.tenCotDiem, heSo: cd.heSo },
      create: {
        id: cd.id,
        idLopHocPhan: cd.idLopHocPhan,
        tenCotDiem: cd.tenCotDiem,
        heSo: cd.heSo,
      },
    });

    await prisma.diemSo.upsert({
      where: {
        idCotDiem_idHocSinh: {
          idCotDiem: cot.id,
          idHocSinh: hoSoHocSinh.id,
        },
      },
      update: { giaTri: cd.giaTriMau },
      create: {
        idCotDiem: cot.id,
        idHocSinh: hoSoHocSinh.id,
        giaTri: cd.giaTriMau,
      },
    });
  }
  console.log('✓ Dữ liệu Sổ điểm & Quản lý kết quả học phần mẫu (SmartClass AI)');

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
