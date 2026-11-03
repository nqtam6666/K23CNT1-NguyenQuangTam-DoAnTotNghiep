package com.example.smartclassai.tien_ich;

public final class DinhDangThoiGian {

    private DinhDangThoiGian() {
    }

    public static String dinhDangNgayGio(String chuoiIso) {
        if (chuoiIso == null || chuoiIso.trim().isEmpty()) {
            return "Chưa cập nhật";
        }
        try {
            String sach = chuoiIso.replace("T", " ").replace("Z", "");
            int viTriCham = sach.indexOf('.');
            if (viTriCham > 0) {
                sach = sach.substring(0, viTriCham);
            }
            if (sach.length() >= 16) {
                String nam = sach.substring(0, 4);
                String thang = sach.substring(5, 7);
                String ngay = sach.substring(8, 10);
                String gioPhut = sach.substring(11, 16);
                return ngay + "/" + thang + "/" + nam + " " + gioPhut;
            }
            if (sach.length() >= 10) {
                String nam = sach.substring(0, 4);
                String thang = sach.substring(5, 7);
                String ngay = sach.substring(8, 10);
                return ngay + "/" + thang + "/" + nam;
            }
            return sach;
        } catch (Exception e) {
            return chuoiIso;
        }
    }

    public static String dinhDangNgayNgan(String chuoiIso) {
        if (chuoiIso == null || chuoiIso.trim().isEmpty()) {
            return "--/--/----";
        }
        try {
            if (chuoiIso.length() >= 10) {
                String nam = chuoiIso.substring(0, 4);
                String thang = chuoiIso.substring(5, 7);
                String ngay = chuoiIso.substring(8, 10);
                return ngay + "/" + thang + "/" + nam;
            }
            return chuoiIso;
        } catch (Exception e) {
            return chuoiIso;
        }
    }

    public static String tenVaiTroTiengViet(String vaiTro) {
        if (vaiTro == null) {
            return "Thành viên";
        }
        switch (vaiTro) {
            case "QUAN_TRI_VIEN":
                return "Quản trị viên";
            case "BAN_GIAM_HIEU":
                return "Ban giám hiệu";
            case "GIAO_VU":
                return "Giáo vụ";
            case "GIAO_VIEN":
                return "Giáo viên";
            case "HOC_SINH":
                return "Học sinh";
            case "PHU_HUYNH":
                return "Phụ huynh";
            default:
                return vaiTro;
        }
    }

    public static String tenThuTrongTuan(int thu) {
        switch (thu) {
            case 2:
                return "Thứ Hai";
            case 3:
                return "Thứ Ba";
            case 4:
                return "Thứ Tư";
            case 5:
                return "Thứ Năm";
            case 6:
                return "Thứ Sáu";
            case 7:
                return "Thứ Bảy";
            case 8:
                return "Chủ Nhật";
            default:
                return "Thứ " + thu;
        }
    }

    public static String chuCaiDau(String hoTen) {
        if (hoTen == null || hoTen.trim().isEmpty()) {
            return "ND";
        }
        String[] tu = hoTen.trim().split("\\s+");
        if (tu.length == 1) {
            return tu[0].substring(0, Math.min(2, tu[0].length())).toUpperCase();
        }
        String dau = tu[0].substring(0, 1);
        String cuoi = tu[tu.length - 1].substring(0, 1);
        return (dau + cuoi).toUpperCase();
    }
}
