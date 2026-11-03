// Chụp màn hình trang cần đăng nhập bằng Chrome không giao diện qua DevTools Protocol.
// Cách dùng:
//   node scripts/chup-man-hinh.mjs --email hocsinh1@lms.edu.vn --trang /bang-dieu-khien --ra anh.png [--rong 1440] [--theme dark]
// Không cần cài thêm gói: dùng WebSocket có sẵn của Node 22.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const thamSo = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []),
);
const WEB = thamSo.web || 'http://localhost:3000';
const API = thamSo.api || 'http://localhost:4000/api/v1';
const trang = thamSo.trang || '/bang-dieu-khien';
const tepRa = thamSo.ra || 'designs/_anh-xem-truoc/chup.png';
const rong = Number(thamSo.rong || 1440);
const cao = Number(thamSo.cao || 900);
const theme = thamSo.theme || 'light';
const cong = 9333 + Math.floor(Math.random() * 500);

const chrome = [
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
].find((p) => p && existsSync(p));
if (!chrome) throw new Error('Không tìm thấy Chrome');

const thuMucHoSo = join(tmpdir(), `chrome-chup-${cong}`);
const tienTrinh = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  `--remote-debugging-port=${cong}`, `--user-data-dir=${thuMucHoSo}`, `--window-size=${rong},${cao}`, 'about:blank',
]);

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 50 && !ws; i++) {
  await ngu(200);
  try {
    const ds = await (await fetch(`http://127.0.0.1:${cong}/json`)).json();
    const p = ds.find((t) => t.type === 'page');
    if (p) ws = new WebSocket(p.webSocketDebuggerUrl);
  } catch { /* chờ Chrome khởi động */ }
}
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let soId = 0;
const choPhanHoi = new Map();
const nghe = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && choPhanHoi.has(m.id)) { choPhanHoi.get(m.id)(m); choPhanHoi.delete(m.id); }
  if (m.method) nghe.forEach((f) => f(m));
});
const goi = (method, params = {}) =>
  new Promise((r) => { const id = ++soId; choPhanHoi.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const choTaiXong = () => new Promise((r) => { const f = (m) => { if (m.method === 'Page.loadEventFired') { nghe.splice(nghe.indexOf(f), 1); r(); } }; nghe.push(f); });

const loiTrang = [];
nghe.push((m) => {
  if (m.method === 'Runtime.exceptionThrown') loiTrang.push(m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text);
});

await goi('Page.enable');
await goi('Runtime.enable');
await goi('Emulation.setDeviceMetricsOverride', { width: rong, height: cao, deviceScaleFactor: 1, mobile: false });

// Mở trang chủ để có cùng nguồn gốc, đặt giao diện rồi đăng nhập qua API (cookie HttpOnly do API cấp)
let tai = choTaiXong();
await goi('Page.navigate', { url: `${WEB}/dang-nhap` });
await tai;
if (thamSo.email) {
  const kq = await goi('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      localStorage.setItem('lms_theme', ${JSON.stringify(theme === 'dark' ? 'toi' : 'sang')});
      localStorage.setItem('theme', ${JSON.stringify(theme)});
      const r = await fetch(${JSON.stringify(API + '/xac-thuc/dang-nhap')}, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ${JSON.stringify(thamSo.email)}, matKhau: ${JSON.stringify(thamSo.matKhau || 'MatKhau@123')} })
      });
      const d = await r.json();
      const nd = (d.duLieu && d.duLieu.nguoiDung) || d.nguoiDung;
      if (nd) { sessionStorage.setItem('lms_cache_ho_so', JSON.stringify(nd)); localStorage.setItem('lms_cache_ho_so', JSON.stringify(nd)); }
      return r.status;
    })()`,
  });
  console.log('Đăng nhập:', thamSo.email, 'HTTP', kq.result?.result?.value);
}

tai = choTaiXong();
await goi('Page.navigate', { url: `${WEB}${trang}` });
await tai;
await ngu(Number(thamSo.cho || 3500));

// Trang bảng điều khiển cuộn bên trong <main>; mở rộng khung hình theo chiều cao nội dung để chụp trọn
const doCao = await goi('Runtime.evaluate', {
  returnByValue: true,
  expression: `(() => { const m = document.querySelector('main.overflow-y-auto') || document.scrollingElement; return Math.max(m.scrollHeight + (m === document.scrollingElement ? 0 : 64), ${cao}); })()`,
});
const caoDayDu = Math.min(Number(doCao.result?.result?.value || cao), 6000);
await goi('Emulation.setDeviceMetricsOverride', { width: rong, height: caoDayDu, deviceScaleFactor: 1, mobile: false });
await ngu(600);

const anh = await goi('Page.captureScreenshot', { format: 'png' });
mkdirSync(dirname(tepRa), { recursive: true });
writeFileSync(tepRa, Buffer.from(anh.result.data, 'base64'));
console.log('Ảnh:', tepRa, `${rong}x${caoDayDu}`);
if (loiTrang.length) console.log('Lỗi JavaScript trên trang:\n  ' + loiTrang.join('\n  '));
else console.log('Không có lỗi JavaScript trên trang.');

ws.close();
tienTrinh.kill();
await ngu(300);
try { rmSync(thuMucHoSo, { recursive: true, force: true }); } catch { /* bỏ qua */ }
process.exit(0);
