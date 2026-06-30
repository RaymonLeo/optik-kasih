<?php

// appV1.0 Rev 9 - Tambah rute setThumbnail untuk foto produk.

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
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DeletionApprovalController;
use App\Http\Controllers\BranchGalleryController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [PublicController::class, 'index'])->name('home');
Route::get('/katalog', [PublicController::class, 'catalog'])->name('catalog');
Route::get('/katalog/produk/{produk}', [PublicController::class, 'showProduct'])->name('catalog.product.show');

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

    // Notifikasi operasional untuk semua pengguna internal.
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read_all');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');

    // Shared routes (both super_admin and admin can access these)
    // Rute statis pasien harus sebelum resource agar tidak tertukar dengan {pasien}
    Route::get('/pasien/template', [PasienController::class, 'importTemplate'])->name('pasien.template');
    Route::post('/pasien/import', [PasienController::class, 'import'])->name('pasien.import');
    Route::resource('pasien', PasienController::class);
    Route::resource('pasien.kesehatan', KesehatanController::class)->only(['store'])->shallow();
    Route::put('/kesehatan/{kesehatan}', [KesehatanController::class, 'update'])->name('kesehatan.update');
    Route::delete('/kesehatan/{kesehatan}', [KesehatanController::class, 'destroy'])->name('kesehatan.destroy');
    Route::get('api/patient/search', [TransaksiController::class, 'searchPatients'])->name('api.patient.search');
    Route::get('api/patient/code/{kode}', [TransaksiController::class, 'patientByCode'])->name('api.patient.byCode');
    Route::get('api/patient/{patient}/exams', [TransaksiController::class, 'patientExams'])->name('api.patient.exams');
    Route::get('pasien/{patient}/transaksi', [TransaksiController::class, 'byPatient'])->name('transaksi.byPatient');
    
    // Stop impersonation — accessible saat superadmin sedang impersonasi (login sebagai admin)
    Route::post('/impersonate/stop', [SuperAdminController::class, 'stopImpersonation'])->name('impersonate.stop');

    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        // Admin's own resources
        Route::resource('produk', ProdukController::class);
        Route::delete('produk/{produk}/images/{productImage}', [ProdukController::class, 'destroyImage'])->name('produk.images.destroy');
        Route::post('produk/{produk}/images/{productImage}/thumbnail', [ProdukController::class, 'setThumbnail'])->name('produk.images.thumbnail');
        Route::resource('lensa', LensaController::class);
        // transaksi: static routes must come before resource so they aren't swallowed by {transaksi}
        Route::get('transaksi/export', [TransaksiController::class, 'exportExcel'])->name('transaksi.export');
        Route::patch('transaksi/{transaksi}/status', [TransaksiController::class, 'updateStatus'])->name('transaksi.update_status');
        Route::get('transaksi/{transaksi}/print-bon', [TransaksiController::class, 'printBon'])->name('transaksi.print_bon');
        Route::resource('transaksi', TransaksiController::class);
        Route::get('/cabang', [BranchGalleryController::class, 'own'])->name('branch.gallery');
        Route::post('/cabang/photos', [BranchGalleryController::class, 'storeOwn'])->name('branch.photos.store');
        Route::patch('/cabang/photos/{branchPhoto}', [BranchGalleryController::class, 'updateOwn'])->name('branch.photos.update');
        Route::delete('/cabang/photos/{branchPhoto}', [BranchGalleryController::class, 'destroyOwn'])->name('branch.photos.destroy');
    });

    // Super Admin Routes
    Route::middleware('role:super_admin')->prefix('super_admin')->name('super_admin.')->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/history', [SuperAdminController::class, 'history'])->name('history');
        Route::get('/deletion-requests', [DeletionApprovalController::class, 'index'])->name('deletion_requests.index');
        Route::patch('/deletion-requests/{deletionRequest}/approve', [DeletionApprovalController::class, 'approve'])->name('deletion_requests.approve');
        Route::patch('/deletion-requests/{deletionRequest}/reject', [DeletionApprovalController::class, 'reject'])->name('deletion_requests.reject');
        Route::get('admins/{admin}/gallery', [BranchGalleryController::class, 'show'])->name('admins.gallery');
        Route::post('admins/{admin}/gallery/photos', [BranchGalleryController::class, 'storeForAdmin'])->name('admins.gallery.photos.store');
        Route::patch('admins/{admin}/gallery/photos/{branchPhoto}', [BranchGalleryController::class, 'updateForAdmin'])->name('admins.gallery.photos.update');
        Route::delete('admins/{admin}/gallery/photos/{branchPhoto}', [BranchGalleryController::class, 'destroyForAdmin'])->name('admins.gallery.photos.destroy');
        Route::resource('admins', SuperAdminController::class);
        Route::post('admins/{admin}/impersonate', [SuperAdminController::class, 'impersonate'])->name('admins.impersonate');
        
        // Super Admin global resources
        Route::get('produk', [ProdukController::class, 'indexGlobal'])->name('produk.global');
        Route::get('produk/create', [ProdukController::class, 'createGlobal'])->name('produk.create');
        Route::post('produk', [ProdukController::class, 'storeGlobal'])->name('produk.store');
        Route::get('produk/{produk}/edit', [ProdukController::class, 'editGlobal'])->name('produk.edit');
        Route::match(['put', 'patch'], 'produk/{produk}', [ProdukController::class, 'updateGlobal'])->name('produk.update');
        Route::delete('produk/{produk}', [ProdukController::class, 'destroy'])->name('produk.destroy');
        Route::delete('produk/{produk}/images/{productImage}', [ProdukController::class, 'destroyImage'])->name('produk.images.destroy');
        Route::post('produk/{produk}/images/{productImage}/thumbnail', [ProdukController::class, 'setThumbnail'])->name('produk.images.thumbnail');
        Route::get('transaksi', [TransaksiController::class, 'indexGlobal'])->name('transaksi.global');
        Route::get('lensa', [LensaController::class, 'indexGlobal'])->name('lensa.global');
        Route::get('lensa/create', [LensaController::class, 'createGlobal'])->name('lensa.create');
        Route::post('lensa', [LensaController::class, 'storeGlobal'])->name('lensa.store');
        Route::get('lensa/{lensa}/edit', [LensaController::class, 'editGlobal'])->name('lensa.edit');
        Route::match(['put','patch'], 'lensa/{lensa}', [LensaController::class, 'updateGlobal'])->name('lensa.update');
        Route::delete('lensa/{lensa}', [LensaController::class, 'destroy'])->name('lensa.destroy');
    });
});

require __DIR__ . '/auth.php';
