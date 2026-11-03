package com.example.smartclassai.mo_hinh;

import com.google.gson.annotations.SerializedName;

import java.util.Collections;
import java.util.List;

public class DuLieuPhanTrang<T> {
    @SerializedName("duLieu")
    private List<T> duLieu;

    @SerializedName("danhSach")
    private List<T> danhSach;

    @SerializedName("tongSo")
    private int tongSo;

    @SerializedName("trang")
    private int trang;

    @SerializedName("trangHienTai")
    private int trangHienTai;

    @SerializedName("tongSoTrang")
    private int tongSoTrang;

    public List<T> layDanhSach() {
        if (duLieu != null) {
            return duLieu;
        }
        if (danhSach != null) {
            return danhSach;
        }
        return Collections.emptyList();
    }

    public int layTongSo() {
        return tongSo;
    }

    public int layTrangHienTai() {
        return trangHienTai > 0 ? trangHienTai : Math.max(1, trang);
    }

    public int layTongSoTrang() {
        return Math.max(1, tongSoTrang);
    }
}
