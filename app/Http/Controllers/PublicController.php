<?php

// appV1.0 Rev 7 - Tambah branch_map_link ke detail cabang publik.

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produk;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;

class PublicController extends Controller
{
    public function index(Request $request)
    {
        $admins = $this->publicBranches();

        $selectedBranchId = $request->filled('branch') ? (int) $request->branch : null;

        if ($selectedBranchId && ! $admins->contains('id', $selectedBranchId)) {
            $selectedBranchId = null;
        }

        $baseQuery = Produk::query();

        if ($selectedBranchId) {
            $baseQuery->where('admin_id', $selectedBranchId);
        }

        $query = (clone $baseQuery)->with(['admin', 'images']);

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

        $products = $query->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Produk $product) => $this->catalogProductPayload($product));

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'products' => $products,
            'categories' => $categories,
            'branches' => $this->branchDetails($admins),
            'contact' => $this->contact(),
            'filters' => [
                'search' => $request->get('search', ''),
                'category' => $request->get('category', ''),
                'branch' => $selectedBranchId ? (string) $selectedBranchId : '',
            ],
        ]);
    }

    public function catalog(Request $request)
    {
        $admins = $this->publicBranches();
        $selectedBranchId = $request->filled('branch') ? (int) $request->branch : (int) optional($admins->first())->id;

        if ($selectedBranchId && ! $admins->contains('id', $selectedBranchId)) {
            $selectedBranchId = (int) optional($admins->first())->id;
        }

        $baseQuery = Produk::query()->with(['admin', 'images']);
        if ($selectedBranchId) {
            $baseQuery->where('admin_id', $selectedBranchId);
        }

        if ($request->filled('search')) {
            $baseQuery->where('nama_produk', 'like', '%' . $request->string('search')->toString() . '%');
        }

        if ($request->filled('category')) {
            $baseQuery->where('kategori_produk', $request->string('category')->toString());
        }

        $sort = $request->string('sort', 'latest')->toString();
        match ($sort) {
            'name_asc' => $baseQuery->orderBy('nama_produk'),
            default => $baseQuery->latest(),
        };

        $categoryQuery = Produk::query();
        if ($selectedBranchId) {
            $categoryQuery->where('admin_id', $selectedBranchId);
        }

        return Inertia::render('Public/Catalog', [
            'products' => $baseQuery
                ->paginate(24)
                ->withQueryString()
                ->through(fn (Produk $product) => $this->catalogProductPayload($product)),
            'categories' => $categoryQuery
                ->whereNotNull('kategori_produk')
                ->select('kategori_produk')
                ->distinct()
                ->orderBy('kategori_produk')
                ->pluck('kategori_produk'),
            'branches' => $this->branchDetails($admins),
            'contact' => $this->contact(),
            'filters' => [
                'branch' => $selectedBranchId ? (string) $selectedBranchId : '',
                'search' => $request->get('search', ''),
                'category' => $request->get('category', ''),
                'sort' => $sort,
            ],
        ]);
    }

    public function showProduct(Produk $produk)
    {
        $produk->load([
            'admin:id,name,role,branch_phone,branch_address,branch_operational_hours,branch_description',
            'images',
        ]);
        abort_unless($produk->admin?->role === 'admin', 404);

        $phone = preg_replace('/\D+/', '', (string) $produk->admin->branch_phone);
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        } elseif (str_starts_with($phone, '8')) {
            $phone = '62' . $phone;
        }
        $whatsappPhone = str_starts_with($phone, '62') && strlen($phone) >= 11 ? $phone : null;

        return Inertia::render('Public/ProductShow', [
            'product' => [
                'id' => $produk->id,
                'name' => $produk->nama_produk,
                'category' => $produk->kategori_produk,
                'description' => $produk->deskripsi_produk,
                'stock' => $produk->jumlah_produk,
                'date_added' => optional($produk->tanggal_masuk)->toDateString(),
                'expiry_date' => optional($produk->expired_produk)->toDateString(),
                'images' => $this->productImages($produk),
            ],
            'branch' => [
                'id' => (string) $produk->admin->id,
                'name' => $produk->admin->name,
                'address' => $produk->admin->branch_address,
                'hours' => $produk->admin->branch_operational_hours,
                'description' => $produk->admin->branch_description,
                'whatsapp_phone' => $whatsappPhone,
            ],
        ]);
    }

    private function publicBranches(): Collection
    {
        return User::query()
            ->where('role', 'admin')
            ->withCount('produk')
            ->with(['branchPhotos' => fn ($query) => $query
                ->where('is_featured', true)
                ->orderBy('sort_order')
                ->orderBy('id')])
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
                'branch_phone',
                'branch_operational_hours',
                'branch_address',
                'branch_description',
                'branch_map_link',
            ]);
    }

    private function branchDetails(Collection $admins): Collection
    {
        return $admins->map(function (User $admin) {
            return [
                'id' => (string) $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'address' => $admin->branch_address,
                'hours' => $admin->branch_operational_hours ?: '10.30-21.00 WIB',
                'phone' => $admin->branch_phone,
                'description' => $admin->branch_description,
                'map_link' => $admin->branch_map_link,
                'product_count' => $admin->produk_count,
                'photos' => $admin->branchPhotos->map(fn ($photo) => [
                    'id' => (string) $photo->id,
                    'url' => Storage::url($photo->path),
                    'caption' => $photo->caption,
                ])->values(),
            ];
        })->values();
    }

    private function contact(): array
    {
        return [
            'address' => 'Jl. Kayu Manis No.27 C, Tampan, Kec. Payung Sekaki, Kota Pekanbaru, Riau 28291',
            'hours' => 'Setiap hari 10.30-21.00 WIB',
            'phone' => '0761 261**XX',
            'since' => '2007',
            'map_embed_url' => 'https://www.google.com/maps?q=Jl.%20Kayu%20Manis%20No.27%20C%2C%20Tampan%2C%20Kec.%20Payung%20Sekaki%2C%20Kota%20Pekanbaru%2C%20Riau%2028291&z=16&output=embed',
            'map_url' => 'https://www.google.com/maps/search/?api=1&query=Jl.+Kayu+Manis+No.27+C%2C+Tampan%2C+Kec.+Payung+Sekaki%2C+Kota+Pekanbaru%2C+Riau+28291',
        ];
    }

    private function productImages(Produk $produk): array
    {
        $images = collect();

        if ($produk->gambar_produk) {
            $images->push([
                'id' => 'cover',
                'url' => Storage::url($produk->gambar_produk),
                'alt' => "Foto utama {$produk->nama_produk}",
            ]);
        }

        return $images->concat($produk->images->map(fn ($image) => [
            'id' => (string) $image->id,
            'url' => Storage::url($image->path),
            'alt' => "Foto {$produk->nama_produk}",
        ]))->values()->all();
    }

    private function catalogProductPayload(Produk $product): array
    {
        return [
            'id' => $product->id,
            'nama_produk' => $product->nama_produk,
            'kategori_produk' => $product->kategori_produk,
            'jumlah_produk' => $product->jumlah_produk,
            'gambar_produk' => $product->gambar_produk,
            'deskripsi_produk' => $product->deskripsi_produk,
            'images' => $product->images->map(fn ($image) => [
                'id' => $image->id,
                'path' => $image->path,
            ])->values(),
            'admin' => $product->admin ? [
                'id' => $product->admin->id,
                'name' => $product->admin->name,
            ] : null,
        ];
    }
}
