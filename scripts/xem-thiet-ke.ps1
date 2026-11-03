# Xem và kiểm tra bản thiết kế trong designs/
#
# Cách dùng:
#   .\scripts\xem-thiet-ke.ps1 -Tep "smartclass-ai-web/Trang chu va Dang nhap.html" -TrangThai "?trang=login&theme=light"
#
# Lightpanda (Docker) chạy JavaScript của trang và trả về DOM sau khi chạy, dùng để bắt lỗi
# kịch bản và kiểm tra nội dung đã được dựng. Lightpanda không vẽ điểm ảnh nên ảnh chụp
# dùng Chrome headless có sẵn trên máy.

param(
  [Parameter(Mandatory = $true)][string]$Tep,
  [string]$TrangThai = "",
  [string]$KichThuoc = "1440,900",
  [int]$Cong = 4311,
  [string]$ThuMucAnh = "designs/_anh-xem-truoc"
)

$ErrorActionPreference = "Continue"
$goc = Split-Path -Parent $PSScriptRoot
Set-Location $goc

# 1. Máy chủ xem trước cho thư mục designs/
$dangChay = $false
try { Invoke-WebRequest -UseBasicParsing "http://localhost:$Cong/" -TimeoutSec 2 | Out-Null; $dangChay = $true } catch {}
if (-not $dangChay) {
  Start-Process -WindowStyle Hidden -FilePath "python" -ArgumentList "-m", "http.server", "$Cong", "--directory", "designs"
  Start-Sleep -Seconds 2
}

$duongDan = ($Tep -split "/" | ForEach-Object { [uri]::EscapeDataString($_) }) -join "/"
$urlMay = "http://localhost:$Cong/$duongDan$TrangThai"
$urlDocker = "http://host.docker.internal:$Cong/$duongDan$TrangThai"

# 2. Lightpanda: chạy JavaScript và lấy DOM
Write-Host "== Lightpanda: $urlDocker" -ForegroundColor Cyan
$dom = docker run --rm lightpanda/browser:nightly /bin/lightpanda fetch --dump html $urlDocker 2>&1 | Out-String
$loi = ($dom -split "`n") | Where-Object { $_ -match '\b(error|uncaught|exception)\b' -and $_ -notmatch 'class=|aria-|data-' }
if ($loi) { Write-Host "Phát hiện lỗi:" -ForegroundColor Red; $loi | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" } }
else { Write-Host "Không có lỗi JavaScript. DOM sau khi chạy: $($dom.Length) ký tự." -ForegroundColor Green }

# 3. Chrome headless: chụp ảnh
$chrome = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chrome) { Write-Host "Không tìm thấy Chrome, bỏ qua bước chụp ảnh." -ForegroundColor Yellow; exit 0 }

New-Item -ItemType Directory -Force $ThuMucAnh | Out-Null
$tenAnh = ([IO.Path]::GetFileNameWithoutExtension($Tep) -replace '\s+', '-') + ($TrangThai -replace '[^a-zA-Z0-9]+', '-') + ".png"
$anh = Join-Path (Resolve-Path $ThuMucAnh) $tenAnh

Start-Process -Wait -NoNewWindow -FilePath $chrome -ArgumentList @(
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  "--user-data-dir=$env:TEMP\chrome-xem-thiet-ke",
  "--window-size=$KichThuoc", "--virtual-time-budget=4000",
  "--screenshot=$anh", $urlMay
)
Write-Host "== Ảnh chụp: $anh" -ForegroundColor Cyan
