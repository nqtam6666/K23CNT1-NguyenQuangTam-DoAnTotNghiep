package com.example.smartclassai.giao_dien.phong_truc_tuyen;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.smartclassai.R;
import com.example.smartclassai.mang.QuanLyPhien;

public class PhongTrucTuyenWebViewActivity extends AppCompatActivity {

    private WebView webViewPhongHoc;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_phong_truc_tuyen_webview);

        String tenPhong = getIntent().getStringExtra("TEN_PHONG");
        String vaiTroPhong = getIntent().getStringExtra("VAI_TRO_PHONG");
        String urlDich = getIntent().getStringExtra("URL_PHONG");

        TextView tvTieuDe = findViewById(R.id.tvTieuDePhongWeb);
        TextView tvVaiTro = findViewById(R.id.tvVaiTroPhongWeb);
        webViewPhongHoc = findViewById(R.id.webViewPhongHoc);

        tvTieuDe.setText(tenPhong != null ? tenPhong : "Phòng học trực tuyến");
        tvVaiTro.setText(vaiTroPhong != null ? vaiTroPhong : "THAM_GIA");

        findViewById(R.id.btnDongPhongWeb).setOnClickListener(v -> finish());

        QuanLyPhien quanLyPhien = new QuanLyPhien(this);
        String token = quanLyPhien.layAccessToken();
        String webBase = quanLyPhien.layUrlWebSongSong();

        if (token != null && !token.isEmpty()) {
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setCookie(webBase, "access_token=" + token + "; path=/");
        }

        WebSettings settings = webViewPhongHoc.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webViewPhongHoc.setWebViewClient(new WebViewClient());
        webViewPhongHoc.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });

        String targetUrl = (urlDich != null && !urlDich.isEmpty())
            ? urlDich
            : (webBase + "/phong-hoc-truc-tuyen");
        webViewPhongHoc.loadUrl(targetUrl);
    }

    @Override
    protected void onDestroy() {
        if (webViewPhongHoc != null) {
            webViewPhongHoc.destroy();
        }
        super.onDestroy();
    }
}
