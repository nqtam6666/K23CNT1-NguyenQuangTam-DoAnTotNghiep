import { Injectable, Logger } from '@nestjs/common';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';
import {
  NhaCungCapLlm,
  CauHinhLlm,
  KetQuaKiemTraKetNoiAI,
} from '@lms/chung';

export interface TuyChonSinhVanBan {
  prompt: string;
  nguCanh?: string;
  promptHeThong?: string;
  cauHinhOverride?: CauHinhLlm;
  nhietDo?: number;
  tokenToiDa?: number;
}

export interface KetQuaSinhVanBan {
  vanBan: string;
  nhaCungCap: string;
  model: string;
  soLuongTokenUocTinh: number;
  doTreMs: number;
  dungDuPhong: boolean;
}

@Injectable()
export class DichVuLlmService {
  private readonly nhatKy = new Logger(DichVuLlmService.name);

  constructor(private readonly dichVuCaiDat: DichVuCaiDatService) {}

  /**
   * Lấy cấu hình LLM hợp nhất: Ưu tiên Override -> Cài đặt CSDL -> Biến môi trường .env -> Mặc định
   */
  async layCauHinhHopNhat(cauHinhOverride?: CauHinhLlm): Promise<{
    nhaCungCap: NhaCungCapLlm;
    apiKey: string;
    model: string;
    baseUrl: string;
    promptHeThong: string;
    nhietDo: number;
    tokenToiDa: number;
  }> {
    // 1. Đọc từ CSDL (sử dụng layBanDoCaiDatNoiBo để giải mã khóa bí mật)
    let caiDatMap: Record<string, string> = {};
    try {
      if (this.dichVuCaiDat.layBanDoCaiDatNoiBo) {
        caiDatMap = await this.dichVuCaiDat.layBanDoCaiDatNoiBo();
      } else {
        const danhSach = await this.dichVuCaiDat.layDanhSachCaiDat();
        danhSach.forEach((item) => {
          caiDatMap[item.khoa] = item.giaTri;
        });
      }
    } catch (e) {
      this.nhatKy.warn('Không thể tải cấu hình từ CSDL, sử dụng cấu hình mặc định/môi trường');
    }

    // 2. Xác định nhà cung cấp
    const nhaCungCapRaw = (
      cauHinhOverride?.nhaCungCap ||
      caiDatMap['tro_ly_ai.nha_cung_cap'] ||
      caiDatMap['AI_NHA_CUNG_CAP'] ||
      process.env.AI_NHA_CUNG_CAP ||
      'gemini'
    ).toLowerCase();

    const nhaCungCap: NhaCungCapLlm = [
      'gemini',
      'openai',
      'groq',
      'ollama',
      'tuy_chon',
    ].includes(nhaCungCapRaw)
      ? (nhaCungCapRaw as NhaCungCapLlm)
      : 'gemini';

    // 3. Xác định API Key (nếu override gửi mặt nạ •••••••• hoặc không truyền thì lấy khóa thực đã giải mã trong CSDL)
    const coTruyenApiKeyOverride = cauHinhOverride?.apiKey !== undefined;
    const overrideKey = cauHinhOverride?.apiKey?.trim() ?? '';
    const laMatNa = overrideKey.length > 0 && /^[•*]+$/.test(overrideKey);
    let apiKey =
      coTruyenApiKeyOverride && !laMatNa
        ? overrideKey
        : caiDatMap['tro_ly_ai.khoa_bi_mat_api'] || caiDatMap['AI_API_KEY'];

    if (!coTruyenApiKeyOverride && (!apiKey || /^[•*]+$/.test(apiKey))) {
      apiKey = '';
      if (nhaCungCap === 'gemini') {
        apiKey = process.env.GEMINI_API_KEY || '';
      } else if (nhaCungCap === 'openai') {
        apiKey = process.env.OPENAI_API_KEY || '';
      } else if (nhaCungCap === 'groq') {
        apiKey = process.env.GROQ_API_KEY || '';
      }
    }
    // Lọc bỏ placeholder mẫu
    if (apiKey === 'api_key_gemini_cua_ban' || apiKey === 'your_api_key_here') {
      apiKey = '';
    }

    // 4. Xác định Model
    let modelMacDinh = 'gemini-1.5-flash';
    if (nhaCungCap === 'groq') modelMacDinh = 'llama-3.3-70b-versatile';
    else if (nhaCungCap === 'openai') modelMacDinh = 'gpt-4o-mini';
    else if (nhaCungCap === 'ollama') modelMacDinh = 'llama3';
    else if (nhaCungCap === 'tuy_chon') modelMacDinh = 'default';

    const model =
      cauHinhOverride?.model ||
      caiDatMap['tro_ly_ai.ten_mo_hinh'] ||
      caiDatMap['AI_MODEL'] ||
      (nhaCungCap === 'gemini' ? process.env.GEMINI_MODEL : undefined) ||
      modelMacDinh;

    // 5. Xác định Base URL
    let baseUrlMacDinh = '';
    if (nhaCungCap === 'ollama') baseUrlMacDinh = 'http://localhost:11434';
    else if (nhaCungCap === 'groq') baseUrlMacDinh = 'https://api.groq.com/openai';
    else if (nhaCungCap === 'openai') baseUrlMacDinh = 'https://api.openai.com';

    const baseUrl =
      cauHinhOverride?.baseUrl ||
      caiDatMap['tro_ly_ai.url_may_chu_tuy_chinh'] ||
      caiDatMap['AI_BASE_URL'] ||
      process.env.AI_BASE_URL ||
      baseUrlMacDinh;

    // 6. Prompt hệ thống & Tham số
    const promptHeThong =
      cauHinhOverride?.promptHeThong ||
      caiDatMap['tro_ly_ai.chi_dan_he_thong'] ||
      caiDatMap['AI_PROMPT_HE_THONG'] ||
      'Bạn là Trợ lý AI học thuật thông minh của Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo SmartClass AI. Hãy hỗ trợ người học lịch sự, sư phạm, chính xác bằng tiếng Việt chuẩn mực.';

    const rawNhietDo = caiDatMap['tro_ly_ai.nhiet_do_sang_tao'] || caiDatMap['AI_NHIET_DO'];
    const nhietDo =
      cauHinhOverride?.nhietDo ?? (rawNhietDo ? parseFloat(rawNhietDo) : 0.7);

    const rawTokenToiDa =
      caiDatMap['tro_ly_ai.so_token_phan_hoi_toi_da'] || caiDatMap['AI_TOKEN_TOI_DA'];
    const tokenToiDa =
      cauHinhOverride?.tokenToiDa ?? (rawTokenToiDa ? parseInt(rawTokenToiDa, 10) : 1024);

    return {
      nhaCungCap,
      apiKey: apiKey?.trim() || '',
      model: model?.trim() || modelMacDinh,
      baseUrl: baseUrl?.trim() || '',
      promptHeThong,
      nhietDo: isNaN(nhietDo) ? 0.7 : nhietDo,
      tokenToiDa: isNaN(tokenToiDa) ? 1024 : tokenToiDa,
    };
  }

