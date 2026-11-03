package com.example.smartclassai.giao_dien.quan_tri;

import android.content.Context;
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
import com.example.smartclassai.mo_hinh.MoHinhTrucTuyenVaAi;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.DinhDangThoiGian;
import com.example.smartclassai.tien_ich.TaoGiaoDienWarmMinimal;
import com.example.smartclassai.tien_ich.ThongBaoToast;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BaoLoiDongGopFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout khungChinh;

    private MoHinhTrucTuyenVaAi.ThongKeBaoLoi thongKe;
    private List<MoHinhTrucTuyenVaAi.BaoLoiDongGop> danhSach = new ArrayList<>();

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
            .layThongKeBaoLoi()
            .enqueue(new Callback<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeBaoLoi>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeBaoLoi>> call,
                    Response<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeBaoLoi>> response
                ) {
                    if (response.isSuccessful() && response.body() != null) {
                        thongKe = response.body().layDuLieu();
                    }
                    taiDanhSach();
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.ThongKeBaoLoi>> call, Throwable t) {
                    taiDanhSach();
                }
            });
    }

    private void taiDanhSach() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachBaoLoi(1, 50)
            .enqueue(new Callback<PhanHoiChuan<DuLieuPhanTrang<MoHinhTrucTuyenVaAi.BaoLoiDongGop>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhTrucTuyenVaAi.BaoLoiDongGop>>> call,
                    Response<PhanHoiChuan<DuLieuPhanTrang<MoHinhTrucTuyenVaAi.BaoLoiDongGop>>> response
                ) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        danhSach = response.body().layDuLieu().layDanhSach();
                    }
                    veGiaoDien();
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhTrucTuyenVaAi.BaoLoiDongGop>>> call,
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

        QuanLyPhien ql = new QuanLyPhien(context);
        MoHinhXacThuc.NguoiDung nd = ql.layNguoiDung();
        String vaiTro = nd != null ? nd.vaiTro : "";

        LinearLayout theDau = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theDau.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "PHẢN HỒI HỆ THỐNG & ĐÓNG GÓP Ý KIẾN"));
        if (thongKe != null) {
            theDau.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(
                context,
                "Tổng số: " + thongKe.tongSo + " • Chờ tiếp nhận: " + thongKe.choTiepNhan
                    + " • Đang xử lý: " + thongKe.dangXuLy + " • Đã xử lý: " + thongKe.daXuLy
            ));
        }
        Button btnGuiMoi = TaoGiaoDienWarmMinimal.taoNutChinh(context, "+ Gửi báo lỗi / Đóng góp ý kiến mới");
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            TaoGiaoDienWarmMinimal.dp(context, 40)
        );
        p.topMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
        btnGuiMoi.setLayoutParams(p);
        btnGuiMoi.setOnClickListener(v -> moHopThoaiGuiBaoLoi());
        theDau.addView(btnGuiMoi);
        khungChinh.addView(theDau);

        if (danhSach.isEmpty()) {
            khungChinh.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                context,
                "Chưa có phản hồi nào",
                "Mọi góp ý hoặc báo cáo sự cố từ ứng dụng Android sẽ đồng bộ trực tiếp lên trang Quản trị Web."
            ));
            return;
        }

        for (MoHinhTrucTuyenVaAi.BaoLoiDongGop item : danhSach) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(context);

            LinearLayout hangDau = new LinearLayout(context);
            hangDau.setOrientation(LinearLayout.HORIZONTAL);
            hangDau.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvTieuDe = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(context, item.tieuDe, 14.5f);
            tvTieuDe.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangDau.addView(tvTieuDe);

            hangDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                context,
                item.trangThai,
                "DA_XU_LY".equals(item.trangThai) ? "accent" : "info"
            ));
            card.addView(hangDau);

            card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                item.loaiPhanHoi + " • Ưu tiên: " + item.mucDoUuTien + " • "
                    + DinhDangThoiGian.dinhDangNgayGio(item.ngayTao)
            ));
            card.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(context, item.noiDung));

            if (item.phanHoiXuLy != null && !item.phanHoiXuLy.isEmpty()) {
                card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
                card.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(
                    context,
                    "Phản hồi từ Ban quản trị: " + item.phanHoiXuLy
                ));
            }

            if (QuanLyPhien.laQuanTriHoacGiaoVu(vaiTro)) {
                card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
                Button btnXuLy = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Cập nhật trạng thái & Phản hồi");
                btnXuLy.setOnClickListener(v -> moHopThoaiXuLy(item));
                card.addView(btnXuLy);
            }

            khungChinh.addView(card);
        }
    }

    private void moHopThoaiGuiBaoLoi() {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        String[] dsLoai = {"BAO_LOI_KY_THUAT", "DONG_GOP_CAI_TIEN", "HO_TRO_HOC_VU", "KHAC"};
        Spinner spLoai = new Spinner(context);
        spLoai.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, dsLoai));
        khung.addView(spLoai);

        String[] dsUuTien = {"TRUNG_BINH", "CAO", "KHAN_CAP", "THAP"};
        Spinner spUuTien = new Spinner(context);
        spUuTien.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, dsUuTien));
        khung.addView(spUuTien);

        EditText edtTieuDe = TaoGiaoDienWarmMinimal.taoONhap(context, "Tiêu đề ngắn gọn (tối thiểu 5 ký tự)");
        khung.addView(edtTieuDe);

        EditText edtNoiDung = TaoGiaoDienWarmMinimal.taoONhap(context, "Mô tả chi tiết vấn đề hoặc đề xuất của bạn...");
        edtNoiDung.setMinLines(3);
        khung.addView(edtNoiDung);

        new AlertDialog.Builder(context)
            .setTitle("Gửi báo lỗi / Đóng góp ý kiến")
            .setView(khung)
            .setPositiveButton("Gửi phản hồi", (d, w) -> {
                String tieuDe = edtTieuDe.getText().toString().trim();
                String noiDung = edtNoiDung.getText().toString().trim();
                if (tieuDe.length() < 5 || noiDung.length() < 10) {
                    ThongBaoToast.hienThi(context, "Tiêu đề cần ít nhất 5 ký tự và nội dung ít nhất 10 ký tự");
                    return;
                }
                RetrofitClient.layDichVu(context)
                    .taoBaoLoi(new MoHinhTrucTuyenVaAi.YeuCauTaoBaoLoi(
                        dsLoai[spLoai.getSelectedItemPosition()],
                        dsUuTien[spUuTien.getSelectedItemPosition()],
                        tieuDe,
                        noiDung
                    ))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>> call,
                            Response<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã gửi phản hồi thành công");
                                taiDuLieu();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    context,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không gửi được phản hồi")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void moHopThoaiXuLy(MoHinhTrucTuyenVaAi.BaoLoiDongGop item) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        LinearLayout khung = new LinearLayout(context);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 16);
        khung.setPadding(pad, pad, pad, pad);

        String[] dsTrangThai = {"DA_XU_LY", "DANG_XU_LY", "CHO_TIEP_NHAN", "TU_CHOI"};
        Spinner spTt = new Spinner(context);
        spTt.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, dsTrangThai));
        khung.addView(spTt);

        EditText edtPh = TaoGiaoDienWarmMinimal.taoONhap(context, "Nội dung phản hồi xử lý...");
        if (item.phanHoiXuLy != null) {
            edtPh.setText(item.phanHoiXuLy);
        }
        khung.addView(edtPh);

        new AlertDialog.Builder(context)
            .setTitle("Xử lý: " + item.tieuDe)
            .setView(khung)
            .setPositiveButton("Lưu xử lý", (d, w) -> {
                String tt = dsTrangThai[spTt.getSelectedItemPosition()];
                String ph = edtPh.getText().toString().trim();
                RetrofitClient.layDichVu(context)
                    .xuLyBaoLoi(item.id, new MoHinhTrucTuyenVaAi.YeuCauXuLyBaoLoi(tt, ph))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>> call,
                            Response<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(context, "Đã cập nhật trạng thái xử lý");
                                taiDuLieu();
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.BaoLoiDongGop>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Đóng", null)
            .show();
    }
}
