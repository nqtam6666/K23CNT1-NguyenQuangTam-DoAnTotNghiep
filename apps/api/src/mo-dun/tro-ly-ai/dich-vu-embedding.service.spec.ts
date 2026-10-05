import { Test, TestingModule } from '@nestjs/testing';
import { DichVuEmbeddingService } from './dich-vu-embedding.service';

describe('DichVuEmbeddingService', () => {
  let service: DichVuEmbeddingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DichVuEmbeddingService],
    }).compile();

    service = module.get<DichVuEmbeddingService>(DichVuEmbeddingService);
  });

  it('nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  describe('tachDoanVanBan (Chunking)', () => {
    it('trả về mảng rỗng nếu văn bản trống', () => {
      expect(service.tachDoanVanBan('')).toEqual([]);
      expect(service.tachDoanVanBan('   ')).toEqual([]);
    });

    it('giữ nguyên 1 đoạn nếu văn bản ngắn hơn kích thước đoạn', () => {
      const vanBan = 'Bài 1: Giới thiệu ngôn ngữ lập trình Python và cú pháp cơ bản.';
      const ketQua = service.tachDoanVanBan(vanBan, 600, 100);
      expect(ketQua).toHaveLength(1);
      expect(ketQua[0].noiDung).toBe(vanBan);
      expect(ketQua[0].soThuTu).toBe(1);
    });

    it('chia thành nhiều đoạn có gối đầu khi văn bản dài', () => {
      const doanMau = 'Đây là nội dung bài giảng chi tiết về lập trình hướng đối tượng trong Python. '.repeat(15);
      const ketQua = service.tachDoanVanBan(doanMau, 300, 50);
      expect(ketQua.length).toBeGreaterThan(1);
      expect(ketQua[0].soThuTu).toBe(1);
      expect(ketQua[1].soThuTu).toBe(2);
    });
  });

  describe('taoVectorEmbedding', () => {
    it('tạo vector 768 chiều được chuẩn hóa L2 norm ~ 1', async () => {
      const vector = await service.taoVectorEmbedding('Lập trình Python cơ bản');
      expect(vector).toHaveLength(768);

      let tongBinhPhuong = 0;
      for (const giaTri of vector) {
        tongBinhPhuong += giaTri * giaTri;
      }
      expect(Math.sqrt(tongBinhPhuong)).toBeCloseTo(1, 2);
    });

    it('đoạn văn bản tương đồng ngữ cảnh có điểm Cosine cao hơn đoạn không liên quan', async () => {
      const v1 = await service.taoVectorEmbedding('Ngôn ngữ lập trình Python và biến số');
      const v2 = await service.taoVectorEmbedding('Khai báo biến và kiểu dữ liệu trong Python');
      const v3 = await service.taoVectorEmbedding('Món ăn truyền thống bún chả Hà Nội nấu như thế nào');

      const doTuongDong12 = service.tinhDoTuongDongCosine(v1, v2);
      const doTuongDong13 = service.tinhDoTuongDongCosine(v1, v3);

      expect(doTuongDong12).toBeGreaterThan(doTuongDong13);
    });
  });
});
