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
    // 1. Đọc từ CSDL
    let caiDatMap: Record<string, string> = {};
    try {
      const danhSach = await this.dichVuCaiDat.layDanhSachCaiDat();
      danhSach.forEach((item) => {
        caiDatMap[item.khoa] = item.giaTri;
      });
    } catch (e) {
      this.nhatKy.warn('Không thể tải cấu hình từ CSDL, sử dụng cấu hình mặc định/môi trường');
    }

    // 2. Xác định nhà cung cấp
    const nhaCungCapRaw = (
      cauHinhOverride?.nhaCungCap ||
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

    // 3. Xác định API Key
    let apiKey = cauHinhOverride?.apiKey ?? caiDatMap['AI_API_KEY'];
    if (!apiKey) {
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
      caiDatMap['AI_BASE_URL'] ||
      process.env.AI_BASE_URL ||
      baseUrlMacDinh;

    // 6. Prompt hệ thống & Tham số
    const promptHeThong =
      cauHinhOverride?.promptHeThong ||
      caiDatMap['AI_PROMPT_HE_THONG'] ||
      'Bạn là Trợ lý AI học thuật thông minh của Hệ thống LMS Trường học. Hãy hỗ trợ người học lịch sự, sư phạm, chính xác bằng tiếng Việt chuẩn mực.';

    const nhietDo =
      cauHinhOverride?.nhietDo ??
      (caiDatMap['AI_NHIET_DO'] ? parseFloat(caiDatMap['AI_NHIET_DO']) : 0.7);

    const tokenToiDa =
      cauHinhOverride?.tokenToiDa ??
      (caiDatMap['AI_TOKEN_TOI_DA'] ? parseInt(caiDatMap['AI_TOKEN_TOI_DA'], 10) : 1024);

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

    // 1. Phản hồi lời chào hỏi, làm quen hoặc hỏi về khả năng hỗ trợ (ví dụ: "bạn giúp được gì tôi", "chức năng của bạn")
    const laChaoHoiHoacHoiKhaNang =
      chuoiThuong.includes('chào') ||
      chuoiThuong.includes('hello') ||
      chuoiThuong.includes('hi') ||
      chuoiThuong.includes('bạn là ai') ||
      chuoiThuong.includes('giúp') ||
      chuoiThuong.includes('hỗ trợ') ||
      chuoiThuong.includes('làm được gì') ||
      chuoiThuong.includes('có thể làm') ||
      chuoiThuong.includes('biết làm gì') ||
      chuoiThuong.includes('chức năng') ||
      chuoiThuong.includes('hướng dẫn');

    if (laChaoHoiHoacHoiKhaNang) {
      return (
        'Xin chào bạn! Tôi là **Trợ lý AI học thuật** của Hệ thống Quản lý Học tập LMS. 🎓\n\n' +
        'Tôi có thể đồng hành và hỗ trợ bạn trong các hoạt động học tập:\n' +
        '- 📖 **Tra cứu & giải đáp bài học**: Tóm tắt kiến thức trọng tâm, giải thích thuật ngữ, công thức và cú pháp lập trình theo tài liệu môn học.\n' +
        '- 💡 **Ôn tập & làm bài tập**: Hướng dẫn tư duy giải bài tập, phân tích đề bài và định hướng phương pháp ôn thi hiệu quả.\n' +
        '- 📝 **Hỗ trợ học vụ**: Cung cấp thông tin về tiến độ lớp học, thời khóa biểu, lịch nộp bài và kết quả học tập.\n' +
        '- 🔍 **Trích dẫn nguồn tài liệu chuẩn xác**: Tự động liên kết và trích đoạn trực tiếp từ giáo trình/tài liệu của giáo viên để bạn đối chiếu.\n\n' +
        '*Mẹo*: Bạn hãy chọn một lớp học phần ở thanh công cụ phía trên và đặt câu hỏi cụ thể để tôi hỗ trợ bạn tốt nhất nhé!'
      );
    }

    // 2. Phản hồi câu hỏi về lập trình, thuật toán hoặc yêu cầu ví dụ code
    if (
      chuoiThuong.includes('code') ||
      chuoiThuong.includes('lập trình') ||
      chuoiThuong.includes('javascript') ||
      chuoiThuong.includes('giai thừa') ||
      chuoiThuong.includes('python') ||
      chuoiThuong.includes('thuật toán')
    ) {
      if (chuoiThuong.includes('giai thừa')) {
        return (
          `### Ví dụ: Thuật toán tính Giai thừa trong JavaScript\n\n` +
          `Giai thừa của một số nguyên dương $n$ (ký hiệu $n!$) là tích của tất cả các số nguyên dương từ 1 đến $n$.\n\n` +
          `Dưới đây là 2 cách cài đặt phổ biến:\n\n` +
          `#### 1. Phương pháp Đệ quy (Recursion)\n` +
          `\`\`\`javascript\n` +
          `function tinhGiaiThuaDeQuy(n) {\n` +
          `  if (n < 0) return null; // Không hợp lệ cho số âm\n` +
          `  if (n === 0 || n === 1) return 1;\n` +
          `  return n * tinhGiaiThuaDeQuy(n - 1);\n` +
          `}\n\n` +
          `console.log(tinhGiaiThuaDeQuy(5)); // Kết quả: 120\n` +
          `\`\`\`\n\n` +
          `#### 2. Phương pháp Vòng lặp (Iterative - Khuyên dùng)\n` +
          `\`\`\`javascript\n` +
          `function tinhGiaiThuaVongLap(n) {\n` +
          `  if (n < 0) return null;\n` +
          `  let ketQua = 1;\n` +
          `  for (let i = 2; i <= n; i++) {\n` +
          `    ketQua *= i;\n` +
          `  }\n` +
          `  return ketQua;\n` +
          `}\n\n` +
          `console.log(tinhGiaiThuaVongLap(6)); // Kết quả: 720\n` +
          `\`\`\`\n\n` +
          `> 💡 **Nhận xét**: Phương pháp lặp có độ phức tạp thời gian $\\mathcal{O}(n)$ và bộ nhớ $\\mathcal{O}(1)$, tránh nguy cơ tràn ngăn xếp (*stack overflow*) khi $n$ lớn.`
        );
      }
    }

    // 3. Nếu có ngữ cảnh tài liệu học tập được truyền vào
    if (nguCanh && nguCanh.trim().length > 0) {
      return (
        `### Trích cứu từ tài liệu học tập:\n\n` +
        `${nguCanh.slice(0, 800)}\n\n` +
        `---\n` +
        `> 📚 *Gợi ý*: Để hiểu sâu hơn về nội dung trên, bạn có thể xem lại toàn bộ bài giảng trong mục **Tài liệu** hoặc trao đổi trực tiếp với giáo viên phụ trách nhé!`
      );
    }

    // 3. Phản hồi câu hỏi học vụ chung khi chưa có tài liệu tương đồng
    return (
      `Đối với câu hỏi của bạn về: **"${prompt}"**\n\n` +
      `Tôi chưa tìm thấy đoạn trích trực tiếp nào về chủ đề này trong tài liệu của lớp học phần đang chọn. Bạn có thể:\n` +
      `1. Thử thay đổi từ khóa tìm kiếm (ví dụ: dùng từ khóa chuyên ngành hoặc tên bài học).\n` +
      `2. Chọn lớp học phần phù hợp ở thanh phạm vi phía trên.\n` +
      `3. Xem thêm giáo trình bài giảng trong mục **Tài liệu** hoặc trao đổi với giáo viên phụ trách môn học.`
    );
  }
}
