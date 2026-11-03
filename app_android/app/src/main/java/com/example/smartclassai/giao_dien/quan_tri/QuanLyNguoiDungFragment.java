package com.example.smartclassai.giao_dien.quan_tri;

import android.content.Context;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
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
import com.example.smartclassai.mang.RetrofitClient;
import com.example.smartclassai.mo_hinh.DuLieuPhanTrang;
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

public class QuanLyNguoiDungFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout khungChinh;

    private String tuKhoa = "";
    private int viTriVaiTroLoc = 0;
    private final String[] maVaiTro = {
        "",
        "QUAN_TRI_VIEN",
        "BAN_GIAM_HIEU",
        "GIAO_VU",
        "GIAO_VIEN",
        "HOC_SINH",
        "PHU_HUYNH"
    };
    private final String[] nhanVaiTro = {
        "Tất cả vai trò (6 vai trò)",
        "Quản trị viên",
        "Ban giám hiệu",
        "Giáo vụ",
        "Giáo viên",
        "Học sinh",
        "Phụ huynh"
    };

    private List<MoHinhXacThuc.NguoiDung> danhSach = new ArrayList<>();
    private int tongSo = 0;

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

        swipeRefresh.setOnRefreshListener(this::taiDanhSach);
        taiDanhSach();
        return view;
    }

    private void taiDanhSach() {
        if (getContext() == null) {
            return;
        }
        swipeRefresh.setRefreshing(true);
        String vt = maVaiTro[viTriVaiTroLoc];
        RetrofitClient.layDichVu(getContext())
            .layDanhSachNguoiDung(
                tuKhoa.isEmpty() ? null : tuKhoa,
                vt.isEmpty() ? null : vt,
                1,
                50
            )
            .enqueue(new Callback<PhanHoiChuan<DuLieuPhanTrang<MoHinhXacThuc.NguoiDung>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhXacThuc.NguoiDung>>> call,
                    Response<PhanHoiChuan<DuLieuPhanTrang<MoHinhXacThuc.NguoiDung>>> response
                ) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        danhSach = response.body().layDuLieu().layDanhSach();
                        tongSo = response.body().layDuLieu().layTongSo();
                    }
                    veGiaoDien();
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhXacThuc.NguoiDung>>> call,
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

        LinearLayout theCongCu = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theCongCu.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            context,
            "QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG (" + Math.max(tongSo, danhSach.size()) + " TÀI KHOẢN)"
        ));

        EditText edtTim = TaoGiaoDienWarmMinimal.taoONhap(context, "Tìm theo họ tên, email, số điện thoại...");
        edtTim.setText(tuKhoa);
        theCongCu.addView(edtTim);

        Spinner spVaiTro = new Spinner(context);
        spVaiTro.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, nhanVaiTro));
        spVaiTro.setSelection(viTriVaiTroLoc, false);
        spVaiTro.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position != viTriVaiTroLoc) {
                    viTriVaiTroLoc = position;
                    tuKhoa = edtTim.getText().toString().trim();
                    taiDanhSach();
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });
        theCongCu.addView(spVaiTro);

        LinearLayout hangNut = new LinearLayout(context);
        hangNut.setOrientation(LinearLayout.HORIZONTAL);
        hangNut.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 6), 0, 0);

        Button btnLoc = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Lọc danh sách");
        btnLoc.setOnClickListener(v -> {
            tuKhoa = edtTim.getText().toString().trim();
            taiDanhSach();
        });
        hangNut.addView(btnLoc);

        Button btnTao = TaoGiaoDienWarmMinimal.taoNutChinh(context, "+ Tạo tài khoản");
        LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnTao.getLayoutParams();
        p.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
        btnTao.setLayoutParams(p);
        btnTao.setOnClickListener(v -> moHopThoaiTaoNguoiDung());
        hangNut.addView(btnTao);

        theCongCu.addView(hangNut);
        khungChinh.addView(theCongCu);

        for (MoHinhXacThuc.NguoiDung nd : danhSach) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(context);

            LinearLayout hangDau = new LinearLayout(this.getContext());
            hangDau.setOrientation(LinearLayout.HORIZONTAL);
            hangDau.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvTen = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(context, nd.hoTen, 14.5f);
            tvTen.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangDau.addView(tvTen);

            hangDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                context,
                DinhDangThoiGian.tenVaiTroTiengViet(nd.vaiTro),
                nd.kichHoat ? "accent" : "danger"
            ));
            card.addView(hangDau);

            card.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(context, nd.email));
            card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                "Trạng thái: " + (nd.kichHoat ? "Đang hoạt động" : "Đã khóa")
                    + (nd.soDienThoai != null ? " • SĐT: " + nd.soDienThoai : "")
            ));

            card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));

            LinearLayout hangThaoTac = new LinearLayout(context);
            hangThaoTac.setOrientation(LinearLayout.HORIZONTAL);

            Button btnKhoa = TaoGiaoDienWarmMinimal.taoNutPhu(
                context,
                nd.kichHoat ? "Khóa tài khoản" : "Mở khóa"
            );
            btnKhoa.setOnClickListener(v -> chuyenTrangThai(nd));
            hangThaoTac.addView(btnKhoa);

            Button btnDatMk = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Đặt lại mật khẩu");
            LinearLayout.LayoutParams pm = (LinearLayout.LayoutParams) btnDatMk.getLayoutParams();
            pm.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
            btnDatMk.setLayoutParams(pm);
            btnDatMk.setOnClickListener(v -> datLaiMatKhau(nd));
            hangThaoTac.addView(btnDatMk);

            card.addView(hangThaoTac);
            khungChinh.addView(card);
        }
    }

    private void moHopThoaiTaoNguoiDung() {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtHoTen = TaoGiaoDienWarmMinimal.taoONhap(context, "Họ và tên");
        khung.addView(edtHoTen);

        EditText edtEmail = TaoGiaoDienWarmMinimal.taoONhap(context, "Địa chỉ Email");
        edtEmail.setInputType(InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        khung.addView(edtEmail);

        EditText edtSdt = TaoGiaoDienWarmMinimal.taoONhap(context, "Số điện thoại");
        edtSdt.setInputType(InputType.TYPE_CLASS_PHONE);
        khung.addView(edtSdt);

        EditText edtMk = TaoGiaoDienWarmMinimal.taoONhap(context, "Mật khẩu khởi tạo");
        edtMk.setText("MatKhau@123");
        khung.addView(edtMk);

        String[] dsVt = {"HOC_SINH", "GIAO_VIEN", "PHU_HUYNH", "GIAO_VU", "BAN_GIAM_HIEU", "QUAN_TRI_VIEN"};
        Spinner spVt = new Spinner(context);
        spVt.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, dsVt));
        khung.addView(spVt);

        new AlertDialog.Builder(context)
            .setTitle("Tạo tài khoản người dùng mới")
            .setView(khung)
            .setPositiveButton("Tạo tài khoản", (d, w) -> {
                String ten = edtHoTen.getText().toString().trim();
                String email = edtEmail.getText().toString().trim();
                String sdt = edtSdt.getText().toString().trim();
                String mk = edtMk.getText().toString();
                String vt = dsVt[spVt.getSelectedItemPosition()];
                if (ten.isEmpty() || email.isEmpty() || mk.isEmpty()) {
                    ThongBaoToast.hienThi(context, "Vui lòng nhập đủ Họ tên, Email và Mật khẩu");
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .taoNguoiDung(new MoHinhXacThuc.YeuCauTaoNguoiDung(ten, email, sdt.isEmpty() ? null : sdt, mk, vt))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhXacThuc.NguoiDung>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> call,
                            Response<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã tạo người dùng " + ten);
                                taiDanhSach();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    context,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không tạo được tài khoản")
                                );
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

    private void chuyenTrangThai(MoHinhXacThuc.NguoiDung nd) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        boolean moi = !nd.kichHoat;
        RetrofitClient.layDichVu(context)
            .chuyenTrangThaiNguoiDung(nd.id, new MoHinhXacThuc.YeuCauChuyenTrangThai(moi))
            .enqueue(new Callback<PhanHoiChuan<MoHinhXacThuc.NguoiDung>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> call,
                    Response<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> response
                ) {
                    if (response.isSuccessful()) {
                        ThongBaoToast.hienThi(
                            context,
                            (moi ? "Đã kích hoạt lại " : "Đã khóa ") + nd.hoTen
                        );
                        taiDanhSach();
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhXacThuc.NguoiDung>> call, Throwable t) {
                }
            });
    }

    private void datLaiMatKhau(MoHinhXacThuc.NguoiDung nd) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtMkMoi = TaoGiaoDienWarmMinimal.taoONhap(context, "Mật khẩu mới");
        edtMkMoi.setText("MatKhau@123");
        khung.addView(edtMkMoi);

        new AlertDialog.Builder(context)
            .setTitle("Đặt lại mật khẩu: " + nd.hoTen)
            .setView(khung)
            .setPositiveButton("Lưu mật khẩu", (d, w) -> {
                String mk = edtMkMoi.getText().toString().trim();
                if (mk.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .datLaiMatKhauAdmin(nd.id, new MoHinhXacThuc.YeuCauDatLaiMatKhau(mk))
                    .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<JsonElement>> call,
                            Response<PhanHoiChuan<JsonElement>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã đặt lại mật khẩu cho " + nd.hoTen);
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
}
