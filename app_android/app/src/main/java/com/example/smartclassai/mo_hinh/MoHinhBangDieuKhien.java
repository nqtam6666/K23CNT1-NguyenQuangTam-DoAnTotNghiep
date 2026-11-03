package com.example.smartclassai.mo_hinh;

import com.google.gson.JsonElement;
import com.google.gson.annotations.SerializedName;

import java.util.List;

public final class MoHinhBangDieuKhien {

    private MoHinhBangDieuKhien() {
    }

    public static class PhanHoiBangDieuKhien {
        @SerializedName("tienIch")
        public List<TienIchBangDieuKhien> tienIch;
        @SerializedName("thoiGianTao")
        public String thoiGianTao;
    }

    public static class TienIchBangDieuKhien {
        @SerializedName("id")
        public String id;
        @SerializedName("loai")
        public String loai;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("moTa")
        public String moTa;
        @SerializedName("duLieu")
        public JsonElement duLieu;
        @SerializedName("trangThai")
        public String trangThai;
    }

    public static class TheThongKe {
        @SerializedName("id")
        public String id;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("giaTri")
        public JsonElement giaTri;
        @SerializedName("donVi")
        public String donVi;
        @SerializedName("moTa")
        public String moTa;
    }

    public static class ViecCanXuLy {
        @SerializedName("id")
        public String id;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("moTa")
        public String moTa;
        @SerializedName("loai")
        public String loai;
        @SerializedName("mucDoUuTien")
        public String mucDoUuTien;
        @SerializedName("thoiHan")
        public String thoiHan;
    }

    public static class HoatDongGanDay {
        @SerializedName("id")
        public String id;
        @SerializedName("hanhDong")
        public String hanhDong;
        @SerializedName("thucThe")
        public String thucThe;
        @SerializedName("tenNguoiThucHien")
        public String tenNguoiThucHien;
        @SerializedName("thoiGian")
        public String thoiGian;
    }

    public static class ThongTinHocKyThucTe {
        @SerializedName("tenHocKy")
        public String tenHocKy;
        @SerializedName("tenNamHoc")
        public String tenNamHoc;
        @SerializedName("ngayBatDau")
        public String ngayBatDau;
        @SerializedName("ngayKetThuc")
        public String ngayKetThuc;
        @SerializedName("soLopThamGia")
        public int soLopThamGia;
        @SerializedName("soBuoiHocHomNay")
        public int soBuoiHocHomNay;
        @SerializedName("soViecCanXuLy")
        public int soViecCanXuLy;
    }

    public static class BanTinToanTruong {
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("loai")
        public String loai;
        @SerializedName("thoiGianCapNhat")
        public String thoiGianCapNhat;
    }

    public static class MucThongBaoThucTe {
        @SerializedName("id")
        public String id;
        @SerializedName("loai")
        public String loai;
        @SerializedName("phanLoai")
        public String phanLoai;
        @SerializedName("eyebrow")
        public String eyebrow;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("thoiGian")
        public String thoiGian;
        @SerializedName("daDoc")
        public boolean daDoc;
        @SerializedName("nhanHanhDong")
        public String nhanHanhDong;
    }

    public static class PhanHoiThongBaoBangDieuKhien {
        @SerializedName("hocKyHienTai")
        public ThongTinHocKyThucTe hocKyHienTai;
        @SerializedName("banTinToanTruong")
        public BanTinToanTruong banTinToanTruong;
        @SerializedName("danhSachThongBao")
        public List<MucThongBaoThucTe> danhSachThongBao;
        @SerializedName("tongSoChuaDoc")
        public int tongSoChuaDoc;
    }

    public static class KetQuaGuiThuThongBao {
        @SerializedName("thanhCong")
        public boolean thanhCong;
        @SerializedName("thongDiep")
        public String thongDiep;
    }
}
