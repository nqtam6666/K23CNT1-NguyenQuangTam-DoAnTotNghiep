# HỒ SƠ BÀN GIAO & TIẾP TỤC CÔNG VIỆC (HANDOVER CONTEXT)

> **Tài liệu này dùng để khôi phục 100% ngữ cảnh dự án khi bạn chuyển máy tính hoặc bắt đầu phiên làm việc mới.**

---

## 1. THÔNG TIN ĐỒ ÁN
- **Đề tài**: Xây dựng Hệ thống Quản lý Học tập (LMS - Learning Management System) tích hợp Lớp học trực tuyến (Google Meet / LiveKit), Quản lý học vụ (Google Classroom) và Trợ lý AI học tập thông minh (RAG pgvector).
- **Sinh viên thực hiện**: Nguyễn Quang Tâm (MSSV: 2310900093 - Lớp: K23CNT1).
- **Hệ thống công nghệ**:
  - Monorepo: `pnpm` workspaces + `Turborepo`.
  - Backend: `NestJS 10`, `Prisma ORM`, `PostgreSQL 16` (`pgvector`), `Redis 7`, `BullMQ`, `Socket.IO`.
  - Frontend: `Next.js 15` (App Router, React 19), `TailwindCSS v4`, `shadcn/ui`, `TanStack Query`.
  - Video trực tuyến: `LiveKit SFU` (LiveKit Server SDK + `@livekit/components-react`).
  - Phân quyền & An toàn: CASL (RBAC + ABAC theo quan hệ sở hữu), Argon2id, JWT rotation, Zod validation chung tại `packages/chung`.
  - Quy ước đặt tên: **100% tiếng Việt không dấu** cho danh từ/động từ/trạng thái nghiệp vụ theo [docs/thuat-ngu.md](docs/thuat-ngu.md).

---

## 2. HIỆN TRẠNG ĐÃ HOÀN THÀNH (CHƯA VIẾT CODE ỨNG DỤNG)
1. **Hệ thống Quy tắc cốt lõi (Always-On Rules tại `.agents/rules/`)**:
   - `00-quy-uoc-dat-ten.md`: Quy ước tiếng Việt không dấu, cấm trộn Anh-Việt.
   - `01-kien-truc.md`: 3 tầng (Controller mỏng → Service dày → Repository), Zod chung.
   - `02-bao-mat-phan-quyen.md`: Chống IDOR, bảo vệ dữ liệu nhạy cảm, checklist OWASP Top 10.
   - `03-kiem-thu-va-git.md`: Kiểm thử 3 lớp (Unit, Role/CASL test, E2E), Conventional Commits tiếng Việt.
   - `04-an-toan-ai.md`: AI chạy bằng quyền người dùng, SQL lọc quyền trước khi truy hồi vector, công cụ ghi chỉ tạo `BanNhapAI`.
   - `05-dieu-phoi-ky-nang.md`: Ma trận điều phối tự động kích hoạt kỹ năng tương ứng với từng tác vụ.
2. **Kho Kỹ năng (19 Skills tại `.agents/skills/`)**:
   - Cốt lõi LMS: `quy-uoc-dat-ten-viet`, `tao-module-nestjs`, `tao-trang-nextjs`, `viet-test-phan-quyen`, `tich-hop-livekit`, `tro-ly-ai-rag`, `ve-so-do-mermaid`, `viet-chuong-bao-cao`, `ra-soat-bao-mat`.
   - UI/UX & Anti-Slop (`Leonxlnx/taste-skill`): `design-taste-frontend`, `high-end-visual-design`, `minimalist-ui`, `redesign-existing-projects`.
   - Chuẩn kỹ nghệ Vercel & UI: `vercel-react-best-practices`, `web-design-guidelines`, `vercel-composition-patterns`.
   - Kỹ nghệ phần mềm & Testing (`Addy Osmani` & `Grafana`): `frontend-ui-engineering`, `performance-optimization`, `interview-me`, `spec-driven-development`, `code-review-and-quality`, `shadcn`, `k6`.
3. **Quy trình làm việc (Workflows tại `.agents/workflows/`)**:
   - `/bat-dau-giai-doan`, `/them-module`, `/ra-soat-truoc-pr`, `/cap-nhat-tai-lieu`, `/xuat-so-do`, `/chuan-bi-demo`.
4. **An toàn Git**: File `.gitignore` đã loại trừ toàn bộ file markdown tài liệu, cấu hình agent và mã bí mật, chỉ cho phép push duy nhất `README.md`.

---

## 3. CÁC ĐIỂM CHỜ BẠN XÁC NHẬN KHI VỀ NHÀ

1. **Thời gian thực hiện**: Bạn có mấy tháng để làm và dự kiến bảo vệ vào tháng mấy?
2. **Mẫu báo cáo khoa**: Trường quy định báo cáo 5 chương hay 7 chương?
3. **Nhà cung cấp AI**: Dùng Google Gemini API (`gemini-1.5-flash` + `text-embedding-004`) hay OpenAI API (`gpt-4o-mini`)?
4. **Mô hình lớp**: Thống nhất dùng cả `LopHanhChinh` (quản lý niên khóa) và `LopHocPhan` (không gian lớp học trực tuyến chính thức).

---

## 4. PROMPT MẪU ĐỂ TIẾP TỤC CHAT Ở NHÀ

Khi mở Antigravity ở nhà, bạn chỉ cần **copy toàn bộ đoạn văn bản dưới đây** và gửi vào khung chat:

```text
Xin chào! Tôi đang tiếp tục thực hiện Đồ án tốt nghiệp LMS trường học (K23CNT1 - Nguyễn Quang Tâm).
Hãy đọc kỹ file `docs/tiep-tuc-cong-viec.md`, `AGENTS.md` và các quy tắc trong `.agents/rules/`.

Đây là các thông tin xác nhận của tôi:
1. Thời gian làm đồ án: [ĐIỀN VÍ DỤ: 4 tháng, dự kiến bảo vệ tháng 12/2026]
2. Mẫu báo cáo khoa: [ĐIỀN VÍ DỤ: 7 chương theo chuẩn Bộ GD&ĐT]
3. Nhà cung cấp AI: [ĐIỀN VÍ DỤ: Google Gemini API / OpenAI API]
4. Mô hình lớp học: Đồng ý tách LopHanhChinh và LopHocPhan theo đề xuất của bạn.

Bản thiết kế kiến trúc và timeline ở phiên trước tôi đã xem và ĐỒNG Ý PHÊ DUYỆT.
Bây giờ, hãy khởi động GIAI ĐOẠN 0:
- Tạo nhánh git `giai-doan-0-khoi-tao-du-an`.
- Khởi tạo khung monorepo (pnpm workspaces, Turborepo, apps/api, apps/web, packages/chung).
- Thiết lập docker-compose (Postgres 16 + pgvector, Redis, MinIO).
- Viết Prisma schema sơ bộ và khung module xác thực + phân quyền CASL.
Hãy trình bày kế hoạch triển khai cụ thể của Giai đoạn 0 cho tôi duyệt trước khi viết code!
```
