<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Produk;
use App\Models\Transaksi;
use App\Models\Pengeluaran;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $adminId = auth()->id();
        
        $produkCount = Produk::where('admin_id', $adminId)->count();
        $transaksiCount = Transaksi::where('admin_id', $adminId)->count();
        $totalPendapatan = Transaksi::where('admin_id', $adminId)->sum('harga');
        $totalPengeluaran = Pengeluaran::where('admin_id', $adminId)->sum('jumlah');

        $recentTransaksi = Transaksi::with('pasien')->where('admin_id', $adminId)->latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'produk' => $produkCount,
                'transaksi' => $transaksiCount,
                'pendapatan' => $totalPendapatan,
                'pengeluaran' => $totalPengeluaran,
            ],
            'recentTransaksi' => $recentTransaksi
        ]);
    }
}
