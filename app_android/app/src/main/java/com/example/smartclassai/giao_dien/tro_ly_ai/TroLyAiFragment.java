package com.example.smartclassai.giao_dien.tro_ly_ai;

import android.content.Context;
import android.os.Bundle;
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
import androidx.fragment.app.Fragment;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.smartclassai.R;
import com.example.smartclassai.mang.RetrofitClient;
import com.example.smartclassai.mo_hinh.DuLieuPhanTrang;
import com.example.smartclassai.mo_hinh.MoHinhHocVu;
import com.example.smartclassai.mo_hinh.MoHinhTrucTuyenVaAi;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.TaoGiaoDienWarmMinimal;
import com.example.smartclassai.tien_ich.ThongBaoToast;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TroLyAiFragment extends Fragment {

    private SwipeRefreshLayout swipeRefresh;
    private LinearLayout khungChinh;

    private List<MoHinhTrucTuyenVaAi.PhienTroLy> dsPhien = new ArrayList<>();
    private List<MoHinhHocVu.LopHocPhan> dsLop = new ArrayList<>();
    private List<MoHinhTrucTuyenVaAi.TinNhanTroLy> dsTinNhan = new ArrayList<>();
    private List<String> goiYCauHoi = new ArrayList<>();

    private String idPhienHienTai = null;
    private int viTriLopChon = 0;
    private int viTriMucDoChon = 1; // TRUNG_BINH
    private boolean dangGuiCauHoi = false;

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
                    taiDanhSachPhien();
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<DuLieuPhanTrang<MoHinhHocVu.LopHocPhan>>> call,
                    Throwable t
                ) {
                    taiDanhSachPhien();
                }
            });
    }

    private void taiDanhSachPhien() {
        if (getContext() == null) {
            return;
        }
        RetrofitClient.layDichVu(getContext())
            .layDanhSachPhienAi()
            .enqueue(new Callback<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.PhienTroLy>>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.PhienTroLy>>> call,
                    Response<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.PhienTroLy>>> response
                ) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        dsPhien = response.body().layDuLieu();
                    }
                    if (idPhienHienTai == null && !dsPhien.isEmpty()) {
                        taiChiTietPhien(dsPhien.get(0).id);
                    } else {
                        veGiaoDien();
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<List<MoHinhTrucTuyenVaAi.PhienTroLy>>> call, Throwable t) {
                    if (swipeRefresh != null) {
                        swipeRefresh.setRefreshing(false);
                    }
                    veGiaoDien();
                }
            });
    }

    private void taiChiTietPhien(String idPhien) {
        if (getContext() == null) {
            return;
        }
        idPhienHienTai = idPhien;
        RetrofitClient.layDichVu(getContext())
            .layChiTietPhienAi(idPhien)
            .enqueue(new Callback<PhanHoiChuan<MoHinhTrucTuyenVaAi.PhienTroLy>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.PhienTroLy>> call,
                    Response<PhanHoiChuan<MoHinhTrucTuyenVaAi.PhienTroLy>> response
                ) {
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        MoHinhTrucTuyenVaAi.PhienTroLy phien = response.body().layDuLieu();
                        dsTinNhan = phien.cacTinNhan != null ? phien.cacTinNhan : new ArrayList<>();
                    }
                    veGiaoDien();
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.PhienTroLy>> call, Throwable t) {
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

        // 1. Khung cấu hình Tra cứu Học liệu RAG
        LinearLayout theCauHinh = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theCauHinh.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "TRỢ LÝ HỌC TẬP TRA CỨU HỌC LIỆU (RAG)"));

        // Chọn lớp ngữ cảnh
        String[] tenLopArr = new String[dsLop.size() + 1];
        tenLopArr[0] = "Tất cả lớp học phần đã ghi danh";
        for (int i = 0; i < dsLop.size(); i++) {
            tenLopArr[i + 1] = dsLop.get(i).maLopHocPhan + " - " + dsLop.get(i).tenLopHocPhan;
        }
        Spinner spLop = new Spinner(context);
        spLop.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, tenLopArr));
        spLop.setSelection(Math.min(viTriLopChon, tenLopArr.length - 1), false);
        spLop.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                viTriLopChon = position;
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });
        theCauHinh.addView(spLop);

        // Chọn mức độ giải thích
        final String[] maMucDo = {"CO_BAN", "TRUNG_BINH", "NANG_CAO"};
        String[] nhanMucDo = {
            "Mức độ giải thích: Cơ bản (Trực quan)",
            "Mức độ giải thích: Trung bình (Chuẩn chương trình)",
            "Mức độ giải thích: Nâng cao (Chuyên sâu)"
        };
        Spinner spMucDo = new Spinner(context);
        spMucDo.setAdapter(new ArrayAdapter<>(context, android.R.layout.simple_spinner_dropdown_item, nhanMucDo));
        spMucDo.setSelection(viTriMucDoChon, false);
        spMucDo.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                viTriMucDoChon = position;
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });
        theCauHinh.addView(spMucDo);

        // Chọn phiên hoặc Tạo phiên mới
        LinearLayout hangPhien = new LinearLayout(context);
        hangPhien.setOrientation(LinearLayout.HORIZONTAL);
        hangPhien.setGravity(Gravity.CENTER_VERTICAL);

        Button btnPhienMoi = TaoGiaoDienWarmMinimal.taoNutPhu(context, "+ Phiên hỏi đáp mới");
        btnPhienMoi.setOnClickListener(v -> {
            idPhienHienTai = null;
            dsTinNhan = new ArrayList<>();
            goiYCauHoi = new ArrayList<>();
            veGiaoDien();
        });
        hangPhien.addView(btnPhienMoi);

        if (!dsPhien.isEmpty()) {
            Button btnChonPhien = TaoGiaoDienWarmMinimal.taoNutPhu(
                context,
                "Lịch sử (" + dsPhien.size() + " phiên)"
            );
            LinearLayout.LayoutParams p = (LinearLayout.LayoutParams) btnChonPhien.getLayoutParams();
            p.leftMargin = TaoGiaoDienWarmMinimal.dp(context, 8);
            btnChonPhien.setLayoutParams(p);
            btnChonPhien.setOnClickListener(v -> {
                String[] tieuDePhien = new String[dsPhien.size()];
                for (int i = 0; i < dsPhien.size(); i++) {
                    tieuDePhien[i] = dsPhien.get(i).tieuDe;
                }
                new androidx.appcompat.app.AlertDialog.Builder(context)
                    .setTitle("Chọn phiên hội thoại")
                    .setItems(tieuDePhien, (d, which) -> taiChiTietPhien(dsPhien.get(which).id))
                    .setNegativeButton("Đóng", null)
                    .show();
            });
            hangPhien.addView(btnChonPhien);
        }

        theCauHinh.addView(hangPhien);
        khungChinh.addView(theCauHinh);

        // 2. Ô đặt câu hỏi
        LinearLayout theHoi = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
        theHoi.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "ĐẶT CÂU HỎI HỌC THUẬT"));
        EditText edtCauHoi = TaoGiaoDienWarmMinimal.taoONhap(
            context,
            "Nhập câu hỏi về bài giảng, công thức hoặc bài tập..."
        );
        edtCauHoi.setMinLines(2);
        theHoi.addView(edtCauHoi);

        Button btnGui = TaoGiaoDienWarmMinimal.taoNutChinh(
            context,
            dangGuiCauHoi ? "Đang tra cứu học liệu..." : "Gửi câu hỏi tra cứu"
        );
        btnGui.setEnabled(!dangGuiCauHoi);
        btnGui.setOnClickListener(v -> {
            String cauHoi = edtCauHoi.getText().toString().trim();
            if (cauHoi.isEmpty()) {
                ThongBaoToast.hienThi(context, "Vui lòng nhập câu hỏi");
                return;
            }
            guiCauHoiAi(cauHoi, maMucDo[viTriMucDoChon]);
        });
        theHoi.addView(btnGui);

        // Các gợi ý câu hỏi tiếp theo (nếu có)
        if (goiYCauHoi != null && !goiYCauHoi.isEmpty()) {
            theHoi.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
            theHoi.addView(TaoGiaoDienWarmMinimal.taoEyebrow(context, "CÂU HỎI GỢI Ý TIẾP THEO"));
            for (String gy : goiYCauHoi) {
                TextView tvGy = TaoGiaoDienWarmMinimal.taoVanBanMoTa(context, "→ " + gy);
                tvGy.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 4), 0, TaoGiaoDienWarmMinimal.dp(context, 4));
                tvGy.setOnClickListener(v -> guiCauHoiAi(gy, maMucDo[viTriMucDoChon]));
                theHoi.addView(tvGy);
            }
        }
        khungChinh.addView(theHoi);

        // 3. Lịch sử tin nhắn & Nguồn trích dẫn học liệu
        if (dsTinNhan.isEmpty()) {
            khungChinh.addView(TaoGiaoDienWarmMinimal.taoKhungTrangThaiRong(
                context,
                "Bắt đầu phiên tra cứu học liệu",
                "Mọi câu trả lời đều được đối chiếu và trích dẫn trực tiếp từ tài liệu lớp học phần của bạn."
            ));
            return;
        }

        for (MoHinhTrucTuyenVaAi.TinNhanTroLy tn : dsTinNhan) {
            LinearLayout card = TaoGiaoDienWarmMinimal.taoTheBeMat(context);
            boolean laNguoiDung = "user".equalsIgnoreCase(tn.vaiTro);

            card.addView(TaoGiaoDienWarmMinimal.taoNhanTrangThai(
                context,
                laNguoiDung ? "CÂU HỎI CỦA BẠN" : "PHẢN HỒI TỪ HỌC LIỆU",
                laNguoiDung ? "info" : "accent"
            ));

            TextView tvNd = TaoGiaoDienWarmMinimal.taoVanBanMoTa(context, tn.noiDung);
            tvNd.setPadding(0, TaoGiaoDienWarmMinimal.dp(context, 6), 0, TaoGiaoDienWarmMinimal.dp(context, 4));
            card.addView(tvNd);

            if (tn.trichDan != null && !tn.trichDan.isEmpty()) {
                card.addView(TaoGiaoDienWarmMinimal.taoDuongKeNgang(context));
                card.addView(TaoGiaoDienWarmMinimal.taoEyebrow(
                    context,
                    "NGUỒN TRÍCH DẪN TÀI LIỆU (" + tn.trichDan.size() + ")"
                ));
                for (MoHinhTrucTuyenVaAi.NguonTrichDan td : tn.trichDan) {
                    String doKhop = String.format(Locale.US, "%.0f%%", td.doTuongDong * 100);
                    card.addView(TaoGiaoDienWarmMinimal.taoVanBanPhu(
                        context,
                        "• [" + td.tieuDeTaiLieu + " - Độ tương đồng " + doKhop + "]: " + td.noiDung
                    ));
                }
            }

            khungChinh.addView(card);
        }
    }

    private void guiCauHoiAi(String cauHoi, String mucDo) {
        Context context = getContext();
        if (context == null) {
            return;
        }
        dangGuiCauHoi = true;
        veGiaoDien();

        String idLopNgucanh = (viTriLopChon > 0 && viTriLopChon <= dsLop.size())
            ? dsLop.get(viTriLopChon - 1).id
            : null;

        RetrofitClient.layDichVu(context)
            .hoiDapAi(new MoHinhTrucTuyenVaAi.YeuCauHoiDapAI(idPhienHienTai, idLopNgucanh, cauHoi, mucDo))
            .enqueue(new Callback<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaHoiDapAI>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaHoiDapAI>> call,
                    Response<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaHoiDapAI>> response
                ) {
                    dangGuiCauHoi = false;
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        MoHinhTrucTuyenVaAi.KetQuaHoiDapAI kq = response.body().layDuLieu();
                        idPhienHienTai = kq.idPhien;
                        goiYCauHoi = kq.goiYCauHoiTiepTheo != null ? kq.goiYCauHoiTiepTheo : new ArrayList<>();
                        taiChiTietPhien(idPhienHienTai);
                    } else {
                        if (getContext() != null) {
                            ThongBaoToast.hienThiDai(
                                getContext(),
                                ThongBaoToast.trichXuatThongDiepLoi(response, "Không thể xử lý câu hỏi")
                            );
                        }
                        veGiaoDien();
                    }
                }

                @Override
                public void onFailure(Call<PhanHoiChuan<MoHinhTrucTuyenVaAi.KetQuaHoiDapAI>> call, Throwable t) {
                    dangGuiCauHoi = false;
                    if (getContext() != null) {
                        ThongBaoToast.hienThi(getContext(), "Lỗi kết nối máy chủ khi hỏi đáp");
                    }
                    veGiaoDien();
                }
            });
    }
}
