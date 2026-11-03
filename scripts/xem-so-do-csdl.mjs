import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DUONG_DAN_SCHEMA = path.resolve(__dirname, '../apps/api/prisma/schema.prisma');
const PORT = 5556;

const PHAN_HE_THEO_MODEL = {
  NguoiDung: { ma: 'nguoi-dung', ten: '1. Người dùng & Xác thực', mau: '#059669' },
  PhienDangNhap: { ma: 'nguoi-dung', ten: '1. Người dùng & Xác thực', mau: '#059669' },
  HoSoHocSinh: { ma: 'nguoi-dung', ten: '1. Người dùng & Xác thực', mau: '#059669' },
  HoSoGiaoVien: { ma: 'nguoi-dung', ten: '1. Người dùng & Xác thực', mau: '#059669' },
  PhuHuynhHocSinh: { ma: 'nguoi-dung', ten: '1. Người dùng & Xác thực', mau: '#059669' },

  NamHoc: { ma: 'hoc-vu', ten: '2. Học vụ & Lớp học', mau: '#0284C7' },
  HocKy: { ma: 'hoc-vu', ten: '2. Học vụ & Lớp học', mau: '#0284C7' },
  MonHoc: { ma: 'hoc-vu', ten: '2. Học vụ & Lớp học', mau: '#0284C7' },
  LopHanhChinh: { ma: 'hoc-vu', ten: '2. Học vụ & Lớp học', mau: '#0284C7' },
  LopHocPhan: { ma: 'hoc-vu', ten: '2. Học vụ & Lớp học', mau: '#0284C7' },
  GhiDanh: { ma: 'hoc-vu', ten: '2. Học vụ & Lớp học', mau: '#0284C7' },
  ThoiKhoaBieu: { ma: 'hoc-vu', ten: '2. Học vụ & Lớp học', mau: '#0284C7' },
  BuoiHoc: { ma: 'hoc-vu', ten: '2. Học vụ & Lớp học', mau: '#0284C7' },
  PhongTrucTuyen: { ma: 'hoc-vu', ten: '2. Học vụ & Lớp học', mau: '#0284C7' },

  BaiDang: { ma: 'hoc-lieu', ten: '3. Bảng tin, Học liệu & Bài tập', mau: '#D97706' },
  BinhLuan: { ma: 'hoc-lieu', ten: '3. Bảng tin, Học liệu & Bài tập', mau: '#D97706' },
  TaiLieu: { ma: 'hoc-lieu', ten: '3. Bảng tin, Học liệu & Bài tập', mau: '#D97706' },
  BaiTap: { ma: 'hoc-lieu', ten: '3. Bảng tin, Học liệu & Bài tập', mau: '#D97706' },
  BaiNop: { ma: 'hoc-lieu', ten: '3. Bảng tin, Học liệu & Bài tập', mau: '#D97706' },
  BaiKiemTra: { ma: 'hoc-lieu', ten: '3. Bảng tin, Học liệu & Bài tập', mau: '#D97706' },
  CauHoi: { ma: 'hoc-lieu', ten: '3. Bảng tin, Học liệu & Bài tập', mau: '#D97706' },
  LuotLamBai: { ma: 'hoc-lieu', ten: '3. Bảng tin, Học liệu & Bài tập', mau: '#D97706' },

  BanGhiDiemDanh: { ma: 'diem-so', ten: '4. Điểm danh & Sổ điểm', mau: '#E11D48' },
  NhatKyThamGia: { ma: 'diem-so', ten: '4. Điểm danh & Sổ điểm', mau: '#E11D48' },
  DonXinNghi: { ma: 'diem-so', ten: '4. Điểm danh & Sổ điểm', mau: '#E11D48' },
  CotDiem: { ma: 'diem-so', ten: '4. Điểm danh & Sổ điểm', mau: '#E11D48' },
  DiemSo: { ma: 'diem-so', ten: '4. Điểm danh & Sổ điểm', mau: '#E11D48' },

  PhienTroLy: { ma: 'tro-ly-ai', ten: '5. Trợ lý AI (RAG pgvector)', mau: '#0D9488' },
  TinNhanTroLy: { ma: 'tro-ly-ai', ten: '5. Trợ lý AI (RAG pgvector)', mau: '#0D9488' },
  DoanTaiLieu: { ma: 'tro-ly-ai', ten: '5. Trợ lý AI (RAG pgvector)', mau: '#0D9488' },
  BanNhapAI: { ma: 'tro-ly-ai', ten: '5. Trợ lý AI (RAG pgvector)', mau: '#0D9488' },
  NhatKySuDungAI: { ma: 'tro-ly-ai', ten: '5. Trợ lý AI (RAG pgvector)', mau: '#0D9488' },

  ThongBao: { ma: 'he-thong', ten: '6. Hệ thống, Cài đặt & Báo lỗi', mau: '#57534E' },
  NhatKyHeThong: { ma: 'he-thong', ten: '6. Hệ thống, Cài đặt & Báo lỗi', mau: '#57534E' },
  CaiDatHeThong: { ma: 'he-thong', ten: '6. Hệ thống, Cài đặt & Báo lỗi', mau: '#57534E' },
  BaoLoiDongGop: { ma: 'he-thong', ten: '6. Hệ thống, Cài đặt & Báo lỗi', mau: '#57534E' },
};

