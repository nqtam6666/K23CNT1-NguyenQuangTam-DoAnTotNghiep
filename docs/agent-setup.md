# HƯỚNG DẪN CẤU HÌNH AGENT & MÔI TRƯỜNG PHÁT TRIỂN (DOCS/AGENT-SETUP.MD)

Tài liệu này ghi lại toàn bộ kết quả xác minh môi trường Antigravity, hướng dẫn tích hợp MCP Server an toàn, danh sách kiểm soát lệnh terminal (Allow/Deny), và quy trình phối hợp làm việc giữa Lập trình viên và AI Agent trong đồ án tốt nghiệp LMS.

---

## 1. KẾT QUẢ XÁC MINH MÔI TRƯỜNG ANTIGRAVITY (BƯỚC 0)

Sau khi kiểm tra tài liệu kiến trúc nội bộ của Google Antigravity (`agy-customizations`, `antigravity-guide`, `ide.md`), môi trường được xác minh như sau:

| Thành phần | Đường dẫn quy ước chuẩn | Cơ chế nạp & Nhận diện | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Thư mục Customization Root** | `.agents/` (Dự án hiện tại dùng `.agents/`) | Duyệt từ thư mục hiện tại lên gốc git | Hỗ trợ alias phụ `.agent/`, nhưng `.agents/` là chuẩn chính thức |
| **Quy tắc (Rules)** | `.agents/rules/*.md` và `AGENTS.md` tại root | Luôn nạp tự động (Always-on) | Giới hạn tối đa 24.000 bytes/file, ngân sách 20.000 tokens |
| **Kỹ năng (Skills)** | `.agents/skills/<tên-kỹ-năng>/SKILL.md` | Progressive Disclosure (Kích hoạt theo ngữ cảnh hoặc slash command) | Bắt buộc YAML frontmatter có `name` và `description` cụ thể |
| **Quy trình (Workflows)** | `.agents/workflows/<tên-quy-trình>.md` | Kích hoạt bằng lệnh Slash command `/<tên>` | Quản lý các quy trình phát triển nhiều bước |
| **MCP Servers** | `%USERPROFILE%\.gemini\config\mcp_config.json` | Nạp toàn cục (Global) cho Antigravity IDE / CLI | Quản lý các công cụ mở rộng bên ngoài |

### Định dạng Frontmatter chuẩn cho Skill (`SKILL.md`):
```yaml
---
name: ten-ky-nang-kebab-case
description: >-
  Mô tả chi tiết kỹ năng làm gì và KHI NÀO agent phải tự động kích hoạt kỹ năng này.
---
```

---

## 2. HƯỚNG DẪN CÀI ĐẶT MCP SERVERS (BẢO VỆ BÍ MẬT 100%)

> [!CAUTION]
> **NGUYÊN TẮC AN TOÀN**: Tuyệt đối **KHÔNG** ghi cứng token, mật khẩu thật vào file cấu hình commit git. Luôn sử dụng biến môi trường hệ thống (`env`) hoặc file cấu hình cục bộ của người dùng tại `%USERPROFILE%\.gemini\config\mcp_config.json`.

Cấu hình MCP toàn cục được lưu tại:
`C:\Users\NoPainNoGain\.gemini\config\mcp_config.json`

### 2.1. GitHub MCP Server (`@modelcontextprotocol/server-github`)
- **Mục đích**: Cho phép Agent tra cứu issue, đọc PR, kiểm tra commit, tạo pull request trực tiếp trên repo GitHub.
- **Yêu cầu**: Cần 1 GitHub Personal Access Token (Classic hoặc Fine-grained) có quyền `repo`.
- **Cách lấy token**: Vào GitHub -> *Settings* -> *Developer Settings* -> *Personal access tokens* -> *Tokens (classic)* -> Tạo token với quyền `repo`.
- **Cấu hình**:
  ```json
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxx"
    }
  }
  ```

### 2.2. Context7 MCP Server
- **Mục đích**: Hỗ trợ Agent tra cứu tài liệu thư viện mới nhất (NestJS v10+, Next.js v15 App Router, LiveKit Cloud SDK, TanStack Query v5) nhằm tránh lỗi thời thông tin.
- **Cấu hình**:
  ```json
  "context7": {
    "command": "npx",
    "args": ["-y", "context7-mcp-server"]
  }
  ```

### 2.3. PostgreSQL MCP Server (`@modelcontextprotocol/server-postgres`)
- **Mục đích**: Cho phép Agent đọc cấu trúc bảng, kiểm tra index, và xem dữ liệu phát triển (dev) cục bộ.
- **QUY TẮC AN TOÀN TUYỆT ĐỐI**:
  - Chỉ kết nối tới Database môi trường phát triển (Local Docker Dev DB).
  - Sử dụng tài khoản **CHỈ ĐỌC (READ-ONLY)** để ngăn Agent vô tình làm biến đổi dữ liệu ngoài ý muốn.
  - Tạo user chỉ đọc trong PostgreSQL:
    ```sql
    CREATE USER lms_readonly WITH PASSWORD 'MatKhauChiDoc@123';
    GRANT CONNECT ON DATABASE lms_dev TO lms_readonly;
    GRANT USAGE ON SCHEMA public TO lms_readonly;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO lms_readonly;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO lms_readonly;
    ```
