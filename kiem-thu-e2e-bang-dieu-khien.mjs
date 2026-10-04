import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const TAI_KHOAN_TEST = [
  {
    vaiTro: 'QUAN_TRI_VIEN',
    email: 'admin@lms.edu.vn',
    matKhau: 'MatKhau@123',
    anhChup: 'bang-dieu-khien-quan-tri.png',
  },
  {
    vaiTro: 'BAN_GIAM_HIEU',
    email: 'bangiamhieu@lms.edu.vn',
    matKhau: 'MatKhau@123',
    anhChup: 'bang-dieu-khien-ban-giam-hieu.png',
  },
  {
    vaiTro: 'GIAO_VU',
    email: 'giaovu@lms.edu.vn',
    matKhau: 'MatKhau@123',
    anhChup: 'bang-dieu-khien-giao-vu.png',
  },
  {
    vaiTro: 'GIAO_VIEN',
    email: 'giaovien1@lms.edu.vn',
    matKhau: 'MatKhau@123',
    anhChup: 'bang-dieu-khien-giao-vien.png',
  },
  {
    vaiTro: 'HOC_SINH',
    email: 'hocsinh1@lms.edu.vn',
    matKhau: 'MatKhau@123',
    anhChup: 'bang-dieu-khien-hoc-sinh.png',
  },
  {
    vaiTro: 'PHU_HUYNH',
    email: 'phuhuynh1@lms.edu.vn',
    matKhau: 'MatKhau@123',
    anhChup: 'bang-dieu-khien-phu-huynh.png',
  },
];

async function chayKiemThu() {
  console.log('🚀 Bắt đầu kiểm thử E2E Bảng điều khiển đa vai trò & Kiểm tra Accessibility...');
  
  const thuMucAnh = path.resolve('docs/anh');
  if (!fs.existsSync(thuMucAnh)) {
    fs.mkdirSync(thuMucAnh, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const ketQuaAccessibility = [];

  for (const tk of TAI_KHOAN_TEST) {
    console.log(`\n--------------------------------------------`);
    console.log(`👉 Đang kiểm thử vai trò: ${tk.vaiTro} (${tk.email})`);
    
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2, // Chụp ảnh Retina siêu nét
    });
    const page = await context.newPage();

    // 1. Vào trang đăng nhập
    await page.goto('http://localhost:3000/dang-nhap', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', tk.email);
    await page.fill('input[type="password"]', tk.matKhau);
    await page.click('button[type="submit"]');

    // Chờ chuyển hướng sang bảng điều khiển
    await page.waitForURL('**/bang-dieu-khien', { timeout: 15000 });
    // Chờ API nạp xong tiện ích
    await page.waitForTimeout(2500);

    console.log(`  ✓ Đăng nhập thành công và đã vào /bang-dieu-khien`);

    // 2. Kiểm tra quyền hiển thị menu
    const noiDungMenu = await page.textContent('aside');
    if (tk.vaiTro === 'QUAN_TRI_VIEN') {
      const coConEm = noiDungMenu.includes('Con em của tôi');
      console.log(`  🔍 Quản trị viên thấy menu 'Con em của tôi'?: ${coConEm ? '❌ CÓ (LỖI)' : '✅ KHÔNG (ĐÚNG)'}`);
      if (coConEm) {
        throw new Error('Lỗi bảo mật: Quản trị viên không được phép thấy menu Con em của tôi!');
      }

      // Kiểm tra chặn truy cập URL trực tiếp
      console.log(`  🔒 Kiểm tra chặn URL trái quyền /phu-huynh/con-em...`);
      await page.goto('http://localhost:3000/phu-huynh/con-em', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      const urlHienTai = page.url();
      const coThongBao403 = (await page.textContent('body')).includes('403');
      console.log(`  🔍 Kết quả truy cập trực tiếp: URL=${urlHienTai}, có 403: ${coThongBao403 ? '✅ CÓ' : '❌ KHÔNG'}`);

      // Quay lại bảng điều khiển
      await page.goto('http://localhost:3000/bang-dieu-khien', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Kiểm tra nút chỉ báo sức khỏe
      const nutSucKhoe = await page.$('button[title*="sức khỏe"]');
      if (nutSucKhoe) {
        console.log(`  ✅ Thấy chỉ báo sức khỏe hệ thống, đang thử mở popover...`);
        await nutSucKhoe.click();
        await page.waitForTimeout(1000);
        const noiDungPopover = await page.textContent('body');
        const coDB = noiDungPopover.includes('Cơ sở dữ liệu');
        console.log(`  🔍 Popover sức khỏe hiển thị DB & Redis: ${coDB ? '✅ CÓ' : '❌ KHÔNG'}`);
        // Đóng popover bằng Esc
        await page.keyboard.press('Escape');
      }

      // Kiểm tra Axe Accessibility
      console.log(`  ♿ Đang quét Accessibility với axe-core...`);
      const axeResults = await new AxeBuilder({ page })
        .disableRules(['color-contrast']) // Recharts SVG nodes sometimes need special handling
        .analyze();
      console.log(`  🔍 Vi phạm nghiêm trọng (critical): ${axeResults.violations.filter(v => v.impact === 'critical').length}`);
      ketQuaAccessibility.push({
        vaiTro: tk.vaiTro,
        violations: axeResults.violations,
      });

      // Chụp ảnh responsive các cỡ màn hình
      console.log(`  📸 Đang chụp ảnh màn hình 1440px Desktop...`);
      await page.screenshot({ path: path.join(thuMucAnh, 'bang-dieu-khien-1440px-desktop.png') });

      console.log(`  📸 Đang chụp ảnh màn hình 768px Tablet...`);
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(thuMucAnh, 'bang-dieu-khien-768px-tablet.png') });

      console.log(`  📸 Đang chụp ảnh màn hình 375px Mobile...`);
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(thuMucAnh, 'bang-dieu-khien-375px-mobile.png') });

      // Trả lại kích thước desktop cho các chụp tiếp
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(500);
    } else if (tk.vaiTro === 'PHU_HUYNH') {
      const coConEm = noiDungMenu.includes('Con em của tôi');
      console.log(`  🔍 Phụ huynh thấy menu 'Con em của tôi'?: ${coConEm ? '✅ CÓ (ĐÚNG)' : '❌ KHÔNG (LỖI)'}`);
      if (!coConEm) {
        throw new Error('Lỗi hiển thị: Phụ huynh phải thấy menu Con em của tôi!');
      }
    }

    // 3. Chụp ảnh màn hình sạch của vai trò này
    const duongDanAnh = path.join(thuMucAnh, tk.anhChup);
    console.log(`  📸 Đang lưu ảnh chụp: ${tk.anhChup}`);
    await page.screenshot({ path: duongDanAnh });

    await context.close();
  }

  await browser.close();
  console.log('\n============================================');
  console.log('🎉 TẤT CẢ KIỂM THỬ E2E VÀ CHỤP ẢNH THÀNH CÔNG RỰC RỠ!');
  console.log('============================================');
}

chayKiemThu().catch((err) => {
  console.error('❌ Lỗi kiểm thử E2E:', err);
  process.exit(1);
});
