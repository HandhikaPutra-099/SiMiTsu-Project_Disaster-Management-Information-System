# SiMiTsu — Sistem Mitigasi Tsunami Indonesia

Website statis berbasis HTML, CSS, dan JavaScript biasa. Tidak memakai React, Vite, npm, atau proses build.

## Struktur folder

```text
simitsu-vscode/
├── index.html
├── assets/
│   ├── css/
│   │   ├── style.css              # Tampilan utama
│   │   └── responsive.css         # Penyesuaian tablet dan HP
│   └── js/
│       ├── data.js                # Data historis tsunami dan koordinat peta
│       ├── history.js             # Pengisian tabel riwayat tsunami
│       ├── simulator-controls.js  # Perhitungan parameter simulasi
│       ├── quiz.js                # Kuis kesiapsiagaan
│       ├── cause-animations.js    # Animasi penyebab tsunami
│       ├── simulator-3d.js        # Visualisasi dan kontrol simulasi 3D
│       ├── map.js                 # Peta, lempeng, dan layer sensor
│       └── app.js                 # Inisialisasi dan event halaman
└── README.md
```

## Menjalankan dan mengedit di VS Code

1. Ekstrak ZIP ini.
2. Buka VS Code → **File → Open Folder** → pilih folder `simitsu-vscode`.
3. Buka file `index.html` untuk melihat struktur halaman.
4. Untuk preview yang lebih nyaman, pasang ekstensi **Live Server**, lalu klik kanan `index.html` → **Open with Live Server**.
5. Edit HTML, CSS, atau JavaScript sesuai kebutuhan. Simpan file dan browser akan memuat ulang jika memakai Live Server.

### Bagian mana yang diedit?

- Struktur, teks, dan elemen halaman: `index.html`.
- Warna, font, jarak, kartu, dan komponen desktop: `assets/css/style.css`.
- Layout tablet dan HP: `assets/css/responsive.css`.
- Data historis dan koordinat peta: `assets/js/data.js`.
- Perhitungan simulasi: `assets/js/simulator-controls.js`.
- Bentuk, interaksi, dan animasi: file JavaScript terkait di `assets/js/`.

## Deploy ke Vercel

1. Upload **seluruh isi folder proyek** ke repository GitHub. Jangan hanya mengunggah `index.html`.
2. Pastikan `index.html` berada di root repository, berdampingan dengan folder `assets`.
3. Import repository itu di Vercel.
4. Pilih Framework Preset **Other**.
5. Untuk website statis ini, tidak perlu Build Command. Pastikan Root Directory menunjuk ke folder yang berisi `index.html`.
6. Deploy.

## Deploy ke GitHub Pages

1. Commit dan push seluruh folder proyek ke branch `main`.
2. Di repository GitHub, buka **Settings → Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/(root)`, lalu klik **Save**.

## Catatan

- File `index.html` harus tetap berada di root proyek.
- Folder `assets` harus ikut diunggah agar file CSS dan JavaScript dapat ditemukan.
- Jangan mengubah ejaan atau huruf besar-kecil nama file di satu tempat saja. Jalur di `index.html` harus sesuai dengan nama file sebenarnya.
- Semua library dan tile peta eksternal dimuat melalui CDN, jadi preview dan website perlu koneksi internet untuk fitur tersebut.
- Script menggunakan urutan biasa (`defer`), bukan ES modules, agar fungsi yang dipanggil dari atribut `onclick` HTML tetap tersedia.
