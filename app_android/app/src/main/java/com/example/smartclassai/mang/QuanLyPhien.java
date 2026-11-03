package com.example.smartclassai.mang;

import android.content.Context;
import android.content.SharedPreferences;

import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.google.gson.Gson;

public class QuanLyPhien {
    private static final String TEN_PREF = "smartclass_ai_phien_prefs";
    private static final String KHOA_ACCESS_TOKEN = "access_token";
    private static final String KHOA_REFRESH_TOKEN = "refresh_token";
    private static final String KHOA_NGUOI_DUNG = "nguoi_dung_json";

    public static final String URL_MAC_DINH_EMULATOR = "http://10.0.2.2:4000/api/v1/";

    private final SharedPreferences prefs;
    private final Gson gson = new Gson();

    public QuanLyPhien(Context context) {
        this.prefs = context.getApplicationContext()
            .getSharedPreferences(TEN_PREF, Context.MODE_PRIVATE);
    }

    public void luuPhienDangNhap(String accessToken, String refreshToken, MoHinhXacThuc.NguoiDung nguoiDung) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(KHOA_ACCESS_TOKEN, accessToken);
        if (refreshToken != null) {
            editor.putString(KHOA_REFRESH_TOKEN, refreshToken);
        }
        if (nguoiDung != null) {
            editor.putString(KHOA_NGUOI_DUNG, gson.toJson(nguoiDung));
        }
        editor.apply();
    }

    public void capNhatNguoiDung(MoHinhXacThuc.NguoiDung nguoiDung) {
        if (nguoiDung != null) {
            prefs.edit().putString(KHOA_NGUOI_DUNG, gson.toJson(nguoiDung)).apply();
        }
    }

    public String layAccessToken() {
        return prefs.getString(KHOA_ACCESS_TOKEN, null);
    }

    public String layRefreshToken() {
        return prefs.getString(KHOA_REFRESH_TOKEN, null);
    }

    public MoHinhXacThuc.NguoiDung layNguoiDung() {
        String json = prefs.getString(KHOA_NGUOI_DUNG, null);
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return gson.fromJson(json, MoHinhXacThuc.NguoiDung.class);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean daDangNhap() {
        String token = layAccessToken();
        return token != null && !token.trim().isEmpty() && layNguoiDung() != null;
    }

    public void xoaPhien() {
        prefs.edit().clear().apply();
    }

    public String layBaseUrl() {
        return URL_MAC_DINH_EMULATOR;
    }

    public String layUrlGocMayChu() {
        return "http://10.0.2.2:4000";
    }

    public String layUrlWebSongSong() {
        return "http://10.0.2.2:3000";
    }

    public static boolean laQuanTriHoacGiaoVu(String vaiTro) {
        return "QUAN_TRI_VIEN".equals(vaiTro)
            || "BAN_GIAM_HIEU".equals(vaiTro)
            || "GIAO_VU".equals(vaiTro);
    }

    public static boolean laGiaoVienHoacQuanTri(String vaiTro) {
        return "GIAO_VIEN".equals(vaiTro) || laQuanTriHoacGiaoVu(vaiTro);
    }
}
