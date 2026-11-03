package com.example.smartclassai.giao_dien.xac_thuc;

import android.content.Intent;
import android.os.Bundle;
import android.text.InputType;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.example.smartclassai.MainActivity;
import com.example.smartclassai.R;
import com.example.smartclassai.mang.DichVuApiLms;
import com.example.smartclassai.mang.QuanLyPhien;
import com.example.smartclassai.mang.RetrofitClient;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.mo_hinh.PhanHoiChuan;
import com.example.smartclassai.tien_ich.DinhDangThoiGian;
import com.example.smartclassai.tien_ich.ThongBaoToast;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DangNhapActivity extends AppCompatActivity {

    private static final String MAT_KHAU_DEMO = "MatKhau@123";

    private QuanLyPhien quanLyPhien;
    private EditText edtEmail;
    private EditText edtMatKhau;
    private Button btnDangNhap;
    private ProgressBar thanhTienTrinh;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        quanLyPhien = new QuanLyPhien(this);

        if (quanLyPhien.daDangNhap()) {
            chuyenVaoManHinhChinh();
            return;
        }

        setContentView(R.layout.activity_dang_nhap);

        edtEmail = findViewById(R.id.edtEmail);
        edtMatKhau = findViewById(R.id.edtMatKhau);
        btnDangNhap = findViewById(R.id.btnDangNhap);
        thanhTienTrinh = findViewById(R.id.thanhTienTrinh);

        btnDangNhap.setOnClickListener(v -> thucHienDangNhap());
        findViewById(R.id.btnMoDangKy).setOnClickListener(v -> hienThiHopThoaiDangKy());

        // Gắn 6 nút chọn nhanh tài khoản Demo
        ganNutDemo(R.id.btnDemoHocSinh, "hocsinh1@lms.edu.vn");
        ganNutDemo(R.id.btnDemoGiaoVien, "giaovien1@lms.edu.vn");
        ganNutDemo(R.id.btnDemoPhuHuynh, "phuhuynh1@lms.edu.vn");
        ganNutDemo(R.id.btnDemoGiaoVu, "giaovu@lms.edu.vn");
        ganNutDemo(R.id.btnDemoBanGiamHieu, "bangiamhieu@lms.edu.vn");
        ganNutDemo(R.id.btnDemoAdmin, "admin@lms.edu.vn");
    }

    private void ganNutDemo(int idNut, String emailDemo) {
        View nut = findViewById(idNut);
        if (nut != null) {
            nut.setOnClickListener(v -> {
                edtEmail.setText(emailDemo);
                edtMatKhau.setText(MAT_KHAU_DEMO);
                thucHienDangNhap();
            });
        }
    }

    private void thucHienDangNhap() {
        String email = edtEmail.getText().toString().trim();
        String matKhau = edtMatKhau.getText().toString();

        if (email.isEmpty() || matKhau.isEmpty()) {
            ThongBaoToast.hienThi(this, "Vui lòng nhập đầy đủ Email và Mật khẩu");
            return;
        }

        datTrangThaiTai(true);
        DichVuApiLms api = RetrofitClient.layDichVu(this);
        api.dangNhap(new MoHinhXacThuc.YeuCauDangNhap(email, matKhau))
            .enqueue(new Callback<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>>() {
                @Override
                public void onResponse(
                    Call<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>> call,
                    Response<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>> response
                ) {
                    datTrangThaiTai(false);
                    if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                        MoHinhXacThuc.KetQuaDangNhap kq = response.body().layDuLieu();
                        quanLyPhien.luuPhienDangNhap(kq.accessToken, kq.refreshToken, kq.nguoiDung);
                        String tenVaiTro = kq.nguoiDung != null
                            ? DinhDangThoiGian.tenVaiTroTiengViet(kq.nguoiDung.vaiTro)
                            : "";
                        ThongBaoToast.hienThi(
                            DangNhapActivity.this,
                            "Đăng nhập thành công (" + tenVaiTro + ")"
                        );
                        chuyenVaoManHinhChinh();
                    } else {
                        String loi = ThongBaoToast.trichXuatThongDiepLoi(
                            response,
                            "Email hoặc mật khẩu không chính xác"
                        );
                        ThongBaoToast.hienThiDai(DangNhapActivity.this, loi);
                    }
                }

                @Override
                public void onFailure(
                    Call<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>> call,
                    Throwable t
                ) {
                    datTrangThaiTai(false);
                    ThongBaoToast.hienThiDai(
                        DangNhapActivity.this,
                        "Không thể kết nối máy chủ. Hãy kiểm tra Backend đã được bật chưa."
                    );
                }
            });
    }

    private void hienThiHopThoaiDangKy() {
        LinearLayout khung = new LinearLayout(this);
        khung.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (18 * getResources().getDisplayMetrics().density);
        khung.setPadding(pad, pad, pad, pad);

        EditText edtHoTen = new EditText(this);
        edtHoTen.setHint("Họ và tên (VD: Nguyễn Văn A)");
        khung.addView(edtHoTen);

        EditText edtEmailDk = new EditText(this);
        edtEmailDk.setHint("Email (VD: hocsinh.moi@lms.edu.vn)");
        edtEmailDk.setInputType(InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        khung.addView(edtEmailDk);

        EditText edtSdt = new EditText(this);
        edtSdt.setHint("Số điện thoại (VD: 0987654321)");
        edtSdt.setInputType(InputType.TYPE_CLASS_PHONE);
        khung.addView(edtSdt);

        EditText edtMkDk = new EditText(this);
        edtMkDk.setHint("Mật khẩu (tối thiểu 8 ký tự, chữ hoa, số, ký tự đặc biệt)");
        edtMkDk.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        khung.addView(edtMkDk);

        new AlertDialog.Builder(this)
            .setTitle("Đăng ký tài khoản mới")
            .setView(khung)
            .setPositiveButton("Đăng ký", (dialog, which) -> {
                String hoTen = edtHoTen.getText().toString().trim();
                String email = edtEmailDk.getText().toString().trim();
                String sdt = edtSdt.getText().toString().trim();
                String mk = edtMkDk.getText().toString();

                if (hoTen.isEmpty() || email.isEmpty() || mk.isEmpty()) {
                    ThongBaoToast.hienThi(this, "Vui lòng điền đủ Họ tên, Email và Mật khẩu");
                    return;
                }

                datTrangThaiTai(true);
                RetrofitClient.layDichVu(this)
                    .dangKy(new MoHinhXacThuc.YeuCauDangKy(hoTen, email, sdt.isEmpty() ? null : sdt, mk))
                    .enqueue(new Callback<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>>() {
                        @Override
                        public void onResponse(
                            Call<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>> call,
                            Response<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>> response
                        ) {
                            datTrangThaiTai(false);
                            if (response.isSuccessful() && response.body() != null && response.body().layDuLieu() != null) {
                                MoHinhXacThuc.KetQuaDangNhap kq = response.body().layDuLieu();
                                quanLyPhien.luuPhienDangNhap(kq.accessToken, kq.refreshToken, kq.nguoiDung);
                                ThongBaoToast.hienThi(DangNhapActivity.this, "Đăng ký và đăng nhập thành công");
                                chuyenVaoManHinhChinh();
                            } else {
                                ThongBaoToast.hienThiDai(
                                    DangNhapActivity.this,
                                    ThongBaoToast.trichXuatThongDiepLoi(response, "Không thể đăng ký tài khoản")
                                );
                            }
                        }

                        @Override
                        public void onFailure(
                            Call<PhanHoiChuan<MoHinhXacThuc.KetQuaDangNhap>> call,
                            Throwable t
                        ) {
                            datTrangThaiTai(false);
                            ThongBaoToast.hienThiDai(DangNhapActivity.this, "Lỗi kết nối máy chủ: " + t.getMessage());
                        }
                    });
            })
            .setNegativeButton("Hủy", null)
            .show();
    }

    private void datTrangThaiTai(boolean dangTai) {
        thanhTienTrinh.setVisibility(dangTai ? View.VISIBLE : View.GONE);
        btnDangNhap.setEnabled(!dangTai);
    }

    private void chuyenVaoManHinhChinh() {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }
}
