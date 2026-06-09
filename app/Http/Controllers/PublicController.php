<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produk;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class PublicController extends Controller
{
    public function index(Request $request)
    {
        $admins = User::where('role', 'admin')
            ->withCount('produk')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
                'branch_phone',
                'branch_operational_hours',
                'branch_address',
            ]);

        $selectedBranchId = $request->filled('branch') ? (int) $request->branch : null;

        if ($selectedBranchId && ! $admins->contains('id', $selectedBranchId)) {
            $selectedBranchId = null;
        }

        $baseQuery = Produk::query();

        if ($selectedBranchId) {
            $baseQuery->where('admin_id', $selectedBranchId);
        }

        $query = (clone $baseQuery)->with('admin');

        // Search by name
        if ($request->has('search') && $request->search != '') {
            $query->where('nama_produk', 'like', '%' . $request->search . '%');
        }

        // Filter by category
        if ($request->has('category') && $request->category != '') {
            $query->where('kategori_produk', $request->category);
        }

        $categories = (clone $baseQuery)
            ->select('kategori_produk')
            ->whereNotNull('kategori_produk')
            ->distinct()
            ->orderBy('kategori_produk')
            ->pluck('kategori_produk');

        $products = $query->latest()->paginate(12)->withQueryString();

        $branchDetails = $admins->map(function ($admin) {
            return [
                'id' => (string) $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'address' => $admin->branch_address,
                'hours' => $admin->branch_operational_hours ?: '10.30-21.00 WIB',
                'phone' => $admin->branch_phone,
                'product_count' => $admin->produk_count,
            ];
        });

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'products' => $products,
            'categories' => $categories,
            'branches' => $branchDetails->values(),
            'contact' => [
                'address' => 'Jl. Kayu Manis No. 27 C, Pekanbaru, Riau, Indonesia',
                'hours' => 'Setiap hari 10.30-21.00 WIB',
                'phone' => '0761 261**XX',
                'since' => '2007',
            ],
            'filters' => [
                'search' => $request->get('search', ''),
                'category' => $request->get('category', ''),
                'branch' => $selectedBranchId ? (string) $selectedBranchId : '',
            ],
        ]);
    }
}
