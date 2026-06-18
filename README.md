# appV1.0 Rev 2 - Setup Optik Kasih

# Optik Kasih Management System

Website ini digunakan untuk manajemen toko Optik Kasih, pengelolaan cabang/admin, produk, lensa, transaksi, pasien, dan katalog produk publik berdasarkan cabang.

## Akun Superadmin

Seeder proyek membuat akun superadmin utama berikut:

- Nama: `Optik Kasih`
- Email: `optikasih@gmail.com`
- Password awal: `rahasia`
- Role: `super_admin`
- Status email: sudah terverifikasi

Seeder tidak menimpa password jika akun `optikasih@gmail.com` sudah ada. Jadi setelah password diganti lewat profil atau reset password, menjalankan seeder ulang tidak akan mengembalikan password ke `rahasia`.

Email superadmin dikunci ke `optikasih@gmail.com`. Jangan mengganti email ini dari database kecuali memang ingin memindahkan kepemilikan superadmin dan sudah menyiapkan email pengganti di `.env`.

## Langkah Setup Superadmin

1. Pastikan `.env` sudah tersedia dari `.env.example`.
2. Sesuaikan database di `.env`.
3. Jalankan migration dan seeder:

```bash
php artisan migrate --seed
```

4. Login lewat `/superlogin` atau route login aplikasi dengan:

```text
Email: optikasih@gmail.com
Password: rahasia
```

5. Setelah login pertama, ganti password dari menu profil agar password awal tidak dipakai terus.

## Langkah Setup Email Reset Password Gmail

1. Masuk ke akun Google `optikasih@gmail.com`.
2. Aktifkan 2-Step Verification di Google Account.
3. Buat App Password untuk aplikasi Laravel.
4. Isi `.env` seperti contoh berikut:

```env
APP_NAME="Optik Kasih"
APP_URL=http://localhost:8000

MAIL_MAILER=smtp
MAIL_SCHEME=null
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=optikasih@gmail.com
MAIL_PASSWORD="isi_dengan_google_app_password"
MAIL_FROM_ADDRESS="optikasih@gmail.com"
MAIL_FROM_NAME="${APP_NAME}"

SUPER_ADMIN_NAME="Optik Kasih"
SUPER_ADMIN_EMAIL="optikasih@gmail.com"
SUPER_ADMIN_INITIAL_PASSWORD="rahasia"
```

5. Bersihkan cache konfigurasi:

```bash
php artisan config:clear
```

6. Uji dari halaman `Lupa Password` memakai email `optikasih@gmail.com`.

## Koneksi Total Superadmin ke Email

Setelah konfigurasi Gmail aktif, sistem melakukan hal berikut:

- Reset password superadmin mengirim link ke `optikasih@gmail.com`.
- Setelah password berhasil diubah dari profil, sistem mengirim notifikasi keamanan ke email akun tersebut.
- Setelah password berhasil direset dari link email, sistem mengirim notifikasi keamanan ke email akun tersebut.
- Perubahan profil superadmin mengirim notifikasi keamanan ke `optikasih@gmail.com`.
- Email superadmin tidak bisa diganti dari halaman profil agar reset password dan pemulihan akses tetap melekat ke akun toko.

Jika email tidak masuk, cek urutan berikut:

1. Pastikan `MAIL_MAILER=smtp`.
2. Pastikan `MAIL_HOST=smtp.gmail.com` dan `MAIL_PORT=587`.
3. Pastikan `MAIL_USERNAME=optikasih@gmail.com`.
4. Pastikan `MAIL_PASSWORD` berisi Google App Password, bukan password login Gmail biasa.
5. Jalankan `php artisan config:clear`.
6. Cek `storage/logs/laravel.log` jika masih gagal.

## Splash Screen

Splash screen global berada di `resources/js/Components/AppSplashScreen.jsx` dan dipasang di `resources/js/app.jsx`. Splash screen muncul saat initial load singkat dan saat navigasi Inertia sedang mengambil data, lalu hilang otomatis setelah proses selesai.

---

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
# optik-kasih