function phanTichSchemaPrisma() {
  const noiDung = fs.readFileSync(DUONG_DAN_SCHEMA, 'utf8');
  const danhSachEnum = [];
  const danhSachModel = [];
  const danhSachQuanHe = [];

  // Parse Enums
  const enumRegex = /enum\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let match;
  while ((match = enumRegex.exec(noiDung)) !== null) {
    const tenEnum = match[1];
    const than = match[2];
    const giaTri = [];
    let tenVatLy = tenEnum;
    for (const dong of than.split(/\r?\n/)) {
      const d = dong.trim();
      if (!d || d.startsWith('//')) continue;
      const mapMatch = d.match(/@@map\("([^"]+)"\)/);
      if (mapMatch) {
        tenVatLy = mapMatch[1];
      } else if (/^[A-Z0-9_]+$/.test(d)) {
        giaTri.push(d);
      }
    }
    danhSachEnum.push({ tenEnum, tenVatLy, giaTri });
  }

  const tapTenEnum = new Set(danhSachEnum.map((e) => e.tenEnum));

  // First pass: collect model names
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;
  const rawModels = [];
  while ((match = modelRegex.exec(noiDung)) !== null) {
    rawModels.push({ tenModel: match[1], than: match[2] });
  }
  const tapTenModel = new Set(rawModels.map((m) => m.tenModel));

  for (const { tenModel, than } of rawModels) {
    let tenBang = tenModel;
    const cacCot = [];
    const fkMap = new Map(); // fieldName -> { targetModel, referencesField, onDelete, isOneToOne }

    const cacDong = than.split(/\r?\n/);
    // Pass A: find relation lines to identify FKs
    for (const dong of cacDong) {
      const d = dong.trim();
      if (!d || d.startsWith('//')) continue;
      const mapBang = d.match(/^@@map\("([^"]+)"\)/);
      if (mapBang) {
        tenBang = mapBang[1];
        continue;
      }
      if (d.startsWith('@@')) continue;

      const relMatch = d.match(/^(\w+)\s+(\w+)(\[\]|\?)?\s+.*@relation\((.*)\)/);
      if (relMatch) {
        const tenQuanHe = relMatch[1];
        const kieuDich = relMatch[2];
        const hauTo = relMatch[3] || '';
        const noiDungRel = relMatch[4];
        const fieldsMatch = noiDungRel.match(/fields:\s*\[([^\]]+)\]/);
        const refsMatch = noiDungRel.match(/references:\s*\[([^\]]+)\]/);
        const onDeleteMatch = noiDungRel.match(/onDelete:\s*(\w+)/);
        if (fieldsMatch && refsMatch && tapTenModel.has(kieuDich)) {
          const truongFk = fieldsMatch[1].trim();
          const truongDich = refsMatch[1].trim();
          fkMap.set(truongFk, {
            tenQuanHe,
            bangDich: kieuDich,
            truongDich,
            onDelete: onDeleteMatch ? onDeleteMatch[1] : 'Restrict',
            batBuoc: hauTo !== '?',
          });
        }
      }
    }

    // Pass B: collect scalar & enum columns
    for (const dong of cacDong) {
      const d = dong.trim();
      if (!d || d.startsWith('//') || d.startsWith('@@')) continue;
      const parts = d.split(/\s+/);
      if (parts.length < 2) continue;
      const tenTruong = parts[0];
      const kieuRaw = parts[1];
      const kieuGoc = kieuRaw.replace(/[\?\!]/g, '');

      // Skip virtual relation arrays or object relations without scalar column
      if (kieuRaw.endsWith('[]')) continue;
      if (tapTenModel.has(kieuGoc)) continue;

      const laId = d.includes('@id');
      const laUnique = d.includes('@unique');
      const laBatBuoc = !kieuRaw.endsWith('?');
      const mapCotMatch = d.match(/@map\("([^"]+)"\)/);
      const dbTypeMatch = d.match(/@db\.(\w+(?:\([^)]+\))?)/);
      const tenCotVatLy = mapCotMatch ? mapCotMatch[1] : tenTruong;

      let kieuHienThi = dbTypeMatch ? dbTypeMatch[1].toLowerCase() : kieuGoc.toLowerCase();
      if (kieuGoc.startsWith('Unsupported')) {
        kieuHienThi = 'vector(768)';
      } else if (tapTenEnum.has(kieuGoc)) {
        kieuHienThi = `enum(${kieuGoc})`;
      }

      const thongTinFk = fkMap.get(tenTruong) || null;

      cacCot.push({
        tenTruong,
        tenCotVatLy,
        kieuPrisma: kieuGoc,
        kieuHienThi,
        laId,
        laUnique,
        laBatBuoc,
        laFk: Boolean(thongTinFk),
        thongTinFk,
      });

      if (thongTinFk) {
        danhSachQuanHe.push({
          id: `${tenModel}.${tenTruong}->${thongTinFk.bangDich}.${thongTinFk.truongDich}`,
          tuBang: tenModel,
          tuTruong: tenTruong,
          tuCotVatLy: tenCotVatLy,
          denBang: thongTinFk.bangDich,
          denTruong: thongTinFk.truongDich,
          loaiQuanHe: laUnique ? '1 - 1' : 'N - 1',
          batBuoc: laBatBuoc,
          onDelete: thongTinFk.onDelete,
        });
      }
    }

    const phanHe = PHAN_HE_THEO_MODEL[tenModel] || {
      ma: 'khac',
      ten: 'Khác',
      mau: '#64748B',
    };

    danhSachModel.push({
      tenModel,
      tenBang,
      phanHe,
      cacCot,
    });
  }

  return { danhSachModel, danhSachQuanHe, danhSachEnum };
}

