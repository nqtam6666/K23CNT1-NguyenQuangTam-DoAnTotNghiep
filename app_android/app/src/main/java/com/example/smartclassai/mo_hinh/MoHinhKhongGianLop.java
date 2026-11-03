package com.example.smartclassai.mo_hinh;

import com.google.gson.annotations.SerializedName;

import java.util.List;
import java.util.Map;

public final class MoHinhKhongGianLop {

    private MoHinhKhongGianLop() {
    }

    // ==================== BẢNG TIN (BÀI ĐĂNG & BÌNH LUẬN) ====================
    public static class BinhLuan {
        @SerializedName("id")
        public String id;
        @SerializedName("idBaiDang")
        public String idBaiDang;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("laCauTraLoiChapNhan")
        public boolean laCauTraLoiChapNhan;
        @SerializedName("ngayTao")
        public String ngayTao;
        @SerializedName("nguoiDung")
        public MoHinhXacThuc.NguoiDung nguoiDung;
    }

    public static class BaiDang {
        @SerializedName("id")
        public String id;
        @SerializedName("idLopHocPhan")
        public String idLopHocPhan;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("chuDe")
        public String chuDe;
        @SerializedName("nhanChuong")
        public String nhanChuong;
        @SerializedName("daGiaiDap")
        public boolean daGiaiDap;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("ghimDauTrang")
        public boolean ghimDauTrang;
        @SerializedName("ngayTao")
        public String ngayTao;
        @SerializedName("nguoiDang")
        public MoHinhXacThuc.NguoiDung nguoiDang;
        @SerializedName("cacBinhLuan")
        public List<BinhLuan> cacBinhLuan;
    }

    public static class YeuCauTaoBaiDang {
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("chuDe")
        public String chuDe;
        @SerializedName("nhanChuong")
        public String nhanChuong;
        @SerializedName("ghimDauTrang")
        public boolean ghimDauTrang;

        public YeuCauTaoBaiDang(String tieuDe, String noiDung, String chuDe, String nhanChuong, boolean ghimDauTrang) {
            this.tieuDe = tieuDe;
            this.noiDung = noiDung;
            this.chuDe = chuDe;
            this.nhanChuong = nhanChuong;
            this.ghimDauTrang = ghimDauTrang;
        }
    }

    public static class YeuCauTaoBinhLuan {
        @SerializedName("noiDung")
        public String noiDung;

        public YeuCauTaoBinhLuan(String noiDung) {
            this.noiDung = noiDung;
        }
    }

    // ==================== TÀI LIỆU HỌC TẬP ====================
    public static class TaiLieu {
        @SerializedName("id")
        public String id;
        @SerializedName("idLopHocPhan")
        public String idLopHocPhan;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("moTa")
        public String moTa;
        @SerializedName("duongDanTep")
        public String duongDanTep;
        @SerializedName("loaiTaiLieu")
        public String loaiTaiLieu;
        @SerializedName("kichThuocTep")
        public long kichThuocTep;
        @SerializedName("ngayTao")
        public String ngayTao;
        @SerializedName("soPhienBanHienTai")
        public int soPhienBanHienTai;
        @SerializedName("diemDanhGiaTrungBinh")
        public double diemDanhGiaTrungBinh;
        @SerializedName("tongSoDanhGia")
        public int tongSoDanhGia;
        @SerializedName("soDoanVectorRag")
        public int soDoanVectorRag;
    }

    public static class YeuCauDanhGiaTaiLieu {
        @SerializedName("soSao")
        public int soSao;
        @SerializedName("nhanXet")
        public String nhanXet;

        public YeuCauDanhGiaTaiLieu(int soSao, String nhanXet) {
            this.soSao = soSao;
            this.nhanXet = nhanXet;
        }
    }

    // ==================== BÀI TẬP & BÀI NỘP ====================
    public static class BaiNop {
        @SerializedName("id")
        public String id;
        @SerializedName("idBaiTap")
        public String idBaiTap;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("duongDanTep")
        public String duongDanTep;
        @SerializedName("trangThai")
        public String trangThai;
        @SerializedName("diemSo")
        public Double diemSo;
        @SerializedName("nhanXet")
        public String nhanXet;
        @SerializedName("ngayNop")
        public String ngayNop;
        @SerializedName("nguoiNop")
        public MoHinhXacThuc.NguoiDung nguoiNop;
    }