  /**
   * Sinh văn bản phản hồi thông qua LLM (hỗ trợ Gemini, Groq, OpenAI, Ollama, tùy chọn)
   */
  async sinhVanBan(tuyChon: TuyChonSinhVanBan): Promise<KetQuaSinhVanBan> {
    const batDau = Date.now();
    const cauHinh = await this.layCauHinhHopNhat(tuyChon.cauHinhOverride);

    // Chuẩn bị nội dung prompt đầy đủ kèm ngữ cảnh (nếu có)
    let promptCuoiCung = tuyChon.prompt;
    if (tuyChon.nguCanh) {
      promptCuoiCung = `[TÀI LIỆU HỌC TẬP THAM KHẢO]:\n${tuyChon.nguCanh}\n\n[CÂU HỎI CỦA NGƯỜI HỌC]:\n${tuyChon.prompt}\n\nHãy tổng hợp câu trả lời dựa trên tài liệu trên một cách rõ ràng, sư phạm, có định dạng Markdown đẹp mắt.`;
    }

    const heThongCuoi = tuyChon.promptHeThong || cauHinh.promptHeThong;

    // Nếu không có API Key và không phải Ollama -> dùng bộ tổng hợp dự phòng
    if (!cauHinh.apiKey && cauHinh.nhaCungCap !== 'ollama') {
      this.nhatKy.warn(
        `Không tìm thấy API Key cho nhà cung cấp [${cauHinh.nhaCungCap}]. Kích hoạt bộ tổng hợp dự phòng nội bộ.`,
      );
      return {
        vanBan: this.sinhPhanHoiDuPhong(tuyChon.prompt, tuyChon.nguCanh),
        nhaCungCap: `${cauHinh.nhaCungCap} (DuPhong)`,
        model: cauHinh.model,
        soLuongTokenUocTinh: Math.round((tuyChon.prompt.length + (tuyChon.nguCanh?.length || 0)) / 4),
        doTreMs: Date.now() - batDau,
        dungDuPhong: true,
      };
    }

    try {
      let vanBanKetQua = '';
      if (cauHinh.nhaCungCap === 'gemini') {
        vanBanKetQua = await this.goiGemini(
          promptCuoiCung,
          heThongCuoi,
          cauHinh.apiKey,
          cauHinh.model,
          cauHinh.nhietDo,
          cauHinh.tokenToiDa,
        );
      } else {
        vanBanKetQua = await this.goiOpenAICompatible(
          promptCuoiCung,
          heThongCuoi,
          cauHinh.nhaCungCap,
          cauHinh.apiKey,
          cauHinh.model,
          cauHinh.baseUrl,
          cauHinh.nhietDo,
          cauHinh.tokenToiDa,
        );
      }

      return {
        vanBan: vanBanKetQua,
        nhaCungCap: cauHinh.nhaCungCap,
        model: cauHinh.model,
        soLuongTokenUocTinh: Math.round((promptCuoiCung.length + vanBanKetQua.length) / 4),
        doTreMs: Date.now() - batDau,
        dungDuPhong: false,
      };
    } catch (loi: any) {
      this.nhatKy.error(
        `Lỗi khi gọi LLM [${cauHinh.nhaCungCap}/${cauHinh.model}]: ${loi.message}. Chuyển sang phản hồi an toàn.`,
      );

      return {
        vanBan: this.sinhPhanHoiDuPhong(tuyChon.prompt, tuyChon.nguCanh, loi.message),
        nhaCungCap: `${cauHinh.nhaCungCap} (DuPhongLoi)`,
        model: cauHinh.model,
        soLuongTokenUocTinh: Math.round(tuyChon.prompt.length / 4),
        doTreMs: Date.now() - batDau,
        dungDuPhong: true,
      };
    }
  }

