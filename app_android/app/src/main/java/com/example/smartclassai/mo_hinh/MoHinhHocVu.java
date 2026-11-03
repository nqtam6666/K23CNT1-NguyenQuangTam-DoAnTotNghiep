package com.example.smartclassai.mo_hinh;

import com.google.gson.annotations.SerializedName;

public final class MoHinhHocVu {

    private MoHinhHocVu() {
    }

    public static class NamHoc {
        @SerializedName("id")
        public String id;
        @SerializedName("tenNamHoc")
        public String tenNamHoc;
        @SerializedName("hienTai")
        public boolean hienTai;
        @SerializedName("ngayTao")
        public String ngayTao;
    }

    public static class YeuCauTaoNamHoc {
        @SerializedName("tenNamHoc")
        public String tenNamHoc;
        @SerializedName("hienTai")
        public boolean hienTai;

        public YeuCauTaoNamHoc(String tenNamHoc, boolean hienTai) {
            this.tenNamHoc = tenNamHoc;
            this.hienTai = hienTai;
        }
    }

    public static class HocKy {
        @SerializedName("id")
        public String id;
        @SerializedName("idNamHoc")
        public String idNamHoc;
        @SerializedName("tenHocKy")
        public String tenHocKy;
        @SerializedName("hienTai")
        public boolean hienTai;
        @SerializedName("ngayBatDau")
        public String ngayBatDau;
        @SerializedName("ngayKetThuc")
        public String ngayKetThuc;
        @SerializedName("namHoc")
        public NamHoc namHoc;
    }

    public static class YeuCauTaoHocKy {
        @SerializedName("idNamHoc")
        public String idNamHoc;
        @SerializedName("tenHocKy")
        public String tenHocKy;
        @SerializedName("ngayBatDau")
        public String ngayBatDau;
        @SerializedName("ngayKetThuc")
        public String ngayKetThuc;
        @SerializedName("hienTai")
        public boolean hienTai;

        public YeuCauTaoHocKy(String idNamHoc, String tenHocKy, String ngayBatDau, String ngayKetThuc, boolean hienTai) {
            this.idNamHoc = idNamHoc;
            this.tenHocKy = tenHocKy;
            this.ngayBatDau = ngayBatDau;
            this.ngayKetThuc = ngayKetThuc;
            this.hienTai = hienTai;
        }
    }

    public static class MonHoc {
        @SerializedName("id")
        public String id;
        @SerializedName("maMonHoc")
        public String maMonHoc;
        @SerializedName("tenMonHoc")
        public String tenMonHoc;
        @SerializedName("soTinChi")
        public int soTinChi;
        @SerializedName("moTa")
        public String moTa;
    }

    public static class YeuCauTaoMonHoc {
        @SerializedName("maMonHoc")
        public String maMonHoc;
        @SerializedName("tenMonHoc")
        public String tenMonHoc;
        @SerializedName("soTinChi")
        public int soTinChi;
        @SerializedName("moTa")
        public String moTa;

        public YeuCauTaoMonHoc(String maMonHoc, String tenMonHoc, int soTinChi, String moTa) {
            this.maMonHoc = maMonHoc;
            this.tenMonHoc = tenMonHoc;
            this.soTinChi = soTinChi;
            this.moTa = moTa;
        }
    }

    public static class LopHanhChinh {
        @SerializedName("id")
        public String id;
        @SerializedName("maLop")
        public String maLop;
        @SerializedName("tenLop")
        public String tenLop;
        @SerializedName("khoiLop")
        public int khoiLop;
        @SerializedName("giaoVienChuNhiem")
        public ThongTinGiaoVienPhuTrach giaoVienChuNhiem;
        @SerializedName("_count")
        public DemLopHanhChinh dem;
    }

    public static class DemLopHanhChinh {
        @SerializedName("danhSachHocSinh")
        public int danhSachHocSinh;
    }

    public static class YeuCauTaoLopHanhChinh {
        @SerializedName("maLop")
        public String maLop;
        @SerializedName("tenLop")
        public String tenLop;
        @SerializedName("khoiLop")
        public int khoiLop;

        public YeuCauTaoLopHanhChinh(String maLop, String tenLop, int khoiLop) {
            this.maLop = maLop;
            this.tenLop = tenLop;
            this.khoiLop = khoiLop;
        }
    }

    public static class ThongTinGiaoVienPhuTrach {
        @SerializedName("id")
        public String id;
        @SerializedName("maGiaoVien")
        public String maGiaoVien;
        @SerializedName("hocVi")
        public String hocVi;
        @SerializedName("nguoiDung")
        public MoHinhXacThuc.NguoiDung nguoiDung;
    }

