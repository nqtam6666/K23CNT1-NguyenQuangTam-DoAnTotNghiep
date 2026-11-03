package com.example.smartclassai.giao_dien.lop_hoc_phan;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.smartclassai.R;
import com.example.smartclassai.mang.QuanLyPhien;
import com.example.smartclassai.mang.RetrofitClient;
import com.example.smartclassai.mo_hinh.MoHinhKhongGianLop;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.DinhDangThoiGian;
import com.example.smartclassai.tien_ich.TaoGiaoDienWarmMinimal;
import com.example.smartclassai.tien_ich.ThongBaoToast;
import com.google.gson.JsonElement;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChiTietLopHocActivity extends AppCompatActivity {

    private static final int TAB_BANG_TIN = 1;
    private static final int TAB_TAI_LIEU = 2;
    private static final int TAB_BAI_TAP = 3;
    private static final int TAB_KIEM_TRA = 4;
    private static final int TAB_SO_DIEM = 5;

    private String idLop;
    private String tenLop;
    private String maLop;
    private String maThamGia;

    private QuanLyPhien quanLyPhien;
    private String vaiTroHienTai = "";

    private int tabDangChon = TAB_BANG_TIN;
    private SwipeRefreshLayout swipeChiTietLop;
    private LinearLayout khungNoiDungTabLop;

    private TextView tabBangTin;
    private TextView tabTaiLieu;
    private TextView tabBaiTap;
    private TextView tabKiemTra;
    private TextView tabSoDiem;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chi_tiet_lop_hoc);

        quanLyPhien = new QuanLyPhien(this);
        MoHinhXacThuc.NguoiDung nd = quanLyPhien.layNguoiDung();
        if (nd != null && nd.vaiTro != null) {
            vaiTroHienTai = nd.vaiTro;
        }

        idLop = getIntent().getStringExtra("ID_LOP");
        tenLop = getIntent().getStringExtra("TEN_LOP");
        maLop = getIntent().getStringExtra("MA_LOP");
        maThamGia = getIntent().getStringExtra("MA_THAM_GIA");

        TextView tvMa = findViewById(R.id.tvMaLopChiTiet);
        TextView tvTen = findViewById(R.id.tvTenLopChiTiet);
        TextView tvMaMoi = findViewById(R.id.tvMaThamGiaChiTiet);

        tvMa.setText(maLop != null ? maLop : "LỚP HỌC PHẦN");
        tvTen.setText(tenLop != null ? tenLop : "Chi tiết lớp học phần");
        tvMaMoi.setText("MÃ: " + (maThamGia != null ? maThamGia : "---"));

        findViewById(R.id.btnQuayLaiLop).setOnClickListener(v -> finish());

        swipeChiTietLop = findViewById(R.id.swipeChiTietLop);
        khungNoiDungTabLop = findViewById(R.id.khungNoiDungTabLop);

        tabBangTin = findViewById(R.id.tabBangTin);
        tabTaiLieu = findViewById(R.id.tabTaiLieu);
        tabBaiTap = findViewById(R.id.tabBaiTap);
        tabKiemTra = findViewById(R.id.tabKiemTra);
        tabSoDiem = findViewById(R.id.tabSoDiem);

        tabBangTin.setOnClickListener(v -> chuyenTab(TAB_BANG_TIN));
        tabTaiLieu.setOnClickListener(v -> chuyenTab(TAB_TAI_LIEU));
        tabBaiTap.setOnClickListener(v -> chuyenTab(TAB_BAI_TAP));
        tabKiemTra.setOnClickListener(v -> chuyenTab(TAB_KIEM_TRA));
        tabSoDiem.setOnClickListener(v -> chuyenTab(TAB_SO_DIEM));

        swipeChiTietLop.setOnRefreshListener(this::taiDuLieuTabHienTai);
        chuyenTab(TAB_BANG_TIN);
    }

    private void chuyenTab(int tabMoi) {
        tabDangChon = tabMoi;
        capNhatMauTab(tabBangTin, tabMoi == TAB_BANG_TIN);
        capNhatMauTab(tabTaiLieu, tabMoi == TAB_TAI_LIEU);
        capNhatMauTab(tabBaiTap, tabMoi == TAB_BAI_TAP);
        capNhatMauTab(tabKiemTra, tabMoi == TAB_KIEM_TRA);
        capNhatMauTab(tabSoDiem, tabMoi == TAB_SO_DIEM);
        taiDuLieuTabHienTai();
    }

    private void capNhatMauTab(TextView tv, boolean dangChon) {
        tv.setBackgroundResource(dangChon ? R.drawable.bg_nut_chinh : R.drawable.bg_nut_phu);
        tv.setTextColor(ContextCompat.getColor(this, dangChon ? R.color.white : R.color.text));
        int padH = TaoGiaoDienWarmMinimal.dp(this, 12);
        int padV = TaoGiaoDienWarmMinimal.dp(this, 7);
        tv.setPadding(padH, padV, padH, padV);
    }

    private void taiDuLieuTabHienTai() {
        if (idLop == null || idLop.isEmpty()) {
            return;
        }
        swipeChiTietLop.setRefreshing(true);
        switch (tabDangChon) {
            case TAB_BANG_TIN:
                taiBangTin();
                break;
            case TAB_TAI_LIEU:
                taiTaiLieu();
                break;
            case TAB_BAI_TAP:
                taiBaiTap();
                break;
            case TAB_KIEM_TRA:
                taiBaiKiemTra();
                break;
            case TAB_SO_DIEM:
                taiSoDiem();
                break;
        }
    }

    // =========================================================================
    // TAB 1: BẢNG TIN & HỎI ĐÁP
    // =========================================================================
    private void taiBangTin() {
        RetrofitClient.layDichVu(this)
            .layBaiDangTheoLop(idLop)
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhKhongGianLop.BaiDang>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiDang>>> call,
                    Response<PhanHoiChuan<List<MoHinhKhongGianLop.BaiDang>>> response
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    List<MoHinhKhongGianLop.BaiDang> ds =
                        response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null
                            ? response.body().layDuLieu()
                            : new ArrayList<>();
                    veTabBangTin(ds);
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiDang>>> call,
                    Throwable t
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    veTabBangTin(new ArrayList<>());
                }
            });
    }

    private void veTabBangTin(List<MoHinhKhongGianLop.BaiDang> ds) {
        khungNoiDungTabLop.removeAllViews();

        LinearLayout thanhDau = TaoGiaoDienWarmMinimal.taoTheBeMat(this);
        thanhDau.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            this,
            "BẢNG TIN & THẢO LUẬN LỚP HỌC (" + ds.size() + " BÀI ĐĂNG)"
        ));
        Button btnDangBai = TaoGiaoDienWarmMinimal.taoNutChinh(this, "+ Đăng thông báo / Câu hỏi thảo luận");
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            TaoGiaoDienWarmMinimal.dp(this, 40)
        );
        p.topMargin = TaoGiaoDienWarmMinimal.dp(this, 8);
        btnDangBai.setLayoutParams(p);
        btnDangBai.setOnClickListener(v -> moHopThoaiDangBai());
        thanhDau.addView(btnDangBai);
        khungNoiDungTabLop.addView(thanhDau);

        if (ds.isEmpty()) {
            khungNoiDungTabLop.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                this,
                "Bảng tin chưa có bài viết",
                "Hãy đăng câu hỏi hoặc thông báo đầu tiên cho lớp học phần."
            ));
            return;
        }

        for (MoHinhKhongGianLop.BaiDang bai : ds) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(this);

            LinearLayout hangDau = new LinearLayout(this);
            hangDau.setOrientation(LinearLayout.HORIZONTAL);
            hangDau.setGravity(Gravity.CENTER_VERTICAL);

            String tenNguoiDang = bai.nguoiDang != null && bai.nguoiDang.hoTen != null
                ? bai.nguoiDang.hoTen
                : "Thành viên lớp";
            TextView tvTacGia = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(this, tenNguoiDang, 13.5f);
            tvTacGia.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangDau.addView(tvTacGia);

            String nhanChuDe = bai.chuDe != null ? bai.chuDe : "THONG_BAO";
            hangDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                this,
                nhanChuDe,
                bai.ghimDauTrang ? "accent" : "info"
            ));
            card.addView(hangDau);

            card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                this,
                DinhDangThoiGian.dinhDangNgayGio(bai.ngayTao)
                    + (bai.nhanChuong != null && !bai.nhanChuong.isEmpty() ? " • " + bai.nhanChuong : "")
            ));

            if (bai.tieuDe != null && !bai.tieuDe.isEmpty()) {
                TextView tvTieuDe = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(this, bai.tieuDe, 15f);
                tvTieuDe.setPadding(0, TaoGiaoDienWarmMinimal.dp(this, 6), 0, TaoGiaoDienWarmMinimal.dp(this, 4));
                card.addView(tvTieuDe);
            }

            TextView tvNoiDung = TaoGiaoDienWarmMinimal.taoVanBanMoTa(this, bai.noiDung);
            tvNoiDung.setPadding(0, TaoGiaoDienWarmMinimal.dp(this, 4), 0, TaoGiaoDienWarmMinimal.dp(this, 6));
            card.addView(tvNoiDung);

            // Hiển thị các bình luận
            if (bai.cacBinhLuan != null && !bai.cacBinhLuan.isEmpty()) {
                card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(this));
                card.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
                    this,
                    "BÌNH LUẬN (" + bai.cacBinhLuan.size() + ")"
                ));
                for (MoHinhKhongGianLop.BinhLuan bl : bai.cacBinhLuan) {
                    String tenBl = bl.nguoiDung != null && bl.nguoiDung.hoTen != null
                        ? bl.nguoiDung.hoTen
                        : "Thành viên";
                    TextView tvBl = TaoGiaoDienWarmMinimal.taoVanBanMoTa(
                        this,
                        "• " + tenBl + ": " + bl.noiDung
                    );
                    tvBl.setPadding(0, TaoGiaoDienWarmMinimal.dp(this, 4), 0, 0);
                    card.addView(tvBl);
                }
            }

            card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(this));
            Button btnBinhLuan = TaoGiaoDienWarmMinimal.taoNutPhu(this, "Trả lời / Bình luận");
            btnBinhLuan.setOnClickListener(v -> moHopThoaiBinhLuan(bai));
            card.addView(btnBinhLuan);

            khungNoiDungTabLop.addView(card);
        }
    }

    private void moHopThoaiDangBai() {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtTieuDe = TaoGiaoDienWarmMinimal.taoONhap(this, "Tiêu đề bài đăng / câu hỏi");
        khung.addView(edtTieuDe);

        String[] dsChuDe = {"THONG_BAO", "HOI_DAP_BAI_HOC", "THAO_LUAN_BAI_TAP", "ON_THI", "CHIA_SE_TAI_LIEU"};
        Spinner spChuDe = new Spinner(this);
        spChuDe.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, dsChuDe));
        khung.addView(spChuDe);

        EditText edtChuong = TaoGiaoDienWarmMinimal.taoONhap(this, "Nhãn chương / bài học (VD: Chương 2)");
        khung.addView(edtChuong);

        EditText edtNoiDung = TaoGiaoDienWarmMinimal.taoONhap(this, "Nội dung chi tiết...");
        edtNoiDung.setMinLines(3);
        khung.addView(edtNoiDung);

        CheckBox cbGhim = new CheckBox(this);
        cbGhim.setText("Ghim lên đầu bảng tin");
        khung.addView(cbGhim);

        new AlertDialog.Builder(this)
            .setTitle("Đăng bài lên bảng tin lớp")
            .setView(khung)
            .setPositiveButton("Đăng bài", (d, w) -> {
                String tieuDe = edtTieuDe.getText().toString().trim();
                String noiDung = edtNoiDung.getText().toString().trim();
                String chuDe = dsChuDe[spChuDe.getSelectedItemPosition()];
                String chuong = edtChuong.getText().toString().trim();
                if (noiDung.isEmpty()) {
                    ThongBaoToast.hienThi(this, "Vui lòng nhập nội dung bài đăng");
                    return;
                }
                RetrofitClient.layDichVu(this)
                    .taoBaiDang(idLop, new MoHinhKhongGianLop.YeuCauTaoBaiDang(
                        tieuDe.isEmpty() ? null : tieuDe,
                        noiDung,
                        chuDe,
                        chuong.isEmpty() ? null : chuong,
                        cbGhim.isChecked()
                    ))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.BaiDang>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhKhongGianLop.BaiDang>> call,
                            Response<PhanHoiChuan<MoHinhKhongGianLop.BaiDang>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Đã đăng bài lên bảng tin lớp");
                                taiBangTin();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    ChiTietLopHocActivity.this,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không đăng được bài")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.BaiDang>> call, Throwable t) {
                            ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Lỗi kết nối máy chủ");
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void moHopThoaiBinhLuan(MoHinhKhongGianLop.BaiDang bai) {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtBl = TaoGiaoDienWarmMinimal.taoONhap(this, "Nhập câu trả lời hoặc bình luận...");
        khung.addView(edtBl);

        new AlertDialog.Builder(this)
            .setTitle("Bình luận bài viết")
            .setView(khung)
            .setPositiveButton("Gửi bình luận", (d, w) -> {
                String nd = edtBl.getText().toString().trim();
                if (nd.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(this)
                    .taoBinhLuan(bai.id, new MoHinhKhongGianLop.YeuCauTaoBinhLuan(nd))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.BinhLuan>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhKhongGianLop.BinhLuan>> call,
                            Response<PhanHoiChuan<MoHinhKhongGianLop.BinhLuan>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Đã gửi bình luận");
                                taiBangTin();
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.BinhLuan>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Đóng", null)
            .show();
    }

    // =========================================================================
    // TAB 2: TÀI LIỆU HỌC TẬP & ĐÁNH GIÁ HỌC LIỆU
    // =========================================================================
    private void taiTaiLieu() {
        RetrofitClient.layDichVu(this)
            .layTaiLieuTheoLop(idLop)
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhKhongGianLop.TaiLieu>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhKhongGianLop.TaiLieu>>> call,
                    Response<PhanHoiChuan<List<MoHinhKhongGianLop.TaiLieu>>> response
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    List<MoHinhKhongGianLop.TaiLieu> ds =
                        response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null
                            ? response.body().layDuLieu()
                            : new ArrayList<>();
                    veTabTaiLieu(ds);
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<List<MoHinhKhongGianLop.TaiLieu>>> call,
                    Throwable t
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    veTabTaiLieu(new ArrayList<>());
                }
            });
    }

    private void veTabTaiLieu(List<MoHinhKhongGianLop.TaiLieu> ds) {
        khungNoiDungTabLop.removeAllViews();

        LinearLayout thanhDau = TaoGiaoDienWarmMinimal.taoTheBeMat(this);
        thanhDau.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            this,
            "HỌC LIỆU & GIÁO TRÌNH (" + ds.size() + " TÀI LIỆU)"
        ));

        if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTroHienTai)) {
            Button btnThemTl = TaoGiaoDienWarmMinimal.taoNutChinh(this, "+ Thêm học liệu mới");
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                TaoGiaoDienWarmMinimal.dp(this, 40)
            );
            p.topMargin = TaoGiaoDienWarmMinimal.dp(this, 8);
            btnThemTl.setLayoutParams(p);
            btnThemTl.setOnClickListener(v -> moHopThoaiThemTaiLieu());
            thanhDau.addView(btnThemTl);
        } else {
            thanhDau.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                this,
                "Bạn có thể xem, tải về và đánh giá chất lượng từng học liệu."
            ));
        }
        khungNoiDungTabLop.addView(thanhDau);

        if (ds.isEmpty()) {
            khungNoiDungTabLop.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                this,
                "Chưa có tài liệu học tập",
                "Giảng viên chưa đăng tải học liệu cho lớp học phần này."
            ));
            return;
        }

        for (MoHinhKhongGianLop.TaiLieu tl : ds) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(this);

            LinearLayout hangDau = new LinearLayout(this);
            hangDau.setOrientation(LinearLayout.HORIZONTAL);
            hangDau.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvLoai = TaoGiaoDienWarmMinimal.taoEyebrow(
                this,
                (tl.loaiTaiLieu != null ? tl.loaiTaiLieu : "TAI_LIEU")
                    + " • v" + Math.max(1, tl.soPhienBanHienTai)
            );
            tvLoai.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangDau.addView(tvLoai);

            String diemSao = String.format(Locale.US, "★ %.1f (%d)", tl.diemDanhGiaTrungBinh, tl.tongSoDanhGia);
            hangDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(this, diemSao, "accent"));
            card.addView(hangDau);

            TextView tvTieuDe = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(this, tl.tieuDe, 15f);
            tvTieuDe.setPadding(0, TaoGiaoDienWarmMinimal.dp(this, 4), 0, TaoGiaoDienWarmMinimal.dp(this, 4));
            card.addView(tvTieuDe);

            if (tl.moTa != null && !tl.moTa.isEmpty()) {
                card.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(this, tl.moTa));
            }

            card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                this,
                "Chỉ mục RAG: " + tl.soDoanVectorRag + " đoạn vector • Ngày đăng: "
                    + DinhDangThoiGian.dinhDangNgayGio(tl.ngayTao)
            ));

            card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(this));

            LinearLayout hangNut = new LinearLayout(this);
            hangNut.setOrientation(LinearLayout.HORIZONTAL);

            Button btnDanhGia = TaoGiaoDienWarmMinimal.taoNutPhu(this, "Đánh giá sao");
            btnDanhGia.setOnClickListener(v -> moHopThoaiDanhGiaTaiLieu(tl));
            hangNut.addView(btnDanhGia);

            if (tl.duongDanTep != null && !tl.duongDanTep.isEmpty()) {
                Button btnMo = TaoGiaoDienWarmMinimal.taoNutChinh(this, "Mở tài liệu");
                LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnMo.getLayoutParams();
                p.leftMargin = TaoGiaoDienWarmMinimal.dp(this, 8);
                btnMo.setLayoutParams(p);
                btnMo.setOnClickListener(v -> {
                    String url = tl.duongDanTep.startsWith("http")
                        ? tl.duongDanTep
                        : quanLyPhien.layUrlGocMayChu() + tl.duongDanTep;
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                });
                hangNut.addView(btnMo);
            }

            if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTroHienTai)) {
                Button btnRag = TaoGiaoDienWarmMinimal.taoNutPhu(this, "Nạp RAG");
                LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnRag.getLayoutParams();
                p.leftMargin = TaoGiaoDienWarmMinimal.dp(this, 8);
                btnRag.setLayoutParams(p);
                btnRag.setOnClickListener(v -> napTaiLieuRag(tl));
                hangNut.addView(btnRag);
            }

            card.addView(hangNut);
            khungNoiDungTabLop.addView(card);
        }
    }

    private void moHopThoaiThemTaiLieu() {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtTieuDe = TaoGiaoDienWarmMinimal.taoONhap(this, "Tiêu đề tài liệu (VD: Bài giảng Chương 3)");
        khung.addView(edtTieuDe);

        EditText edtMoTa = TaoGiaoDienWarmMinimal.taoONhap(this, "Tóm tắt nội dung học liệu...");
        edtMoTa.setMinLines(3);
        khung.addView(edtMoTa);

        String[] loai = {"BAI_GIANG_PDF", "SLIDE_TRINH_CHIEU", "TAI_LIEU_THAM_KHAO", "BAI_DOC"};
        Spinner spLoai = new Spinner(this);
        spLoai.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, loai));
        khung.addView(spLoai);

        new AlertDialog.Builder(this)
            .setTitle("Thêm học liệu mới")
            .setView(khung)
            .setPositiveButton("Tạo học liệu", (d, w) -> {
                String tieuDe = edtTieuDe.getText().toString().trim();
                String moTa = edtMoTa.getText().toString().trim();
                String loaiChon = loai[spLoai.getSelectedItemPosition()];
                if (tieuDe.isEmpty()) {
                    ThongBaoToast.hienThi(this, "Vui lòng nhập tiêu đề tài liệu");
                    return;
                }
                RequestBody rbTieuDe = RequestBody.create(MediaType.parse("text/plain"), tieuDe);
                RequestBody rbMoTa = RequestBody.create(MediaType.parse("text/plain"), moTa);
                RequestBody rbLoai = RequestBody.create(MediaType.parse("text/plain"), loaiChon);

                RetrofitClient.layDichVu(this)
                    .taiLenTaiLieu(idLop, rbTieuDe, rbMoTa, rbLoai)
                    .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.TaiLieu>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhKhongGianLop.TaiLieu>> call,
                            Response<PhanHoiChuan<MoHinhKhongGianLop.TaiLieu>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Đã thêm học liệu mới");
                                taiTaiLieu();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    ChiTietLopHocActivity.this,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không thể tạo học liệu")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.TaiLieu>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void moHopThoaiDanhGiaTaiLieu(MoHinhKhongGianLop.TaiLieu tl) {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);

        String[] mucSao = {"5 sao - Rất hữu ích", "4 sao - Tốt", "3 sao - Khá", "2 sao - Cần bổ sung", "1 sao - Chưa rõ"};
        int[] giaTriSao = {5, 4, 3, 2, 1};
        Spinner spSao = new Spinner(this);
        spSao.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, mucSao));
        khung.addView(spSao);

        EditText edtNhanXet = TaoGiaoDienWarmMinimal.taoONhap(this, "Nhận xét của bạn về tài liệu này...");
        khung.addView(edtNhanXet);

        new AlertDialog.Builder(this)
            .setTitle("Đánh giá: " + tl.tieuDe)
            .setView(khung)
            .setPositiveButton("Gửi đánh giá", (d, w) -> {
                int sao = giaTriSao[spSao.getSelectedItemPosition()];
                String nx = edtNhanXet.getText().toString().trim();
                RetrofitClient.layDichVu(this)
                    .danhGiaTaiLieu(tl.id, new MoHinhKhongGianLop.YeuCauDanhGiaTaiLieu(sao, nx))
                    .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<JsonElement>> call,
                            Response<PhanHoiChuan<JsonElement>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Đã ghi nhận đánh giá " + sao + " sao");
                                taiTaiLieu();
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

    private void napTaiLieuRag(MoHinhKhongGianLop.TaiLieu tl) {
        RetrofitClient.layDichVu(this)
            .napTaiLieuVaoKhoVector(tl.id)
            .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<JsonElement>> call,
                    Response<PhanHoiChuan<JsonElement>> response
                ) {
                    if (response.isSuccessful()) {
                        ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Đã nạp học liệu vào kho tri thức Vector RAG");
                        taiTaiLieu();
                    } else {
                        ThongBaoToast.hienThiDai(
                            ChiTietLopHocActivity.this,
                            ThongBaoToast.trichXuatThongDiepLoi(response, "Không nạp được tài liệu")
                        );
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<JsonElement>> call, Throwable t) {
                }
            });
    }

    // =========================================================================
    // TAB 3: BÀI TẬP, NỘP BÀI & CHẤM ĐIỂM
    // =========================================================================
    private void taiBaiTap() {
        RetrofitClient.layDichVu(this)
            .layBaiTapTheoLop(idLop)
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhKhongGianLop.BaiTap>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiTap>>> call,
                    Response<PhanHoiChuan<List<MoHinhKhongGianLop.BaiTap>>> response
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    List<MoHinhKhongGianLop.BaiTap> ds =
                        response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null
                            ? response.body().layDuLieu()
                            : new ArrayList<>();
                    veTabBaiTap(ds);
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiTap>>> call,
                    Throwable t
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    veTabBaiTap(new ArrayList<>());
                }
            });
    }

    private void veTabBaiTap(List<MoHinhKhongGianLop.BaiTap> ds) {
        khungNoiDungTabLop.removeAllViews();

        LinearLayout thanhDau = TaoGiaoDienWarmMinimal.taoTheBeMat(this);
        thanhDau.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            this,
            "BÀI TẬP & ĐÁNH GIÁ (" + ds.size() + " BÀI TẬP)"
        ));
        if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTroHienTai)) {
            Button btnGiao = TaoGiaoDienWarmMinimal.taoNutChinh(this, "+ Giao bài tập mới cho lớp");
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                TaoGiaoDienWarmMinimal.dp(this, 40)
            );
            p.topMargin = TaoGiaoDienWarmMinimal.dp(this, 8);
            btnGiao.setLayoutParams(p);
            btnGiao.setOnClickListener(v -> moHopThoaiGiaoBaiTap());
            thanhDau.addView(btnGiao);
        }
        khungNoiDungTabLop.addView(thanhDau);

        if (ds.isEmpty()) {
            khungNoiDungTabLop.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                this,
                "Chưa có bài tập nào",
                "Khi giảng viên giao bài tập mới, danh sách sẽ hiển thị tại đây."
            ));
            return;
        }

        for (MoHinhKhongGianLop.BaiTap bt : ds) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(this);

            LinearLayout hangDau = new LinearLayout(this);
            hangDau.setOrientation(LinearLayout.HORIZONTAL);
            hangDau.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvTieuDe = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(this, bt.tieuDe, 15f);
            tvTieuDe.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangDau.addView(tvTieuDe);

            hangDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                this,
                "Thang " + bt.diemToiDa + "đ",
                "info"
            ));
            card.addView(hangDau);

            card.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(this, bt.noiDung));
            card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                this,
                "Hạn nộp: " + DinhDangThoiGian.dinhDangNgayGio(bt.hanNop)
                    + (bt.dem != null ? " • Đã nộp: " + bt.dem.cacBaiNop + " bài" : "")
            ));

            if (bt.baiNopCuaToi != null) {
                card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(this));
                String trangThaiNop = "Trạng thái bài nộp của bạn: " + bt.baiNopCuaToi.trangThai;
                if (bt.baiNopCuaToi.diemSo != null) {
                    trangThaiNop += " • Điểm: " + bt.baiNopCuaToi.diemSo + "/" + bt.diemToiDa;
                }
                card.addView(TaoGiaoDienWarmMinimal.taoTieuDeMonospace(this, trangThaiNop, 13f));
                if (bt.baiNopCuaToi.nhanXet != null && !bt.baiNopCuaToi.nhanXet.isEmpty()) {
                    card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                        this,
                        "Nhận xét GV: " + bt.baiNopCuaToi.nhanXet
                    ));
                }
            }

            card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(this));

            if ("HOC_SINH".equals(vaiTroHienTai)) {
                Button btnNop = TaoGiaoDienWarmMinimal.taoNutChinh(
                    this,
                    bt.baiNopCuaToi != null ? "Cập nhật bài nộp" : "Nộp bài làm"
                );
                btnNop.setOnClickListener(v -> moHopThoaiNopBai(bt));
                card.addView(btnNop);
            } else if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTroHienTai)) {
                Button btnDsNop = TaoGiaoDienWarmMinimal.taoNutChinh(this, "Xem bài nộp & Chấm điểm");
                btnDsNop.setOnClickListener(v -> moDanhSachBaiNop(bt));
                card.addView(btnDsNop);
            }

            khungNoiDungTabLop.addView(card);
        }
    }

    private void moHopThoaiGiaoBaiTap() {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtTieuDe = TaoGiaoDienWarmMinimal.taoONhap(this, "Tiêu đề bài tập");
        khung.addView(edtTieuDe);

        EditText edtNoiDung = TaoGiaoDienWarmMinimal.taoONhap(this, "Yêu cầu chi tiết bài tập...");
        edtNoiDung.setMinLines(3);
        khung.addView(edtNoiDung);

        EditText edtHan = TaoGiaoDienWarmMinimal.taoONhap(this, "Hạn nộp ISO (VD: 2026-12-25T23:59:00.000Z)");
        edtHan.setText("2026-12-25T23:59:00.000Z");
        khung.addView(edtHan);

        new AlertDialog.Builder(this)
            .setTitle("Giao bài tập mới")
            .setView(khung)
            .setPositiveButton("Giao bài", (d, w) -> {
                String tieuDe = edtTieuDe.getText().toString().trim();
                String noiDung = edtNoiDung.getText().toString().trim();
                String han = edtHan.getText().toString().trim();
                if (tieuDe.isEmpty() || noiDung.isEmpty()) {
                    ThongBaoToast.hienThi(this, "Vui lòng nhập đủ tiêu đề và nội dung bài tập");
                    return;
                }
                RetrofitClient.layDichVu(this)
                    .taoBaiTap(idLop, new MoHinhKhongGianLop.YeuCauTaoBaiTap(tieuDe, noiDung, han, 10.0))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.BaiTap>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhKhongGianLop.BaiTap>> call,
                            Response<PhanHoiChuan<MoHinhKhongGianLop.BaiTap>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Đã giao bài tập mới");
                                taiBaiTap();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    ChiTietLopHocActivity.this,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không giao được bài tập")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.BaiTap>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void moHopThoaiNopBai(MoHinhKhongGianLop.BaiTap bt) {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtBaiLam = TaoGiaoDienWarmMinimal.taoONhap(this, "Nhập nội dung bài làm hoặc đường dẫn tài liệu...");
        edtBaiLam.setMinLines(4);
        if (bt.baiNopCuaToi != null && bt.baiNopCuaToi.noiDung != null) {
            edtBaiLam.setText(bt.baiNopCuaToi.noiDung);
        }
        khung.addView(edtBaiLam);

        new AlertDialog.Builder(this)
            .setTitle("Nộp bài: " + bt.tieuDe)
            .setView(khung)
            .setPositiveButton("Nộp bài", (d, w) -> {
                String nd = edtBaiLam.getText().toString().trim();
                if (nd.isEmpty()) {
                    ThongBaoToast.hienThi(this, "Vui lòng nhập nội dung bài làm");
                    return;
                }
                RequestBody rbNoiDung = RequestBody.create(MediaType.parse("text/plain"), nd);
                RetrofitClient.layDichVu(this)
                    .nopBaiTap(bt.id, rbNoiDung)
                    .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>> call,
                            Response<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Nộp bài thành công");
                                taiBaiTap();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    ChiTietLopHocActivity.this,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không nộp được bài")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Đóng", null)
            .show();
    }

    private void moDanhSachBaiNop(MoHinhKhongGianLop.BaiTap bt) {
        RetrofitClient.layDichVu(this)
            .layDanhSachBaiNop(bt.id)
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhKhongGianLop.BaiNop>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiNop>>> call,
                    Response<PhanHoiChuan<List<MoHinhKhongGianLop.BaiNop>>> response
                ) {
                    List<MoHinhKhongGianLop.BaiNop> ds =
                        response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null
                            ? response.body().layDuLieu()
                            : new ArrayList<>();
                    if (ds.isEmpty()) {
                        ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Chưa có học sinh nào nộp bài tập này");
                        return;
                    }
                    String[] tenMuc = new String[ds.size()];
                    for (int i = 0; i < ds.size(); i++) {
                        MoHinhKhongGianLop.BaiNop bn = ds.get(i);
                        String tenHs = bn.nguoiNop != null ? bn.nguoiNop.hoTen : "Học sinh";
                        String diem = bn.diemSo != null ? (bn.diemSo + "đ") : "Chưa chấm";
                        tenMuc[i] = tenHs + " (" + diem + ")";
                    }
                    new AlertDialog.Builder(ChiTietLopHocActivity.this)
                        .setTitle("Danh sách bài nộp (" + ds.size() + ") - Chạm để chấm")
                        .setItems(tenMuc, (d, which) -> moHopThoaiChamDiem(ds.get(which)))
                        .setNegativeButton("Đóng", null)
                        .show();
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiNop>>> call, Throwable t) {
                }
            });
    }

    private void moHopThoaiChamDiem(MoHinhKhongGianLop.BaiNop bn) {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);

        khung.addView(TaoGiaoDienWarmMinimal.taoVanBanMoTa(
            this,
            "Bài làm: " + (bn.noiDung != null ? bn.noiDung : "(Đính kèm tệp)")
        ));

        EditText edtDiem = TaoGiaoDienWarmMinimal.taoONhap(this, "Điểm số (0 - 10)");
        edtDiem.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL);
        if (bn.diemSo != null) {
            edtDiem.setText(String.valueOf(bn.diemSo));
        }
        khung.addView(edtDiem);

        EditText edtNhanXet = TaoGiaoDienWarmMinimal.taoONhap(this, "Nhận xét của giảng viên...");
        if (bn.nhanXet != null) {
            edtNhanXet.setText(bn.nhanXet);
        }
        khung.addView(edtNhanXet);

        new AlertDialog.Builder(this)
            .setTitle("Chấm điểm: " + (bn.nguoiNop != null ? bn.nguoiNop.hoTen : ""))
            .setView(khung)
            .setPositiveButton("Lưu điểm", (d, w) -> {
                try {
                    double diem = Double.parseDouble(edtDiem.getText().toString().trim());
                    String nx = edtNhanXet.getText().toString().trim();
                    RetrofitClient.layDichVu(this)
                        .chamDiemBaiNop(bn.id, new MoHinhKhongGianLop.YeuCauChamDiem(diem, nx))
                        .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>>() {
                            @Override
                            public void onResponse(
                                Call<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>> call,
                                Response<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>> response
                            ) {
                                if (response.isSuccessful()) {
                                    ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Đã lưu điểm bài nộp");
                                    taiBaiTap();
                                }
                            }

                            @Override
                            public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.BaiNop>> call, Throwable t) {
                            }
                        });
                } catch (Exception e) {
                    ThongBaoToast.hienThi(this, "Điểm số không hợp lệ");
                }
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    // =========================================================================
    // TAB 4: BÀI KIỂM TRA TRẮC NGHIỆM & LÀM BÀI TỰ ĐỘNG CHẤM
    // =========================================================================
    private void taiBaiKiemTra() {
        RetrofitClient.layDichVu(this)
            .layBaiKiemTraTheoLop(idLop)
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhKhongGianLop.BaiKiemTra>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiKiemTra>>> call,
                    Response<PhanHoiChuan<List<MoHinhKhongGianLop.BaiKiemTra>>> response
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    List<MoHinhKhongGianLop.BaiKiemTra> ds =
                        response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null
                            ? response.body().layDuLieu()
                            : new ArrayList<>();
                    veTabKiemTra(ds);
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<List<MoHinhKhongGianLop.BaiKiemTra>>> call,
                    Throwable t
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    veTabKiemTra(new ArrayList<>());
                }
            });
    }

    private void veTabKiemTra(List<MoHinhKhongGianLop.BaiKiemTra> ds) {
        khungNoiDungTabLop.removeAllViews();

        LinearLayout thanhDau = TaoGiaoDienWarmMinimal.taoTheBeMat(this);
        thanhDau.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
            this,
            "LUYỆN TẬP & THI THỬ TRẮC NGHIỆM (" + ds.size() + " ĐỀ)"
        ));
        if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTroHienTai)) {
            Button btnSinhDe = TaoGiaoDienWarmMinimal.taoNutChinh(this, "+ Biên soạn đề trắc nghiệm tự động từ học liệu");
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                TaoGiaoDienWarmMinimal.dp(this, 40)
            );
            p.topMargin = TaoGiaoDienWarmMinimal.dp(this, 8);
            btnSinhDe.setLayoutParams(p);
            btnSinhDe.setOnClickListener(v -> moHopThoaiSinhDeAi());
            thanhDau.addView(btnSinhDe);
        }
        khungNoiDungTabLop.addView(thanhDau);

        if (ds.isEmpty()) {
            khungNoiDungTabLop.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                this,
                "Chưa có đề kiểm tra",
                "Giảng viên có thể tạo đề trắc nghiệm để học sinh luyện tập trực tiếp trên điện thoại."
            ));
            return;
        }

        for (MoHinhKhongGianLop.BaiKiemTra de : ds) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(this);

            LinearLayout hangDau = new LinearLayout(this);
            hangDau.setOrientation(LinearLayout.HORIZONTAL);
            hangDau.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvTieuDe = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(this, de.tieuDe, 15f);
            tvTieuDe.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangDau.addView(tvTieuDe);

            hangDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                this,
                de.cheDo != null ? de.cheDo : "LUYEN_TAP",
                "DANG_MO".equals(de.trangThai) ? "accent" : "muted"
            ));
            card.addView(hangDau);

            int soCau = de.dem != null ? de.dem.cacCauHoi : 0;
            card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                this,
                "Thời gian: " + de.thoiGianLamPhut + " phút • Số câu: " + soCau
                    + " câu • Tối đa: " + de.soLuotToiDa + " lượt"
            ));

            if (de.diemCaoNhatCuaToi != null) {
                card.addView(TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                    this,
                    "Điểm cao nhất của bạn: " + de.diemCaoNhatCuaToi + "/" + de.diemToiDa
                        + " (" + de.soLuotDaLam + " lượt đã làm)",
                    13f
                ));
            }

            card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(this));

            Button btnLamBai = TaoGiaoDienWarmMinimal.taoNutChinh(this, "Vào làm bài trắc nghiệm");
            btnLamBai.setOnClickListener(v -> taiChiTietVaMoPhongThi(de.id));
            card.addView(btnLamBai);

            khungNoiDungTabLop.addView(card);
        }
    }

    private void moHopThoaiSinhDeAi() {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtChuDe = TaoGiaoDienWarmMinimal.taoONhap(this, "Chủ đề kiểm tra (VD: Ôn tập Chương 1 & 2)");
        khung.addView(edtChuDe);

        String[] dsCheDo = {"LUYEN_TAP", "THI_THU"};
        Spinner spCheDo = new Spinner(this);
        spCheDo.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, dsCheDo));
        khung.addView(spCheDo);

        EditText edtSoCau = TaoGiaoDienWarmMinimal.taoONhap(this, "Số lượng câu hỏi (VD: 5)");
        edtSoCau.setInputType(InputType.TYPE_CLASS_NUMBER);
        edtSoCau.setText("5");
        khung.addView(edtSoCau);

        new AlertDialog.Builder(this)
            .setTitle("Biên soạn đề kiểm tra từ học liệu")
            .setView(khung)
            .setPositiveButton("Tạo đề ngay", (d, w) -> {
                String chuDe = edtChuDe.getText().toString().trim();
                if (chuDe.isEmpty()) {
                    ThongBaoToast.hienThi(this, "Vui lòng nhập chủ đề đề kiểm tra");
                    return;
                }
                int soCau = 5;
                try {
                    soCau = Integer.parseInt(edtSoCau.getText().toString().trim());
                } catch (Exception ignored) {
                }
                String cheDo = dsCheDo[spCheDo.getSelectedItemPosition()];

                ThongBaoToast.hienThi(this, "Đang biên soạn đề trắc nghiệm...");
                RetrofitClient.layDichVu(this)
                    .sinhDeBangAI(idLop, new MoHinhKhongGianLop.YeuCauSinhDeAI(chuDe, cheDo, soCau, 15))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>> call,
                            Response<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Đã tạo đề kiểm tra mới");
                                taiBaiKiemTra();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    ChiTietLopHocActivity.this,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không tạo được đề")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void taiChiTietVaMoPhongThi(String idBaiKiemTra) {
        RetrofitClient.layDichVu(this)
            .layChiTietBaiKiemTra(idBaiKiemTra)
            .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>> call,
                    Response<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        hienThiHopThoaiLamBai(response.body().layDuLieu());
                    } else {
                        ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Không tải được danh sách câu hỏi");
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.BaiKiemTra>> call, Throwable t) {
                }
            });
    }

    private void hienThiHopThoaiLamBai(MoHinhKhongGianLop.BaiKiemTra de) {
        if (de.cacCauHoi == null || de.cacCauHoi.isEmpty()) {
            ThongBaoToast.hienThi(this, "Đề kiểm tra này chưa có câu hỏi");
            return;
        }

        ScrollView scroll = new ScrollView(this);
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);
        scroll.addView(khung);

        final Map<String, String> dapAnChon = new HashMap<>();
        final long thoiDiemBatDau = System.currentTimeMillis();

        for (int i = 0; i < de.cacCauHoi.size(); i++) {
            MoHinhKhongGianLop.CauHoi ch = de.cacCauHoi.get(i);
            TextView tvCau = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                this,
                "Câu " + (i + 1) + ": " + ch.noiDung,
                13.5f
            );
            tvCau.setPadding(0, TaoGiaoDienWarmMinimal.dp(this, 8), 0, TaoGiaoDienWarmMinimal.dp(this, 4));
            khung.addView(tvCau);

            RadioGroup rg = new RadioGroup(this);
            rg.setOrientation(RadioGroup.VERTICAL);
            if (ch.cacPhuongAn != null) {
                for (MoHinhKhongGianLop.PhuongAnCauHoi pa : ch.cacPhuongAn) {
                    RadioButton rb = new RadioButton(this);
                    rb.setText(pa.ma + ". " + pa.noiDung);
                    rb.setTextColor(ContextCompat.getColor(this, R.color.text));
                    rb.setOnCheckedChangeListener((buttonView, isChecked) -> {
                        if (isChecked) {
                            dapAnChon.put(ch.id, pa.ma);
                        }
                    });
                    rg.addView(rb);
                }
            }
            khung.addView(rg);
            khung.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(this));
        }

        new AlertDialog.Builder(this)
            .setTitle(de.tieuDe)
            .setView(scroll)
            .setPositiveButton("Nộp bài & Chấm điểm", (d, w) -> {
                List<MoHinhKhongGianLop.TraLoiCauHoiInput> dsTraLoi = new ArrayList<>();
                for (MoHinhKhongGianLop.CauHoi ch : de.cacCauHoi) {
                    String chon = dapAnChon.get(ch.id);
                    if (chon != null) {
                        dsTraLoi.add(new MoHinhKhongGianLop.TraLoiCauHoiInput(ch.id, chon));
                    }
                }
                int giay = (int) Math.max(5, (System.currentTimeMillis() - thoiDiemBatDau) / 1000);
                RetrofitClient.layDichVu(this)
                    .nopBaiKiemTra(de.id, new MoHinhKhongGianLop.YeuCauNopBaiKiemTra(dsTraLoi, giay))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.LuotLamBai>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhKhongGianLop.LuotLamBai>> call,
                            Response<PhanHoiChuan<MoHinhKhongGianLop.LuotLamBai>> response
                        ) {
                            if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                                MoHinhKhongGianLop.LuotLamBai kq = response.body().layDuLieu();
                                new AlertDialog.Builder(ChiTietLopHocActivity.this)
                                    .setTitle("Kết quả chấm điểm tự động")
                                    .setMessage(
                                        "Điểm đạt được: " + kq.diemSo + "/" + de.diemToiDa
                                            + "\nSố câu đúng: " + kq.soCauDung + "/" + kq.tongSoCau
                                            + (kq.nhanXetAI != null ? "\n\nNhận xét: " + kq.nhanXetAI : "")
                                    )
                                    .setPositiveButton("Hoàn tất", null)
                                    .show();
                                taiBaiKiemTra();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    ChiTietLopHocActivity.this,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không nộp được bài kiểm tra")
                                );
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.LuotLamBai>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Đóng", null)
            .show();
    }

    // =========================================================================
    // TAB 5: SỔ ĐIỂM HỌC PHẦN & PHÂN TÍCH AI
    // =========================================================================
    private void taiSoDiem() {
        RetrofitClient.layDichVu(this)
            .layBangDiemLop(idLop)
            .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.BangDiemLopHocPhan>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhKhongGianLop.BangDiemLopHocPhan>> call,
                    Response<PhanHoiChuan<MoHinhKhongGianLop.BangDiemLopHocPhan>> response
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        veTabSoDiem(response.body().layDuLieu());
                    } else {
                        veTabSoDiem(null);
                    }
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<MoHinhKhongGianLop.BangDiemLopHocPhan>> call,
                    Throwable t
                ) {
                    swipeChiTietLop.setRefreshing(false);
                    veTabSoDiem(null);
                }
            });
    }

    private void veTabSoDiem(MoHinhKhongGianLop.BangDiemLopHocPhan bangDiem) {
        khungNoiDungTabLop.removeAllViews();

        if (bangDiem == null) {
            khungNoiDungTabLop.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                this,
                "Chưa tải được sổ điểm",
                "Kéo xuống để làm mới dữ liệu sổ điểm lớp học phần."
            ));
            return;
        }

        // Thống kê tổng hợp
        LinearLayout theThongKe = TaoGiaoDienWarmMinimal.taoTheBeMat(this);
        theThongKe.addView(TaoGiaoDienWarmMinimal.taoEyebrow(this, "SỔ ĐIỂM TỔNG HỢP LỚP HỌC PHẦN"));
        if (bangDiem.thongKe != null) {
            TextView tvTb = TaoGiaoDienWarmMinimal.taoSoLieuLon(
                this,
                String.format(Locale.US, "ĐTB Lớp: %.2f • Qua môn: %.0f%%",
                    bangDiem.thongKe.diemTrungBinhLop,
                    bangDiem.thongKe.tyLeQuaMon)
            );
            tvTb.setPadding(0, TaoGiaoDienWarmMinimal.dp(this, 4), 0, TaoGiaoDienWarmMinimal.dp(this, 4));
            theThongKe.addView(tvTb);
            theThongKe.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                this,
                "Tổng số: " + bangDiem.thongKe.tongSoHocSinh + " học sinh • Đã đủ đầu điểm: "
                    + bangDiem.thongKe.soHocSinhDaDuDiem
            ));
        }

        if (QuanLyPhien.laGiaoVienHoacQuanTri(vaiTroHienTai)) {
            LinearLayout hangNut = new LinearLayout(this);
            hangNut.setOrientation(LinearLayout.HORIZONTAL);
            hangNut.setPadding(0, TaoGiaoDienWarmMinimal.dp(this, 8), 0, 0);

            Button btnDongBo = TaoGiaoDienWarmMinimal.taoNutChinh(this, "Đồng bộ điểm tự động");
            btnDongBo.setOnClickListener(v -> dongBoDiemLop());
            hangNut.addView(btnDongBo);

            Button btnThemCot = TaoGiaoDienWarmMinimal.taoNutPhu(this, "+ Cột điểm");
            LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnThemCot.getLayoutParams();
            p.leftMargin = TaoGiaoDienWarmMinimal.dp(this, 8);
            btnThemCot.setLayoutParams(p);
            btnThemCot.setOnClickListener(v -> moHopThoaiThemCotDiem());
            hangNut.addView(btnThemCot);

            theThongKe.addView(hangNut);
        }
        khungNoiDungTabLop.addView(theThongKe);

        if (bangDiem.danhSachHocSinh == null || bangDiem.danhSachHocSinh.isEmpty()) {
            khungNoiDungTabLop.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                this,
                "Chưa có học sinh trong sổ điểm",
                "Danh sách điểm sẽ hiển thị khi có học sinh ghi danh."
            ));
            return;
        }

        for (MoHinhKhongGianLop.DongBangDiemHocSinh dong : bangDiem.danhSachHocSinh) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(this);

            LinearLayout hangDau = new LinearLayout(this);
            hangDau.setOrientation(LinearLayout.HORIZONTAL);
            hangDau.setGravity(Gravity.CENTER_VERTICAL);

            TextView tvTen = TaoGiaoDienWarmMinimal.taoTieuDeMonospace(
                this,
                dong.hoTen + " (" + dong.maHocSinh + ")",
                14f
            );
            tvTen.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
            hangDau.addView(tvTen);

            String chuoiDtb = dong.diemTrungBinhHe10 != null
                ? String.format(Locale.US, "%.2f (%s)", dong.diemTrungBinhHe10, dong.diemChu)
                : "Chưa xếp loại";
            hangDau.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                this,
                chuoiDtb,
                Boolean.TRUE.equals(dong.datQuaMon) ? "accent" : "info"
            ));
            card.addView(hangDau);

            card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                this,
                "Chuyên cần: " + String.format(Locale.US, "%.0f%%", dong.tyLeChuyenCan)
                    + " • Xếp loại: " + (dong.xepLoai != null ? dong.xepLoai : "Đang học")
            ));

            if (bangDiem.danhSachCotDiem != null && dong.diemTheoCot != null) {
                StringBuilder sb = new StringBuilder();
                for (MoHinhKhongGianLop.CotDiem cot : bangDiem.danhSachCotDiem) {
                    MoHinhKhongGianLop.OChiTietDiem o = dong.diemTheoCot.get(cot.id);
                    String val = (o != null && o.giaTri != null) ? String.valueOf(o.giaTri) : "--";
                    if (sb.length() > 0) {
                        sb.append("  |  ");
                    }
                    sb.append(cot.tenCotDiem).append(" (HS").append(cot.heSo).append("): ").append(val);
                }
                if (sb.length() > 0) {
                    TextView tvChiTiet = TaoGiaoDienWarmMinimal.taoVanBanMoTa(this, sb.toString());
                    tvChiTiet.setPadding(0, TaoGiaoDienWarmMinimal.dp(this, 4), 0, 0);
                    card.addView(tvChiTiet);
                }
            }

            card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(this));
            Button btnPhanTichAi = TaoGiaoDienWarmMinimal.taoNutPhu(this, "Phân tích kết quả & Gợi ý lộ trình");
            btnPhanTichAi.setOnClickListener(v -> xemNhanXetHocPhanAi(dong));
            card.addView(btnPhanTichAi);

            khungNoiDungTabLop.addView(card);
        }
    }

    private void dongBoDiemLop() {
        RetrofitClient.layDichVu(this)
            .dongBoDiemTuDong(idLop)
            .enqueue(new Callback<PhanHoiChuan<JsonElement>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<JsonElement>> call,
                    Response<PhanHoiChuan<JsonElement>> response
                ) {
                    if (response.isSuccessful()) {
                        ThongBaoToast.hienThi(
                            ChiTietLopHocActivity.this,
                            "Đã đồng bộ điểm Chuyên cần, Bài tập và Kiểm tra vào Sổ điểm"
                        );
                        taiSoDiem();
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<JsonElement>> call, Throwable t) {
                }
            });
    }

    private void moHopThoaiThemCotDiem() {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = TaoGiaoDienWarmMinimal.dp(this, 16);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtTen = TaoGiaoDienWarmMinimal.taoONhap(this, "Tên cột điểm (VD: Giữa kỳ)");
        khung.addView(edtTen);

        EditText edtHeSo = TaoGiaoDienWarmMinimal.taoONhap(this, "Hệ số (1, 2 hoặc 3)");
        edtHeSo.setInputType(InputType.TYPE_CLASS_NUMBER);
        edtHeSo.setText("2");
        khung.addView(edtHeSo);

        new AlertDialog.Builder(this)
            .setTitle("Thêm cột điểm thành phần")
            .setView(khung)
            .setPositiveButton("Thêm cột", (d, w) -> {
                String ten = edtTen.getText().toString().trim();
                int hs = 1;
                try {
                    hs = Integer.parseInt(edtHeSo.getText().toString().trim());
                } catch (Exception ignored) {
                }
                if (ten.isEmpty()) {
                    return;
                }
                RetrofitClient.layDichVu(this)
                    .taoCotDiem(idLop, new MoHinhKhongGianLop.YeuCauTaoCotDiem(ten, hs))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.CotDiem>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhKhongGianLop.CotDiem>> call,
                            Response<PhanHoiChuan<MoHinhKhongGianLop.CotDiem>> response
                        ) {
                            if (response.isSuccessful()) {
                                ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Đã thêm cột điểm " + ten);
                                taiSoDiem();
                            }
                        }

                        @Override
                        public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.CotDiem>> call, Throwable t) {
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void xemNhanXetHocPhanAi(MoHinhKhongGianLop.DongBangDiemHocSinh dong) {
        ThongBaoToast.hienThi(this, "Đang phân tích kết quả học tập của " + dong.hoTen + "...");
        RetrofitClient.layDichVu(this)
            .sinhNhanXetHocPhanAI(idLop, dong.idHocSinh)
            .enqueue(new Callback<PhanHoiChuan<MoHinhKhongGianLop.KetQuaNhanXetHocPhanAI>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhKhongGianLop.KetQuaNhanXetHocPhanAI>> call,
                    Response<PhanHoiChuan<MoHinhKhongGianLop.KetQuaNhanXetHocPhanAI>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        MoHinhKhongGianLop.KetQuaNhanXetHocPhanAI kq = response.body().layDuLieu();
                        StringBuilder msg = new StringBuilder();
                        msg.append(kq.nhanXetChiTiet != null ? kq.nhanXetChiTiet : "").append("\n\n");
                        if (kq.loTrinhDeXuat != null && !kq.loTrinhDeXuat.isEmpty()) {
                            msg.append("Lộ trình đề xuất:\n");
                            for (String buoc : kq.loTrinhDeXuat) {
                                msg.append("• ").append(buoc).append("\n");
                            }
                        }
                        new AlertDialog.Builder(ChiTietLopHocActivity.this)
                            .setTitle("Đánh giá học tập: " + dong.hoTen)
                            .setMessage(msg.toString().trim())
                            .setPositiveButton("Đóng", null)
                            .show();
                    } else {
                        ThongBaoToast.hienThi(ChiTietLopHocActivity.this, "Không lấy được nhận xét học phần");
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhKhongGianLop.KetQuaNhanXetHocPhanAI>> call, Throwable t) {
                }
            });
    }
}
