package com.example.smartclassai.mang;

import android.content.Context;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public final class RetrofitClient {

    private static DichVuApiLms dichVuApi;
    private static String baseUrlHienTai;

    private RetrofitClient() {
    }

    public static synchronized DichVuApiLms layDichVu(Context context) {
        QuanLyPhien quanLyPhien = new QuanLyPhien(context);
        String baseUrl = quanLyPhien.layBaseUrl();

        if (dichVuApi == null || !baseUrl.equals(baseUrlHienTai)) {
            baseUrlHienTai = baseUrl;

            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BASIC);

            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(chain -> {
                    Request goc = chain.request();
                    Request.Builder builder = goc.newBuilder()
                        .header("Accept", "application/json")
                        .header("User-Agent", "SmartClassAI-Android/1.0 (Java; Android Studio)");

                    String token = quanLyPhien.layAccessToken();
                    if (token != null && !token.trim().isEmpty()) {
                        builder.header("Authorization", "Bearer " + token.trim());
                    }
                    return chain.proceed(builder.build());
                })
                .addInterceptor(logging)
                .build();

            Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

            dichVuApi = retrofit.create(DichVuApiLms.class);
        }

        return dichVuApi;
    }

    public static synchronized void lamMoiKetNoi() {
        dichVuApi = null;
        baseUrlHienTai = null;
    }
}