    public static class DemLopHocPhan {
        @SerializedName("danhSachGhiDanh")
        public int danhSachGhiDanh;
        @SerializedName("cacBuoiHoc")
        public int cacBuoiHoc;
        @SerializedName("cacBaiTap")
        public int cacBaiTap;
    }

    public static class LopHocPhan {
        @SerializedName("id")
        public String id;
        @SerializedName("maLopHocPhan")
        public String maLopHocPhan;
        @SerializedName("tenLopHocPhan")
        public String tenLopHocPhan;
        @SerializedName("idMonHoc")
        public String idMonHoc;
        @SerializedName("idHocKy")
        public String idHocKy;
        @SerializedName("idGiaoVien")
        public String idGiaoVien;
        @SerializedName("maThamGia")
        public String maThamGia;
        @SerializedName("moTa")
        public String moTa;
        @SerializedName("kichHoat")
        public boolean kichHoat;
        @SerializedName("monHoc")
        public MonHoc monHoc;
        @SerializedName("hocKy")
        public HocKy hocKy;
        @SerializedName("giaoVien")
        public ThongTinGiaoVienPhuTrach giaoVien;
        @SerializedName("_count")
        public DemLopHocPhan dem;

        public String layTenGiaoVien() {
            if (giaoVien != null && giaoVien.nguoiDung != null && giaoVien.nguoiDung.hoTen != null) {
                return giaoVien.nguoiDung.hoTen;
            }
            return "Chưa phân công";
        }

        public String layTenMonHoc() {
            if (monHoc != null && monHoc.tenMonHoc != null) {
                return monHoc.tenMonHoc;
            }
            return maLopHocPhan;
        }
    }

    public static class YeuCauThamGiaBangMa {
        @SerializedName("maThamGia")
        public String maThamGia;

        public YeuCauThamGiaBangMa(String maThamGia) {
            this.maThamGia = maThamGia;
        }
    }

    public static class YeuCauTaoLopHocPhan {
        @SerializedName("maLopHocPhan")
        public String maLopHocPhan;
        @SerializedName("tenLopHocPhan")
        public String tenLopHocPhan;
        @SerializedName("idMonHoc")
        public String idMonHoc;
        @SerializedName("idHocKy")
        public String idHocKy;
        @SerializedName("idGiaoVien")
        public String idGiaoVien;
        @SerializedName("moTa")
        public String moTa;

        public YeuCauTaoLopHocPhan(String maLopHocPhan, String tenLopHocPhan, String idMonHoc, String idHocKy, String idGiaoVien, String moTa) {
            this.maLopHocPhan = maLopHocPhan;
            this.tenLopHocPhan = tenLopHocPhan;
            this.idMonHoc = idMonHoc;
            this.idHocKy = idHocKy;
            this.idGiaoVien = idGiaoVien;
            this.moTa = moTa;
        }
    }

    public static class ThoiKhoaBieu {
        @SerializedName("id")
        public String id;
        @SerializedName("idLopHocPhan")
        public String idLopHocPhan;
        @SerializedName("thuTrongTuan")
        public int thuTrongTuan;
        @SerializedName("tietBatDau")
        public int tietBatDau;
        @SerializedName("soTiet")
        public int soTiet;
        @SerializedName("phongHoc")
        public String phongHoc;
        @SerializedName("lopHocPhan")
        public LopHocPhan lopHocPhan;
    }

    public static class BuoiHoc {
        @SerializedName("id")
        public String id;
        @SerializedName("idLopHocPhan")
        public String idLopHocPhan;
        @SerializedName("chuDe")
        public String chuDe;
        @SerializedName("thoiGianBD")
        public String thoiGianBD;
        @SerializedName("thoiGianKT")
        public String thoiGianKT;
        @SerializedName("trangThai")
        public String trangThai;
        @SerializedName("maDiemDanh")
        public String maDiemDanh;
        @SerializedName("hanMaDiemDanh")
        public String hanMaDiemDanh;
        @SerializedName("lopHocPhan")
        public LopHocPhan lopHocPhan;
    }

    public static class YeuCauTaoBuoiHoc {
        @SerializedName("idLopHocPhan")
        public String idLopHocPhan;
        @SerializedName("chuDe")
        public String chuDe;
        @SerializedName("thoiGianBD")
        public String thoiGianBD;
        @SerializedName("thoiGianKT")
        public String thoiGianKT;

        public YeuCauTaoBuoiHoc(String idLopHocPhan, String chuDe, String thoiGianBD, String thoiGianKT) {
            this.idLopHocPhan = idLopHocPhan;
            this.chuDe = chuDe;
            this.thoiGianBD = thoiGianBD;
            this.thoiGianKT = thoiGianKT;
        }
    }
}
