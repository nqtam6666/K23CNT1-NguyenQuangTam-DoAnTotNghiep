package com.example.smartclassai.mo_hinh;

import com.google.gson.annotations.SerializedName;

public final class MoHinhXacThuc {

    private MoHinhXacThuc() {
    }

    public static class YeuCauDangNhap {
        @SerializedName("email")
        public String email;
        @SerializedName("matKhau")
        public String matKhau;

        public YeuCauDangNhap(String email, String matKhau) {
            this.email = email;
            this.matKhau = matKhau;
        }
    }

    public static class YeuCauDangKy {
        @SerializedName("hoTen")
        public String hoTen;
        @SerializedName("email")
        public String email;
        @SerializedName("soDienThoai")
        public String soDienThoai;
        @SerializedName("matKhau")
        public String matKhau;

        public YeuCauDangKy(String hoTen, String email, String soDienThoai, String matKhau) {
            this.hoTen = hoTen;
            this.email = email;
            this.soDienThoai = soDienThoai;
            this.matKhau = matKhau;
        }
    }

    public static class KetQuaDangNhap {
        @SerializedName("accessToken")
        public String accessToken;
        @SerializedName("refreshToken")
        public String refreshToken;
        @SerializedName("thoiGianPhienGiay")
        public int thoiGianPhienGiay;
        @SerializedName("nguoiDung")
        public NguoiDung nguoiDung;
    }

    public static class NguoiDung {
        @SerializedName("id")
        public String id;
        @SerializedName("email")
        public String email;
        @SerializedName("hoTen")
        public String hoTen;
        @SerializedName("soDienThoai")
        public String soDienThoai;
        @SerializedName("anhDaiDien")
        public String anhDaiDien;
        @SerializedName("vaiTro")
        public String vaiTro;
        @SerializedName("kichHoat")
        public boolean kichHoat = true;
        @SerializedName("ngayTao")
        public String ngayTao;
        @SerializedName("hoSoHocSinh")
        public ThongTinHoSoHocSinh hoSoHocSinh;
        @SerializedName("hoSoGiaoVien")
        public ThongTinHoSoGiaoVien hoSoGiaoVien;
    }

    public static class ThongTinHoSoHocSinh {
        @SerializedName("id")
        public String id;
        @SerializedName("maHocSinh")
        public String maHocSinh;
        @SerializedName("diaChi")
        public String diaChi;
        @SerializedName("ngaySinh")
        public String ngaySinh;
    }

    public static class ThongTinHoSoGiaoVien {
        @SerializedName("id")
        public String id;
        @SerializedName("maGiaoVien")
        public String maGiaoVien;
        @SerializedName("hocVi")
        public String hocVi;
        @SerializedName("chuyenMon")
        public String chuyenMon;
    }

    public static class PhienDangNhap {
        @SerializedName("id")
        public String id;
        @SerializedName("thongTinThietBi")
        public String thongTinThietBi;
        @SerializedName("diaChiIp")
        public String diaChiIp;
        @SerializedName("ngayTao")
        public String ngayTao;
        @SerializedName("ngayHetHan")
        public String ngayHetHan;
        @SerializedName("laPhienHienTai")
        public boolean laPhienHienTai;
    }

    public static class YeuCauDoiMatKhau {
        @SerializedName("matKhauHienTai")
        public String matKhauHienTai;
        @SerializedName("matKhauMoi")
        public String matKhauMoi;
        @SerializedName("xacNhanMatKhauMoi")
        public String xacNhanMatKhauMoi;

        public YeuCauDoiMatKhau(String matKhauHienTai, String matKhauMoi) {
            this.matKhauHienTai = matKhauHienTai;
            this.matKhauMoi = matKhauMoi;
            this.xacNhanMatKhauMoi = matKhauMoi;
        }
    }

    public static class YeuCauCapNhatHoSo {
        @SerializedName("hoTen")
        public String hoTen;
        @SerializedName("soDienThoai")
        public String soDienThoai;

        public YeuCauCapNhatHoSo(String hoTen, String soDienThoai) {
            this.hoTen = hoTen;
            this.soDienThoai = soDienThoai;
        }
    }

    public static class ConEmPhuHuynh {
        @SerializedName("id")
        public String id;
        @SerializedName("moiQuanHe")
        public String moiQuanHe;
        @SerializedName("hocSinh")
        public ChiTietConEm hocSinh;
    }

    public static class ChiTietConEm {
        @SerializedName("id")
        public String id;
        @SerializedName("maHocSinh")
        public String maHocSinh;
        @SerializedName("nguoiDung")
        public NguoiDung nguoiDung;
    }

    public static class YeuCauTaoNguoiDung {
        @SerializedName("hoTen")
        public String hoTen;
        @SerializedName("email")
        public String email;
        @SerializedName("soDienThoai")
        public String soDienThoai;
        @SerializedName("matKhau")
        public String matKhau;
        @SerializedName("vaiTro")
        public String vaiTro;
        @SerializedName("kichHoat")
        public boolean kichHoat = true;

        public YeuCauTaoNguoiDung(String hoTen, String email, String soDienThoai, String matKhau, String vaiTro) {
            this.hoTen = hoTen;
            this.email = email;
            this.soDienThoai = soDienThoai;
            this.matKhau = matKhau;
            this.vaiTro = vaiTro;
        }
    }

    public static class YeuCauChuyenTrangThai {
        @SerializedName("kichHoat")
        public boolean kichHoat;

        public YeuCauChuyenTrangThai(boolean kichHoat) {
            this.kichHoat = kichHoat;
        }
    }

    public static class YeuCauDatLaiMatKhau {
        @SerializedName("matKhauMoi")
        public String matKhauMoi;

        public YeuCauDatLaiMatKhau(String matKhauMoi) {
            this.matKhauMoi = matKhauMoi;
        }
    }
}