- **Cấu hình**:
  ```json
  "postgres-dev": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-postgres",
      "postgresql://lms_readonly:MatKhauChiDoc@123@localhost:5432/lms_dev"
    ]
  }
  ```

### 2.4. Playwright MCP Server (Tùy chọn)
- **Mục đích**: Hỗ trợ Agent chạy kiểm thử E2E tự động hóa trên trình duyệt thực tế, chụp ảnh màn hình giao diện.
- **Cấu hình**:
  ```json
  "playwright": {
    "command": "npx",
    "args": ["-y", "@executeautomation/playwright-mcp-server"]
  }
  ```

### 2.5. File Mẫu Hoàn Chỉnh: `mcp_config.json`
Để kích hoạt, bạn hãy mở file `C:\Users\NoPainNoGain\.gemini\config\mcp_config.json` và điền cấu trúc sau:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "THAY_BANG_TOKEN_CUA_BAN"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "context7-mcp-server"]
    },
    "postgres-dev": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://lms_readonly:MatKhauChiDoc@123@localhost:5432/lms_dev"
      ]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

---

## 3. DANH SÁCH AN TOÀN TERMINAL (TERMINAL SECURITY POLICY)

Nhằm đảm bảo an toàn tuyệt đối cho máy trạm và mã nguồn của bạn, Agent áp dụng danh mục kiểm soát lệnh chặt chẽ:

### 3.1. Danh Sách Lệnh BỊ CHẶN TUYỆT ĐỐI (DENY LIST)
Agent **KHÔNG ĐƯỢC PHÉP** đề xuất hoặc thực thi các lệnh sau:

| Nhóm lệnh | Cú pháp nguy hiểm bị chặn | Lý do rủi ro |
| :--- | :--- | :--- |
| **Xóa đệ quy ngoài phạm vi** | `rm -rf /`, `rm -rf ~`, `Remove-Item -Recurse C:\`, `Remove-Item ..` | Nguy cơ phá hủy hệ điều hành hoặc dữ liệu ngoài thư mục đồ án |
| **Ghi đè Git bạo lực** | `git push --force`, `git push -f` | Làm mất lịch sử commit và phá hỏng nhánh đồng nghiệp/giáo viên |
| **Xóa trắng Git nhánh chính** | `git reset --hard` trên `main` hoặc `master` | Làm mất mã nguồn đã hoàn thiện |
| **Xóa sạch CSDL không xác nhận** | `DROP DATABASE`, `TRUNCATE TABLE` trực tiếp ngoài migration | Gây mất toàn bộ dữ liệu đang phát triển hoặc dữ liệu demo |
| **Chạy script từ xa không kiểm duyệt**| `curl ... \| sh`, `wget ... \| bash`, `iex (iwr ...)` | Nguy cơ dính mã độc Remote Code Execution (RCE) |
| **Thao tác vào CSDL Production** | Bất kỳ chuỗi kết nối chứa tên miền/IP production | Nguy cơ làm gián đoạn hệ thống chính thức |

### 3.2. Danh Sách Lệnh ĐƯỢC PHÉP THỰC THI (ALLOW LIST)
Agent được khuyến nghị và cho phép chạy các lệnh phục vụ phát triển đồ án:

| Công cụ / Lệnh | Ví dụ lệnh được phép | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Quản lý gói pnpm** | `pnpm install`, `pnpm add <goi>`, `pnpm run <script>`, `pnpm audit` | Quản trị thư viện monorepo |
| **Quản lý phiên bản Git** | `git status`, `git branch`, `git checkout -b <nhanh>`, `git commit -m "..."`, `git pull` | Quản lý nhánh và lịch sử mã nguồn an toàn |
| **Docker Compose** | `docker compose up -d`, `docker compose down`, `docker compose ps` | Chạy PostgreSQL, Redis, LiveKit container local |
| **Prisma ORM** | `pnpm prisma format`, `pnpm prisma migrate dev`, `pnpm prisma db seed` | Quản trị schema và migration CSDL dev |
| **Kiểm tra chất lượng** | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` | Đảm bảo mã nguồn không có lỗi |
| **Biên dịch & Build** | `pnpm build`, `pnpm dev`, `pnpm docs:so-do` | Chạy ứng dụng và biên dịch sơ đồ Mermaid |

---

## 4. QUY TRÌNH PHỐI HỢP LÀM VIỆC CHUẨN (WORKFLOW CONFIGURATION)

1. **Chế độ Lập Kế Hoạch (Planning Mode)**:
   - Trước mỗi giai đoạn hoặc tính năng lớn, Agent **BẮT BUỘC** viết Kế hoạch Triển khai (Implementation Plan) trình bày chi tiết các file sẽ tạo/sửa.
   - Agent **PHẢI CHỜ BẠN DUYỆT** kế hoạch trước khi bắt đầu viết bất kỳ dòng mã nào.
2. **Xuất Walkthrough sau mỗi giai đoạn**:
   - Sau khi hoàn thành một nhánh tính năng, Agent có nghĩa vụ xuất file `walkthrough.md` tổng kết các thay đổi, kết quả chạy test và các bước để bạn tự kiểm thử trên trình duyệt.
3. **Nguồn chuẩn duy nhất**:
   - Mọi thắc mắc về tên gọi nghiệp vụ đều lấy `docs/thuat-ngu.md` làm chuẩn cao nhất.
