package com.example.smartclassai.tien_ich;

import android.content.Context;
import android.graphics.Typeface;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.core.content.ContextCompat;

import com.example.smartclassai.R;

public final class TaoGiaoDienWarmMinimal {

    private TaoGiaoDienWarmMinimal() {
    }

    public static int dp(Context context, int dpVal) {
        return Math.round(dpVal * context.getResources().getDisplayMetrics().density);
    }

    public static LinearLayout taoTheBeMat(Context context) {
        LinearLayout card = new LinearLayout(context);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setBackgroundResource(R.drawable.bg_the_be_mat);
        int pad = dp(context, 14);
        card.setPadding(pad, pad, pad, pad);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.bottomMargin = dp(context, 12);
        card.setLayoutParams(params);
        return card;
    }

    public static TextView taoEyebrow(Context context, String vanBan) {
        TextView tv = new TextView(context);
        tv.setText(vanBan != null ? vanBan.toUpperCase() : "");
        tv.setTypeface(Typeface.MONOSPACE, Typeface.NORMAL);
        tv.setTextSize(11f);
        tv.setLetterSpacing(0.10f);
        tv.setTextColor(ContextCompat.getColor(context, R.color.muted));
        return tv;
    }

    public static TextView taoTieuDeMonospace(Context context, String vanBan, float coChuSp) {
        TextView tv = new TextView(context);
        tv.setText(vanBan != null ? vanBan : "");
        tv.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
        tv.setTextSize(coChuSp);
        tv.setTextColor(ContextCompat.getColor(context, R.color.text));
        return tv;
    }

    public static TextView taoSoLieuLon(Context context, String giaTri) {
        TextView tv = new TextView(context);
        tv.setText(giaTri != null ? giaTri : "0");
        tv.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
        tv.setFontFeatureSettings("tnum");
        tv.setTextSize(20f);
        tv.setTextColor(ContextCompat.getColor(context, R.color.accent));
        return tv;
    }

    public static TextView taoVanBanMoTa(Context context, String vanBan) {
        TextView tv = new TextView(context);
        tv.setText(vanBan != null ? vanBan : "");
        tv.setTextSize(13.5f);
        tv.setLineSpacing(0f, 1.3f);
        tv.setTextColor(ContextCompat.getColor(context, R.color.text));
        return tv;
    }

    public static TextView taoVanBanPhu(Context context, String vanBan) {
        TextView tv = new TextView(context);
        tv.setText(vanBan != null ? vanBan : "");
        tv.setTextSize(12.5f);
        tv.setLineSpacing(0f, 1.25f);
        tv.setTextColor(ContextCompat.getColor(context, R.color.muted));
        return tv;
    }

    public static TextView taoNhanTrangThai(Context context, String vanBan, String kieuMau) {
        TextView tv = new TextView(context);
        tv.setText(vanBan != null ? vanBan : "");
        tv.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
        tv.setTextSize(11f);
        int padH = dp(context, 8);
        int padV = dp(context, 3);
        tv.setPadding(padH, padV, padH, padV);

        if ("accent".equalsIgnoreCase(kieuMau) || "success".equalsIgnoreCase(kieuMau)) {
            tv.setBackgroundResource(R.drawable.bg_nhan_accent);
            tv.setTextColor(ContextCompat.getColor(context, R.color.accent));
        } else if ("info".equalsIgnoreCase(kieuMau)) {
            tv.setBackgroundResource(R.drawable.bg_nhan_info);
            tv.setTextColor(ContextCompat.getColor(context, R.color.info));
        } else if ("danger".equalsIgnoreCase(kieuMau) || "warning".equalsIgnoreCase(kieuMau)) {
            tv.setBackgroundResource(R.drawable.bg_nhan_danger);
            tv.setTextColor(ContextCompat.getColor(context, R.color.danger));
        } else {
            tv.setBackgroundResource(R.drawable.bg_nhan_muted);
            tv.setTextColor(ContextCompat.getColor(context, R.color.text));
        }
        return tv;
    }

    public static Button taoNutChinh(Context context, String nhan) {
        Button btn = new Button(context);
        btn.setText(nhan);
        btn.setAllCaps(false);
        btn.setTextSize(13f);
        btn.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        btn.setTextColor(ContextCompat.getColor(context, R.color.white));
        btn.setBackgroundTintList(null);
        btn.setBackgroundResource(R.drawable.bg_nut_chinh);
        int padH = dp(context, 14);
        btn.setPadding(padH, 0, padH, 0);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            dp(context, 44)
        );
        btn.setLayoutParams(params);
        return btn;
    }

    public static Button taoNutPhu(Context context, String nhan) {
        Button btn = new Button(context);
        btn.setText(nhan);
        btn.setAllCaps(false);
        btn.setTextSize(12.5f);
        btn.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        btn.setTextColor(ContextCompat.getColor(context, R.color.text));
        btn.setBackgroundTintList(null);
        btn.setBackgroundResource(R.drawable.bg_nut_phu);
        int padH = dp(context, 12);
        btn.setPadding(padH, 0, padH, 0);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            dp(context, 44)
        );
        btn.setLayoutParams(params);
        return btn;
    }

    public static EditText taoONhap(Context context, String goiY) {
        EditText edt = new EditText(context);
        edt.setHint(goiY);
        edt.setTextSize(13.5f);
        edt.setTextColor(ContextCompat.getColor(context, R.color.text));
        edt.setHintTextColor(ContextCompat.getColor(context, R.color.muted));
        edt.setBackgroundResource(R.drawable.bg_o_nhap);
        int padH = dp(context, 12);
        int padV = dp(context, 10);
        edt.setPadding(padH, padV, padH, padV);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.topMargin = dp(context, 6);
        params.bottomMargin = dp(context, 8);
        edt.setLayoutParams(params);
        return edt;
    }

    public static View taoDuongKeNgang(Context context) {
        View line = new View(context);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            dp(context, 1)
        );
        params.topMargin = dp(context, 10);
        params.bottomMargin = dp(context, 10);
        line.setLayoutParams(params);
        line.setBackgroundColor(ContextCompat.getColor(context, R.color.border));
        return line;
    }

    public static LinearLayout taoKhungTrangThaiRong(Context context, String tieuDe, String moTa) {
        LinearLayout box = taoTheBeMat(context);
        box.setGravity(Gravity.CENTER);
        int pad = dp(context, 24);
        box.setPadding(pad, pad, pad, pad);

        TextView tvTieuDe = taoTieuDeMonospace(context, tieuDe, 14f);
        tvTieuDe.setGravity(Gravity.CENTER);
        box.addView(tvTieuDe);

        if (!TextUtils.isEmpty(moTa)) {
            TextView tvMoTa = taoVanBanPhu(context, moTa);
            tvMoTa.setGravity(Gravity.CENTER);
            tvMoTa.setPadding(0, dp(context, 6), 0, 0);
            box.addView(tvMoTa);
        }
        return box;
    }
}
