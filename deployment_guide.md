# Panduan Deploy 100% Gratis & Bebas Kartu Kredit: Remind Task System

Platform **Render** memerlukan verifikasi kartu kredit untuk mencegah spam bot (meskipun layanannya gratis). Agar Anda **tidak perlu memasukkan kartu kredit sama sekali**, kita akan mendeploy baik **Frontend** maupun **Backend** secara bersamaan sebagai **satu proyek tunggal di Vercel**. 

Vercel **100% gratis** dan tidak meminta informasi kartu kredit saat pendaftaran/deployment biasa!

---

## Bagian 1: Konfigurasi Proyek (Sudah Saya Siapkan)
Saya telah memodifikasi proyek Anda agar siap berjalan di Vercel dalam sekali klik:
1. **`vercel.json`:** Mengatur perutean otomatis sehingga `/` mengarah ke frontend statis Anda, dan `/api/*` mengarah ke server backend Anda sebagai *Serverless Functions*.
2. **`package.json` di root:** Menyediakan dependensi Express dan Mongoose yang dibutuhkan oleh backend agar dapat di-build otomatis oleh Vercel.
3. **`app.js` dinamis:** Mendeteksi otomatis jika berjalan di Vercel, maka dia akan langsung menggunakan endpoint serverless yang sama tanpa konfigurasi manual.

---

## Bagian 2: Langkah Klik-demi-Klik Deploy ke Vercel (Gratis)

Ikuti langkah mudah berikut di browser Anda:

1. **Masuk ke Vercel:**
   * Buka **[vercel.com](https://vercel.com/)** dan pilih **Log In**.
   * Klik tombol **Continue with GitHub** (masuk menggunakan akun GitHub Anda).

2. **Impor Repositori Anda:**
   * Setelah masuk, klik tombol hitam **"Add New..."** di pojok kanan atas, lalu pilih **Project**.
   * Di daftar repositori GitHub yang muncul, cari repositori **`remind-task-system`** Anda, lalu klik tombol **Import**.

3. **Atur Environment Variables (Koneksi Database Cloud):**
   * Di halaman konfigurasi proyek Vercel, klik tulisan **Environment Variables** untuk membuka form.
   * Isi kolom input dengan key dan value berikut untuk menghubungkan database MongoDB Atlas cloud Anda (karena di server Vercel, koneksi MongoDB Atlas berjalan lancar tanpa diblokir ISP lokal):
     * **Key:** `MONGO_URI`
     * **Value:** `mongodb+srv://niraswaraa:n1r45w4r4@cluster0.ssf6oa0.mongodb.net/remind_task_db?retryWrites=true&w=majority&appName=Cluster0`
   * Klik tombol **Add**.

4. **Klik Deploy!**
   * Klik tombol **Deploy** di bagian bawah.
   * Vercel akan memproses penginstalan dan pengunggahan file Anda (kurang dari 1 menit).
   * Setelah selesai, Anda akan melihat animasi kembang api dan tulisan *"Congratulations!"*.

5. **Dapatkan Link Publik:**
   * Klik pada tampilan *preview* gambar website Anda untuk membukanya.
   * Salin alamat URL yang diberikan Vercel di address bar browser Anda (contoh: `https://remind-task-system.vercel.app`).
   * **Link inilah yang dapat Anda berikan langsung ke Dosen Anda.** Dosen Anda akan dapat membuka, membaca, menyimpan, dan menghapus tugas secara online secara real-time!

---

## Bagian 3: Cara Menjalankan untuk Uji Coba di Komputer Lokal

Jika Anda ingin menjalankan dan menguji proyek ini secara lokal di laptop Anda:

1. **Jalankan Backend Lokal (JSON File Database):**
   Buka terminal di VS Code pada folder `backend`, lalu ketik:
   ```powershell
   node server.js
   ```
   *Sistem akan otomatis mendeteksi jika dijalankan di laptop Anda dan menggunakan database file lokal `tasks.json` sehingga terhindar dari pemblokiran ISP Anda.*

2. **Jalankan Frontend Lokal:**
   Buka file `frontend/index.html` dengan ekstensi **Live Server** di VS Code Anda. Aplikasi lokal Anda akan terhubung ke backend lokal port 5000 secara otomatis!
