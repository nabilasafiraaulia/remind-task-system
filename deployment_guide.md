# Panduan Git & Deploy: Remind Task System

Panduan ini berisi petunjuk langkah-demi-langkah untuk menyiapkan repositori Git, mendorong (push) kode ke GitHub, dan mendeploy backend ke Render serta frontend ke Vercel.

---

## Bagian 1: Cek Git & Konfigurasi .gitignore

### 1. Cara Cek Apakah Git Sudah Terinstal
Buka terminal (Command Prompt, PowerShell, atau Git Bash) di laptop Anda, lalu jalankan perintah berikut:
```bash
git --version
```
* **Jika terinstal:** Terminal akan menampilkan versi Git yang terpasang (contoh: `git version 2.40.1.windows.1`).
* **Jika belum terinstal:** Unduh dan instal Git terlebih dahulu melalui situs resmi [git-scm.com](https://git-scm.com/).

### 2. Cara Membuat File `.gitignore` Secara Manual
Kami sudah membuatkan file `.gitignore` otomatis di folder proyek utama dan folder `backend`. Jika Anda ingin membuatnya sendiri di kemudian hari, ikuti cara ini:
* **Menggunakan VS Code:** Klik kanan pada folder `backend` -> **New File** -> beri nama `.gitignore`.
* **Menggunakan Terminal/CMD:** Masuk ke folder backend dan jalankan perintah:
  ```bash
  # Windows PowerShell:
  New-Item -Path .gitignore -ItemType File
  # macOS/Linux/Git Bash:
  touch .gitignore
  ```
* **Isi file `.gitignore`:** Pastikan baris berikut tertulis di dalamnya agar folder instalasi lokal (`node_modules`) dan kunci rahasia (`.env`) tidak ikut terunggah ke internet:
  ```text
  node_modules/
  .env
  .DS_Store
  ```

---

## Bagian 2: Cara Push Proyek ke GitHub

Ikuti urutan perintah terminal berikut untuk membuat repositori Git lokal dan mengirimkannya ke akun GitHub Anda:

1. **Buat Repositori Baru di GitHub:**
   * Masuk ke akun [GitHub](https://github.com/) Anda.
   * Klik tombol **New** (atau **Create repository**).
   * Beri nama repositori (contoh: `remind-task-system`).
   * Biarkan pengaturan lainnya default (jangan centang README, .gitignore, atau lisensi).
   * Klik **Create repository**.
   * Salin URL repositori Anda (contoh: `https://github.com/USERNAME/remind-task-system.git`).

2. **Jalankan Perintah di Terminal Laptop Anda:**
   Buka terminal di **folder root proyek** (`c:\Users\LENOVO\Downloads\Remind Task System\Remind Task System`) dan jalankan baris perintah berikut satu-satu:
   ```bash
   # 1. Inisialisasi repositori Git lokal
   git init

   # 2. Tambahkan semua file proyek ke staging area
   git add .

   # 3. Lakukan commit pertama Anda
   git commit -m "Initial commit - Remind Task System Premium"

   # 4. Ubah nama branch utama menjadi main
   git branch -M main

   # 5. Hubungkan repositori lokal ke GitHub (Ganti URL dengan URL repositori Anda!)
   git remote add origin https://github.com/USERNAME/remind-task-system.git

   # 6. Push (unggah) kode ke GitHub
   git push -u origin main
   ```

---

## Bagian 3: Panduan Deploy Backend ke Render

[Render](https://render.com/) adalah platform cloud gratis yang sangat cocok untuk meng-host API backend berbasis Node.js/Express.

### Langkah Klik-demi-Klik:
1. Masuk ke situs [Render](https://render.com/) dan lakukan **Sign In** menggunakan akun **GitHub** Anda.
2. Di halaman Dashboard Render, klik tombol **New +** (kanan atas) lalu pilih **Web Service**.
3. Hubungkan repositori GitHub Anda:
   * Cari repositori `remind-task-system` yang baru Anda buat, lalu klik **Connect**.
4. Konfigurasikan detail Web Service sebagai berikut:
   * **Name:** `remind-task-backend` (atau nama lain bebas spasi).
   * **Region:** Pilih wilayah terdekat (misal: *Singapore*).
   * **Branch:** `main`
   * **Root Directory:** `backend` *(Sangat Penting! Ini memberi tahu Render bahwa server Anda ada di dalam folder backend).*
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Instance Type:** Pilih **Free** ($0/month).
5. Tambahkan **Environment Variables** (Kunci Konfigurasi):
   * Gulir ke bawah dan klik tombol **Advanced** atau langsung cari bagian **Environment Variables**.
   * Klik **Add Environment Variable** dan isi key-value berikut:
     * **Key:** `MONGO_URI`
     * **Value:** *(Tempelkan string koneksi MongoDB Atlas Cloud Anda di sini)*
     * **Key:** `NODE_ENV`
     * **Value:** `production`
6. Klik tombol **Deploy Web Service** di bagian paling bawah.
7. Tunggu proses build hingga muncul status **Live** (sekitar 2-3 menit).
8. **Salin URL Backend Anda:** Salin URL unik yang dibuat oleh Render (terletak di bagian atas halaman web service Anda, contoh: `https://remind-task-backend.onrender.com`).

---

## Bagian 4: Panduan Deploy Frontend ke Vercel

[Vercel](https://vercel.com/) adalah layanan deployment gratis terbaik untuk situs web statis frontend (HTML, CSS, JS).

### Langkah Klik-demi-Klik:
1. Masuk ke situs [Vercel](https://vercel.com/) dan lakukan **Log In** dengan akun **GitHub** Anda.
2. Di Dashboard Vercel, klik tombol **Add New...** (kanan atas) lalu pilih **Project**.
3. Hubungkan repositori GitHub Anda:
   * Cari repositori `remind-task-system` pada daftar, kemudian klik **Import**.
4. Konfigurasikan proyek frontend sebagai berikut:
   * **Framework Preset:** Pilih **Other** (karena menggunakan HTML/JS murni).
   * **Root Directory:** Klik **Edit** dan pilih folder `frontend`, lalu klik **Continue** *(Sangat Penting! Ini mengarahkan Vercel ke folder frontend).*
   * **Build and Development Settings:** Biarkan default (kosong).
5. Klik tombol **Deploy**.
6. Vercel akan memproses deployment Anda kurang dari 1 menit. Jika sudah selesai, klik tampilan preview situs untuk membukanya.
7. **Salin URL Frontend Anda:** Salin alamat web yang diberikan oleh Vercel (contoh: `https://remind-task-system.vercel.app`).

---

## Bagian 5: Menghubungkan Frontend dan Backend (Langkah Final)

Berkat fitur **Pengaturan API** yang telah kami buat secara dinamis di antarmuka web, Anda tidak perlu mengubah kode program sama sekali saat menghubungkan frontend dan backend!

1. **Hubungkan Frontend ke Backend (Melalui Aplikasi):**
   * Buka URL frontend Anda di Vercel (misal: `https://remind-task-system.vercel.app`).
   * Klik tombol **Pengaturan API** (ikon gir ⚙️ di pojok kanan atas).
   * Tempelkan URL backend Render Anda yang diakhiri dengan `/api/tasks` ke dalam kolom input.
     * Contoh: `https://remind-task-backend.onrender.com/api/tasks`
   * Klik **Simpan Perubahan**.
   * Aplikasi Anda sekarang akan langsung terhubung ke database cloud MongoDB melalui backend Render Anda secara langsung! Status badge API akan berubah menjadi **Connected** (berwarna hijau).

2. **Amankan Backend (Opsional tapi Direkomendasikan):**
   * Untuk keamanan ekstra agar backend Anda hanya menerima data dari web frontend Anda (mencegah pencurian API), buka kembali Dashboard Render Anda.
   * Masuk ke web service backend Anda -> pilih menu **Environment**.
   * Klik **Add Environment Variable**:
     * **Key:** `FRONTEND_URL`
     * **Value:** *(Tempelkan URL Frontend Vercel Anda, misal: `https://remind-task-system.vercel.app`)*
   * Klik **Save Changes**. Render akan melakukan restart otomatis dengan aturan CORS yang aman!
