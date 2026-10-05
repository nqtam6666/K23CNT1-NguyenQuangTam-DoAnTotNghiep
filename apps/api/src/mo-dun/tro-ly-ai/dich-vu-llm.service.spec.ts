import { Test, TestingModule } from '@nestjs/testing';
import { DichVuLlmService } from './dich-vu-llm.service';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';

describe('DichVuLlmService', () => {
  let service: DichVuLlmService;
  let dichVuCaiDat: jest.Mocked<DichVuCaiDatService>;

  beforeEach(async () => {
    const mockDichVuCaiDat = {
      layDanhSachCaiDat: jest.fn().mockResolvedValue([
        { khoa: 'AI_NHA_CUNG_CAP', giaTri: 'gemini' },
        { khoa: 'AI_API_KEY', giaTri: 'test-gemini-key' },
        { khoa: 'AI_MODEL', giaTri: 'gemini-1.5-flash' },
        { khoa: 'AI_PROMPT_HE_THONG', giaTri: 'Bạn là trợ lý LMS.' },
      ] as any[]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuLlmService,
        { provide: DichVuCaiDatService, useValue: mockDichVuCaiDat },
      ],
    }).compile();

    service = module.get<DichVuLlmService>(DichVuLlmService);
    dichVuCaiDat = module.get(DichVuCaiDatService);
  });

  it('nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  describe('layCauHinhHopNhat', () => {
    it('ưu tiên cấu hình override khi được truyền vào', async () => {
      const cauHinh = await service.layCauHinhHopNhat({
        nhaCungCap: 'groq',
        apiKey: 'override-key',
        model: 'llama-3.3-70b-versatile',
      });

      expect(cauHinh.nhaCungCap).toBe('groq');
      expect(cauHinh.apiKey).toBe('override-key');
      expect(cauHinh.model).toBe('llama-3.3-70b-versatile');
    });

    it('đọc cấu hình từ cơ sở dữ liệu khi không có override', async () => {
      const cauHinh = await service.layCauHinhHopNhat();
      expect(cauHinh.nhaCungCap).toBe('gemini');
      expect(cauHinh.apiKey).toBe('test-gemini-key');
      expect(cauHinh.model).toBe('gemini-1.5-flash');
    });
  });

  describe('sinhVanBan', () => {
    it('sử dụng bộ phản hồi dự phòng thông minh khi không có API Key', async () => {
      dichVuCaiDat.layDanhSachCaiDat.mockResolvedValueOnce([
        { khoa: 'AI_NHA_CUNG_CAP', giaTri: 'gemini' },
        { khoa: 'AI_API_KEY', giaTri: '' },
      ] as any[]);

      const ketQua = await service.sinhVanBan({
        prompt: 'Xin chào',
      });

      expect(ketQua.dungDuPhong).toBe(true);
      expect(ketQua.vanBan).toContain('Trợ lý AI học thuật');
    });

    it('xử lý lời chào hỏi mượt mà qua bộ dự phòng khi offline', async () => {
      const ketQua = await service.sinhVanBan({
        prompt: 'chào bạn, bạn là ai?',
        cauHinhOverride: { apiKey: '' },
      });

      expect(ketQua.dungDuPhong).toBe(true);
      expect(ketQua.vanBan).toContain('Hệ thống Quản lý Học tập LMS');
    });
  });

  describe('kiemTraKetNoi', () => {
    it('thông báo lỗi rõ ràng nếu thiếu API Key khi kiểm tra', async () => {
      const ketQua = await service.kiemTraKetNoi({
        nhaCungCap: 'openai',
        apiKey: '',
      });

      expect(ketQua.thanhCong).toBe(false);
      expect(ketQua.thongDiep).toContain('Chưa cấu hình API Key');
    });
  });
});
