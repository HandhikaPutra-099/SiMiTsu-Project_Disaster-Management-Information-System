# SIMITSU

Sistem edukasi mitigasi tsunami untuk Indonesia. Situs ini memakai HTML, CSS,
dan JavaScript biasa; tidak memerlukan instalasi dependensi atau proses build.

## Menjalankan secara lokal

Jalankan server statis dari folder proyek:

```powershell
py -m http.server 8000
```

Buka `http://localhost:8000`. Jika perintah `py` tidak tersedia, jalankan
`python -m http.server 8000`.

## Deploy ke Vercel

Impor repositori dengan root directory di folder proyek. Pilih **Other** sebagai
Framework Preset, tanpa Build Command, dan gunakan `.` sebagai Output Directory.
File `index.html` dan folder `assets/` akan disajikan langsung.

## Struktur

- `index.html` — halaman utama dan markup antarmuka.
- `assets/css/` — gaya dasar dan tata letak responsif.
- `assets/js/` — data, peta, animasi, simulator, linimasa, dan database.
- `assets/video/` — lokasi untuk aset video berlisensi yang mungkin ditambahkan.

Peta dan tautan katalog memakai layanan NOAA NCEI dan memerlukan koneksi internet.
Titik sensor di peta bersifat ilustratif. Simulator hanya untuk edukasi, bukan
prediksi atau peringatan resmi. Ikuti BMKG, BNPB, dan BPBD setempat.