const HTML_GIAO_DIEN = `<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sơ đồ Quan hệ Cơ sở dữ liệu (ERD Studio) — LMS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #161614;
      --surface: #201F1C;
      --surface-hover: #292824;
      --border: #36342E;
      --text: #ECE9E1;
      --muted: #969287;
      --accent: #34D399;
      --pk: #FBBF24;
      --fk: #38BDF8;
      --uk: #A3E635;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Be Vietnam Pro', system-ui, sans-serif;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      user-select: none;
    }
    /* Thanh công cụ trên cùng */
    .topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 54px;
      background: rgba(32, 31, 28, 0.96);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 100;
      gap: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 14px;
    }
    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      background: #12372B;
      color: var(--accent);
      border: 1px solid rgba(52, 211, 153, 0.3);
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .search-input, .select-filter, .btn {
      background: var(--bg);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 6px 11px;
      font-size: 12.5px;
      font-family: 'Be Vietnam Pro', sans-serif;
      outline: none;
    }
    .search-input { width: 220px; }
    .search-input:focus, .select-filter:focus { border-color: var(--accent); }
    .btn {
      cursor: pointer;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .btn:hover { background: var(--surface-hover); border-color: var(--muted); }
    .btn-accent {
      background: #059669;
      color: #fff;
      border-color: #059669;
    }
    .btn-accent:hover { background: #047857; }

    /* Thanh bên trái: Danh sách bảng & Chi tiết quan hệ */
    .sidebar {
      position: fixed;
      top: 54px; left: 0; bottom: 0;
      width: 280px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      z-index: 90;
      display: flex;
      flex-direction: column;
    }
    .sidebar-header {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
    }
    .sidebar-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .group-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: var(--muted);
      padding: 8px 6px 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .table-nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12.5px;
      margin-bottom: 2px;
      border: 1px solid transparent;
    }
    .table-nav-item:hover { background: var(--surface-hover); }
    .table-nav-item.active {
      background: #12372B;
      border-color: rgba(52, 211, 153, 0.45);
      color: var(--accent);
    }
    .table-nav-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: var(--muted);
    }

    /* Vùng vẽ Canvas tương tác */
    .viewport {
      position: fixed;
      top: 54px;
      left: 280px;
      right: 0;
      bottom: 0;
      overflow: hidden;
      cursor: grab;
      background-color: var(--bg);
      background-image: radial-gradient(rgba(150, 146, 135, 0.16) 1px, transparent 1px);
      background-size: 22px 22px;
    }
    .viewport.dragging { cursor: grabbing; }
    .canvas {
      position: absolute;
      top: 0; left: 0;
      width: 6000px;
      height: 4500px;
      transform-origin: 0 0;
    }
    svg.connections {
      position: absolute;
      top: 0; left: 0;
      width: 6000px;
      height: 4500px;
      pointer-events: none;
      z-index: 1;
      overflow: visible;
    }
    .rel-path {
      fill: none;
      stroke: rgba(150, 146, 135, 0.42);
      stroke-width: 1.75px;
      transition: stroke 0.15s, stroke-width 0.15s, opacity 0.15s;
      pointer-events: stroke;
      cursor: pointer;
    }
    .rel-path.dashed {
      stroke-dasharray: 5 4;
    }
    .rel-path.highlighted {
      stroke: var(--accent) !important;
      stroke-width: 2.8px !important;
      opacity: 1 !important;
      filter: drop-shadow(0 0 6px rgba(52, 211, 153, 0.5));
    }
    .rel-path.dimmed {
      opacity: 0.12;
    }
    .rel-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      fill: var(--text);
      paint-order: stroke;
      stroke: var(--bg);
      stroke-width: 4px;
      stroke-linecap: round;
      stroke-linejoin: round;
      pointer-events: none;
    }

    /* Thẻ Bảng (Table Node) giống MySQL Workbench / dbdiagram.io */
    .table-node {
      position: absolute;
      width: 288px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 6px;
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
      z-index: 2;
      transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;
    }
    .table-node:hover {
      border-color: #656157;
      z-index: 10;
    }
    .table-node.selected {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35), 0 14px 32px rgba(0,0,0,0.6);
      z-index: 20;
    }
    .table-node.connected {
      border-color: var(--fk);
      box-shadow: 0 0 0 1.5px rgba(56, 189, 248, 0.3);
      z-index: 15;
    }
    .table-node.dimmed {
      opacity: 0.22;
    }
    .table-header {
      padding: 8px 11px;
      border-bottom: 1px solid var(--border);
      cursor: move;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .table-title-wrap {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .table-title {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 13px;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .table-db-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: rgba(255, 255, 255, 0.72);
    }
    .table-col-count {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.32);
      color: #fff;
      flex-shrink: 0;
    }
    .table-columns {
      padding: 4px 0;
    }
    .col-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 10px;
      font-size: 12px;
      gap: 6px;
      border-left: 2px solid transparent;
    }
    .col-row:hover {
      background: var(--surface-hover);
    }
    .col-row.highlight-col {
      background: rgba(52, 211, 153, 0.14);
      border-left-color: var(--accent);
    }
    .col-left {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .key-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .key-pk { background: rgba(251, 191, 36, 0.18); color: var(--pk); border: 1px solid rgba(251, 191, 36, 0.4); }
    .key-fk { background: rgba(56, 189, 248, 0.18); color: var(--fk); border: 1px solid rgba(56, 189, 248, 0.4); }
    .key-uk { background: rgba(163, 230, 53, 0.15); color: var(--uk); border: 1px solid rgba(163, 230, 53, 0.35); }
    .col-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .col-type {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: var(--muted);
      flex-shrink: 0;
    }

    /* Chú thích góc dưới phải */
    .legend {
      position: fixed;
      right: 16px;
      bottom: 16px;
      background: rgba(32, 31, 28, 0.95);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px 14px;
      z-index: 95;
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 11.5px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    /* Hộp thông tin chi tiết bảng đang chọn góc dưới trái */
    .inspector {
      border-top: 1px solid var(--border);
      padding: 12px;
      background: #1B1A17;
      max-height: 250px;
      overflow-y: auto;
      font-size: 12px;
    }
    .inspector-title {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 12px;
      color: var(--accent);
      margin-bottom: 6px;
    }
    .rel-item {
      padding: 5px 6px;
      border-radius: 4px;
      background: var(--surface);
      border: 1px solid var(--border);
      margin-bottom: 5px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      cursor: pointer;
    }
    .rel-item:hover {
      border-color: var(--accent);
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>SƠ ĐỒ QUAN HỆ CSDL (DATABASE DIAGRAM)</span>
      <span class="badge" id="stats-badge">Đang tải...</span>
    </div>
    <div class="controls">
      <input type="text" id="search-box" class="search-input" placeholder="Tìm bảng hoặc tên cột (VD: nguoi_dung)..." />
      <select id="module-filter" class="select-filter">
        <option value="ALL">Tất cả phân hệ (36 bảng)</option>
        <option value="nguoi-dung">1. Người dùng & Xác thực</option>
        <option value="hoc-vu">2. Học vụ & Lớp học</option>
        <option value="hoc-lieu">3. Bảng tin, Học liệu & Bài tập</option>
        <option value="diem-so">4. Điểm danh & Sổ điểm</option>
        <option value="tro-ly-ai">5. Trợ lý AI (RAG pgvector)</option>
        <option value="he-thong">6. Hệ thống, Cài đặt & Báo lỗi</option>
      </select>
      <button class="btn" id="btn-reset-layout" title="Sắp xếp lại vị trí các bảng">Sắp xếp chuẩn</button>
      <button class="btn" id="btn-zoom-in">Phóng to (+)</button>
      <button class="btn" id="btn-zoom-out">Thu nhỏ (-)</button>
      <button class="btn" id="btn-fit">Toàn cảnh</button>
      <button class="btn btn-accent" id="btn-clear-select">Bỏ lọc chọn</button>
    </div>
  </div>

  <div class="sidebar">
    <div class="sidebar-header">
      <span>DANH MỤC BẢNG (TABLES)</span>
      <span id="sidebar-count">36</span>
    </div>
    <div class="sidebar-list" id="sidebar-list"></div>
    <div class="inspector" id="inspector">
      <div class="inspector-title">HƯỚNG DẪN TƯƠNG TÁC</div>
      <p style="color: var(--muted); line-height: 1.55;">
        • <b>Click vào bảng</b>: Làm nổi bật tất cả đường nối Khóa ngoại (FK) đi và đến.<br/>
        • <b>Kéo thả tiêu đề bảng</b>: Di chuyển bảng tự do như MySQL Workbench.<br/>
        • <b>Cuộn chuột (Wheel)</b>: Phóng to / thu nhỏ sơ đồ.<br/>
        • <b>Giữ chuột trái nền trống</b>: Kéo trượt toàn bộ bản đồ.
      </p>
    </div>
  </div>

  <div class="viewport" id="viewport">
    <div class="canvas" id="canvas">
      <svg class="connections" id="svg-connections">
        <defs>
          <marker id="arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#969287" />
          </marker>
          <marker id="arrow-end-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#34D399" />
          </marker>
        </defs>
      </svg>
      <div id="nodes-layer"></div>
    </div>
  </div>

  <div class="legend">
    <div class="legend-item"><span class="key-badge key-pk">PK</span> Khóa chính</div>
    <div class="legend-item"><span class="key-badge key-fk">FK</span> Khóa ngoại</div>
    <div class="legend-item"><span class="key-badge key-uk">UK</span> Duy nhất (Unique)</div>
    <div class="legend-item"><span style="color: var(--accent); font-family: monospace; font-weight: bold;">* ───► 1</span> Quan hệ N - 1</div>
    <div class="legend-item"><span id="zoom-indicator" style="font-family: monospace; color: var(--muted);">100%</span></div>
  </div>

  <script>
    let schemaData = null;
    let nodePositions = {}; // modelName -> { x, y }
    let selectedModel = null;
    let activeModule = 'ALL';
    let searchQuery = '';

    // Pan & Zoom state
    let scale = 0.72;
    let panX = 40;
    let panY = 30;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;

    // Dragging table state
    let draggingModel = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const viewport = document.getElementById('viewport');
    const canvas = document.getElementById('canvas');
    const nodesLayer = document.getElementById('nodes-layer');
    const svgLayer = document.getElementById('svg-connections');

    // Bố cục tọa độ ban đầu theo từng cụm phân hệ để các đường nối rõ ràng, dễ nhìn nhất
    const VI_TRI_MAC_DINH = {
      // Cụm 1: Người dùng & Hồ sơ (Cột 1-2, Hàng trên)
      PhienDangNhap:   { x: 60,   y: 60 },
      NguoiDung:       { x: 410,  y: 60 },
      PhuHuynhHocSinh: { x: 410,  y: 470 },
      HoSoHocSinh:     { x: 770,  y: 260 },
      HoSoGiaoVien:    { x: 770,  y: 60 },

      // Cụm 2: Học vụ & Lớp học phần (Cột 3-4, Hàng trên)
      NamHoc:          { x: 1140, y: 60 },
      HocKy:           { x: 1480, y: 60 },
      MonHoc:          { x: 1480, y: 290 },
      LopHanhChinh:    { x: 1140, y: 250 },
      LopHocPhan:      { x: 1840, y: 120 },
      GhiDanh:         { x: 1480, y: 490 },
      ThoiKhoaBieu:    { x: 2210, y: 60 },
      PhongTrucTuyen:  { x: 2210, y: 280 },
      BuoiHoc:         { x: 2210, y: 480 },

      // Cụm 3: Điểm danh & Sổ điểm (Phía dưới cụm Lớp học)
      BanGhiDiemDanh:  { x: 1840, y: 540 },
      NhatKyThamGia:   { x: 2560, y: 480 },
      DonXinNghi:      { x: 2560, y: 690 },
      CotDiem:         { x: 1480, y: 690 },
      DiemSo:          { x: 1140, y: 690 },

      // Cụm 4: Bảng tin, Học liệu & Bài tập, Kiểm tra (Cột phải)
      BaiDang:         { x: 2560, y: 60 },
      BinhLuan:        { x: 2910, y: 60 },
      TaiLieu:         { x: 2560, y: 270 },
      BaiTap:          { x: 1840, y: 760 },
      BaiNop:          { x: 1480, y: 900 },
      BaiKiemTra:      { x: 2210, y: 760 },
      CauHoi:          { x: 2560, y: 900 },
      LuotLamBai:      { x: 2210, y: 1100 },

      // Cụm 5: Trợ lý AI (RAG pgvector)
      PhienTroLy:      { x: 60,   y: 660 },
      TinNhanTroLy:    { x: 60,   y: 880 },
      DoanTaiLieu:     { x: 2910, y: 270 },
      BanNhapAI:       { x: 770,  y: 660 },
      NhatKySuDungAI:  { x: 410,  y: 690 },

      // Cụm 6: Hệ thống, Cài đặt & Báo lỗi
      ThongBao:        { x: 410,  y: 920 },
      NhatKyHeThong:   { x: 770,  y: 920 },
      BaoLoiDongGop:   { x: 1140, y: 920 },
      CaiDatHeThong:   { x: 60,   y: 1120 },
    };

    function capNhatTransform() {
      canvas.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${scale})\`;
      document.getElementById('zoom-indicator').textContent = Math.round(scale * 100) + '%';
    }

    function khoiTaoViTriMacDinh() {
      let fallbackX = 100;
      let fallbackY = 1200;
      schemaData.danhSachModel.forEach((m) => {
        if (VI_TRI_MAC_DINH[m.tenModel]) {
          nodePositions[m.tenModel] = { ...VI_TRI_MAC_DINH[m.tenModel] };
        } else {
          nodePositions[m.tenModel] = { x: fallbackX, y: fallbackY };
          fallbackX += 340;
        }
      });
    }

    function renderSidebar() {
      const container = document.getElementById('sidebar-list');
      container.innerHTML = '';
      const nhomMap = new Map();
      schemaData.danhSachModel.forEach((m) => {
        if (activeModule !== 'ALL' && m.phanHe.ma !== activeModule) return;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const khopTen = m.tenModel.toLowerCase().includes(q) || m.tenBang.toLowerCase().includes(q);
          const khopCot = m.cacCot.some((c) => c.tenTruong.toLowerCase().includes(q) || c.tenCotVatLy.toLowerCase().includes(q));
          if (!khopTen && !khopCot) return;
        }
        if (!nhomMap.has(m.phanHe.ten)) nhomMap.set(m.phanHe.ten, []);
        nhomMap.get(m.phanHe.ten).push(m);
      });

      let tong = 0;
      for (const [tenNhom, danhSach] of nhomMap.entries()) {
        const groupEl = document.createElement('div');
        groupEl.className = 'group-title';
        groupEl.textContent = \`\${tenNhom} (\${danhSach.length})\`;
        container.appendChild(groupEl);

        danhSach.forEach((m) => {
          tong++;
          const item = document.createElement('div');
          item.className = 'table-nav-item' + (selectedModel === m.tenModel ? ' active' : '');
          item.innerHTML = \`
            <div>
              <div style="font-weight: 600; font-family: 'JetBrains Mono', monospace;">\${m.tenModel}</div>
              <div class="table-nav-sub">\${m.tenBang}</div>
            </div>
            <span class="table-nav-sub">\${m.cacCot.length} cột</span>
          \`;
          item.onclick = () => {
            chonBang(m.tenModel, true);
          };
          container.appendChild(item);
        });
      }
      document.getElementById('sidebar-count').textContent = tong;
    }

    function renderNodes() {
      nodesLayer.innerHTML = '';
      schemaData.danhSachModel.forEach((m) => {
        const pos = nodePositions[m.tenModel] || { x: 100, y: 100 };
        const node = document.createElement('div');
        node.className = 'table-node';
        node.id = 'node-' + m.tenModel;
        node.style.left = pos.x + 'px';
        node.style.top = pos.y + 'px';

        const rowsHtml = m.cacCot.map((c) => {
          let badges = '';
          if (c.laId) badges += '<span class="key-badge key-pk">PK</span>';
          if (c.laFk) badges += '<span class="key-badge key-fk">FK</span>';
          else if (c.laUnique && !c.laId) badges += '<span class="key-badge key-uk">UK</span>';

          const q = searchQuery.toLowerCase();
          const highlightCol = q && (c.tenTruong.toLowerCase().includes(q) || c.tenCotVatLy.toLowerCase().includes(q));

          return \`
            <div class="col-row \${highlightCol ? 'highlight-col' : ''}" id="col-\${m.tenModel}-\${c.tenTruong}">
              <div class="col-left">
                \${badges}
                <span class="col-name" title="\${c.tenTruong} (\${c.tenCotVatLy})">\${c.tenCotVatLy}</span>
              </div>
              <span class="col-type">\${c.kieuHienThi}\${c.laBatBuoc ? '' : '?'}</span>
            </div>
          \`;
        }).join('');

        node.innerHTML = \`
          <div class="table-header" style="background: \${m.phanHe.mau};" data-model="\${m.tenModel}">
            <div class="table-title-wrap">
              <span class="table-title">\${m.tenModel}</span>
              <span class="table-db-name">\${m.tenBang}</span>
            </div>
            <span class="table-col-count">\${m.cacCot.length} cột</span>
          </div>
          <div class="table-columns">
            \${rowsHtml}
          </div>
        \`;

        node.addEventListener('click', (e) => {
          e.stopPropagation();
          chonBang(m.tenModel, false);
        });

        const header = node.querySelector('.table-header');
        header.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          draggingModel = m.tenModel;
          const rect = viewport.getBoundingClientRect();
          const mouseCanvasX = (e.clientX - rect.left - panX) / scale;
          const mouseCanvasY = (e.clientY - rect.top - panY) / scale;
          dragOffsetX = mouseCanvasX - nodePositions[m.tenModel].x;
          dragOffsetY = mouseCanvasY - nodePositions[m.tenModel].y;
        });

        nodesLayer.appendChild(node);
      });

      capNhatTrangThaiHienThi();
      renderConnections();
    }

    function tinhToaDoCot(tenModel, tenTruong) {
      const nodeEl = document.getElementById('node-' + tenModel);
      const colEl = document.getElementById(\`col-\${tenModel}-\${tenTruong}\`);
      const pos = nodePositions[tenModel];
      if (!nodeEl || !pos) return { xLeft: 0, xRight: 288, y: 20 };

      const width = 288;
      let yOffset = 46;
      if (colEl) {
        yOffset = colEl.offsetTop + colEl.offsetHeight / 2;
      }
      return {
        xLeft: pos.x,
        xRight: pos.x + width,
        y: pos.y + yOffset,
      };
    }

    function renderConnections() {
      // Giữ lại thẻ <defs>
      const defs = svgLayer.querySelector('defs');
      svgLayer.innerHTML = '';
      svgLayer.appendChild(defs);

      schemaData.danhSachQuanHe.forEach((rel) => {
        const src = tinhToaDoCot(rel.tuBang, rel.tuTruong);
        const dst = tinhToaDoCot(rel.denBang, rel.denTruong);

        let x1, x2, dir1, dir2;
        if (src.xRight < dst.xLeft - 20) {
          x1 = src.xRight;
          x2 = dst.xLeft;
          dir1 = 1;
          dir2 = -1;
        } else if (dst.xRight < src.xLeft - 20) {
          x1 = src.xLeft;
          x2 = dst.xRight;
          dir1 = -1;
          dir2 = 1;
        } else {
          x1 = src.xRight;
          x2 = dst.xRight;
          dir1 = 1;
          dir2 = 1;
        }

        const y1 = src.y;
        const y2 = dst.y;
        const dist = Math.max(55, Math.min(180, Math.abs(x2 - x1) * 0.45));
        const cx1 = x1 + dir1 * dist;
        const cx2 = x2 + dir2 * dist;

        const isHighlighted = selectedModel && (rel.tuBang === selectedModel || rel.denBang === selectedModel);
        const isDimmed = selectedModel && !isHighlighted;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', \`M \${x1} \${y1} C \${cx1} \${y1}, \${cx2} \${y2}, \${x2} \${y2}\`);
        path.setAttribute(
          'class',
          'rel-path' +
            (!rel.batBuoc ? ' dashed' : '') +
            (isHighlighted ? ' highlighted' : '') +
            (isDimmed ? ' dimmed' : '')
        );
        path.setAttribute('marker-end', isHighlighted ? 'url(#arrow-end-active)' : 'url(#arrow-end)');
        path.setAttribute('title', \`\${rel.tuBang}.\${rel.tuCotVatLy} (\${rel.loaiQuanHe}) → \${rel.denBang}.\${rel.denTruong}\`);
        path.onclick = (e) => {
          e.stopPropagation();
          chonBang(rel.tuBang, false);
        };
        svgLayer.appendChild(path);

        // Hiển thị nhãn 1 / * khi bảng đang được chọn
        if (isHighlighted) {
          const textStart = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          textStart.setAttribute('x', x1 + dir1 * 12);
          textStart.setAttribute('y', y1 - 5);
          textStart.setAttribute('class', 'rel-label');
          textStart.textContent = rel.loaiQuanHe === '1 - 1' ? '1' : '*';
          svgLayer.appendChild(textStart);

          const textEnd = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          textEnd.setAttribute('x', x2 + dir2 * 14);
          textEnd.setAttribute('y', y2 - 5);
          textEnd.setAttribute('class', 'rel-label');
          textEnd.textContent = '1';
          svgLayer.appendChild(textEnd);
        }
      });
    }

    function capNhatTrangThaiHienThi() {
      const cacBangLienQuan = new Set();
      if (selectedModel) {
        cacBangLienQuan.add(selectedModel);
        schemaData.danhSachQuanHe.forEach((r) => {
          if (r.tuBang === selectedModel) cacBangLienQuan.add(r.denBang);
          if (r.denBang === selectedModel) cacBangLienQuan.add(r.tuBang);
        });
      }

      schemaData.danhSachModel.forEach((m) => {
        const el = document.getElementById('node-' + m.tenModel);
        if (!el) return;
        el.classList.remove('selected', 'connected', 'dimmed');

        let biAnTheoBoLoc = false;
        if (activeModule !== 'ALL' && m.phanHe.ma !== activeModule) biAnTheoBoLoc = true;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const khopTen = m.tenModel.toLowerCase().includes(q) || m.tenBang.toLowerCase().includes(q);
          const khopCot = m.cacCot.some((c) => c.tenTruong.toLowerCase().includes(q) || c.tenCotVatLy.toLowerCase().includes(q));
          if (!khopTen && !khopCot) biAnTheoBoLoc = true;
        }

        if (selectedModel) {
          if (m.tenModel === selectedModel) {
            el.classList.add('selected');
          } else if (cacBangLienQuan.has(m.tenModel)) {
            el.classList.add('connected');
          } else {
            el.classList.add('dimmed');
          }
        } else if (biAnTheoBoLoc) {
          el.classList.add('dimmed');
        }
      });

      capNhatInspector();
    }

    function capNhatInspector() {
      const inspector = document.getElementById('inspector');
      if (!selectedModel) {
        inspector.innerHTML = \`
          <div class="inspector-title">HƯỚNG DẪN TƯƠNG TÁC</div>
          <p style="color: var(--muted); line-height: 1.55;">
            • <b>Click vào bảng</b>: Làm nổi bật tất cả đường nối Khóa ngoại (FK) đi và đến.<br/>
            • <b>Kéo thả tiêu đề bảng</b>: Di chuyển bảng tự do như MySQL Workbench.<br/>
            • <b>Cuộn chuột (Wheel)</b>: Phóng to / thu nhỏ sơ đồ.<br/>
            • <b>Giữ chuột trái nền trống</b>: Kéo trượt toàn bộ bản đồ.
          </p>
        \`;
        return;
      }

      const model = schemaData.danhSachModel.find((m) => m.tenModel === selectedModel);
      const diRa = schemaData.danhSachQuanHe.filter((r) => r.tuBang === selectedModel);
      const diVao = schemaData.danhSachQuanHe.filter((r) => r.denBang === selectedModel);

      let html = \`
        <div class="inspector-title">\${model.tenModel} (\${model.tenBang})</div>
        <div style="color: var(--muted); margin-bottom: 8px;">
          Khóa ngoại tham chiếu đi (\${diRa.length}) & Bảng khác trỏ tới (\${diVao.length})
        </div>
      \`;

      diRa.forEach((r) => {
        html += \`
          <div class="rel-item" onclick="chonBang('\${r.denBang}', true)">
            <span style="color: var(--fk);">FK</span> \${r.tuCotVatLy} ──(\${r.loaiQuanHe})──► <b>\${r.denBang}</b>.\${r.denTruong}
          </div>
        \`;
      });

      diVao.forEach((r) => {
        html += \`
          <div class="rel-item" onclick="chonBang('\${r.tuBang}', true)">
            <span style="color: var(--accent);">REF</span> <b>\${r.tuBang}</b>.\${r.tuCotVatLy} ──(\${r.loaiQuanHe})──► \${r.denTruong}
          </div>
        \`;
      });

      inspector.innerHTML = html;
    }

    window.chonBang = function(tenModel, focusCamera) {
      selectedModel = tenModel;
      renderSidebar();
      capNhatTrangThaiHienThi();
      renderConnections();

      if (focusCamera && nodePositions[tenModel]) {
        const rect = viewport.getBoundingClientRect();
        const pos = nodePositions[tenModel];
        scale = Math.max(scale, 0.85);
        panX = rect.width / 2 - (pos.x + 144) * scale;
        panY = rect.height / 2 - (pos.y + 120) * scale;
        capNhatTransform();
      }
    };

    // Sự kiện kéo thả bảng & Panning bản đồ
    window.addEventListener('mousemove', (e) => {
      if (draggingModel) {
        const rect = viewport.getBoundingClientRect();
        const mouseCanvasX = (e.clientX - rect.left - panX) / scale;
        const mouseCanvasY = (e.clientY - rect.top - panY) / scale;
        const newX = Math.round(mouseCanvasX - dragOffsetX);
        const newY = Math.round(mouseCanvasY - dragOffsetY);
        nodePositions[draggingModel] = { x: newX, y: newY };
        const nodeEl = document.getElementById('node-' + draggingModel);
        if (nodeEl) {
          nodeEl.style.left = newX + 'px';
          nodeEl.style.top = newY + 'px';
        }
        renderConnections();
      } else if (isPanning) {
        panX = e.clientX - panStartX;
        panY = e.clientY - panStartY;
        capNhatTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      draggingModel = null;
      isPanning = false;
      viewport.classList.remove('dragging');
    });

    viewport.addEventListener('mousedown', (e) => {
      if (e.target === viewport || e.target === canvas || e.target === svgLayer) {
        isPanning = true;
        panStartX = e.clientX - panX;
        panStartY = e.clientY - panY;
        viewport.classList.add('dragging');
      }
    });

    viewport.addEventListener('click', (e) => {
      if (e.target === viewport || e.target === canvas) {
        selectedModel = null;
        renderSidebar();
        capNhatTrangThaiHienThi();
        renderConnections();
      }
    });

    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(1.8, Math.max(0.28, scale * zoomFactor));

      panX = mouseX - ((mouseX - panX) / scale) * newScale;
      panY = mouseY - ((mouseY - panY) / scale) * newScale;
      scale = newScale;
      capNhatTransform();
    }, { passive: false });

    document.getElementById('search-box').addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderSidebar();
      renderNodes();
    });

    document.getElementById('module-filter').addEventListener('change', (e) => {
      activeModule = e.target.value;
      selectedModel = null;
      renderSidebar();
      capNhatTrangThaiHienThi();
      renderConnections();
    });

    document.getElementById('btn-reset-layout').onclick = () => {
      khoiTaoViTriMacDinh();
      renderNodes();
    };

    document.getElementById('btn-zoom-in').onclick = () => {
      scale = Math.min(1.8, scale * 1.15);
      capNhatTransform();
    };

    document.getElementById('btn-zoom-out').onclick = () => {
      scale = Math.max(0.28, scale * 0.85);
      capNhatTransform();
    };

    document.getElementById('btn-fit').onclick = () => {
      scale = 0.42;
      panX = 30;
      panY = 20;
      capNhatTransform();
    };

    document.getElementById('btn-clear-select').onclick = () => {
      selectedModel = null;
      activeModule = 'ALL';
      searchQuery = '';
      document.getElementById('search-box').value = '';
      document.getElementById('module-filter').value = 'ALL';
      renderSidebar();
      renderNodes();
    };

    // Khởi chạy tải Schema
    fetch('/api/schema')
      .then((r) => r.json())
      .then((data) => {
        schemaData = data;
        document.getElementById('stats-badge').textContent =
          \`\${data.danhSachModel.length} Bảng • \${data.danhSachQuanHe.length} Quan hệ FK • \${data.danhSachEnum.length} Enum\`;
        khoiTaoViTriMacDinh();
        capNhatTransform();
        renderSidebar();
        renderNodes();
      });
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/api/schema') {
    const duLieu = phanTichSchemaPrisma();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(duLieu));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML_GIAO_DIEN);
});

server.listen(PORT, () => {
  console.log('ERD Studio đang chạy tại: http://localhost:' + PORT);
});
