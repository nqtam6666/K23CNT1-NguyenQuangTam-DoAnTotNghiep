package com.example.smartclassai.giao_dien.phong_truc_tuyen;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
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
import com.example.smartclassai.tien_ich.TaoGiaoDienWarmMinimal;
import com.example.smartclassai.tien_ich.ThongBaoToast;
import com.google.gson.JsonElement;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PhongTrucTuyenFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout khungChinh;
    private List<MoHinhHocVu.LopHocPhan> dsLop = new ArrayList<>();

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
            .layDanhSachLopHocPhan(null, 1, 50)
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
                        dsLop = response.body().layDuLieu().layDanhSach();
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

        LinearLayout theGioiThieu = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theGioiThieu.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "PHÒNG HỌC TRỰC TUYẾN ĐỒNG BỘ WEB & ANDROID"));
        theGioiThieu.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(
            context,
            "Cấp mã phiên truy cập ngắn hạn theo vai trò (CHỦ TRÌ / THAM GIA) và tự động lưu nhật ký điểm danh trực tuyến."
        ));
        khungChinh.addView(theGioiThieu);

        if (dsLop.isEmpty()) {
            khungChinh.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                context,
                "Chưa có lớp học phần",
                "Bạn cần tham gia ít nhất một lớp học phần để vào phòng trực tuyến."
            ));
            return;
        }

        for (MoHinhHocVu.LopHocPhan lop : dsLop) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(context);

            LinearLayout hangDau = new LinearLayout(context);
            hangDau.setOrientation(LinearLayout.HORIZONTAL);
            hangDau.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvMa = TaoGiaoDienWarmMinimal.taoEyebrow(context, lop.maLopHocPhan);
            tvMa.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangDau.addView(tvMa);

            hangDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(context, "LIVEKIT ROOM", "accent"));
            card.addView(hangDau);

            TextView tvTen = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(context, lop.tenLopHocPhan, 15.5f);
            tvTen.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(this.getContext(), 4));
            card.addView(tvTen);

            card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                "Giảng viên: " + lop.layTenGiaoVien()
            ));

            card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));

            LinearLayout hangNut = new LinearLayout(context);
            hangNut.setOrientation(LinearLayout.HORIZONTAL);

            Button btnVaoPhong = TaoGiaoDienWarmMinimal.taoNutChinh(context, "Lấy Token & Vào phòng học");
            btnVaoPhong.setOnClickListener(v -> capTokenVaVaoPhong(lop));
            hangNut.addView(btnVaoPhong);

            if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTro)) {
                Button btnMoPhong = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Mở phòng");
                LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnMoPhong.getLayoutParams();
                p.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
                btnMoPhong.setLayoutParams(p);
                btnMoPhong.setOnClickListener(v -> batTatPhong(lop.id, true));
                hangNut.addView(btnMoPhong);
            }

            card.addView(hangNut);
            khungChinh.addView(card);
        }
    }

    private void batTatPhong(String idLop, boolean dangMo) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        RetrofitClient.layDichVu(context)
            .batTatPhongHoc(idLop, new MoHinhTrucTuyenVaAi.YeuCauBatTatPhong(dangMo))
            .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<JsonElement>> call,
                    Response<PhanHoiChuan<JsonElement>> response
                ) {
                    if (response.isSuccessful()) {
                        ThongBaoToast.hienThi(context, dangMo ? "Đã mở phòng học trực tuyến" : "Đã đóng phòng học");
                    } else {
                        ThongBaoToast.hienThiDai(
                            context,
                            ThongBaoToast.trichXuatThongDiepLoi(response, "Không thể đổi trạng thái phòng")
                        );
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<JsonElement>> call, Throwable t) {
                }
            });
    }

    private void capTokenVaVaoPhong(MoHinhHocVu.LopHocPhan lop) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        RetrofitClient.layDichVu(context)
            .layTokenPhongHoc(lop.id, new HashMap<>())
            .enqueue(new Callback<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaTokenLiveKit>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaTokenLiveKit>> call,
                    Response<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaTokenLiveKit>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        MoHinhTrucTuyenVaAi.KetQuaTokenLiveKit kq = response.body().layDuLieu();
                        ThongBaoToast.hienThi(
                            context,
                            "Đã cấp token phòng " + kq.tenPhong + " (" + kq.vaiTroTrongPhong + ")"
                        );
                        QuanLyPhien ql = new QuanLyPhien(context);
                        Intent intent = new Intent(context, PhongTrucTuyenWebViewActivity.class);
                        intent.putExtra("TEN_PHONG", lop.tenLopHocPhan);
                        intent.putExtra("VAI_TRO_PHONG", kq.vaiTroTrongPhong);
                        intent.putExtra("URL_PHONG", ql.layUrlWebSongSong() + "/phong-hoc-truc-tuyen");
                        startActivity(intent);
                    } else {
                        ThongBaoToast.hienThiDai(
                            context,
                            ThongBaoToast.trichXuatThongDiepLoi(
                                response,
                                "Phòng học hiện đang đóng. Giảng viên vui lòng bấm 'Mở phòng' trước."
                            )
                        );
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaTokenLiveKit>> call, Throwable t) {
                    ThongBaoToast.hienThi(context, "Lỗi kết nối máy chủ khi cấp token phòng học");
                }
            });
    }
}
