package com.example.smartclassai.giao_dien.thoi_khoa_bieu;

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
import com.example.smartclassai.mang.QuanLyPhien;
import com.example.smartclassai.mang.RetrofitClient;
import com.example.smartclassai.mo_hinh.DuLieuPhanTrang;
import com.example.smartclassai.mo_hinh.MoHinhHocVu;
import com.example.smartclassai.mo_hinh.MoHinhTrucTuyenVaAi;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.DinhDangThoiGian;
import com.example.smartclassai.tien_ich.TaoGiaoDienWarmMinimal;
import com.example.smartclassai.tien_ich.ThongBaoToast;
import com.google.gson.JsonElement;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ThoiKhoaBieuFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout khungChinh;

    private List<MoHinhHocVu.ThoiKhoaBieu> dsTkbCaNhan = new ArrayList<>();
    private List<MoHinhHocVu.LopHocPhan> dsLop = new ArrayList<>();
    private List<MoHinhHocVu.BuoiHoc> dsBuoiHoc = new ArrayList<>();
    private List<MoHinhTrucTuyenVaAi.DonXinNghi> dsDonXinNghi = new ArrayList<>();
    private MoHinhTrucTuyenVaAi.ThongKeChuyenCanLop thongKeChuyenCan;
    private int viTriLopChon = 0;

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
        RetrofitClient.layDichVu(getContext())
            .layThoiKhoaBieuCaNhan()
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhHocVu.ThoiKhoaBieu>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhHocVu.ThoiKhoaBieu>>> call,
                    Response<PhanHoiChuan<List<MoHinhHocVu.ThoiKhoaBieu>>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsTkbCaNhan = response.body().layDuLieu();
                    }
                    taiDanhSachLop();
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<List<MoHinhHocVu.ThoiKhoaBieu>>> call, Throwable t) {
                    taiDanhSachLop();
                }
            });
    }

    private void taiDanhSachLop() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachLopHocPhan(null, 1, 50)
            .enqueue(new Callback<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>> call,
                    Response<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsLop = response.body().layDuLieu().layDanhSach();
                    }
                    if (!dsLop.isEmpty()) {
                        if (viTriLopChon >= dsLop.size()) {
                            viTriLopChon = 0;
                        }
                        taiDuLieuBuoiHocTheoLop(dsLop.get(viTriLopChon).id);
                    } else {
                        if (swipeRefresh != null) {
                            swipeRefresh.setRefreshing(false);
                        }
                        veGiaoDien();
                    }
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

    private void taiDuLieuBuoiHocTheoLop(String idLop) {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachBuoiHoc(idLop)
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhHocVu.BuoiHoc>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhHocVu.BuoiHoc>>> call,
                    Response<PhanHoiChuan<List<MoHinhHocVu.BuoiHoc>>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsBuoiHoc = response.body().layDuLieu();
                    } else {
                        dsBuoiHoc = new ArrayList<>();
                    }
                    taiChuyenCanVaDonNghi(idLop);
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<List<MoHinhHocVu.BuoiHoc>>> call, Throwable t) {
                    taiChuyenCanVaDonNghi(idLop);
                }
            });
    }

    private void taiChuyenCanVaDonNghi(String idLop) {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layThongKeChuyenCan(idLop)
            .enqueue(new Callback<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeChuyenCanLop>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeChuyenCanLop>> call,
                    Response<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeChuyenCanLop>> response
                ) {
                    if (response.isSuccessful() && response.body() != null) {
                        thongKeChuyenCan = response.body().layDuLieu();
                    }
                    RetrofitClient.layDichVu(getContext())
                        .layDanhSachDonXinNghi(idLop)
                        .enqueue(new Callback<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.DonXinNghi>>>() {
                            @Override
                            public void onResponse(
                                Call<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.DonXinNghi>>> call,
                                Response<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.DonXinNghi>>> resDon
                            ) {
                                if (swipeRefresh != null) {
                                    swipeRefresh.setRefreshing(false);
                                }
                                if (resDon.isSuccessful() && resDon.body() != null && resDon.body().layDuLieu() != null) {
                                    dsDonXinNghi = resDon.body().layDuLieu();
                                } else {
                                    dsDonXinNghi = new ArrayList<>();
                                }
                                veGiaoDien();
                            }

                            @Override
                            public void onFailure(
                                Call<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.DonXinNghi>>> call,
                                Throwable t
                            ) {
                                if (swipeRefresh != null) {
                                    swipeRefresh.setRefreshing(false);
                                }
                                veGiaoDien();
                            }
                        });
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeChuyenCanLop>> call,
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

        // 1. Khung Thời khóa biểu tuần cá nhân
        LinearLayout theTkb = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theTkb.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            context,
            "THỜI KHÓA BIỂU CÁ NHÂN TRONG TUẦN (" + dsTkbCaNhan.size() + " CA HỌC)"
        ));

        if (dsTkbCaNhan.isEmpty()) {
            theTkb.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                "Chưa có tiết học cố định nào trong tuần."
            ));
        } else {
            for (MoHinhHocVu.ThoiKhoaBieu tkb : dsTkbCaNhan) {
                theTkb.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
                String tenLop = tkb.lopHocPhan != null ? tkb.lopHocPhan.tenLopHocPhan : "Lớp học phần";
                theTkb.addView(TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                    context,
                    DinhDangThoiGian.tenThuTrongTuan(tkb.thuTrongTuan)
                        + " • Tiết " + tkb.tietBatDau + " (" + tkb.soTiet + " tiết)",
                    13.5f
                ));
                theTkb.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(
                    context,
                    tenLop + (tkb.phongHoc != null ? " • Phòng: " + tkb.phongHoc : "")
                ));
            }
        }
        khungChinh.addView(theTkb);

        if (dsLop.isEmpty()) {
            return;
        }

        // 2. Chọn lớp để quản lý Điểm danh & Buổi học
        LinearLayout theChonLop = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theChonLop.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "ĐIỂM DANH THÔNG MINH & BUỔI HỌC THEO LỚP"));

        String[] tenCacLop = new String[dsLop.size()];
        for (int i = 0; i < dsLop.size(); i++) {
            tenCacLop[i] = dsLop.get(i).maLopHocPhan + " - " + dsLop.get(i).tenLopHocPhan;
        }
        Spinner spLop = new Spinner(context);
        spLop.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, tenCacLop));
        spLop.setSelection(viTriLopChon, false);
        spLop.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position != viTriLopChon) {
                    viTriLopChon = position;
                    swipeRefresh.setRefreshing(true);
                    taiDuLieuBuoiHocTheoLop(dsLop.get(viTriLopChon).id);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });
        theChonLop.addView(spLop);

        if (thongKeChuyenCan != null) {
            TextView tvCc = TaoGiaoDienWarmMinimal.taoSoLieuLon(
                context,
                String.format(Locale.US, "Chuyên cần TB: %.1f%% (%d buổi)",
                    thongKeChuyenCan.tyLeChuyenCanTrungBinh,
                    thongKeChuyenCan.tongSoBuoiHoc)
            );
            tvCc.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 4));
            theChonLop.addView(tvCc);
        }

        if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTro)) {
            Button btnTaoBuoi = TaoGiaoDienWarmMinimal.taoNutChinh(context, "+ Tạo buổi học mới");
            btnTaoBuoi.setOnClickListener(v -> moHopThoaiTaoBuoiHoc(dsLop.get(viTriLopChon).id));
            theChonLop.addView(btnTaoBuoi);
        }
        khungChinh.addView(theChonLop);

        // 3. Danh sách các Buổi học & Điểm danh bằng mã PIN 6 số
        for (MoHinhHocVu.BuoiHoc bh : dsBuoiHoc) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(context);

            LinearLayout hangDau = new LinearLayout(context);
            hangDau.setOrientation(LinearLayout.HORIZONTAL);
            hangDau.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvChuDe = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(context, bh.chuDe, 14.5f);
            tvChuDe.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangDau.addView(tvChuDe);

            boolean coMa = bh.maDiemDanh != null && !bh.maDiemDanh.isEmpty();
            hangDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                context,
                coMa ? ("PIN: " + bh.maDiemDanh) : (bh.trangThai != null ? bh.trangThai : "DA_LEN_LICH"),
                coMa ? "accent" : "info"
            ));
            card.addView(hangDau);

            card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                "Bắt đầu: " + DinhDangThoiGian.dinhDangNgayGio(bh.thoiGianBD)
                    + "\nKết thúc: " + DinhDangThoiGian.dinhDangNgayGio(bh.thoiGianKT)
            ));

            card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));

            LinearLayout hangNut = new LinearLayout(context);
            hangNut.setOrientation(LinearLayout.HORIZONTAL);

            if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTro)) {
                Button btnMoPin = TaoGiaoDienWarmMinimal.taoNutChinh(
                    context,
                    coMa ? "Đổi mã PIN" : "Mở mã PIN điểm danh"
                );
                btnMoPin.setOnClickListener(v -> moMaPinDiemDanh(bh.id));
                hangNut.addView(btnMoPin);

                if (coMa) {
                    Button btnDongPin = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Đóng mã");
                    LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnDongPin.getLayoutParams();
                    p.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
                    btnDongPin.setLayoutParams(p);
                    btnDongPin.setOnClickListener(v -> dongMaPinDiemDanh(bh.id));
                    hangNut.addView(btnDongPin);
                }
            } else {
                Button btnDiemDanh = TaoGiaoDienWarmMinimal.taoNutChinh(context, "Nhập mã PIN điểm danh");
                btnDiemDanh.setOnClickListener(v -> moHopThoaiNhapPin(bh));
                hangNut.addView(btnDiemDanh);

                Button btnXinNghi = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Xin nghỉ phép");
                LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnXinNghi.getLayoutParams();
                p.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
                btnXinNghi.setLayoutParams(p);
                btnXinNghi.setOnClickListener(v -> moHopThoaiXinNghi(dsLop.get(viTriLopChon).id, bh));
                hangNut.addView(btnXinNghi);
            }

            card.addView(hangNut);
            khungChinh.addView(card);
        }

        // 4. Danh sách Đơn xin nghỉ phép của lớp
        if (!dsDonXinNghi.isEmpty()) {
            LinearLayout theDon = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
            theDon.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
                context,
                "ĐƠN XIN NGHỈ PHÉP (" + dsDonXinNghi.size() + " ĐƠN)"
            ));
            for (MoHinhTrucTuyenVaAi.DonXinNghi don : dsDonXinNghi) {
                theDon.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
                String tenGui = don.nguoiGui != null ? don.nguoiGui.hoTen : "Học sinh";
                String chuDeBuoi = don.buoiHoc != null ? don.buoiHoc.chuDe : "Buổi học";
                theDon.addView(TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                    context,
                    tenGui + " • " + chuDeBuoi + " [" + don.trangThai + "]",
                    13f
                ));
                theDon.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(context, "Lý do: " + don.lyDo));
                if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTro) && "CHO_DUYET".equals(don.trangThai)) {
                    Button btnDuyet = TaoGiaoDienWarmMinimal.taoNutChinh(context, "Chấp thuận đơn nghỉ phép");
                    btnDuyet.setOnClickListener(v -> duyetDonNghi(don.id));
                    theDon.addView(btnDuyet);
                }
            }
            khungChinh.addView(theDon);
        }
    }

    private void moHopThoaiTaoBuoiHoc(String idLop) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtChuDe = TaoGiaoDienWarmMinimal.taoONhap(context, "Chủ đề buổi học (VD: Buổi 6: Thực hành thuật toán)");
        khung.addView(edtChuDe);

        EditText edtBd = TaoGiaoDienWarmMinimal.taoONhap(context, "Bắt đầu ISO");
        edtBd.setText("2026-11-10T08:00:00.000Z");
        khung.addView(edtBd);

        EditText edtKt = TaoGiaoDienWarmMinimal.taoONhap(context, "Kết thúc ISO");
        edtKt.setText("2026-11-10T10:00:00.000Z");
        khung.addView(edtKt);

        new AlertDialog.Builder(context)
            .setTitle("Tạo buổi học mới")
            .setView(khung)
            .setPositiveButton("Tạo buổi học", (d, w) -> {
                String cd = edtChuDe.getText().toString().trim();
                if (cd.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .taoBuoiHoc(new MoHinhHocVu.YeuCauTaoBuoiHoc(
                        idLop,
                        cd,
                        edtBd.getText().toString().trim(),
                        edtKt.getText().toString().trim()
                    ))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhHocVu.BuoiHoc>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> call,
                            Response<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã tạo buổi học mới");
                                taiDuLieuBuoiHocTheoLop(idLop);
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void moMaPinDiemDanh(String idBuoiHoc) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        RetrofitClient.layDichVu(context)
            .moMaDiemDanh(idBuoiHoc, new MoHinhTrucTuyenVaAi.YeuCauMoMaDiemDanh(15))
            .enqueue(new Callback<PhanHoiChuan<MoHinhHocVu.BuoiHoc>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> call,
                    Response<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        String pin = response.body().layDuLieu().maDiemDanh;
                        ThongBaoToast.hienThiDai(context, "Đã mở mã điểm danh PIN: " + pin + " (15 phút)");
                        taiDuLieuBuoiHocTheoLop(dsLop.get(viTriLopChon).id);
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> call, Throwable t) {
                }
            });
    }

    private void dongMaPinDiemDanh(String idBuoiHoc) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        RetrofitClient.layDichVu(context)
            .dongMaDiemDanh(idBuoiHoc)
            .enqueue(new Callback<PhanHoiChuan<MoHinhHocVu.BuoiHoc>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> call,
                    Response<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> response
                ) {
                    if (response.isSuccessful()) {
                        ThongBaoToast.hienThi(context, "Đã đóng phiên mã PIN điểm danh");
                        taiDuLieuBuoiHocTheoLop(dsLop.get(viTriLopChon).id);
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhHocVu.BuoiHoc>> call, Throwable t) {
                }
            });
    }

    private void moHopThoaiNhapPin(MoHinhHocVu.BuoiHoc bh) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtPin = TaoGiaoDienWarmMinimal.taoONhap(context, "Nhập mã PIN 6 chữ số từ giảng viên");
        edtPin.setInputType(InputType.TYPE_CLASS_NUMBER);
        if (bh.maDiemDanh != null) {
            edtPin.setText(bh.maDiemDanh);
        }
        khung.addView(edtPin);

        new AlertDialog.Builder(context)
            .setTitle("Điểm danh: " + bh.chuDe)
            .setView(khung)
            .setPositiveButton("Xác nhận có mặt", (d, w) -> {
                String pin = edtPin.getText().toString().trim();
                if (pin.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .diemDanhBangMa(bh.id, new MoHinhTrucTuyenVaAi.YeuCauDiemDanhMa(pin))
                    .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<JsonElement>> call,
                            Response<PhanHoiChuan<JsonElement>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Điểm danh thành công! Đã ghi nhận có mặt.");
                                taiDuLieuBuoiHocTheoLop(dsLop.get(viTriLopChon).id);
                            } else {
                                ThongBaoToast.hienThiDai(
                                    context,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Mã PIN không đúng hoặc đã hết hạn")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<JsonElement>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Đóng", null)
            .show();
    }

    private void moHopThoaiXinNghi(String idLop, MoHinhHocVu.BuoiHoc bh) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtLyDo = TaoGiaoDienWarmMinimal.taoONhap(context, "Nhập lý do xin nghỉ phép buổi học này...");
        edtLyDo.setMinLines(3);
        khung.addView(edtLyDo);

        new AlertDialog.Builder(context)
            .setTitle("Đơn xin nghỉ: " + bh.chuDe)
            .setView(khung)
            .setPositiveButton("Gửi đơn", (d, w) -> {
                String lyDo = edtLyDo.getText().toString().trim();
                if (lyDo.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .guiDonXinNghi(idLop, new MoHinhTrucTuyenVaAi.YeuCauTaoDonXinNghi(bh.id, lyDo))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhTrucTuyenVaAi.DonXinNghi>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.DonXinNghi>> call,
                            Response<PhanHoiChuan<MoHinhTrucTuyenVaAi.DonXinNghi>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã gửi đơn xin nghỉ phép tới giảng viên");
                                taiDuLieuBuoiHocTheoLop(idLop);
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.DonXinNghi>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void duyetDonNghi(String idDon) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        RetrofitClient.layDichVu(context)
            .duyetDonXinNghi(idDon, new MoHinhTrucTuyenVaAi.YeuCauDuyetDonXinNghi("DA_DUYET", "Đã chấp thuận trên ứng dụng di động"))
            .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<JsonElement>> call,
                    Response<PhanHoiChuan<JsonElement>> response
                ) {
                    if (response.isSuccessful()) {
                        ThongBaoToast.hienThi(context, "Đã duyệt đơn xin nghỉ phép");
                        taiDuLieuBuoiHocTheoLop(dsLop.get(viTriLopChon).id);
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<JsonElement>> call, Throwable t) {
                }
            });
    }
}