    public static class DemBaiTap {
        @SerializedName("cacBaiNop")
        public int cacBaiNop;
    }

    public static class BaiTap {
        @SerializedName("id")
        public String id;
        @SerializedName("idLopHocPhan")
        public String idLopHocPhan;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("hanNop")
        public String hanNop;
        @SerializedName("diemToiDa")
        public double diemToiDa;
        @SerializedName("hinhThucNop")
        public String hinhThucNop;
        @SerializedName("baiNopCuaToi")
        public BaiNop baiNopCuaToi;
        @SerializedName("_count")
        public DemBaiTap dem;
    }

    public static class YeuCauTaoBaiTap {
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("hanNop")
        public String hanNop;
        @SerializedName("diemToiDa")
        public double diemToiDa;
        @SerializedName("hinhThucNop")
        public String hinhThucNop;

        public YeuCauTaoBaiTap(String tieuDe, String noiDung, String hanNop, double diemToiDa) {
            this.tieuDe = tieuDe;
            this.noiDung = noiDung;
            this.hanNop = hanNop;
            this.diemToiDa = diemToiDa;
            this.hinhThucNop = "VAN_BAN_VA_TEP";
        }
    }

    public static class YeuCauChamDiem {
        @SerializedName("diemSo")
        public double diemSo;
        @SerializedName("nhanXet")
        public String nhanXet;

        public YeuCauChamDiem(double diemSo, String nhanXet) {
            this.diemSo = diemSo;
            this.nhanXet = nhanXet;
        }
    }

    // ==================== BÀI KIỂM TRA & LÀM BÀI ====================
    public static class PhuongAnCauHoi {
        @SerializedName("ma")
        public String ma;
        @SerializedName("noiDung")
        public String noiDung;
    }

    public static class CauHoi {
        @SerializedName("id")
        public String id;
        @SerializedName("thuTu")
        public int thuTu;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("cacPhuongAn")
        public List<PhuongAnCauHoi> cacPhuongAn;
        @SerializedName("dapAnDung")
        public String dapAnDung;
        @SerializedName("giaiThich")
        public String giaiThich;
        @SerializedName("diemCau")
        public double diemCau;
    }

    public static class LuotLamBai {
        @SerializedName("id")
        public String id;
        @SerializedName("lanThu")
        public int lanThu;
        @SerializedName("soCauDung")
        public int soCauDung;
        @SerializedName("tongSoCau")
        public int tongSoCau;
        @SerializedName("diemSo")
        public double diemSo;
        @SerializedName("nhanXetAI")
        public String nhanXetAI;
        @SerializedName("thoiGianNop")
        public String thoiGianNop;
    }

    public static class DemBaiKiemTra {
        @SerializedName("cacCauHoi")
        public int cacCauHoi;
        @SerializedName("cacLuotLam")
        public int cacLuotLam;
    }

    public static class BaiKiemTra {
        @SerializedName("id")
        public String id;
        @SerializedName("idLopHocPhan")
        public String idLopHocPhan;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("moTa")
        public String moTa;
        @SerializedName("cheDo")
        public String cheDo;
        @SerializedName("trangThai")
        public String trangThai;
        @SerializedName("thoiGianLamPhut")
        public int thoiGianLamPhut;
        @SerializedName("soLuotToiDa")
        public int soLuotToiDa;
        @SerializedName("diemToiDa")
        public double diemToiDa;
        @SerializedName("cacCauHoi")
        public List<CauHoi> cacCauHoi;
        @SerializedName("_count")
        public DemBaiKiemTra dem;
        @SerializedName("soLuotDaLam")
        public int soLuotDaLam;
        @SerializedName("diemCaoNhatCuaToi")
        public Double diemCaoNhatCuaToi;
    }

    public static class YeuCauSinhDeAI {
        @SerializedName("chuDe")
        public String chuDe;
        @SerializedName("cheDo")
        public String cheDo;
        @SerializedName("soLuongCau")
        public int soLuongCau;
        @SerializedName("thoiGianLamPhut")
        public int thoiGianLamPhut;

        public YeuCauSinhDeAI(String chuDe, String cheDo, int soLuongCau, int thoiGianLamPhut) {
            this.chuDe = chuDe;
            this.cheDo = cheDo;
            this.soLuongCau = soLuongCau;
            this.thoiGianLamPhut = thoiGianLamPhut;
        }
    }

