package com.example.smartclassai.mang;

import com.example.smartclassai.mo_hinh.DuLieuPhanTrang;
import com.example.smartclassai.mo_hinh.MoHinhBangDieuKhien;
import com.example.smartclassai.mo_hinh.MoHinhHocVu;
import com.example.smartclassai.mo_hinh.MoHinhKhongGianLop;
import com.example.smartclassai.mo_hinh.MoHinhTrucTuyenVaAi;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.google.gson.JsonElement;

import java.util.List;
import java.util.Map;

import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface DichVuApiLms {

    // ==================== 1. XÁC THỰC & TÀI KHOẢN ====================
    @POST("xac-thuc/dang-nhap")
    Call<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>> dangNhap(@Body MoHinhXacThuc.YeuCauDangNhap body);

    @POST("xac-thuc/dang-ky")
    Call<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>> dangKy(@Body MoHinhXacThuc.YeuCauDangKy body);

    @POST("xac-thuc/dang-xuat")
    Call<PhanHoiChuan<JsonElement>> dangXuat();

    @GET("xac-thuc/ho-so-hien-tai")
    Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> layHoSoHienTai();

    @POST("xac-thuc/doi-mat-khau")
    Call<PhanHoiChuan<JsonElement>> doiMatKhau(@Body MoHinhXacThuc.YeuCauDoiMatKhau body);

    @GET("xac-thuc/phien-dang-nhap")
    Call<PhanHoiChuan<List<MoHinhXacThuc.PhienDangNhap>>> layDanhSachPhienDangNhap();

    @DELETE("xac-thuc/phien-dang-nhap/{id}")
    Call<PhanHoiChuan<JsonElement>> thuHoiMotPhien(@Path("id") String idPhien);

    @POST("xac-thuc/dang-xuat-tat-ca")
    Call<PhanHoiChuan<JsonElement>> dangXuatTatCaThietBiKhac();

    // ==================== 2. BẢNG ĐIỀU KHIỂN & THÔNG BÁO ====================
    @GET("bang-dieu-khien")
    Call<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiBangDieuKhien>> layDuLieuBangDieuKhien();

    @GET("bang-dieu-khien/thong-bao")
    Call<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiThongBaoBangDieuKhien>> layDanhSachThongBao();

    @PATCH("bang-dieu-khien/thong-bao/{id}/da-doc")
    Call<PhanHoiChuan<JsonElement>> danhDauDaDocThongBao(@Path("id") String id);

    @POST("bang-dieu-khien/thong-bao/doc-tat-ca")
    Call<PhanHoiChuan<JsonElement>> danhDauDocTatCaThongBao();

    @POST("bang-dieu-khien/thong-bao/gui-thu")
    Call<PhanHoiChuan<MoHinhBangDieuKhien.KetQuaGuiThuThongBao>> guiThuThongBaoDaKenh();

    // ==================== 3. LỚP HỌC PHẦN ====================
    @GET("lop-hoc-phan")
    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>> layDanhSachLopHocPhan(
        @Query("tuKhoa") String tuKhoa,
        @Query("trang") int trang,
        @Query("kichThuoc") int kichThuoc
    );

    @GET("lop-hoc-phan/{id}")
    Call<PhanHoiChuan<MoHinhHocVu.LopHocPhan>> layChiTietLopHocPhan(@Path("id") String idLop);

    @POST("lop-hoc-phan")
    Call<PhanHoiChuan<MoHinhHocVu.LopHocPhan>> taoLopHocPhan(@Body MoHinhHocVu.YeuCauTaoLopHocPhan body);

    @POST("lop-hoc-phan/tham-gia-bang-ma")
    Call<PhanHoiChuan<JsonElement>> thamGiaBangMa(@Body MoHinhHocVu.YeuCauThamGiaBangMa body);

    // ==================== 4. BẢNG TIN LỚP HỌC ====================
    @GET("bai-dang/lop/{idLop}")
    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiDang>>> layBaiDangTheoLop(@Path("idLop") String idLop);

    @POST("bai-dang/lop/{idLop}")
    Call<PhanHoiChuan<MoHinhKhongGianLop.BaiDang>> taoBaiDang(
        @Path("idLop") String idLop,
        @Body MoHinhKhongGianLop.YeuCauTaoBaiDang body
    );

    @DELETE("bai-dang/{id}")
    Call<PhanHoiChuan<JsonElement>> xoaBaiDang(@Path("id") String idBaiDang);

    @POST("bai-dang/{id}/binh-luan")
    Call<PhanHoiChuan<MoHinhKhongGianLop.BinhLuan>> taoBinhLuan(
        @Path("id") String idBaiDang,
        @Body MoHinhKhongGianLop.YeuCauTaoBinhLuan body
    );

    // ==================== 5. TÀI LIỆU HỌC TẬP ====================
    @GET("tai-lieu/lop/{idLop}")
    Call<PhanHoiChuan<List<MoHinhKhongGianLop.TaiLieu>>> layTaiLieuTheoLop(@Path("idLop") String idLop);

    @Multipart
    @POST("tai-lieu/lop/{idLop}")
    Call<PhanHoiChuan<MoHinhKhongGianLop.TaiLieu>> taiLenTaiLieu(
        @Path("idLop") String idLop,
        @Part("tieuDe") RequestBody tieuDe,
        @Part("moTa") RequestBody moTa,
        @Part("loaiTaiLieu") RequestBody loaiTaiLieu
    );

    @POST("tai-lieu/{id}/danh-gia")
    Call<PhanHoiChuan<JsonElement>> danhGiaTaiLieu(
        @Path("id") String idTaiLieu,
        @Body MoHinhKhongGianLop.YeuCauDanhGiaTaiLieu body
    );

    @DELETE("tai-lieu/{id}")
    Call<PhanHoiChuan<JsonElement>> xoaTaiLieu(@Path("id") String idTaiLieu);

    // ==================== 6. BÀI TẬP & NỘP BÀI ====================
    @GET("bai-tap/lop/{idLop}")
    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiTap>>> layBaiTapTheoLop(@Path("idLop") String idLop);

    @POST("bai-tap/lop/{idLop}")
    Call<PhanHoiChuan<MoHinhKhongGianLop.BaiTap>> taoBaiTap(
        @Path("idLop") String idLop,
        @Body MoHinhKhongGianLop.YeuCauTaoBaiTap body
    );

    @Multipart
    @POST("bai-tap/{id}/nop-bai")
    Call<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>> nopBaiTap(
        @Path("id") String idBaiTap,
        @Part("noiDung") RequestBody noiDung
    );

    @GET("bai-tap/{id}/danh-sach-nop")
    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiNop>>> layDanhSachBaiNop(@Path("id") String idBaiTap);

    @POST("bai-tap/bai-nop/{idBaiNop}/cham-diem")
    Call<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>> chamDiemBaiNop(
        @Path("idBaiNop") String idBaiNop,
        @Body MoHinhKhongGianLop.YeuCauChamDiem body
    );

    // ==================== 7. KIỂM TRA TRẮC NGHIỆM ====================
    @GET("kiem-tra/lop/{idLop}")
    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiKiemTra>>> layBaiKiemTraTheoLop(@Path("idLop") String idLop);

    @GET("kiem-tra/{id}")
    Call<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>> layChiTietBaiKiemTra(@Path("id") String idBaiKiemTra);

    @POST("kiem-tra/lop/{idLop}/sinh-bang-ai")
    Call<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>> sinhDeBangAI(
        @Path("idLop") String idLop,
        @Body MoHinhKhongGianLop.YeuCauSinhDeAI body
    );

    @POST("kiem-tra/{id}/nop-bai")
    Call<PhanHoiChuan<MoHinhKhongGianLop.LuotLamBai>> nopBaiKiemTra(
        @Path("id") String idBaiKiemTra,
        @Body MoHinhKhongGianLop.YeuCauNopBaiKiemTra body
    );

    // ==================== 8. SỔ ĐIỂM ====================
    @GET("so-diem/lop/{idLop}")
    Call<PhanHoiChuan<MoHinhKhongGianLop.BangDiemLopHocPhan>> layBangDiemLop(@Path("idLop") String idLop);

    @POST("so-diem/lop/{idLop}/cot-diem")
    Call<PhanHoiChuan<MoHinhKhongGianLop.CotDiem>> taoCotDiem(
        @Path("idLop") String idLop,
        @Body MoHinhKhongGianLop.YeuCauTaoCotDiem body
    );

    @POST("so-diem/lop/{idLop}/dong-bo-tu-dong")
    Call<PhanHoiChuan<JsonElement>> dongBoDiemTuDong(@Path("idLop") String idLop);

    @POST("so-diem/lop/{idLop}/hoc-sinh/{idHocSinh}/nhan-xet-ai")
    Call<PhanHoiChuan<MoHinhKhongGianLop.KetQuaNhanXetHocPhanAI>> sinhNhanXetHocPhanAI(
        @Path("idLop") String idLop,
        @Path("idHocSinh") String idHocSinh
    );

    // ==================== 9. THỜI KHÓA BIỂU & ĐIỂM DANH ====================
    @GET("thoi-khoa-bieu/ca-nhan")
    Call<PhanHoiChuan<List<MoHinhHocVu.ThoiKhoaBieu>>> layThoiKhoaBieuCaNhan();

    @GET("thoi-khoa-bieu/buoi-hoc/lop/{idLopHocPhan}")
    Call<PhanHoiChuan<List<MoHinhHocVu.BuoiHoc>>> layDanhSachBuoiHoc(@Path("idLopHocPhan") String idLop);

    @POST("thoi-khoa-bieu/buoi-hoc")
    Call<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> taoBuoiHoc(@Body MoHinhHocVu.YeuCauTaoBuoiHoc body);

    @POST("phong-hoc-truc-tuyen/buoi-hoc/{idBuoiHoc}/mo-ma-diem-danh")
    Call<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> moMaDiemDanh(
        @Path("idBuoiHoc") String idBuoiHoc,
        @Body MoHinhTrucTuyenVaAi.YeuCauMoMaDiemDanh body
    );

    @POST("phong-hoc-truc-tuyen/buoi-hoc/{idBuoiHoc}/dong-ma-diem-danh")
    Call<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> dongMaDiemDanh(@Path("idBuoiHoc") String idBuoiHoc);

    @POST("phong-hoc-truc-tuyen/buoi-hoc/{idBuoiHoc}/diem-danh-ma")
    Call<PhanHoiChuan<JsonElement>> diemDanhBangMa(
        @Path("idBuoiHoc") String idBuoiHoc,
        @Body MoHinhTrucTuyenVaAi.YeuCauDiemDanhMa body
    );

    @GET("phong-hoc-truc-tuyen/lop/{idLop}/thong-ke-chuyen-can")
    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeChuyenCanLop>> layThongKeChuyenCan(@Path("idLop") String idLop);

    @POST("phong-hoc-truc-tuyen/lop/{idLop}/don-xin-nghi")
    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.DonXinNghi>> guiDonXinNghi(
        @Path("idLop") String idLop,
        @Body MoHinhTrucTuyenVaAi.YeuCauTaoDonXinNghi body
    );

    @GET("phong-hoc-truc-tuyen/lop/{idLop}/don-xin-nghi")
    Call<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.DonXinNghi>>> layDanhSachDonXinNghi(@Path("idLop") String idLop);

    @PATCH("phong-hoc-truc-tuyen/don-xin-nghi/{idDon}/duyet")
    Call<PhanHoiChuan<JsonElement>> duyetDonXinNghi(
        @Path("idDon") String idDon,
        @Body MoHinhTrucTuyenVaAi.YeuCauDuyetDonXinNghi body
    );

    // ==================== 10. PHÒNG HỌC TRỰC TUYẾN ====================
    @POST("phong-hoc-truc-tuyen/lop/{idLop}/token")
    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaTokenLiveKit>> layTokenPhongHoc(
        @Path("idLop") String idLop,
        @Body Map<String, String> body
    );

    @PATCH("phong-hoc-truc-tuyen/lop/{idLop}/trang-thai")
    Call<PhanHoiChuan<JsonElement>> batTatPhongHoc(
        @Path("idLop") String idLop,
        @Body MoHinhTrucTuyenVaAi.YeuCauBatTatPhong body
    );

    // ==================== 11. TRỢ LÝ AI (RAG) ====================
    @GET("tro-ly-ai/phien")
    Call<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.PhienTroLy>>> layDanhSachPhienAi();

    @GET("tro-ly-ai/phien/{id}")
    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.PhienTroLy>> layChiTietPhienAi(@Path("id") String idPhien);

    @DELETE("tro-ly-ai/phien/{id}")
    Call<PhanHoiChuan<JsonElement>> xoaPhienAi(@Path("id") String idPhien);

    @POST("tro-ly-ai/hoi-dap")
    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaHoiDapAI>> hoiDapAi(@Body MoHinhTrucTuyenVaAi.YeuCauHoiDapAI body);

    @POST("tro-ly-ai/nap-tai-lieu/{idTaiLieu}")
    Call<PhanHoiChuan<JsonElement>> napTaiLieuVaoKhoVector(@Path("idTaiLieu") String idTaiLieu);

    // ==================== 12. QUẢN LÝ NGƯỜI DÙNG & HỌC VỤ ====================
    @GET("nguoi-dung")
    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhXacThuc.NguoiDung>>> layDanhSachNguoiDung(
        @Query("tuKhoa") String tuKhoa,
        @Query("vaiTro") String vaiTro,
        @Query("trang") int trang,
        @Query("kichThuoc") int kichThuoc
    );

    @POST("nguoi-dung")
    Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> taoNguoiDung(@Body MoHinhXacThuc.YeuCauTaoNguoiDung body);

    @PATCH("nguoi-dung/{id}/trang-thai")
    Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> chuyenTrangThaiNguoiDung(
        @Path("id") String idNguoiDung,
        @Body MoHinhXacThuc.YeuCauChuyenTrangThai body
    );

    @POST("nguoi-dung/{id}/dat-lai-mat-khau")
    Call<PhanHoiChuan<JsonElement>> datLaiMatKhauAdmin(
        @Path("id") String idNguoiDung,
        @Body MoHinhXacThuc.YeuCauDatLaiMatKhau body
    );

    @GET("hoc-vu/nam-hoc")
    Call<PhanHoiChuan<List<MoHinhHocVu.NamHoc>>> layDanhSachNamHoc();

    @POST("hoc-vu/nam-hoc")
    Call<PhanHoiChuan<MoHinhHocVu.NamHoc>> taoNamHoc(@Body MoHinhHocVu.YeuCauTaoNamHoc body);

    @GET("hoc-vu/hoc-ky")
    Call<PhanHoiChuan<List<MoHinhHocVu.HocKy>>> layDanhSachHocKy(@Query("idNamHoc") String idNamHoc);

    @POST("hoc-vu/hoc-ky")
    Call<PhanHoiChuan<MoHinhHocVu.HocKy>> taoHocKy(@Body MoHinhHocVu.YeuCauTaoHocKy body);

    @GET("hoc-vu/mon-hoc")
    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.MonHoc>>> layDanhSachMonHoc(
        @Query("tuKhoa") String tuKhoa,
        @Query("trang") int trang,
        @Query("kichThuoc") int kichThuoc
    );

    @POST("hoc-vu/mon-hoc")
    Call<PhanHoiChuan<MoHinhHocVu.MonHoc>> taoMonHoc(@Body MoHinhHocVu.YeuCauTaoMonHoc body);

    @GET("hoc-vu/lop-hanh-chinh")
    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHanhChinh>>> layDanhSachLopHanhChinh(
        @Query("trang") int trang,
        @Query("kichThuoc") int kichThuoc
    );

    @POST("hoc-vu/lop-hanh-chinh")
    Call<PhanHoiChuan<MoHinhHocVu.LopHanhChinh>> taoLopHanhChinh(@Body MoHinhHocVu.YeuCauTaoLopHanhChinh body);

    // ==================== 13. BÁO LỖI, ĐÓNG GÓP & HỒ SƠ ====================
    @GET("bao-loi-dong-gop")
    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhTrucTuyenVaAi.BaoLoiDongGop>>> layDanhSachBaoLoi(
        @Query("trang") int trang,
        @Query("kichThuoc") int kichThuoc
    );

    @GET("bao-loi-dong-gop/thong-ke")
    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeBaoLoi>> layThongKeBaoLoi();

    @POST("bao-loi-dong-gop")
    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>> taoBaoLoi(@Body MoHinhTrucTuyenVaAi.YeuCauTaoBaoLoi body);

    @PATCH("bao-loi-dong-gop/{id}/xu-ly")
    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>> xuLyBaoLoi(
        @Path("id") String idBaoLoi,
        @Body MoHinhTrucTuyenVaAi.YeuCauXuLyBaoLoi body
    );

    @GET("ho-so/ca-nhan")
    Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> layHoSoCaNhan();

    @PATCH("ho-so/ca-nhan")
    Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> capNhatHoSoCaNhan(@Body MoHinhXacThuc.YeuCauCapNhatHoSo body);

    @GET("ho-so/con-em")
    Call<PhanHoiChuan<List<MoHinhXacThuc.ConEmPhuHuynh>>> layDanhSachConEm();

    @GET("ho-so/giao-vien")
    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.ThongTinGiaoVienPhuTrach>>> layDanhSachHoSoGiaoVien(
        @Query("trang") int trang,
        @Query("kichThuoc") int kichThuoc
    );
}
