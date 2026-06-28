<?php

// appV1.0 Rev 2 - Dashboard cabang: grafik penjualan harian dengan filter periode.

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

        $produkCount     = Produk::where('admin_id', $adminId)->count();
        $transaksiCount  = Transaksi::where('admin_id', $adminId)->count();
        $totalPendapatan = Transaksi::where('admin_id', $adminId)->sum('harga');
        $totalPengeluaran= Pengeluaran::where('admin_id', $adminId)->sum('jumlah');
        $recentTransaksi = Transaksi::with('pasien')->where('admin_id', $adminId)->latest()->take(5)->get();

        // Grafik penjualan harian
        $period = $request->get('period', '7');
        $days = match ($period) {
            'kemarin' => 1,
            '30'      => 30,
            '365'     => 365,
            default   => 7,
        };

        $chartData = Transaksi::query()
            ->selectRaw('DATE(tanggal_pesan) as tanggal, SUM(harga) as total, COUNT(*) as jumlah')
            ->where('admin_id', $adminId)
            ->where('tanggal_pesan', '>=', now()->subDays($days)->toDateString())
            ->groupByRaw('DATE(tanggal_pesan)')
            ->orderBy('tanggal')
            ->get()
            ->map(fn ($row) => [
                'tanggal' => $row->tanggal,
                'total'   => (float) $row->total,
                'jumlah'  => (int) $row->jumlah,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'branchName' => auth()->user()->name,
            'stats' => [
                'produk'         => $produkCount,
                'transaksi'      => $transaksiCount,
                'pendapatan'     => $totalPendapatan,
                'pengeluaran'    => $totalPengeluaran,
                'recentTransaksi'=> $recentTransaksi,
            ],
            'chartData' => $chartData,
        ]);
    }
}
