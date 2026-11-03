package com.example.smartclassai.tien_ich;

import android.content.Context;
import android.widget.Toast;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import okhttp3.ResponseBody;
import retrofit2.Response;

public final class ThongBaoToast {

    private ThongBaoToast() {
    }

    public static void hienThi(Context context, String thongDiep) {
        if (context == null || thongDiep == null || thongDiep.trim().isEmpty()) {
            return;
        }
        Toast.makeText(context.getApplicationContext(), thongDiep, Toast.LENGTH_SHORT).show();
    }

    public static void hienThiDai(Context context, String thongDiep) {
        if (context == null || thongDiep == null || thongDiep.trim().isEmpty()) {
            return;
        }
        Toast.makeText(context.getApplicationContext(), thongDiep, Toast.LENGTH_LONG).show();
    }

    public static String trichXuatThongDiepLoi(Response<?> phanHoi, String macDinh) {
        if (phanHoi == null) {
            return macDinh;
        }
        try {
            ResponseBody errorBody = phanHoi.errorBody();
            if (errorBody != null) {
                String noiDung = errorBody.string();
                JsonObject json = JsonParser.parseString(noiDung).getAsJsonObject();
                if (json.has("thongDiep") && !json.get("thongDiep").isJsonNull()) {
                    return json.get("thongDiep").getAsString();
                }
                if (json.has("message") && !json.get("message").isJsonNull()) {
                    return json.get("message").getAsString();
                }
            }
        } catch (Exception ignored) {
        }
        return macDinh + " (Mã HTTP " + phanHoi.code() + ")";
    }
}
