package com.example.smartclassai.giao_dien.bang_dieu_khien;

import android.content.Context;
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
import com.example.smartclassai.mang.DichVuApiLms;
import com.example.smartclassai.mang.QuanLyPhien;
import com.example.smartclassai.mang.RetrofitClient;
import com.example.smartclassai.mo_hinh.MoHinhBangDieuKhien;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.DinhDangThoiGian;
import com.example.smartclassai.tien_ich.TaoGiaoDienWarmMinimal;
import com.example.smartclassai.tien_ich.ThongBaoToast;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BangDieuKhienFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout khungChinh;
    private final Gson gson = new Gson();

    private MoHinhBangDieuKhien.PhanHoiBangDieuKhien duLieuBangDieuKhien;
    private MoHinhBangDieuKhien.PhanHoiThongBaoBangDieuKhien duLieuThongBao;

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
        DichVuApiLms api = RetrofitClient.layDichVu(getContext());

        api.layDuLieuBangDieuKhien().enqueue(new Callback<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiBangDieuKhien>>() {
            @Override
            public void onResponse(
                Call<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiBangDieuKhien>> call,
                Response<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiBangDieuKhien>> response
            ) {
                if (response.isSuccessful() && response.body() != null) {
                    duLieuBangDieuKhien = response.body().layDuLieu();
                }
                taiThongBao();
            }

            @Override
            public void onFailure(
                Call<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiBangDieuKhien>> call,
                Throwable t
            ) {
                taiThongBao();
            }
        });
    }

    private void taiThongBao() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachThongBao()
            .enqueue(new Callback<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiThongBaoBangDieuKhien>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiThongBaoBangDieuKhien>> call,
                    Response<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiThongBaoBangDieuKhien>> response
                ) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    if (response.isSuccessful() && response.body() != null) {
                        duLieuThongBao = response.body().layDuLieu();
                    }
                    veGiaoDien();
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<MoHinhBangDieuKhien.PhanHoiThongBaoBangDieuKhien>> call,
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

        // 1. Thẻ chào mừng & Trạng thái đồng bộ song song Web - Android
        LinearLayout theChao = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theChao.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            context,
            "KHÔNG GIAN LÀM VIỆC • " + (nd != null ? DinhDangThoiGian.tenVaiTroTiengViet(nd.vaiTro) : "")
        ));
        TextView tvXinChao = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
            context,
            "Xin chào, " + (nd != null ? nd.hoTen : "Thành viên"),
            17f
        );
        tvXinChao.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 4));
        theChao.addView(tvXinChao);

        if (duLieuThongBao != null && duLieuThongBao.hocKyHienTai != null) {
            MoHinhBangDieuKhien.ThongTinHocKyThucTe hk = duLieuThongBao.hocKyHienTai;
            theChao.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                hk.tenHocKy + " (" + hk.tenNamHoc + ") • "
                    + hk.soLopThamGia + " lớp • "
                    + hk.soBuoiHocHomNay + " buổi học hôm nay"
            ));
        } else {
            theChao.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                context,
                "Theo dõi tiến độ học tập, lịch học trong tuần và thông báo học vụ."
            ));
        }
        khungChinh.addView(theChao);

        // 2. Bản tin toàn trường (nếu có)
        if (duLieuThongBao != null && duLieuThongBao.banTinToanTruong != null
            && duLieuThongBao.banTinToanTruong.tieuDe != null) {
            LinearLayout theBanTin = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
            theBanTin.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "BẢN TIN HỌC VỤ TOÀN TRƯỜNG"));
            TextView tvTieuDeBt = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                context,
                duLieuThongBao.banTinToanTruong.tieuDe,
                14.5f
            );
            tvTieuDeBt.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 4));
            theBanTin.addView(tvTieuDeBt);
            theBanTin.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(
                context,
                duLieuThongBao.banTinToanTruong.noiDung
            ));
            khungChinh.addView(theBanTin);
        }

        // 3. Các tiện ích từ Bảng điều khiển (Thẻ thống kê, Việc cần xử lý, Hoạt động gần đây)
        if (duLieuBangDieuKhien != null && duLieuBangDieuKhien.tienIch != null) {
            for (MoHinhBangDieuKhien.TienIchBangDieuKhien muc : duLieuBangDieuKhien.tienIch) {
                if ("THE_THONG_KE".equals(muc.loai)) {
                    veKhungThongKe(context, muc);
                } else if ("VIEC_CAN_XU_LY".equals(muc.loai)) {
                    veKhungViecCanXuLy(context, muc);
                } else if ("HOAT_DONG_GAN_DAY".equals(muc.loai)) {
                    veKhungHoatDongGanDay(context, muc);
                }
            }
        }

        // 4. Trung tâm Thông báo thực tế & Kiểm thử đồng bộ đa kênh
        veKhungThongBao(context);
    }

    private void veKhungThongKe(Context context, MoHinhBangDieuKhien.TienIchBangDieuKhien muc) {
        try {
            Type listType = new TypeToken<List<MoHinhBangDieuKhien.TheThongKe>>() {}.getType();
            List<MoHinhBangDieuKhien.TheThongKe> danhSach = gson.fromJson(muc.duLieu, listType);
            if (danhSach == null || danhSach.isEmpty()) {
                return;
            }

            TextView tvNhom = TaoGiaoDienWarmMinimal.taoEyebrow(context, muc.tieuDe != null ? muc.tieuDe : "CHỈ SỐ THỐNG KÊ");
            tvNhom.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 8));
            khungChinh.addView(tvNhom);

            for (int i = 0; i < danhSach.size(); i += 2) {
                LinearLayout hang = new LinearLayout(context);
                hang.setOrientation(LinearLayout.HORIZONTAL);
                LinearLayout.LayoutParams hangParams = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                );
                hangParams.bottomMargin = TaoGiaoDienWarmMinimal.dp(context, 10);
                hang.setLayoutParams(hangParams);

                hang.addView(taoMotOThongKe(context, danhSach.get(i), i + 1 < danhSach.size()));
                if (i + 1 < danhSach.size()) {
                    hang.addView(taoMotOThongKe(context, danhSach.get(i + 1), false));
                }
                khungChinh.addView(hang);
            }
        } catch (Exception ignored) {
        }
    }

    private View taoMotOThongKe(Context context, MoHinhBangDieuKhien.TheThongKe item, boolean coLePhai) {
        LinearLayout o = new LinearLayout(context);
        o.setOrientation(LinearLayout.VERTICAL);
        o.setBackgroundResource(R.drawable.bg_the_be_mat);
        int pad = TaoGiaoDienWarmMinimal.dp(context, 12);
        o.setPadding(pad, pad, pad, pad);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            0,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            1f
        );
        if (coLePhai) {
            params.rightMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
        }
        o.setLayoutParams(params);

        o.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, item.tieuDe));

        String chuoiGiaTri = "0";
        if (item.giaTri != null && !item.giaTri.isJsonNull()) {
            chuoiGiaTri = item.giaTri.getAsString();
        }
        if (item.donVi != null && !item.donVi.isEmpty()) {
            chuoiGiaTri = chuoiGiaTri + " " + item.donVi;
        }
        TextView tvSo = TaoGiaoDienWarmMinimal.taoSoLieuLon(context, chuoiGiaTri);
        tvSo.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 2));
        o.addView(tvSo);

        if (item.moTa != null && !item.moTa.isEmpty()) {
            o.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(context, item.moTa));
        }
        return o;
    }

    private void veKhungViecCanXuLy(Context context, MoHinhBangDieuKhien.TienIchBangDieuKhien muc) {
        try {
            Type listType = new TypeToken<List<MoHinhBangDieuKhien.ViecCanXuLy>>() {}.getType();
            List<MoHinhBangDieuKhien.ViecCanXuLy> danhSach = gson.fromJson(muc.duLieu, listType);
            if (danhSach == null || danhSach.isEmpty()) {
                return;
            }

            LinearLayout the = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
            the.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "CÔNG VIỆC CẦN XỬ LÝ"));
            TextView tvTieuDe = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                context,
                muc.tieuDe != null ? muc.tieuDe : "Nhiệm vụ học tập & giảng dạy",
                15f
            );
            tvTieuDe.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 6));
            the.addView(tvTieuDe);

            for (MoHinhBangDieuKhien.ViecCanXuLy viec : danhSach) {
                the.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
                LinearLayout dongDau = new LinearLayout(context);
                dongDau.setOrientation(LinearLayout.HORIZONTAL);
                dongDau.setGravity(Gravity.CENTER_VERTICAL);

                TextView tvTen = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(context, viec.tieuDe, 13.5f);
                tvTen.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
                dongDau.addView(tvTen);

                String mau = "CAO".equals(viec.mucDoUuTien) ? "danger" : "info";
                dongDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(context, viec.mucDoUuTien, mau));
                the.addView(dongDau);

                if (viec.moTa != null) {
                    the.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(context, viec.moTa));
                }
                if (viec.thoiHan != null) {
                    the.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                        context,
                        "Hạn: " + DinhDangThoiGian.dinhDangNgayGio(viec.thoiHan)
                    ));
                }
            }
            khungChinh.addView(the);
        } catch (Exception ignored) {
        }
    }

    private void veKhungHoatDongGanDay(Context context, MoHinhBangDieuKhien.TienIchBangDieuKhien muc) {
        try {
            Type listType = new TypeToken<List<MoHinhBangDieuKhien.HoatDongGanDay>>() {}.getType();
            List<MoHinhBangDieuKhien.HoatDongGanDay> danhSach = gson.fromJson(muc.duLieu, listType);
            if (danhSach == null || danhSach.isEmpty()) {
                return;
            }

            LinearLayout the = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
            the.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "NHẬT KÝ HOẠT ĐỘNG"));
            TextView tvTieuDe = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                context,
                muc.tieuDe != null ? muc.tieuDe : "Hoạt động gần đây",
                15f
            );
            tvTieuDe.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 4));
            the.addView(tvTieuDe);

            int gioiHan = Math.min(5, danhSach.size());
            for (int i = 0; i < gioiHan; i++) {
                MoHinhBangDieuKhien.HoatDongGanDay hd = danhSach.get(i);
                the.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
                the.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(
                    context,
                    (hd.tenNguoiThucHien != null ? hd.tenNguoiThucHien : "Hệ thống")
                        + " • " + hd.hanhDong + " (" + hd.thucThe + ")"
                ));
                the.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                    context,
                    DinhDangThoiGian.dinhDangNgayGio(hd.thoiGian)
                ));
            }
            khungChinh.addView(the);
        } catch (Exception ignored) {
        }
    }

    private void veKhungThongBao(Context context) {
        LinearLayout the = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        int soChuaDoc = duLieuThongBao != null ? duLieuThongBao.tongSoChuaDoc : 0;

        the.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            context,
            "THÔNG BÁO ĐỒNG BỘ ĐA NỀN TẢNG (" + soChuaDoc + " CHƯA ĐỌC)"
        ));

        LinearLayout hangNut = new LinearLayout(context);
        hangNut.setOrientation(LinearLayout.HORIZONTAL);
        hangNut.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 8), 0, TaoGiaoDienWarmMinimal.dp(context, 4));

        Button btnGuiThu = TaoGiaoDienWarmMinimal.taoNutChinh(context, "Phát thông báo đồng bộ Web & App");
        btnGuiThu.setOnClickListener(v -> guiThuThongBao());
        hangNut.addView(btnGuiThu);

        Button btnDocTatCa = TaoGiaoDienWarmMinimal.taoNutPhu(context, "Đọc tất cả");
        LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnDocTatCa.getLayoutParams();
        p.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
        btnDocTatCa.setLayoutParams(p);
        btnDocTatCa.setOnClickListener(v -> danhDauDocTatCa());
        hangNut.addView(btnDocTatCa);

        the.addView(hangNut);

        if (duLieuThongBao != null && duLieuThongBao.danhSachThongBao != null
            && !duLieuThongBao.danhSachThongBao.isEmpty()) {
            int max = Math.min(8, duLieuThongBao.danhSachThongBao.size());
            for (int i = 0; i < max; i++) {
                MoHinhBangDieuKhien.MucThongBaoThucTe tb = duLieuThongBao.danhSachThongBao.get(i);
                the.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));

                LinearLayout dong = new LinearLayout(context);
                dong.setOrientation(LinearLayout.HORIZONTAL);
                dong.setGravity(Gravity.CENTER_VERTICAL);

                TextView tvTieuDe = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(context, tb.tieuDe, 13.5f);
                tvTieuDe.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
                dong.addView(tvTieuDe);

                dong.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                    context,
                    tb.daDoc ? "Đã đọc" : "Mới",
                    tb.daDoc ? "muted" : "accent"
                ));
                the.addView(dong);

                the.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(context, tb.noiDung));
                the.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                    context,
                    (tb.eyebrow != null ? tb.eyebrow + " • " : "")
                        + DinhDangThoiGian.dinhDangNgayGio(tb.thoiGian)
                ));
            }
        } else {
            the.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
            the.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(context, "Hiện chưa có thông báo mới."));
        }

        khungChinh.addView(the);
    }

    private void guiThuThongBao() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .guiThuThongBaoDaKenh()
            .enqueue(new Callback<PhanHoiChuan<MoHinhBangDieuKhien.KetQuaGuiThuThongBao>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhBangDieuKhien.KetQuaGuiThuThongBao>> call,
                    Response<PhanHoiChuan<MoHinhBangDieuKhien.KetQuaGuiThuThongBao>> response
                ) {
                    if (getContext() == null) {
                        return;
                    }
                    if (response.isSuccessful()) {
                        ThongBaoToast.hienThi(
                            getContext(),
                            "Đã phát thông báo đồng bộ lên cả App Android và Web"
                        );
                        taiThongBao();
                    } else {
                        ThongBaoToast.hienThi(
                            getContext(),
                            ThongBaoToast.trichXuatThongDiepLoi(response, "Không gửi được thông báo")
                        );
                    }
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<MoHinhBangDieuKhien.KetQuaGuiThuThongBao>> call,
                    Throwable t
                ) {
                    if (getContext() != null) {
                        ThongBaoToast.hienThi(getContext(), "Lỗi mạng khi gửi thông báo");
                    }
                }
            });
    }

    private void danhDauDocTatCa() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .danhDauDocTatCaThongBao()
            .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<JsonElement>> call,
                    Response<PhanHoiChuan<JsonElement>> response
                ) {
                    if (getContext() != null) {
                        ThongBaoToast.hienThi(getContext(), "Đã đánh dấu đọc tất cả thông báo");
                        taiThongBao();
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<JsonElement>> call, Throwable t) {
                }
            });
    }
}
