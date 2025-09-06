<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PasienController;
use App\Http\Controllers\KesehatanController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\LensaController;
use App\Http\Controllers\TransaksiController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    // Profile
    Route::get('/profile',   [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile',[ProfileController::class, 'destroy'])->name('profile.destroy');

    // Inertia pages
    Route::resource('pasien', PasienController::class);
    Route::resource('produk', ProdukController::class);
    Route::resource('lensa',  LensaController::class);
    Route::resource('transaksi', TransaksiController::class);

    // daftar transaksi milik satu pasien (opsional, untuk tombol di detail pasien)
    Route::get('transaksi/pasien/{patient}', [TransaksiController::class, 'byPatient'])
        ->name('transaksi.byPatient');

    // kesehatan nested (create saja), update/destroy pakai id tunggal
    Route::resource('pasien.kesehatan', KesehatanController::class)->only(['store'])->shallow();
    Route::put   ('/kesehatan/{kesehatan}', [KesehatanController::class, 'update'])->name('kesehatan.update');
    Route::delete('/kesehatan/{kesehatan}', [KesehatanController::class, 'destroy'])->name('kesehatan.destroy');

    // --- API kecil untuk form ---
    Route::get('api/patient/by-code/{kode}',   [TransaksiController::class, 'patientByCode'])->name('api.patient.byCode');
    Route::get('api/patient/search',           [TransaksiController::class, 'searchPatients'])->name('api.patient.search');
    Route::get('api/patient/{patient}/exams',  [TransaksiController::class, 'patientExams'])->name('api.patient.exams');

    // autocomplete lensa (opsional, dipakai kalau mau dropdown pada Transaksi)
    Route::get('api/lensa/search', [LensaController::class, 'search'])->name('api.lensa.search');
});

require __DIR__.'/auth.php';
