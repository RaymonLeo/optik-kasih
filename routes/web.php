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
use App\Http\Controllers\PublicController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SuperAdminController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [PublicController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Redirect based on role
    Route::get('/dashboard', function () {
        if (auth()->user()->role === 'super_admin') {
            return redirect()->route('super_admin.dashboard');
        }
        return redirect()->route('admin.dashboard');
    })->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Shared routes (both super_admin and admin can access these)
    Route::resource('pasien', PasienController::class);
    Route::resource('pasien.kesehatan', KesehatanController::class)->only(['store'])->shallow();
    Route::put('/kesehatan/{kesehatan}', [KesehatanController::class, 'update'])->name('kesehatan.update');
    Route::delete('/kesehatan/{kesehatan}', [KesehatanController::class, 'destroy'])->name('kesehatan.destroy');
    Route::get('api/patient/search', [TransaksiController::class, 'searchPatients'])->name('api.patient.search');
    Route::get('api/patient/code/{kode}', [TransaksiController::class, 'patientByCode'])->name('api.patient.byCode');
    Route::get('api/patient/{patient}/exams', [TransaksiController::class, 'patientExams'])->name('api.patient.exams');
    Route::get('pasien/{patient}/transaksi', [TransaksiController::class, 'byPatient'])->name('transaksi.byPatient');
    
    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        // Admin's own resources
        Route::resource('produk', ProdukController::class);
        Route::resource('lensa', LensaController::class);
        Route::resource('transaksi', TransaksiController::class);
    });

    // Super Admin Routes
    Route::middleware('role:super_admin')->prefix('super_admin')->name('super_admin.')->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/history', [SuperAdminController::class, 'history'])->name('history');
        Route::resource('admins', SuperAdminController::class);
        
        // Super Admin global resources
        Route::get('produk', [ProdukController::class, 'indexGlobal'])->name('produk.global');
        Route::get('produk/create', [ProdukController::class, 'createGlobal'])->name('produk.create');
        Route::post('produk', [ProdukController::class, 'storeGlobal'])->name('produk.store');
        Route::get('produk/{produk}/edit', [ProdukController::class, 'editGlobal'])->name('produk.edit');
        Route::match(['put', 'patch'], 'produk/{produk}', [ProdukController::class, 'updateGlobal'])->name('produk.update');
        Route::delete('produk/{produk}', [ProdukController::class, 'destroy'])->name('produk.destroy');
        Route::get('transaksi', [TransaksiController::class, 'indexGlobal'])->name('transaksi.global');
        Route::get('lensa', [LensaController::class, 'indexGlobal'])->name('lensa.global');
    });
});

require __DIR__ . '/auth.php';
