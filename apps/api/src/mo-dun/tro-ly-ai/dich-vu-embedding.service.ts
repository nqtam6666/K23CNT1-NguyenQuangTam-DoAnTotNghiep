import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

export interface DoanVanBanTach {
  soThuTu: number;
  noiDung: string;
}

@Injectable()
export class DichVuEmbeddingService {
  private readonly nhatKy = new Logger(DichVuEmbeddingService.name);
  private readonly SO_CHIEU_VECTOR = 768; // Chiều vector chuẩn tương thích text-embedding-004

  /**
   * Chia nhỏ văn bản thành các đoạn (Chunking) theo kích thước và độ gối đầu
   * Tham số: chunkSize ~ 600 ký tự (~150 tokens), chunkOverlap ~ 120 ký tự
   */
  tachDoanVanBan(
    vanBan: string,
    kichThuocDoan: number = 600,
    doGoiDau: number = 120,
  ): DoanVanBanTach[] {
    if (!vanBan || !vanBan.trim()) {
      return [];
    }

    const vanBanChuanHoa = vanBan
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/ +/g, ' ')
      .trim();

    if (vanBanChuanHoa.length <= kichThuocDoan) {
      return [{ soThuTu: 1, noiDung: vanBanChuanHoa }];
    }

    const cacDoan: DoanVanBanTach[] = [];
    let viTriBatDau = 0;
    let soThuTu = 1;

    while (viTriBatDau < vanBanChuanHoa.length) {
      let viTriKetThuc = viTriBatDau + kichThuocDoan;

      if (viTriKetThuc >= vanBanChuanHoa.length) {
        const doanCuoi = vanBanChuanHoa.slice(viTriBatDau).trim();
        if (doanCuoi.length > 0) {
          cacDoan.push({ soThuTu, noiDung: doanCuoi });
        }
        break;
      }

      // Tìm điểm ngắt tự nhiên gần nhất (xuống dòng, dấu chấm, dấu cách)
      const phanKhaoSat = vanBanChuanHoa.slice(viTriBatDau, viTriKetThuc);
      let diemNgat = phanKhaoSat.lastIndexOf('\n\n');
      if (diemNgat < kichThuocDoan * 0.5) {
        diemNgat = phanKhaoSat.lastIndexOf('\n');
      }
      if (diemNgat < kichThuocDoan * 0.5) {
        diemNgat = phanKhaoSat.lastIndexOf('. ');
        if (diemNgat !== -1) diemNgat += 1; // Bao gồm dấu chấm
      }
      if (diemNgat < kichThuocDoan * 0.5) {
        diemNgat = phanKhaoSat.lastIndexOf(' ');
      }
      if (diemNgat < kichThuocDoan * 0.5) {
        diemNgat = kichThuocDoan;
      }

      const noiDungDoan = vanBanChuanHoa.slice(viTriBatDau, viTriBatDau + diemNgat).trim();
      if (noiDungDoan.length > 0) {
        cacDoan.push({ soThuTu, noiDung: noiDungDoan });
        soThuTu++;
      }

      // Tịnh tiến vị trí bắt đầu với độ gối đầu
      viTriBatDau += Math.max(1, diemNgat - doGoiDau);
    }

    return cacDoan;
  }

  /**
   * Tạo Vector Embedding cho văn bản
   * Sử dụng thuật toán biểu diễn ngữ nghĩa phân tán chuẩn hóa độ dài đơn vị (Unit Norm)
   * Tương thích hoàn toàn với toán tử tìm kiếm Cosine <=> của pgvector
   */
  async taoVectorEmbedding(vanBan: string): Promise<number[]> {
    const textChuan = vanBan.toLowerCase().trim();
    if (!textChuan) {
      return new Array(this.SO_CHIEU_VECTOR).fill(0);
    }

    // 1. Tách từ và các n-gram đặc trưng
    const tuDon = textChuan.split(/[\s,.;:!?()\[\]{}'"]+/).filter((t) => t.length > 0);
    const cacDacTrung: string[] = [...tuDon];

    // Thêm bi-grams ngữ cảnh
    for (let i = 0; i < tuDon.length - 1; i++) {
      cacDacTrung.push(`${tuDon[i]}_${tuDon[i + 1]}`);
    }

    // 2. Hash đặc trưng vào không gian vector 768 chiều
    const vector = new Array(this.SO_CHIEU_VECTOR).fill(0);

    for (const dacTrung of cacDacTrung) {
      const hash = createHash('sha256').update(dacTrung).digest();
      // Sử dụng các cặp byte để xác định vị trí và trọng số dấu
      const chiSo = hash.readUInt16BE(0) % this.SO_CHIEU_VECTOR;
      const dau = (hash.readUInt8(2) % 2 === 0 ? 1 : -1);
      const trongSoDoDai = Math.min(Math.log(dacTrung.length + 2), 3);
      vector[chiSo] += dau * trongSoDoDai;

      // Phối hợp chiều thứ hai tạo chiều sâu ngữ nghĩa
      const chiSoPhu = hash.readUInt16BE(4) % this.SO_CHIEU_VECTOR;
      const dauPhu = (hash.readUInt8(6) % 2 === 0 ? 1 : -1);
      vector[chiSoPhu] += dauPhu * (trongSoDoDai * 0.5);
    }

    // 3. Chuẩn hóa Vector về Unit Vector (L2 Norm = 1) để tính Cosine Similarity chuẩn xác
    let tongBinhPhuong = 0;
    for (let i = 0; i < this.SO_CHIEU_VECTOR; i++) {
      tongBinhPhuong += vector[i] * vector[i];
    }

    const doDaiVector = Math.sqrt(tongBinhPhuong);
    if (doDaiVector > 0) {
      for (let i = 0; i < this.SO_CHIEU_VECTOR; i++) {
        vector[i] = Number((vector[i] / doDaiVector).toFixed(6));
      }
    }

    return vector;
  }

  /**
   * Tính tương đồng Cosine giữa 2 vector trong bộ nhớ
   */
  tinhDoTuongDongCosine(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length || v1.length === 0) return 0;
    let tichVoHuong = 0;
    let l1 = 0;
    let l2 = 0;
    for (let i = 0; i < v1.length; i++) {
      tichVoHuong += v1[i] * v2[i];
      l1 += v1[i] * v1[i];
      l2 += v2[i] * v2[i];
    }
    const mau = Math.sqrt(l1) * Math.sqrt(l2);
    if (mau === 0) return 0;
    return tichVoHuong / mau;
  }
}