    public static class TraLoiCauHoiInput {
        @SerializedName("idCauHoi")
        public String idCauHoi;
        @SerializedName("dapAnChon")
        public String dapAnChon;

        public TraLoiCauHoiInput(String idCauHoi, String dapAnChon) {
            this.idCauHoi = idCauHoi;
            this.dapAnChon = dapAnChon;
        }
    }

    public static class YeuCauNopBaiKiemTra {
        @SerializedName("danhSachTraLoi")
        public List<TraLoiCauHoiInput> danhSachTraLoi;
        @SerializedName("thoiLuongGiay")
        public int thoiLuongGiay;

        public YeuCauNopBaiKiemTra(List<TraLoiCauHoiInput> danhSachTraLoi, int thoiLuongGiay) {
            this.danhSachTraLoi = danhSachTraLoi;
            this.thoiLuongGiay = thoiLuongGiay;
        }
    }

    // ==================== SỔ ĐIỂM ====================
    public static class CotDiem {
        @SerializedName("id")
        public String id;
        @SerializedName("tenCotDiem")
        public String tenCotDiem;
        @SerializedName("heSo")
        public int heSo;
    }

    public static class OChiTietDiem {
        @SerializedName("idDiem")
        public String idDiem;
        @SerializedName("giaTri")
        public Double giaTri;
        @SerializedName("ghiChu")
        public String ghiChu;
    }

    public static class DongBangDiemHocSinh {
        @SerializedName("idHocSinh")
        public String idHocSinh;
        @SerializedName("maHocSinh")
        public String maHocSinh;
        @SerializedName("hoTen")
        public String hoTen;
        @SerializedName("email")
        public String email;
        @SerializedName("tyLeChuyenCan")
        public double tyLeChuyenCan;
        @SerializedName("diemTheoCot")
        public Map<String, OChiTietDiem> diemTheoCot;
        @SerializedName("diemTrungBinhHe10")
        public Double diemTrungBinhHe10;
        @SerializedName("diemChu")
        public String diemChu;
        @SerializedName("xepLoai")
        public String xepLoai;
        @SerializedName("datQuaMon")
        public Boolean datQuaMon;
    }

    public static class ThongKeKetQuaHocPhan {
        @SerializedName("tongSoHocSinh")
        public int tongSoHocSinh;
        @SerializedName("soHocSinhDaDuDiem")
        public int soHocSinhDaDuDiem;
        @SerializedName("diemTrungBinhLop")
        public double diemTrungBinhLop;
        @SerializedName("tyLeQuaMon")
        public double tyLeQuaMon;
    }

    public static class BangDiemLopHocPhan {
        @SerializedName("idLopHocPhan")
        public String idLopHocPhan;
        @SerializedName("tenLopHocPhan")
        public String tenLopHocPhan;
        @SerializedName("maLopHocPhan")
        public String maLopHocPhan;
        @SerializedName("danhSachCotDiem")
        public List<CotDiem> danhSachCotDiem;
        @SerializedName("danhSachHocSinh")
        public List<DongBangDiemHocSinh> danhSachHocSinh;
        @SerializedName("thongKe")
        public ThongKeKetQuaHocPhan thongKe;
    }

    public static class YeuCauTaoCotDiem {
        @SerializedName("tenCotDiem")
        public String tenCotDiem;
        @SerializedName("heSo")
        public int heSo;

        public YeuCauTaoCotDiem(String tenCotDiem, int heSo) {
            this.tenCotDiem = tenCotDiem;
            this.heSo = heSo;
        }
    }

    public static class KetQuaNhanXetHocPhanAI {
        @SerializedName("hoTen")
        public String hoTen;
        @SerializedName("maHocSinh")
        public String maHocSinh;
        @SerializedName("diemTrungBinhHe10")
        public Double diemTrungBinhHe10;
        @SerializedName("xepLoai")
        public String xepLoai;
        @SerializedName("nhanXetChiTiet")
        public String nhanXetChiTiet;
        @SerializedName("diemManh")
        public List<String> diemManh;
        @SerializedName("diemCanCaiThien")
        public List<String> diemCanCaiThien;
        @SerializedName("loTrinhDeXuat")
        public List<String> loTrinhDeXuat;
    }
}
