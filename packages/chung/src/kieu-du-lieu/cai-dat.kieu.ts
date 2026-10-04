export interface CaiDatHeThong {
  id: string;
  khoa: string;
  giaTri: string;
  nhom: string;
  moTa?: string | null;
  kieuDuLieu: string;
  congKhai: boolean;
  ngayTao: string | Date;
  ngayCapNhat: string | Date;
}

export type BanDoCaiDat = Record<string, string>;

export interface CapNhatCaiDatInput {
  danhSachCaiDat: Array<{
    khoa: string;
    giaTri: string;
  }>;
}

export interface CapNhatMotCaiDatInput {
  giaTri: string;
}
