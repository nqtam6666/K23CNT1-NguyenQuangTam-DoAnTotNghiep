package com.example.smartclassai.giao_dien.lop_hoc_phan;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.smartclassai.R;
import com.example.smartclassai.mang.QuanLyPhien;
import com.example.smartclassai.mang.RetrofitClient;
import com.example.smartclassai.mo_hinh.DuLieuPhanTrang;
import com.example.smartclassai.mo_hinh.MoHinhHocVu;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.TaoGiaoDienWarmMinimal;
import com.example.smartclassai.tien_ich.ThongBaoToast;
import com.google.gson.JsonElement;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LopHocPhanFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout khungChinh;
    private String tuKhoaHienTai = "";
    private List<MoHinhHocVu.LopHocPhan> danhSachLop = new ArrayList<>();

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

        swipeRefresh.setOnRefreshListener(this::taiDanhSachLop);
        taiDanhSachLop();
        return view;
    }

    private void taiDanhSachLop() {
        if (getContext() == null) {
            return;
        }
        swipeRefresh.setRefreshing(true);
        RetrofitClient.layDichVu(getContext())
            .layDanhSachLopHocPhan(tuKhoaHienTai.isEmpty() ? null : tuKhoaHienTai, 1, 50)
            .enqueue(new Callback<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>> call,
                    Response<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>> response
                ) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        danhSachLop = response.body().layDuLieu().layDanhSach();
                    } else {
                        danhSachLop = new ArrayList<>();
                    }
                    veGiaoDien();
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>> call,
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

        QuanLyPhien quanLyPhien = new QuanLyPhien(context);
        MoHinhXacThuc.NguoiDung nd = quanLyPhien.layNguoiDung();
        String vaiTro = nd != null ? nd.vaiTro : "";

        // 1. Thanh công cụ Tìm kiếm & Thao tác nhanh
        LinearLayout theCongCu = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theCongCu.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            context,
            "DANH SÁCH LỚP HỌC PHẦN (" + danhSachLop.size() + " LỚP)"
        ));

        EditText edtTim = TaoGiaoDienWarmMinimal.taoONhap(context, "Tìm theo mã lớp hoặc tên học phần...");
        edtTim.setText(tuKhoaHienTai);
        theCongCu.addView(edtTim);

        LinearLayout hangNut = new LinearLayout(context);
        hangNut.setOrientation(LinearLayout.HORIZONTAL);

        Button btnTim = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Tìm kiếm");
        btnTim.setOnClickListener(v -> {
            tuKhoaHienTai = edtTim.getText().toString().trim();
            taiDanhSachLop();
        });
        hangNut.addView(btnTim);

        if ("HOC_SINH".equals(vaiTro)) {
            Button btnThamGia = TaoGiaoDienWarmMinimal.taoNutChinh(context, "+ Tham gia bằng mã");
            LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnThamGia.getLayoutParams();
            p.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
            btnThamGia.setLayoutParams(p);
            btnThamGia.setOnClickListener(v -> moHopThoaiThamGiaBangMa());
            hangNut.addView(btnThamGia);
        } else if (QuanLyPhien.laQuanTriHoacGiaoVu(vaiTro)) {
            Button btnTaoLop = TaoGiaoDienWarmMinimal.taoNutChinh(context, "+ Tạo lớp học phần");
            LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnTaoLop.getLayoutParams();
            p.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
            btnTaoLop.setLayoutParams(p);
            btnTaoLop.setOnClickListener(v -> moHopThoaiTaoLop());
            hangNut.addView(btnTaoLop);
        }

        theCongCu.addView(hangNut);
        khungChinh.addView(theCongCu);

        // 2. Danh sách các thẻ Lớp học phần
        if (danhSachLop.isEmpty()) {
            khungChinh.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                context,
                "Chưa có lớp học phần nào",
                "Bạn có thể kéo xuống để làm mới hoặc dùng mã lớp để ghi danh."
            ));
            return;
        }

        for (MoHinhHocVu.LopHocPhan lop : danhSachLop) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(context);

            LinearLayout hangMa = new LinearLayout(context);
            hangMa.setOrientation(LinearLayout.HORIZONTAL);
            hangMa.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvMa = TaoGiaoDienWarmMinimal.taoEyebrow(context, lop.maLopHocPhan);
            tvMa.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangMa.addView(tvMa);

            if (lop.maThamGia != null && !lop.maThamGia.isEmpty()) {
                hangMa.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                    context,
                    "MÃ MỜI: " + lop.maThamGia,
                    "accent"
                ));
            }
            card.addView(hangMa);

            TextView tvTen = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(context, lop.tenLopHocPhan, 16f);
            tvTen.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 4));
            card.addView(tvTen);

            card.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(
                context,
                "Môn học: " + lop.layTenMonHoc() + "\nGiảng viên: " + lop.layTenGiaoVien()
            ));

            if (lop.dem != null) {
                card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                    context,
                    lop.dem.danhSachGhiDanh + " học sinh • "
                        + lop.dem.cacBuoiHoc + " buổi học • "
                        + lop.dem.cacBaiTap + " bài tập"
                ));
            }

            card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));

            Button btnMoLop = TaoGiaoDienWarmMinimal.taoNutChinh(
                context,
                "Mở không gian lớp học (Bảng tin • Tài liệu • Bài tập • Kiểm tra • Điểm)"
            );
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                TaoGiaoDienWarmMinimal.dp(context, 40)
            );
            btnMoLop.setLayoutParams(params);
            btnMoLop.setOnClickListener(v -> moChiTietLop(lop));
            card.addView(btnMoLop);

            card.setOnClickListener(v -> moChiTietLop(lop));
            khungChinh.addView(card);
        }
    }

    private void moChiTietLop(MoHinhHocVu.LopHocPhan lop) {
        if (getContext() == null) {
            return;
        }
        Intent intent = new Intent(getContext(), ChiTietLopHocActivity.class);
        intent.putExtra("ID_LOP", lop.id);
        intent.putExtra("TEN_LOP", lop.tenLopHocPhan);
        intent.putExtra("MA_LOP", lop.maLopHocPhan);
        intent.putExtra("MA_THAM_GIA", lop.maThamGia);
        intent.putExtra("TEN_GIAO_VIEN", lop.layTenGiaoVien());
        startActivity(intent);
    }

    private void moHopThoaiThamGiaBangMa() {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 18);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtMa = TaoGiaoDienWarmMinimal.taoONhap(context, "Nhập mã mời 6 ký tự (VD: TOAN10)");
        khung.addView(edtMa);

        new AlertDialog.Builder(context)
            .setTitle("Tham gia lớp học phần bằng mã")
            .setView(khung)
            .setPositiveButton("Tham gia ngay", (d, w) -> {
                String ma = edtMa.getText().toString().trim().toUpperCase();
                if (ma.isEmpty()) {
                    ThongBaoToast.hienThi(context, "Vui lòng nhập mã lớp học phần");
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .thamGiaBangMa(new MoHinhHocVu.YeuCauThamGiaBangMa(ma))
                    .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<JsonElement>> call,
                            Response<PhanHoiChuan<JsonElement>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã ghi danh vào lớp học phần thành công");
                                taiDanhSachLop();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    context,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Mã lớp không hợp lệ hoặc bạn đã ở trong lớp")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<JsonElement>> call, Throwable t) {
                            ThongBaoToast.hienThi(context, "Lỗi kết nối máy chủ");
                        }
                    });
            })
            .setNegativeButton("Đóng", null)
            .show();
    }

    private void moHopThoaiTaoLop() {
        Context context = getContext();
        if (context == null) {
            return;
        }
        RetrofitClient.layDichVu(context).layDanhSachMonHoc(null, 1, 50)
            .enqueue(new Callback<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.MonHoc>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.MonHoc>>> call,
                    Response<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.MonHoc>>> resMon
                ) {
                    List<MoHinhHocVu.MonHoc> dsMon = resMon.isSuccessful() && resMon.body() != null
                        && resMon.body().layDuLieu() != null
                        ? resMon.body().layDuLieu().layDanhSach()
                        : new ArrayList<>();

                    RetrofitClient.layDichVu(context).layDanhSachHocKy(null)
                        .enqueue(new Callback<PhanHoiChuan<List<MoHinhHocVu.HocKy>>>() {
                            @Override
                            public void onResponse(
                                Call<PhanHoiChuan<List<MoHinhHocVu.HocKy>>> call,
                                Response<PhanHoiChuan<List<MoHinhHocVu.HocKy>>> resHk
                            ) {
                                List<MoHinhHocVu.HocKy> dsHk = resHk.isSuccessful() && resHk.body() != null
                                    && resHk.body().layDuLieu() != null
                                    ? resHk.body().layDuLieu()
                                    : new ArrayList<>();

                                RetrofitClient.layDichVu(context).layDanhSachHoSoGiaoVien(1, 50)
                                    .enqueue(new Callback<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.ThongTinGiaoVienPhuTrach>>>() {
                                        @Override
                                        public void onResponse(
                                            Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.ThongTinGiaoVienPhuTrach>>> call,
                                            Response<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.ThongTinGiaoVienPhuTrach>>> resGv
                                        ) {
                                            List<MoHinhHocVu.ThongTinGiaoVienPhuTrach> dsGv =
                                                resGv.isSuccessful() && resGv.body() != null && resGv.body().layDuLieu() != null
                                                    ? resGv.body().layDuLieu().layDanhSach()
                                                    : new ArrayList<>();
                                            hienThiFormTaoLop(context, dsMon, dsHk, dsGv);
                                        }

                                        @Override
                                        public void onFailure(
                                            Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.ThongTinGiaoVienPhuTrach>>> call,
                                            Throwable t
                                        ) {
                                            ThongBaoToast.hienThi(context, "Không tải được danh sách giảng viên");
                                        }
                                    });
                            }

                            @Override
                            public void onFailure(Call<PhanHoiChuan<List<MoHinhHocVu.HocKy>>> call, Throwable t) {
                            }
                        });
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.MonHoc>>> call, Throwable t) {
                }
            });
    }

    private void hienThiFormTaoLop(
        Context context,
        List<MoHinhHocVu.MonHoc> dsMon,
        List<MoHinhHocVu.HocKy> dsHk,
        List<MoHinhHocVu.ThongTinGiaoVienPhuTrach> dsGv
    ) {
        if (dsMon.isEmpty() || dsHk.isEmpty() || dsGv.isEmpty()) {
            ThongBaoToast.hienThiDai(context, "Cần có sẵn Môn học, Học kỳ và Hồ sơ Giáo viên để mở lớp học phần");
            return;
        }

        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtMaLop = TaoGiaoDienWarmMinimal.taoONhap(context, "Mã lớp học phần (VD: LHP-TIN10-03)");
        khung.addView(edtMaLop);

        EditText edtTenLop = TaoGiaoDienWarmMinimal.taoONhap(context, "Tên lớp học phần (VD: Tin học 10 - Nhóm 03)");
        khung.addView(edtTenLop);

        String[] tenMon = new String[dsMon.size()];
        for (int i = 0; i < dsMon.size(); i++) {
            tenMon[i] = dsMon.get(i).maMonHoc + " - " + dsMon.get(i).tenMonHoc;
        }
        Spinner spMon = new Spinner(context);
        spMon.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, tenMon));
        khung.addView(spMon);

        String[] tenHk = new String[dsHk.size()];
        for (int i = 0; i < dsHk.size(); i++) {
            tenHk[i] = dsHk.get(i).tenHocKy;
        }
        Spinner spHk = new Spinner(context);
        spHk.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, tenHk));
        khung.addView(spHk);

        String[] tenGv = new String[dsGv.size()];
        for (int i = 0; i < dsGv.size(); i++) {
            MoHinhHocVu.ThongTinGiaoVienPhuTrach gv = dsGv.get(i);
            tenGv[i] = gv.maGiaoVien + " - " + (gv.nguoiDung != null ? gv.nguoiDung.hoTen : "");
        }
        Spinner spGv = new Spinner(context);
        spGv.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, tenGv));
        khung.addView(spGv);

        EditText edtMoTa = TaoGiaoDienWarmMinimal.taoONhap(context, "Mô tả lớp học phần (tùy chọn)");
        khung.addView(edtMoTa);

        new AlertDialog.Builder(context)
            .setTitle("Tạo lớp học phần mới")
            .setView(khung)
            .setPositiveButton("Tạo lớp", (d, w) -> {
                String ma = edtMaLop.getText().toString().trim().toUpperCase();
                String ten = edtTenLop.getText().toString().trim();
                String moTa = edtMoTa.getText().toString().trim();
                if (ma.isEmpty() || ten.isEmpty()) {
                    ThongBaoToast.hienThi(context, "Vui lòng nhập mã và tên lớp học phần");
                    return;
                }
                String idMon = dsMon.get(spMon.getSelectedItemPosition()).id;
                String idHk = dsHk.get(spHk.getSelectedItemPosition()).id;
                String idGv = dsGv.get(spGv.getSelectedItemPosition()).id;

                RetrofitClient.layDichVu(context)
                    .taoLopHocPhan(new MoHinhHocVu.YeuCauTaoLopHocPhan(ma, ten, idMon, idHk, idGv, moTa))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhHocVu.LopHocPhan>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhHocVu.LopHocPhan>> call,
                            Response<PhanHoiChuan<MoHinhHocVu.LopHocPhan>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã tạo lớp học phần thành công");
                                taiDanhSachLop();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    context,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không tạo được lớp học phần")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhHocVu.LopHocPhan>> call, Throwable t) {
                            ThongBaoToast.hienThi(context, "Lỗi kết nối máy chủ");
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }
}
