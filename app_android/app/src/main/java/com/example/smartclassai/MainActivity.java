package com.example.smartclassai;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.GravityCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.fragment.app.Fragment;

import com.example.smartclassai.giao_dien.bang_dieu_khien.BangDieuKhienFragment;
import com.example.smartclassai.giao_dien.ho_so.HoSoCaNhanFragment;
import com.example.smartclassai.giao_dien.lop_hoc_phan.LopHocPhanFragment;
import com.example.smartclassai.giao_dien.phong_truc_tuyen.PhongTrucTuyenFragment;
import com.example.smartclassai.giao_dien.quan_tri.BaoLoiDongGopFragment;
import com.example.smartclassai.giao_dien.quan_tri.QuanLyHocVuFragment;
import com.example.smartclassai.giao_dien.quan_tri.QuanLyNguoiDungFragment;
import com.example.smartclassai.giao_dien.thoi_khoa_bieu.ThoiKhoaBieuFragment;
import com.example.smartclassai.giao_dien.tro_ly_ai.TroLyAiFragment;
import com.example.smartclassai.giao_dien.xac_thuc.DangNhapActivity;
import com.example.smartclassai.mang.QuanLyPhien;
import com.example.smartclassai.mo_hinh.MoHinhXacThuc;
import com.example.smartclassai.tien_ich.DinhDangThoiGian;
import com.example.smartclassai.tien_ich.ThongBaoToast;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationView;

public class MainActivity extends AppCompatActivity {

    private DrawerLayout drawerLayout;
    private NavigationView navigationView;
    private BottomNavigationView bottomNav;
    private TextView tvTieuDeTrang;
    private TextView tvNhanVaiTroTop;
    private QuanLyPhien quanLyPhien;
    private boolean dangDongBoMenu = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        quanLyPhien = new QuanLyPhien(this);

        if (!quanLyPhien.daDangNhap()) {
            chuyenVeDangNhap();
            return;
        }

        WindowCompat.enableEdgeToEdge(getWindow());
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        drawerLayout = findViewById(R.id.drawerLayout);
        navigationView = findViewById(R.id.navigationView);
        bottomNav = findViewById(R.id.bottomNav);
        tvTieuDeTrang = findViewById(R.id.tvTieuDeTrang);
        tvNhanVaiTroTop = findViewById(R.id.tvNhanVaiTroTop);

        findViewById(R.id.btnMoMenu).setOnClickListener(v -> drawerLayout.openDrawer(GravityCompat.START));
        tvNhanVaiTroTop.setOnClickListener(v -> chonMucMenu(R.id.nav_ho_so));

        capNhatThongTinNguoiDungVaMenu();

        navigationView.setNavigationItemSelectedListener(item -> {
            drawerLayout.closeDrawer(GravityCompat.START);
            return xuLyChonMenu(item.getItemId());
        });

        bottomNav.setOnItemSelectedListener(item -> {
            if (dangDongBoMenu) {
                return true;
            }
            return xuLyChonMenu(item.getItemId());
        });

