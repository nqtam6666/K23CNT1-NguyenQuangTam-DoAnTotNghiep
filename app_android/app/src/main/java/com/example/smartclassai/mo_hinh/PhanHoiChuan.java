package com.example.smartclassai.mo_hinh;

import com.google.gson.annotations.SerializedName;

public class PhanHoiChuan<T> {
    @SerializedName("thanhCong")
    private boolean thanhCong;

    @SerializedName("thongDiep")
    private String thongDiep;

    @SerializedName("duLieu")
    private T duLieu;

    @SerializedName("thoiGian")
    private String thoiGian;

    public boolean laThanhCong() {
        return thanhCong;
    }

    public void datThanhCong(boolean thanhCong) {
        this.thanhCong = thanhCong;
    }

    public String layThongDiep() {
        return thongDiep;
    }

    public void datThongDiep(String thongDiep) {
        this.thongDiep = thongDiep;
    }

    public T layDuLieu() {
        return duLieu;
    }

    public void datDuLieu(T duLieu) {
        this.duLieu = duLieu;
    }

    public String layThoiGian() {
        return thoiGian;
    }
}