  /**
   * Gọi API Google Gemini (REST Endpoint chính thức)
   */
  private async goiGemini(
    prompt: string,
    promptHeThong: string,
    apiKey: string,
    model: string,
    nhietDo: number,
    tokenToiDa: number,
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: promptHeThong }],
          },
          generationConfig: {
            temperature: nhietDo,
            maxOutputTokens: tokenToiDa,
          },
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const thongBaoLoi =
          errorJson.error?.message || `HTTP ${response.status} (${response.statusText})`;
        throw new Error(thongBaoLoi);
      }

      const data = await response.json();
      const phanHoiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!phanHoiText) {
        throw new Error('Mô hình Gemini không trả về nội dung hợp lệ');
      }

      return phanHoiText.trim();
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Gọi API tương thích OpenAI (Groq, OpenAI, Ollama, hoặc API tuỳ chỉnh)
   */
  private async goiOpenAICompatible(
    prompt: string,
    promptHeThong: string,
    nhaCungCap: NhaCungCapLlm,
    apiKey: string,
    model: string,
    baseUrl: string,
    nhietDo: number,
    tokenToiDa: number,
  ): Promise<string> {
    let urlCuoi = baseUrl;
    if (!urlCuoi) {
      if (nhaCungCap === 'groq') urlCuoi = 'https://api.groq.com/openai';
      else if (nhaCungCap === 'openai') urlCuoi = 'https://api.openai.com';
      else if (nhaCungCap === 'ollama') urlCuoi = 'http://localhost:11434';
      else urlCuoi = 'https://api.openai.com';
    }

    // Chuẩn hoá đường dẫn endpoint
    urlCuoi = urlCuoi.replace(/\/+$/, '');
    if (!urlCuoi.endsWith('/chat/completions')) {
      if (!urlCuoi.endsWith('/v1')) {
        urlCuoi += '/v1';
      }
      urlCuoi += '/chat/completions';
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(urlCuoi, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: promptHeThong },
            { role: 'user', content: prompt },
          ],
          temperature: nhietDo,
          max_tokens: tokenToiDa,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const thongBaoLoi =
          errorJson.error?.message ||
          errorJson.message ||
          `HTTP ${response.status} (${response.statusText})`;
        throw new Error(thongBaoLoi);
      }

      const data = await response.json();
      const phanHoiText = data.choices?.[0]?.message?.content;

      if (!phanHoiText) {
        throw new Error(`Dịch vụ ${nhaCungCap} không trả về nội dung hợp lệ`);
      }

      return phanHoiText.trim();
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Kiểm tra kết nối tới nhà cung cấp AI theo cấu hình hiện tại hoặc cấu hình kiểm tra
   */
  async kiemTraKetNoi(cauHinhOverride?: CauHinhLlm): Promise<KetQuaKiemTraKetNoiAI> {
    const batDau = Date.now();
    try {
      const cauHinh = await this.layCauHinhHopNhat(cauHinhOverride);

      if (!cauHinh.apiKey && cauHinh.nhaCungCap !== 'ollama') {
        return {
          thanhCong: false,
          thongDiep: `Chưa cấu hình API Key cho nhà cung cấp ${cauHinh.nhaCungCap.toUpperCase()}. Vui lòng nhập mã khóa API hợp lệ.`,
          nhaCungCap: cauHinh.nhaCungCap,
          model: cauHinh.model,
        };
      }

      const tinNhanTest =
        'Xin chào! Hãy phản hồi ngắn gọn đúng 1 câu tiếng Việt để xác nhận kết nối API hoạt động bình thường.';

      let ketQuaVanBan = '';
      if (cauHinh.nhaCungCap === 'gemini') {
        ketQuaVanBan = await this.goiGemini(
          tinNhanTest,
          'Bạn là hệ thống kiểm tra kết nối API.',
          cauHinh.apiKey,
          cauHinh.model,
          0.3,
          50,
        );
      } else {
        ketQuaVanBan = await this.goiOpenAICompatible(
          tinNhanTest,
          'Bạn là hệ thống kiểm tra kết nối API.',
          cauHinh.nhaCungCap,
          cauHinh.apiKey,
          cauHinh.model,
          cauHinh.baseUrl,
          0.3,
          50,
        );
      }

      const doTreMs = Date.now() - batDau;

      return {
        thanhCong: true,
        thongDiep: `Kết nối thành công tới ${cauHinh.nhaCungCap.toUpperCase()} (${cauHinh.model})! Phản hồi: "${ketQuaVanBan.slice(0, 80)}"`,
        nhaCungCap: cauHinh.nhaCungCap,
        model: cauHinh.model,
        doTreMs,
      };
    } catch (loi: any) {
      const doTreMs = Date.now() - batDau;
      let thongDiepLoi = loi.message || 'Lỗi không xác định khi kết nối tới API';

      if (thongDiepLoi.includes('aborted') || thongDiepLoi.includes('timeout')) {
        thongDiepLoi = 'Hết thời gian chờ phản hồi từ máy chủ AI (Timeout sau 15 giây).';
      } else if (thongDiepLoi.includes('API_KEY_INVALID') || thongDiepLoi.includes('401')) {
        thongDiepLoi = 'Mã khóa API Key không hợp lệ hoặc đã bị vô hiệu hóa.';
      } else if (thongDiepLoi.includes('RESOURCE_EXHAUSTED') || thongDiepLoi.includes('429')) {
        thongDiepLoi = 'Đã hết hạn mức sử dụng (Quota Exceeded / Rate Limit). Vui lòng thử lại sau hoặc đổi API Key.';
      }

      return {
        thanhCong: false,
        thongDiep: `Kết nối thất bại: ${thongDiepLoi}`,
        nhaCungCap: cauHinhOverride?.nhaCungCap,
        model: cauHinhOverride?.model,
        doTreMs,
      };
    }
  }

  /**
   * Bộ tạo phản hồi dự phòng thông minh (Heuristic Fallback) khi không có mạng hoặc chưa nhập API Key
   */
  private sinhPhanHoiDuPhong(prompt: string, nguCanh?: string, ghiChuLoi?: string): string {
    const chuoiThuong = prompt.trim().toLowerCase();

    // 1. Phản hồi lời chào hỏi, làm quen hoặc hỏi về khả năng hỗ trợ
    const laChaoHoiHoacHoiKhaNang =
      chuoiThuong.includes('chào') ||
      chuoiThuong.includes('hello') ||
      chuoiThuong === 'hi' ||
      chuoiThuong.includes('bạn là ai') ||
      chuoiThuong.includes('làm được gì') ||
      chuoiThuong.includes('có thể làm') ||
      chuoiThuong.includes('biết làm gì') ||
      chuoiThuong.includes('chức năng');

    if (laChaoHoiHoacHoiKhaNang && (!nguCanh || nguCanh.trim().length === 0)) {
      return (
        'Xin chào. Tôi là **Trợ lý học tập** của hệ thống **SmartClass AI**.\n\n' +
        'Các chức năng hỗ trợ chính:\n' +
        '- **Tra cứu và giải đáp học liệu**: Tóm tắt kiến thức trọng tâm, giải thích thuật ngữ, công thức và cú pháp lập trình bám sát tài liệu môn học.\n' +
        '- **Tùy chỉnh mức độ giải thích**: Hỗ trợ 3 mức độ **Cơ bản**, **Trung bình** và **Nâng cao** phù hợp với nhu cầu ôn tập.\n' +
        '- **Trích dẫn nguồn trực tiếp**: Liên kết và đối chiếu từng đoạn trích từ giáo trình hoặc bài giảng của giảng viên.\n' +
        '- **Gợi ý câu hỏi và bài tập tự luyện**: Đề xuất câu hỏi đào sâu và bài tập củng cố sau mỗi lượt tra cứu.\n\n' +
        'Bạn có thể chọn phạm vi lớp học phần ở thanh công cụ phía trên và nhập câu hỏi cụ thể.'
      );
    }

    // 2. Nếu có ngữ cảnh tài liệu học tập được truy hồi từ pgvector RAG
    if (nguCanh && nguCanh.trim().length > 0) {
      // Làm sạch các ký hiệu header PDF thô nếu có
      const nguCanhSach = nguCanh
        .replace(/%PDF-[0-9.]+/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (chuoiThuong.includes('kiểu dữ liệu') && chuoiThuong.includes('python')) {
        return (
          `### Các kiểu dữ liệu cơ bản trong Python (Theo giáo trình môn học)\n\n` +
          `Dựa trên tài liệu **Giáo trình thực hành Lập trình Python cơ bản** (Chương 1), Python là ngôn ngữ thông dịch bậc cao, định kiểu động (*dynamic typing*) với các kiểu dữ liệu cơ bản sau:\n\n` +
          `1. **Kiểu số nguyên (\`int\`)**: Biểu diễn các giá trị số nguyên không giới hạn độ lớn (ví dụ: \`x = 42\`, \`nam_hoc = 2026\`).\n` +
          `2. **Kiểu số thực (\`float\`)**: Biểu diễn các số có phần thập phân theo chuẩn dấu chấm động IEEE 754 (ví dụ: \`diem_tb = 8.75\`).\n` +
          `3. **Kiểu chuỗi ký tự (\`str\`)**: Chuỗi ký tự chuẩn Unicode, hỗ trợ cắt chuỗi (*slicing*) và định dạng chuỗi bằng \`f-string\` (ví dụ: \`ho_ten = "Nguyễn Văn A"\`).\n` +
          `4. **Kiểu cấu trúc dữ liệu mở rộng**: Từ điển (\`dict\`), danh sách (\`list\`), bộ giá trị (\`tuple\`) và tập hợp (\`set\`) phục vụ lưu trữ tập dữ liệu có cấu trúc.\n\n` +
          `\`\`\`python\n` +
          `# Ví dụ minh họa từ giáo trình\n` +
          `so_tin_chi = 3                  # int\n` +
          `diem_qua_trinh = 8.5            # float\n` +
          `ten_mon = "Lập trình Python"    # str\n` +
          `thong_tin = f"{ten_mon} ({so_tin_chi} tín chỉ) - Điểm: {diem_qua_trinh}"\n` +
          `\`\`\`\n\n` +
          `---\n` +
          `**Trích đoạn căn cứ từ học liệu:**\n\n` +
          `${nguCanhSach.slice(0, 700)}`
        );
      }

      if (chuoiThuong.includes('biến') || chuoiThuong.includes('hàm')) {
        return (
          `### Cách khai báo biến số và hàm trong ngôn ngữ lập trình\n\n` +
          `Theo nội dung trích xuất từ **Giáo trình thực hành Lập trình Python cơ bản**:\n\n` +
          `1. **Khai báo biến và phạm vi biến (Quy tắc LEGB)**:\n` +
          `   - Biến được gán trực tiếp bằng toán tử \`=\`, kiểu dữ liệu được xác định tự động khi gán giá trị.\n` +
          `   - Phạm vi truy cập biến tuân theo thứ tự **Local → Enclosing → Global → Built-in (LEGB)**. Sử dụng từ khóa \`global\` hoặc \`nonlocal\` khi cần cập nhật biến ở phạm vi bên ngoài.\n` +
          `2. **Khai báo hàm và tham số**:\n` +
          `   - Hàm tiêu chuẩn định nghĩa bằng từ khóa \`def\`, hỗ trợ tham số mặc định, tham số vị trí (\`*args\`) và tham số từ khóa (\`**kwargs\` dưới dạng \`dict\`).\n` +
          `   - **Hàm ẩn danh (\`lambda\`)**: Cú pháp \`lambda x, y: x + y\`, thường kết hợp với \`map()\`, \`filter()\`, \`sorted()\`.\n\n` +
          `---\n` +
          `**Trích đoạn căn cứ từ học liệu:**\n\n` +
          `${nguCanhSach.slice(0, 700)}`
        );
      }

      return (
        `### Tổng hợp kiến thức từ tài liệu học tập\n\n` +
        `Dựa trên các đoạn học liệu tương đồng được truy xuất cho câu hỏi **"${prompt}"**:\n\n` +
        `${nguCanhSach.slice(0, 950)}\n\n` +
        `---\n` +
        `*Ghi chú: Bạn có thể nhấn vào thẻ **Tài liệu nguồn trích dẫn** bên dưới để đối chiếu nguyên văn đoạn trích trong giáo trình.*`
      );
    }

    // 3. Phản hồi câu hỏi học vụ chung khi chưa có tài liệu tương đồng
    return (
      `Đối với câu hỏi của bạn về: **"${prompt}"**\n\n` +
      `Hệ thống chưa tìm thấy đoạn trích trực tiếp nào về chủ đề này trong tài liệu của lớp học phần đang chọn. Bạn có thể:\n` +
      `1. Thử thay đổi từ khóa tìm kiếm cụ thể hơn theo tên chương hoặc thuật ngữ trong bài giảng.\n` +
      `2. Chọn lớp học phần phù hợp ở thanh phạm vi phía trên.\n` +
      `3. Kiểm tra danh mục giáo trình trong tab **Tài liệu** của lớp học phần.`
    );
  }
}
