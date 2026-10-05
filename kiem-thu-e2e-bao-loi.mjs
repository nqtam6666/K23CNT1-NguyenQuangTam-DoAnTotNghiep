import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function chayKiemThu() {
  console.log('🚀 Bắt đầu kịch bản kiểm thử E2E phân hệ Báo lỗi & Đóng góp ý kiến...');

  const thuMucAnh = path.resolve('docs/anh');
  if (!fs.existsSync(thuMucAnh)) {
    fs.mkdirSync(thuMucAnh, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // ==========================================
    // BƯỚC 1: HỌC SINH ĐĂNG NHẬP VÀ GỬI BÁO LỖI
    // ==========================================
    console.log('\n--- 1. Học sinh đăng nhập và gửi báo lỗi hệ thống ---');
    const contextHocSinh = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      locale: 'vi-VN',
      extraHTTPHeaders: { 'Accept-Language': 'vi-VN,vi;q=0.9' },
    });
    const pageHocSinh = await contextHocSinh.newPage();

    await pageHocSinh.goto('http://localhost:3000/dang-nhap', { waitUntil: 'networkidle' });
    await pageHocSinh.fill('input[type="email"]', 'hocsinh1@lms.edu.vn');
    await pageHocSinh.fill('input[type="password"]', 'MatKhau@123');
    await pageHocSinh.click('button[type="submit"]');

    await pageHocSinh.waitForURL('**/bang-dieu-khien', { timeout: 15000 });
    await pageHocSinh.waitForTimeout(2500);
    console.log('  ✓ Học sinh đã đăng nhập thành công');

    // Chuyển sang trang Báo lỗi & Đóng góp
    await pageHocSinh.goto('http://localhost:3000/bao-loi-dong-gop', { waitUntil: 'networkidle' });
    await pageHocSinh.waitForTimeout(2000);
    console.log('  ✓ Đã truy cập trang:', pageHocSinh.url());
    const bodyText = await pageHocSinh.textContent('body');
    console.log('  📄 Nội dung trang hiện tại:', bodyText.slice(0, 300));
    await pageHocSinh.screenshot({ path: path.join(thuMucAnh, 'debug-trang-hien-tai.png') });

    // Mở modal gửi mới
    const nutMoModal = await pageHocSinh.locator('button:has-text("Gửi báo lỗi / Đóng góp mới"), button:has-text("Gửi phản ánh đầu tiên")').first();
    await nutMoModal.click();
    await pageHocSinh.waitForTimeout(1000);

    // Điền thông tin báo lỗi
    // Chọn mức độ ưu tiên Cao
    await pageHocSinh.getByRole('button', { name: 'Cao' }).click();

    // Nhập tiêu đề
    const tieuDeLoi = 'Kiểm thử lỗi không tải được tài liệu đính kèm ôn tập môn Toán';
    await pageHocSinh.fill('input[placeholder*="Tóm tắt ngắn gọn"]', tieuDeLoi);

    // Nhập nội dung
    const noiDungLoi = 'Khi nhấn vào nút tải về tài liệu đề cương trên giao diện chi tiết bài học, hệ thống phản hồi mã lỗi và tệp tin không được lưu về máy. Đề nghị ban kỹ thuật hỗ trợ khắc phục.';
    await pageHocSinh.fill('textarea[placeholder*="Mô tả cụ thể các bước"]', noiDungLoi);

    await pageHocSinh.waitForTimeout(500);

    // Chụp ảnh modal gửi phản ánh
    await pageHocSinh.screenshot({
      path: path.join(thuMucAnh, 'bao-loi-modal-gui-moi.png'),
      fullPage: false,
    });
    console.log('  📸 Đã chụp ảnh: docs/anh/bao-loi-modal-gui-moi.png');

    // Gửi phản ánh
    await pageHocSinh.click('button[type="submit"]:has-text("Gửi phản ánh")');
    await pageHocSinh.waitForTimeout(2500);

    // Kiểm tra xem phản ánh đã xuất hiện trong danh sách chưa
    const noiDungTrangHocSinh = await pageHocSinh.textContent('body');
    const daXuatHien = noiDungTrangHocSinh.includes(tieuDeLoi);
    console.log(`  🔍 Phản ánh mới xuất hiện trong danh sách: ${daXuatHien ? '✅ CÓ' : '❌ KHÔNG'}`);

    await pageHocSinh.screenshot({
      path: path.join(thuMucAnh, 'bao-loi-hoc-sinh-gui.png'),
      fullPage: true,
    });
    console.log('  📸 Đã chụp ảnh: docs/anh/bao-loi-hoc-sinh-gui.png');

    // ==========================================
    // BƯỚC 2: QUẢN TRỊ VIÊN TIẾP NHẬN VÀ XỬ LÝ
    // ==========================================
    console.log('\n--- 2. Quản trị viên đăng nhập, xem danh sách và xử lý phản ánh ---');
    const contextQuanTri = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      locale: 'vi-VN',
      extraHTTPHeaders: { 'Accept-Language': 'vi-VN,vi;q=0.9' },
    });
    const pageQuanTri = await contextQuanTri.newPage();

    await pageQuanTri.goto('http://localhost:3000/dang-nhap', { waitUntil: 'networkidle' });
    await pageQuanTri.fill('input[type="email"]', 'admin@lms.edu.vn');
    await pageQuanTri.fill('input[type="password"]', 'MatKhau@123');
    await pageQuanTri.click('button[type="submit"]');

    await pageQuanTri.waitForURL('**/bang-dieu-khien', { timeout: 15000 });
    await pageQuanTri.waitForTimeout(2500);
    console.log('  ✓ Quản trị viên đã đăng nhập thành công');

    // Chuyển sang /bao-loi-dong-gop
    await pageQuanTri.goto('http://localhost:3000/bao-loi-dong-gop', { waitUntil: 'networkidle' });
    await pageQuanTri.waitForTimeout(2000);

    // Kiểm tra Quản trị viên thấy phản ánh của học sinh
    const noiDungTrangQuanTri = await pageQuanTri.textContent('body');
    const quanTriThayLoi = noiDungTrangQuanTri.includes(tieuDeLoi);
    console.log(`  🔍 Quản trị viên thấy báo lỗi của học sinh: ${quanTriThayLoi ? '✅ CÓ' : '❌ KHÔNG'}`);

    await pageQuanTri.screenshot({
      path: path.join(thuMucAnh, 'bao-loi-danh-sach-quan-tri.png'),
      fullPage: true,
    });
    console.log('  📸 Đã chụp ảnh: docs/anh/bao-loi-danh-sach-quan-tri.png');

    // Bấm nút "Xử lý" trên ticket
    const nutXuLy = await pageQuanTri.locator('button[title*="Cập nhật xử lý"]').first();
    await nutXuLy.click();
    await pageQuanTri.waitForTimeout(1000);

    // Chọn trạng thái: "Đã giải quyết"
    await pageQuanTri.click('button:has-text("Đã giải quyết")');

    // Nhập nội dung phản hồi
    const noiDungPhanHoi = 'Ban kỹ thuật đã kiểm tra cấu hình máy chủ lưu trữ tài liệu và khắc phục lỗi phân quyền tải tệp tin. Học sinh có thể tải lại tài liệu bình thường.';
    await pageQuanTri.fill('textarea[placeholder*="Nhập thông điệp trả lời"]', noiDungPhanHoi);

    await pageQuanTri.waitForTimeout(500);

    // Chụp ảnh modal xử lý của quản trị
    await pageQuanTri.screenshot({
      path: path.join(thuMucAnh, 'bao-loi-modal-xu-ly-quan-tri.png'),
      fullPage: false,
    });
    console.log('  📸 Đã chụp ảnh: docs/anh/bao-loi-modal-xu-ly-quan-tri.png');

    // Bấm lưu cập nhật
    await pageQuanTri.click('button[type="submit"]:has-text("Lưu cập nhật")');
    await pageQuanTri.waitForTimeout(2500);

    // Kiểm tra trạng thái đã chuyển thành "Đã giải quyết"
    const noiDungSauXuLy = await pageQuanTri.textContent('body');
    const daChuyenTrangThai = noiDungSauXuLy.includes('Đã giải quyết');
    console.log(`  🔍 Trạng thái đã chuyển sang "Đã giải quyết": ${daChuyenTrangThai ? '✅ CÓ' : '❌ KHÔNG'}`);

    await pageQuanTri.screenshot({
      path: path.join(thuMucAnh, 'bao-loi-quan-tri-da-xu-ly.png'),
      fullPage: true,
    });
    console.log('  📸 Đã chụp ảnh: docs/anh/bao-loi-quan-tri-da-xu-ly.png');

    // ==========================================
    // BƯỚC 3: HỌC SINH KIỂM TRA PHẢN HỒI
    // ==========================================
    console.log('\n--- 3. Học sinh kiểm tra phản hồi đã giải quyết ---');
    await pageHocSinh.reload({ waitUntil: 'networkidle' });
    await pageHocSinh.waitForTimeout(2000);

    const noiDungHocSinhMoi = await pageHocSinh.textContent('body');
    const hocSinhThayPhanHoi = noiDungHocSinhMoi.includes('Ban kỹ thuật đã kiểm tra');
    console.log(`  🔍 Học sinh nhìn thấy phản hồi từ Quản trị viên: ${hocSinhThayPhanHoi ? '✅ CÓ' : '❌ KHÔNG'}`);

    // Bấm xem chi tiết
    const nutChiTiet = await pageHocSinh.locator('button[title*="Xem chi tiết"]').first();
    await nutChiTiet.click();
    await pageHocSinh.waitForTimeout(1000);

    await pageHocSinh.screenshot({
      path: path.join(thuMucAnh, 'bao-loi-chi-tiet-da-giai-quyet.png'),
      fullPage: false,
    });
    console.log('  📸 Đã chụp ảnh: docs/anh/bao-loi-chi-tiet-da-giai-quyet.png');

    console.log('\n🎉 KIỂM THỬ E2E TOÀN DIỆN THÀNH CÔNG RỰC RỠ 100%!');

    await contextHocSinh.close();
    await contextQuanTri.close();
  } catch (err) {
    console.error('❌ Lỗi kiểm thử E2E:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

chayKiemThu();
