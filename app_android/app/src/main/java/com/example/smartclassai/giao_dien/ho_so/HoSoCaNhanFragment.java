package com.example.smartclassai.giao_dien.ho_so;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.smartclassai.R;
import com.example.smartclassai.giao_dien.xac_thuc.DangNhapActivity;
import com.example.smartclassai.mang.QuanLyPhien;
import com.example.smartclassai.mang.RetrofitClient;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.DinhDangThoiGian;
import com.example.smartclassai.tien_ich.TaoGiaoDienWarmMinimal;
import com.example.smartclassai.tien_ich.ThongBaoToast;
import com.google.gson.JsonElement;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HoSoCaNhanFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout khungChinh;

    private MoHinhXacThuc.NguoiDung hoSo;
    private List<MoHinhXacThuc.PhienDangNhap> dsPhien = new ArrayList<>();
    private List<MoHinhXacThuc.ConEmPhuHuynh> dsConEm = new ArrayList<>();

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

        swipeRefresh.setOnRefreshListener(this::taiDuLieu);
        taiDuLieu();
        return view;
    }

    private void taiDuLieu() {
        if (getContext() == null) {
            return;
        }
        swipeRefresh.setRefreshing(true);
        QuanLyPhien ql = new QuanLyPhien(getContext());
        hoSo = ql.layNguoiDung();

        RetrofitClient.layDichVu(getContext())
            .layHoSoHienTai()
            .enqueue(new Callback<PhanHoiChuan<MoHinhXacThuc.NguoiDung>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> call,
                    Response<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        hoSo = response.body().layDuLieu();
                        ql.capNhatNguoiDung(hoSo);
                    }
                    taiPhienDangNhap();
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> call, Throwable t) {
                    taiPhienDangNhap();
                }
            });
    }

    private void taiPhienDangNhap() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachPhienDangNhap()
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhXacThuc.PhienDangNhap>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhXacThuc.PhienDangNhap>>> call,
                    Response<PhanHoiChuan<List<MoHinhXacThuc.PhienDangNhap>>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsPhien = response.body().layDuLieu();
                    }
                    if (hoSo != null && "PHU_HUYNH".equals(hoSo.vaiTro)) {
                        taiDanhSachConEm();
                    } else {
                        if (swipeRefresh != null) {
                            swipeRefresh.setRefreshing(false);
                        }
                        veGiaoDien();
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<List<MoHinhXacThuc.PhienDangNhap>>> call, Throwable t) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    veGiaoDien();
                }
            });
    }

    private void taiDanhSachConEm() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachConEm()
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhXacThuc.ConEmPhuHuynh>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhXacThuc.ConEmPhuHuynh>>> call,
                    Response<PhanHoiChuan<List<MoHinhXacThuc.ConEmPhuHuynh>>> response
                ) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsConEm = response.body().layDuLieu();
                    }
                    veGiaoDien();
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<List<MoHinhXacThuc.ConEmPhuHuynh>>> call, Throwable t) {
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

        QuanLyPhien ql = new QuanLyPhien(context);

        // 1. Thông tin cá nhân
        LinearLayout theHoSo = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theHoSo.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "THÔNG TIN HỒ SƠ CÁ NHÂN"));

        if (hoSo != null) {
            TextView tvTen = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(context, hoSo.hoTen, 17f);
            tvTen.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 4));
            theHoSo.addView(tvTen);

            theHoSo.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                context,
                DinhDangThoiGian.tenVaiTroTiengViet(hoSo.vaiTro),
                "accent"
            ));

            TextView tvChiTiet = TaoGiaoDienWarmMinimal.taoVanBanMoTa(
                context,
                "Email: " + hoSo.email
                    + "\nSố điện thoại: " + (hoSo.soDienThoai != null ? hoSo.soDienThoai : "Chưa cập nhật")
            );
            tvChiTiet.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 8), 0, TaoGiaoDienWarmMinimal.dp(context, 8));
            theHoSo.addView(tvChiTiet);
        }

        LinearLayout hangNut = new LinearLayout(context);
        hangNut.setOrientation(LinearLayout.HORIZONTAL);

        Button btnSua = TaoGiaoDienWarmMinimal.taoNutChinh(context, "Cập nhật hồ sơ");
        btnSua.setOnClickListener(v -> moHopThoaiCapNhatHoSo());
        hangNut.addView(btnSua);

        Button btnDoiMk = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Đổi mật khẩu");
        LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnDoiMk.getLayoutParams();
        p.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
        btnDoiMk.setLayoutParams(p);
        btnDoiMk.setOnClickListener(v -> moHopThoaiDoiMatKhau());
        hangNut.addView(btnDoiMk);

        theHoSo.addView(hangNut);
        khungChinh.addView(theHoSo);

        // 2. Danh sách Con em (dành cho Phụ huynh)
        if (hoSo != null && "PHU_HUYNH".equals(hoSo.vaiTro)) {
            LinearLayout theConEm = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
            theConEm.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
                context,
                "DANH SÁCH CON EM LIÊN KẾT (" + dsConEm.size() + ")"
            ));
            for (MoHinhXacThuc.ConEmPhuHuynh ce : dsConEm) {
                theConEm.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
                String tenHs = (ce.hocSinh != null && ce.hocSinh.nguoiDung != null)
                    ? ce.hocSinh.nguoiDung.hoTen
                    : "Học sinh";
                String maHs = ce.hocSinh != null ? ce.hocSinh.maHocSinh : "";
                theConEm.addView(TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                    context,
                    tenHs + " (" + maHs + ") • Quan hệ: " + ce.moiQuanHe,
                    13.5f
                ));
            }
            khungChinh.addView(theConEm);
        }

        // 3. Danh sách Phiên thiết bị đang đăng nhập (Hiển thị cả Web & Android chạy song song)
        LinearLayout thePhien = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        thePhien.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            context,
            "THIẾT BỊ ĐANG ĐĂNG NHẬP SONG SONG (" + dsPhien.size() + " PHIÊN)"
        ));
        for (MoHinhXacThuc.PhienDangNhap phien : dsPhien) {
            thePhien.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
            String thietBi = phien.thongTinThietBi != null ? phien.thongTinThietBi : "Thiết bị trình duyệt / Di động";
            thePhien.addView(TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                context,
                thietBi.length() > 60 ? thietBi.substring(0, 60) + "..." : thietBi,
                12.5f
            ));
            thePhien.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                "IP: " + (phien.diaChiIp != null ? phien.diaChiIp : "127.0.0.1")
                    + " • Đăng nhập: " + DinhDangThoiGian.dinhDangNgayGio(phien.ngayTao)
            ));
        }

        thePhien.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
        Button btnDangXuat = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Đăng xuất khỏi ứng dụng Android");
        btnDangXuat.setOnClickListener(v -> thucHienDangXuat());
        thePhien.addView(btnDangXuat);
        khungChinh.addView(thePhien);
    }

    private void moHopThoaiCapNhatHoSo() {
        Context context = getContext();
        if (context == null || hoSo == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtTen = TaoGiaoDienWarmMinimal.taoONhap(context, "Họ và tên");
        edtTen.setText(hoSo.hoTen);
        khung.addView(edtTen);

        EditText edtSdt = TaoGiaoDienWarmMinimal.taoONhap(context, "Số điện thoại");
        if (hoSo.soDienThoai != null) {
            edtSdt.setText(hoSo.soDienThoai);
        }
        khung.addView(edtSdt);

        new AlertDialog.Builder(context)
            .setTitle("Cập nhật thông tin cá nhân")
            .setView(khung)
            .setPositiveButton("Lưu thay đổi", (d, w) -> {
                String ten = edtTen.getText().toString().trim();
                String sdt = edtSdt.getText().toString().trim();
                if (ten.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .capNhatHoSoCaNhan(new MoHinhXacThuc.YeuCauCapNhatHoSo(ten, sdt.isEmpty() ? null : sdt))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhXacThuc.NguoiDung>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> call,
                            Response<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã cập nhật hồ sơ cá nhân");
                                taiDuLieu();
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void moHopThoaiDoiMatKhau() {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtMkCu = TaoGiaoDienWarmMinimal.taoONhap(context, "Mật khẩu hiện tại");
        edtMkCu.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        khung.addView(edtMkCu);

        EditText edtMkMoi = TaoGiaoDienWarmMinimal.taoONhap(context, "Mật khẩu mới (ít nhất 8 ký tự)");
        edtMkMoi.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        khung.addView(edtMkMoi);

        new AlertDialog.Builder(context)
            .setTitle("Đổi mật khẩu")
            .setView(khung)
            .setPositiveButton("Đổi mật khẩu", (d, w) -> {
                String cu = edtMkCu.getText().toString();
                String moi = edtMkMoi.getText().toString();
                if (cu.isEmpty() || moi.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .doiMatKhau(new MoHinhXacThuc.YeuCauDoiMatKhau(cu, moi))
                    .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<JsonElement>> call,
                            Response<PhanHoiChuan<JsonElement>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đổi mật khẩu thành công");
                            } else {
                                ThongBaoToast.hienThiDai(
                                    context,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không đổi được mật khẩu")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<JsonElement>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void thucHienDangXuat() {
        Context context = getContext();
        if (context == null) {
            return;
        }
        QuanLyPhien ql = new QuanLyPhien(context);
        ql.xoaPhien();
        ThongBaoToast.hienThi(context, "Đã đăng xuất tài khoản");
        Intent intent = new Intent(context, DangNhapActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
    }
}
