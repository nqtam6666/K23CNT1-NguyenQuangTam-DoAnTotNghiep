package com.example.smartclassai.mo_hinh;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public final class MoHinhTrucTuyenVaAi {

    private MoHinhTrucTuyenVaAi() {
    }

    // ==================== PHÒNG TRỰC TUYẾN & ĐIỂM DANH ====================
    public static class KetQuaTokenLiveKit {
        @SerializedName("token")
        public String token;
        @SerializedName("urlMayChuLiveKit")
        public String urlMayChuLiveKit;
        @SerializedName("tenPhong")
        public String tenPhong;
        @SerializedName("tenNguoiDung")
        public String tenNguoiDung;
        @SerializedName("vaiTroTrongPhong")
        public String vaiTroTrongPhong;
    }

    public static class YeuCauBatTatPhong {
        @SerializedName("dangMo")
        public boolean dangMo;

        public YeuCauBatTatPhong(boolean dangMo) {
            this.dangMo = dangMo;
        }
    }

    public static class YeuCauMoMaDiemDanh {
        @SerializedName("thoiHanPhut")
        public int thoiHanPhut;

        public YeuCauMoMaDiemDanh(int thoiHanPhut) {
            this.thoiHanPhut = thoiHanPhut;
        }
    }

    public static class YeuCauDiemDanhMa {
        @SerializedName("maDiemDanh")
        public String maDiemDanh;

        public YeuCauDiemDanhMa(String maDiemDanh) {
            this.maDiemDanh = maDiemDanh;
        }
    }

    public static class ChiTietChuyenCanHocSinh {
        @SerializedName("idHocSinh")
        public String idHocSinh;
        @SerializedName("maHocSinh")
        public String maHocSinh;
        @SerializedName("hoTen")
        public String hoTen;
        @SerializedName("soBuoiCoMat")
        public int soBuoiCoMat;
        @SerializedName("soBuoiDiMuon")
        public int soBuoiDiMuon;
        @SerializedName("soBuoiVangCoPhep")
        public int soBuoiVangCoPhep;
        @SerializedName("soBuoiVangKhongPhep")
        public int soBuoiVangKhongPhep;
        @SerializedName("tyLeChuyenCan")
        public double tyLeChuyenCan;
        @SerializedName("mucCanhBao")
        public String mucCanhBao;
        @SerializedName("nhanXetChuyenCan")
        public String nhanXetChuyenCan;
    }

    public static class ThongKeChuyenCanLop {
        @SerializedName("tongSoBuoiHoc")
        public int tongSoBuoiHoc;
        @SerializedName("soBuoiDaToChuc")
        public int soBuoiDaToChuc;
        @SerializedName("tyLeChuyenCanTrungBinh")
        public double tyLeChuyenCanTrungBinh;
        @SerializedName("soHocSinhNguyCoCamThi")
        public int soHocSinhNguyCoCamThi;
        @SerializedName("danhSachHocSinh")
        public List<ChiTietChuyenCanHocSinh> danhSachHocSinh;
    }

    public static class DonXinNghi {
        @SerializedName("id")
        public String id;
        @SerializedName("idBuoiHoc")
        public String idBuoiHoc;
        @SerializedName("lyDo")
        public String lyDo;
        @SerializedName("trangThai")
        public String trangThai;
        @SerializedName("phanHoi")
        public String phanHoi;
        @SerializedName("ngayTao")
        public String ngayTao;
        @SerializedName("buoiHoc")
        public MoHinhHocVu.BuoiHoc buoiHoc;
        @SerializedName("nguoiGui")
        public MoHinhXacThuc.NguoiDung nguoiGui;
    }

    public static class YeuCauTaoDonXinNghi {
        @SerializedName("idBuoiHoc")
        public String idBuoiHoc;
        @SerializedName("lyDo")
        public String lyDo;

        public YeuCauTaoDonXinNghi(String idBuoiHoc, String lyDo) {
            this.idBuoiHoc = idBuoiHoc;
            this.lyDo = lyDo;
        }
    }

    public static class YeuCauDuyetDonXinNghi {
        @SerializedName("trangThai")
        public String trangThai;
        @SerializedName("phanHoi")
        public String phanHoi;

        public YeuCauDuyetDonXinNghi(String trangThai, String phanHoi) {
            this.trangThai = trangThai;
            this.phanHoi = phanHoi;
        }
    }

    // ==================== TRỢ LÝ AI (RAG) ====================
    public static class NguonTrichDan {
        @SerializedName("idTaiLieu")
        public String idTaiLieu;
        @SerializedName("tieuDeTaiLieu")
        public String tieuDeTaiLieu;
        @SerializedName("doTuongDong")
        public double doTuongDong;
        @SerializedName("noiDung")
        public String noiDung;
    }

    public static class TinNhanTroLy {
        @SerializedName("id")
        public String id;
        @SerializedName("idPhien")
        public String idPhien;
        @SerializedName("vaiTro")
        public String vaiTro;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("trichDan")
        public List<NguonTrichDan> trichDan;
        @SerializedName("ngayTao")
        public String ngayTao;
    }

    public static class PhienTroLy {
        @SerializedName("id")
        public String id;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("ngayTao")
        public String ngayTao;
        @SerializedName("cacTinNhan")
        public List<TinNhanTroLy> cacTinNhan;
    }

    public static class YeuCauHoiDapAI {
        @SerializedName("idPhien")
        public String idPhien;
        @SerializedName("idLopHocPhan")
        public String idLopHocPhan;
        @SerializedName("cauHoi")
        public String cauHoi;
        @SerializedName("mucDoGiaiThich")
        public String mucDoGiaiThich;

        public YeuCauHoiDapAI(String idPhien, String idLopHocPhan, String cauHoi, String mucDoGiaiThich) {
            this.idPhien = idPhien;
            this.idLopHocPhan = idLopHocPhan;
            this.cauHoi = cauHoi;
            this.mucDoGiaiThich = mucDoGiaiThich;
        }
    }

    public static class KetQuaHoiDapAI {
        @SerializedName("idPhien")
        public String idPhien;
        @SerializedName("tieuDePhien")
        public String tieuDePhien;
        @SerializedName("tinNhanNguoiDung")
        public TinNhanTroLy tinNhanNguoiDung;
        @SerializedName("tinNhanTroLy")
        public TinNhanTroLy tinNhanTroLy;
        @SerializedName("tinNhanTraLoi")
        public TinNhanTroLy tinNhanTraLoi;
        @SerializedName("danhSachTrichDan")
        public List<NguonTrichDan> danhSachTrichDan;
        @SerializedName("goiYCauHoiTiepTheo")
        public List<String> goiYCauHoiTiepTheo;
    }

    // ==================== BÁO LỖI & ĐÓNG GÓP ====================
    public static class BaoLoiDongGop {
        @SerializedName("id")
        public String id;
        @SerializedName("loaiPhanHoi")
        public String loaiPhanHoi;
        @SerializedName("mucDoUuTien")
        public String mucDoUuTien;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("trangThai")
        public String trangThai;
        @SerializedName("phanHoiXuLy")
        public String phanHoiXuLy;
        @SerializedName("ngayTao")
        public String ngayTao;
        @SerializedName("nguoiDung")
        public MoHinhXacThuc.NguoiDung nguoiDung;
    }

    public static class ThongKeBaoLoi {
        @SerializedName("tongSo")
        public int tongSo;
        @SerializedName("choTiepNhan")
        public int choTiepNhan;
        @SerializedName("dangXuLy")
        public int dangXuLy;
        @SerializedName("daXuLy")
        public int daXuLy;
    }

    public static class YeuCauTaoBaoLoi {
        @SerializedName("loaiPhanHoi")
        public String loaiPhanHoi;
        @SerializedName("mucDoUuTien")
        public String mucDoUuTien;
        @SerializedName("tieuDe")
        public String tieuDe;
        @SerializedName("noiDung")
        public String noiDung;
        @SerializedName("thongTinTrinhDuyet")
        public String thongTinTrinhDuyet;

        public YeuCauTaoBaoLoi(String loaiPhanHoi, String mucDoUuTien, String tieuDe, String noiDung) {
            this.loaiPhanHoi = loaiPhanHoi;
            this.mucDoUuTien = mucDoUuTien;
            this.tieuDe = tieuDe;
            this.noiDung = noiDung;
            this.thongTinTrinhDuyet = "SmartClassAI Android App (Java Native)";
        }
    }

    public static class YeuCauXuLyBaoLoi {
        @SerializedName("trangThai")
        public String trangThai;
        @SerializedName("phanHoiXuLy")
        public String phanHoiXuLy;

        public YeuCauXuLyBaoLoi(String trangThai, String phanHoiXuLy) {
            this.trangThai = trangThai;
            this.phanHoiXuLy = phanHoiXuLy;
        }
    }
}