        if (savedInstanceState == null) {
            chonMucMenu(R.id.nav_bang_dieu_khien);
        }
    }

    private void capNhatThongTinNguoiDungVaMenu() {
        MoHinhXacThuc.NguoiDung nd = quanLyPhien.layNguoiDung();
        String vaiTro = nd != null && nd.vaiTro != null ? nd.vaiTro : "HOC_SINH";
        String tenVaiTro = DinhDangThoiGian.tenVaiTroTiengViet(vaiTro);

        tvNhanVaiTroTop.setText(tenVaiTro);

        View header = navigationView.getHeaderView(0);
        if (header != null && nd != null) {
            TextView tvChuCai = header.findViewById(R.id.tvChuCaiDauHeader);
            TextView tvHoTen = header.findViewById(R.id.tvHoTenHeader);
            TextView tvEmail = header.findViewById(R.id.tvEmailHeader);
            TextView tvVaiTro = header.findViewById(R.id.tvVaiTroHeader);
            TextView tvMayChu = header.findViewById(R.id.tvMayChuHeader);

            tvChuCai.setText(DinhDangThoiGian.chuCaiDau(nd.hoTen));
            tvHoTen.setText(nd.hoTen);
            tvEmail.setText(nd.email);
            tvVaiTro.setText(tenVaiTro);
            tvMayChu.setText(quanLyPhien.layUrlGocMayChu());
        }

        // Phân quyền hiển thị các mục Quản trị hệ thống theo vai trò
        Menu menu = navigationView.getMenu();
        boolean coQuyenQuanTri = QuanLyPhien.laQuanTriHoacGiaoVu(vaiTro);
        MenuItem itemNguoiDung = menu.findItem(R.id.nav_nguoi_dung);
        MenuItem itemHocVu = menu.findItem(R.id.nav_hoc_vu);
        if (itemNguoiDung != null) {
            itemNguoiDung.setVisible(coQuyenQuanTri);
        }
        if (itemHocVu != null) {
            itemHocVu.setVisible(coQuyenQuanTri);
        }
    }

    private void chonMucMenu(int itemId) {
        xuLyChonMenu(itemId);
    }

    private boolean xuLyChonMenu(int itemId) {
        if (itemId == R.id.nav_dang_xuat) {
            quanLyPhien.xoaPhien();
            ThongBaoToast.hienThi(this, "Đã đăng xuất tài khoản");
            chuyenVeDangNhap();
            return true;
        }

        Fragment fragment;
        String tieuDe;

        if (itemId == R.id.nav_lop_hoc_phan) {
            fragment = new LopHocPhanFragment();
            tieuDe = "Lớp học phần";
        } else if (itemId == R.id.nav_thoi_khoa_bieu) {
            fragment = new ThoiKhoaBieuFragment();
            tieuDe = "Thời khóa biểu & Điểm danh";
        } else if (itemId == R.id.nav_phong_truc_tuyen) {
            fragment = new PhongTrucTuyenFragment();
            tieuDe = "Phòng học trực tuyến";
        } else if (itemId == R.id.nav_tro_ly_ai) {
            fragment = new TroLyAiFragment();
            tieuDe = "Trợ lý học tập AI";
        } else if (itemId == R.id.nav_nguoi_dung) {
            fragment = new QuanLyNguoiDungFragment();
            tieuDe = "Quản lý Người dùng";
        } else if (itemId == R.id.nav_hoc_vu) {
            fragment = new QuanLyHocVuFragment();
            tieuDe = "Quản lý Học vụ";
        } else if (itemId == R.id.nav_bao_loi) {
            fragment = new BaoLoiDongGopFragment();
            tieuDe = "Góp ý & Báo lỗi";
        } else if (itemId == R.id.nav_ho_so) {
            fragment = new HoSoCaNhanFragment();
            tieuDe = "Hồ sơ & Thiết bị";
        } else {
            fragment = new BangDieuKhienFragment();
            tieuDe = "Tổng quan & Thông báo";
            itemId = R.id.nav_bang_dieu_khien;
        }

        tvTieuDeTrang.setText(tieuDe);
        navigationView.setCheckedItem(itemId);

        if (itemId == R.id.nav_bang_dieu_khien
            || itemId == R.id.nav_lop_hoc_phan
            || itemId == R.id.nav_thoi_khoa_bieu
            || itemId == R.id.nav_tro_ly_ai) {
            dangDongBoMenu = true;
            bottomNav.setSelectedItemId(itemId);
            dangDongBoMenu = false;
        }

        getSupportFragmentManager()
            .beginTransaction()
            .replace(R.id.khungNoiDung, fragment)
            .commit();

        return true;
    }

    private void chuyenVeDangNhap() {
        Intent intent = new Intent(this, DangNhapActivity.class);
        startActivity(intent);
        finish();
    }
}
