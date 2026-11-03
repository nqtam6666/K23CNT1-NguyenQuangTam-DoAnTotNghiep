package com.example.smartclassai;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.example.smartclassai.mo_hinh.DuLieuPhanTrang;
import com.example.smartclassai.mo_hinh.MoHinhHocVu;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.DinhDangThoiGian;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.junit.Test;

import java.lang.reflect.Type;
import java.util.List;

/**
 * Kiểm thử đơn vị cho các mô hình dữ liệu POJO, bộ giải mã JSON đồng bộ với @lms/api
 * và tiện ích định dạng thời gian tiếng Việt.
 */
public class QuanLyPhienVaMoHinhTest {

    private final Gson gson = new Gson();

    @Test
    public void giaiMaPhanHoiDangNhap_hopLe() {
        String json = "{"
                + "\"thanhCong\": true,"
                + "\"thongDiep\": \"Đăng nhập thành công\","
                + "\"duLieu\": {"
                + "  \"accessToken\": \"jwt-token-mau\","
                + "  \"nguoiDung\": {"
                + "    \"id\": \"usr-01\","
                + "    \"email\": \"giaovien1@lms.edu.vn\","
                + "    \"hoTen\": \"Nguyễn Văn Giáo Viên\","
                + "    \"vaiTro\": \"GIAO_VIEN\""
                + "  }"
                + "}"
                + "}";

        Type kieu = new TypeToken<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>>() {}.getType();
        PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap> phanHoi = gson.fromJson(json, kieu);

        assertNotNull(phanHoi);
        assertTrue(phanHoi.laThanhCong());
        assertEquals("Đăng nhập thành công", phanHoi.layThongDiep());
        assertNotNull(phanHoi.layDuLieu());
        assertEquals("jwt-token-mau", phanHoi.layDuLieu().accessToken);
        assertEquals("GIAO_VIEN", phanHoi.layDuLieu().nguoiDung.vaiTro);
        assertEquals("Giáo viên", DinhDangThoiGian.tenVaiTroTiengViet(phanHoi.layDuLieu().nguoiDung.vaiTro));
    }

    @Test
    public void giaiMaDuLieuPhanTrang_hoTroCaHaiTruongDuLieuVaDanhSach() {
        String jsonKieuDuLieu = "{"
                + "\"duLieu\": [{\"id\": \"lhp-1\", \"maLopHocPhan\": \"IT101\", \"tenLopHocPhan\": \"Lập trình Java\"}],"
                + "\"tongSo\": 1,"
                + "\"trang\": 1,"
                + "\"gioiHan\": 20,"
                + "\"tongSoTrang\": 1"
                + "}";

        Type kieu = new TypeToken<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>() {}.getType();
        DuLieuPhanTrang<MoHinhHocVu.LopHocPhan> trang1 = gson.fromJson(jsonKieuDuLieu, kieu);
        List<MoHinhHocVu.LopHocPhan> ds1 = trang1.layDanhSach();
        assertEquals(1, ds1.size());
        assertEquals("IT101", ds1.get(0).maLopHocPhan);

        String jsonKieuDanhSach = "{"
                + "\"danhSach\": [{\"id\": \"lhp-2\", \"maLopHocPhan\": \"IT102\", \"tenLopHocPhan\": \"Cấu trúc dữ liệu\"}],"
                + "\"tongSo\": 1"
                + "}";
        DuLieuPhanTrang<MoHinhHocVu.LopHocPhan> trang2 = gson.fromJson(jsonKieuDanhSach, kieu);
        List<MoHinhHocVu.LopHocPhan> ds2 = trang2.layDanhSach();
        assertEquals(1, ds2.size());
        assertEquals("IT102", ds2.get(0).maLopHocPhan);
    }

    @Test
    public void dinhDangThoiGian_chuyenChuoiIsoSangGioNgayVietNam() {
        String ketQua = DinhDangThoiGian.dinhDangNgayGio("2026-05-15T07:30:00.000Z");
        assertNotNull(ketQua);
        assertTrue(ketQua.contains("15/05/2026"));

        assertEquals("Thứ Hai", DinhDangThoiGian.tenThuTrongTuan(2));
        assertEquals("Chủ Nhật", DinhDangThoiGian.tenThuTrongTuan(8));
        assertEquals("NV", DinhDangThoiGian.chuCaiDau("Nguyễn Văn Giáo Viên"));
    }
}
