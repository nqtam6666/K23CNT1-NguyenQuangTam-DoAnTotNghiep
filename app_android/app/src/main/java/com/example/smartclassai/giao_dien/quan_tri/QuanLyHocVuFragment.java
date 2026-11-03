package com.example.smartclassai.giao_dien.quan_tri;

import android.content.Context;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.smartclassai.R;
import com.example.smartclassai.mang.RetrofitClient;
import com.example.smartclassai.mo_hinh.DuLieuPhanTrang;
import com.example.smartclassai.mo_hinh.MoHinhHocVu;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.TaoGiaoDienWarmMinimal;
import com.example.smartclassai.tien_ich.ThongBaoToast;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class QuanLyHocVuFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout khungChinh;

    private List<MoHinhHocVu.NamHoc> dsNamHoc = new ArrayList<>();
    private List<MoHinhHocVu.HocKy> dsHocKy = new ArrayList<>();
    private List<MoHinhHocVu.MonHoc> dsMonHoc = new ArrayList<>();
    private List<MoHinhHocVu.LopHanhChinh> dsLopHanhChinh = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(
        @NonNull LayoutInflater inflater,
        @Nullable ViewGroup container,
        @Nullable Bundle savedInstanceState
    ) {
        View view = inflater.inflate(R.layout.fragment_khung_danh_sach, container, false);
        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        khungChinh = view.findViewById(R.id.khungChinhFragment);

        swipeRefresh.setOnRefreshListener(this::taiToanBoHocVu);
        taiToanBoHocVu();
        return view;
    }

    private void taiToanBoHocVu() {
        if (getContext() == null) {
            return;
        }
        swipeRefresh.setRefreshing(true);
        RetrofitClient.layDichVu(getContext())
            .layDanhSachNamHoc()
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhHocVu.NamHoc>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhHocVu.NamHoc>>> call,
                    Response<PhanHoiChuan<List<MoHinhHocVu.NamHoc>>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsNamHoc = response.body().layDuLieu();
                    }
                    taiHocKy();
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<List<MoHinhHocVu.NamHoc>>> call, Throwable t) {
                    taiHocKy();
                }
            });
    }

    private void taiHocKy() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachHocKy(null)
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhHocVu.HocKy>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhHocVu.HocKy>>> call,
                    Response<PhanHoiChuan<List<MoHinhHocVu.HocKy>>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsHocKy = response.body().layDuLieu();
                    }
                    taiMonHoc();
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<List<MoHinhHocVu.HocKy>>> call, Throwable t) {
                    taiMonHoc();
                }
            });
    }

    private void taiMonHoc() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachMonHoc(null, 1, 50)
            .enqueue(new Callback<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.MonHoc>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.MonHoc>>> call,
                    Response<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.MonHoc>>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsMonHoc = response.body().layDuLieu().layDanhSach();
                    }
                    taiLopHanhChinh();
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.MonHoc>>> call, Throwable t) {
                    taiLopHanhChinh();
                }
            });
    }

    private void taiLopHanhChinh() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachLopHanhChinh(1, 50)
            .enqueue(new Callback<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHanhChinh>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHanhChinh>>> call,
                    Response<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHanhChinh>>> response
                ) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsLopHanhChinh = response.body().layDuLieu().layDanhSach();
                    }
                    veGiaoDien();
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHanhChinh>>> call,
                    Throwable t
                ) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    veGiaoDien();
                }
            });
    }

    private void veGiaoDien() {
        Context context = getContext();
        if (context == null || khungChinh == null) {
            return;
        }
        khungChinh.removeAllViews();

        // 1. Khung Năm học & Học kỳ
        LinearLayout theNamHoc = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theNamHoc.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            context,
            "NĂM HỌC (" + dsNamHoc.size() + ") & HỌC KỲ (" + dsHocKy.size() + ")"
        ));
        Button btnThemNamHoc = TaoGiaoDienWarmMinimal.taoNutPhu(context, "+ Thêm năm học");
        btnThemNamHoc.setOnClickListener(v -> moHopThoaiThemNamHoc());
        theNamHoc.addView(btnThemNamHoc);

        for (MoHinhHocVu.NamHoc nh : dsNamHoc) {
            theNamHoc.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
            theNamHoc.addView(TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                context,
                "Năm học " + nh.tenNamHoc + (nh.hienTai ? " [HIỆN TẠI]" : ""),
                14f
            ));
        }
        for (MoHinhHocVu.HocKy hk : dsHocKy) {
            theNamHoc.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                "• " + hk.tenHocKy + (hk.hienTai ? " (Đang diễn ra)" : "")
            ));
        }
        khungChinh.addView(theNamHoc);

        // 2. Khung Danh mục Môn học
        LinearLayout theMonHoc = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theMonHoc.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            context,
            "DANH MỤC MÔN HỌC (" + dsMonHoc.size() + " MÔN)"
        ));
        Button btnThemMon = TaoGiaoDienWarmMinimal.taoNutChinh(context, "+ Tạo môn học mới");
        btnThemMon.setOnClickListener(v -> moHopThoaiThemMonHoc());
        theMonHoc.addView(btnThemMon);

        for (MoHinhHocVu.MonHoc mh : dsMonHoc) {
            theMonHoc.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
            LinearLayout dong = new LinearLayout(context);
            dong.setOrientation(LinearLayout.HORIZONTAL);
            dong.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvTen = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                context,
                mh.maMonHoc + " — " + mh.tenMonHoc,
                13.5f
            );
            tvTen.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            dong.addView(tvTen);

            dong.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(context, mh.soTinChi + " TC", "info"));
            theMonHoc.addView(dong);
        }
        khungChinh.addView(theMonHoc);

        // 3. Khung Lớp hành chính (Lớp sinh hoạt)
        LinearLayout theLopHc = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theLopHc.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            context,
            "LỚP HÀNH CHÍNH / NIÊN KHÓA (" + dsLopHanhChinh.size() + " LỚP)"
        ));
        Button btnThemLopHc = TaoGiaoDienWarmMinimal.taoNutPhu(context, "+ Tạo lớp hành chính");
        btnThemLopHc.setOnClickListener(v -> moHopThoaiThemLopHanhChinh());
        theLopHc.addView(btnThemLopHc);

        for (MoHinhHocVu.LopHanhChinh lhc : dsLopHanhChinh) {
            theLopHc.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
            theLopHc.addView(TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                context,
                lhc.maLop + " — " + lhc.tenLop + " (Khối " + lhc.khoiLop + ")",
                13.5f
            ));
            int siSo = lhc.dem != null ? lhc.dem.danhSachHocSinh : 0;
            theLopHc.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                "Sĩ số: " + siSo + " học sinh"
            ));
        }
        khungChinh.addView(theLopHc);
    }

    private void moHopThoaiThemNamHoc() {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtTen = TaoGiaoDienWarmMinimal.taoONhap(context, "Tên năm học (VD: 2026-2027)");
        khung.addView(edtTen);

        CheckBox cbHienTai = new CheckBox(context);
        cbHienTai.setText("Đặt làm năm học hiện tại");
        khung.addView(cbHienTai);

        new AlertDialog.Builder(context)
            .setTitle("Thêm năm học mới")
            .setView(khung)
            .setPositiveButton("Tạo năm học", (d, w) -> {
                String ten = edtTen.getText().toString().trim();
                if (ten.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .taoNamHoc(new MoHinhHocVu.YeuCauTaoNamHoc(ten, cbHienTai.isChecked()))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhHocVu.NamHoc>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhHocVu.NamHoc>> call,
                            Response<PhanHoiChuan<MoHinhHocVu.NamHoc>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã thêm năm học " + ten);
                                taiToanBoHocVu();
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhHocVu.NamHoc>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void moHopThoaiThemMonHoc() {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtMa = TaoGiaoDienWarmMinimal.taoONhap(context, "Mã môn học (VD: TIN11)");
        khung.addView(edtMa);

        EditText edtTen = TaoGiaoDienWarmMinimal.taoONhap(context, "Tên môn học (VD: Cấu trúc dữ liệu & Giải thuật)");
        khung.addView(edtTen);

        EditText edtTc = TaoGiaoDienWarmMinimal.taoONhap(context, "Số tín chỉ (VD: 3)");
        edtTc.setInputType(InputType.TYPE_CLASS_NUMBER);
        edtTc.setText("3");
        khung.addView(edtTc);

        new AlertDialog.Builder(context)
            .setTitle("Tạo môn học mới")
            .setView(khung)
            .setPositiveButton("Tạo môn học", (d, w) -> {
                String ma = edtMa.getText().toString().trim().toUpperCase();
                String ten = edtTen.getText().toString().trim();
                int tc = 3;
                try {
                    tc = Integer.parseInt(edtTc.getText().toString().trim());
                } catch (Exception ignored) {
                }
                if (ma.isEmpty() || ten.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .taoMonHoc(new MoHinhHocVu.YeuCauTaoMonHoc(ma, ten, tc, null))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhHocVu.MonHoc>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhHocVu.MonHoc>> call,
                            Response<PhanHoiChuan<MoHinhHocVu.MonHoc>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã tạo môn học " + ten);
                                taiToanBoHocVu();
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhHocVu.MonHoc>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void moHopThoaiThemLopHanhChinh() {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtMa = TaoGiaoDienWarmMinimal.taoONhap(context, "Mã lớp (VD: 10A2)");
        khung.addView(edtMa);

        EditText edtTen = TaoGiaoDienWarmMinimal.taoONhap(context, "Tên lớp (VD: Lớp 10A2 Tự nhiên)");
        khung.addView(edtTen);

        EditText edtKhoi = TaoGiaoDienWarmMinimal.taoONhap(context, "Khối lớp (10, 11 hoặc 12)");
        edtKhoi.setInputType(InputType.TYPE_CLASS_NUMBER);
        edtKhoi.setText("10");
        khung.addView(edtKhoi);

        new AlertDialog.Builder(context)
            .setTitle("Tạo lớp hành chính mới")
            .setView(khung)
            .setPositiveButton("Tạo lớp", (d, w) -> {
                String ma = edtMa.getText().toString().trim().toUpperCase();
                String ten = edtTen.getText().toString().trim();
                int khoi = 10;
                try {
                    khoi = Integer.parseInt(edtKhoi.getText().toString().trim());
                } catch (Exception ignored) {
                }
                if (ma.isEmpty() || ten.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .taoLopHanhChinh(new MoHinhHocVu.YeuCauTaoLopHanhChinh(ma, ten, khoi))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhHocVu.LopHanhChinh>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhHocVu.LopHanhChinh>> call,
                            Response<PhanHoiChuan<MoHinhHocVu.LopHanhChinh>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã thêm lớp hành chính " + ma);
                                taiToanBoHocVu();
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhHocVu.LopHanhChinh>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }
}
