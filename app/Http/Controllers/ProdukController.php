<?php

// appV1.0 Rev 13 - Saran brand dipisah per kategori (kacamata/soflen/air soflen) via existingBrandsByCategory.

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Produk;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\ProductImage;
use App\Services\ImageCompressor;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $adminId = auth()->id();
        $search  = $request->get('search');
        $habis   = $request->boolean('habis', false);
        $query   = Produk::with('images')->where('admin_id', $adminId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                  ->orWhere('kategori_produk', 'like', "%{$search}%");
            });
        }

        $category = array_values(array_filter((array) $request->get('category', [])));
        if (!empty($category)) {
            $query->whereIn('kategori_produk', $category);
        }

        $warna = array_values(array_filter((array) $request->get('warna', [])));
        if (!empty($warna)) {
            $query->whereIn('warna_produk', $warna);
        }

        $diameter = array_values(array_filter((array) $request->get('diameter', [])));
        if (!empty($diameter)) {
            $query->whereIn('diameter_produk', $diameter);
        }

        $bahan = array_values(array_filter((array) $request->get('bahan', [])));
        if (!empty($bahan)) {
            $query->whereIn('bahan_produk', $bahan);
        }

        $minus = array_values(array_filter((array) $request->get('minus', [])));
        if (!empty($minus)) {
            $query->whereIn('minus_produk', $minus);
        }

        if ($habis) {
            $query->where('jumlah_produk', 0);
        }

        $products = $query->latest()->paginate(10)->withQueryString();
        $categories = Produk::where('admin_id', $adminId)
            ->select('kategori_produk')
            ->whereNotNull('kategori_produk')
            ->distinct()
            ->orderBy('kategori_produk')
            ->pluck('kategori_produk');
        $colors = $this->distinctValues('warna_produk', $adminId);
        $diameters = $this->distinctValues('diameter_produk', $adminId);
        $materials = $this->distinctValues('bahan_produk', $adminId);
        $minuses = $this->distinctValues('minus_produk', $adminId);

        // Stok rendah: jumlah_produk > 0 dan ≤ 5
        $lowStockAlerts = Produk::where('admin_id', $adminId)
            ->where('jumlah_produk', '>', 0)
            ->where('jumlah_produk', '<=', 5)
            ->get(['id', 'nama_produk', 'kategori_produk', 'jumlah_produk']);

        // Stok habis: jumlah_produk = 0
        $outOfStockAlerts = Produk::where('admin_id', $adminId)
            ->where('jumlah_produk', 0)
            ->get(['id', 'nama_produk', 'kategori_produk']);

        // Kadaluarsa: expired_produk ≤ 30 hari dari sekarang (termasuk sudah expired)
        $expiringAlerts = Produk::where('admin_id', $adminId)
            ->whereNotNull('expired_produk')
            ->whereDate('expired_produk', '<=', now()->addDays(30)->toDateString())
            ->get(['id', 'nama_produk', 'kategori_produk', 'expired_produk']);

        return Inertia::render('Produk/Index', [
            'products'         => $products,
            'categories'       => $categories,
            'colors'           => $colors,
            'diameters'        => $diameters,
            'materials'        => $materials,
            'minuses'          => $minuses,
            'filters'          => ['search' => $search, 'category' => $category, 'warna' => $warna, 'diameter' => $diameter, 'bahan' => $bahan, 'minus' => $minus, 'habis' => $request->boolean('habis', false)],
            'routeBase'        => 'admin.produk',
            'lowStockAlerts'   => $lowStockAlerts,
            'outOfStockAlerts' => $outOfStockAlerts,
            'expiringAlerts'   => $expiringAlerts,
        ]);
    }

    public function indexGlobal(Request $request)
    {
        $search = $request->get('search');
        $query = Produk::with(['admin', 'images']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                  ->orWhere('kategori_produk', 'like', "%{$search}%");
            });
        }

        if ($request->filled('admin_id')) {
            $query->where('admin_id', $request->admin_id);
        }

        $category = array_values(array_filter((array) $request->get('category', [])));
        if (!empty($category)) {
            $query->whereIn('kategori_produk', $category);
        }

        $warna = array_values(array_filter((array) $request->get('warna', [])));
        if (!empty($warna)) {
            $query->whereIn('warna_produk', $warna);
        }

        $diameter = array_values(array_filter((array) $request->get('diameter', [])));
        if (!empty($diameter)) {
            $query->whereIn('diameter_produk', $diameter);
        }

        $bahan = array_values(array_filter((array) $request->get('bahan', [])));
        if (!empty($bahan)) {
            $query->whereIn('bahan_produk', $bahan);
        }

        $minus = array_values(array_filter((array) $request->get('minus', [])));
        if (!empty($minus)) {
            $query->whereIn('minus_produk', $minus);
        }

        $products = $query->latest()->paginate(15)->withQueryString();
        $admins = User::where('role', 'admin')->orderBy('name')->get(['id', 'name', 'email']);
        $categories = Produk::select('kategori_produk')
            ->whereNotNull('kategori_produk')
            ->distinct()
            ->orderBy('kategori_produk')
            ->pluck('kategori_produk');

        return Inertia::render('SuperAdmin/ProdukGlobal', [
            'products' => $products,
            'admins' => $admins,
            'categories' => $categories,
            'colors' => $this->distinctValues('warna_produk'),
            'diameters' => $this->distinctValues('diameter_produk'),
            'materials' => $this->distinctValues('bahan_produk'),
            'minuses' => $this->distinctValues('minus_produk'),
            'filters' => ['search' => $search, 'admin_id' => $request->get('admin_id', ''), 'category' => $category, 'warna' => $warna, 'diameter' => $diameter, 'bahan' => $bahan, 'minus' => $minus],
        ]);
    }

    public function create()
    {
        $adminId = auth()->id();
        return Inertia::render('Produk/Create', [
            'routeBase' => 'admin.produk',
            'backRoute'  => 'admin.produk.index',
            'admins'     => [],
            'existingCategories' => $this->distinctValues('kategori_produk', $adminId),
            'existingBrands'     => $this->distinctValues('brand_produk', $adminId),
            'existingBrandsByCategory' => $this->brandsByCategory($adminId),
            'existingColors'     => $this->distinctValues('warna_produk', $adminId),
            'existingDiameters'  => $this->distinctValues('diameter_produk', $adminId),
            'existingMaterials'  => $this->distinctValues('bahan_produk', $adminId),
            'existingMinuses'    => $this->distinctValues('minus_produk', $adminId),
        ]);
    }

    public function createGlobal(Request $request)
    {
        return Inertia::render('Produk/Create', [
            'routeBase'      => 'super_admin.produk',
            'backRoute'      => 'super_admin.produk.global',
            'admins'         => User::where('role', 'admin')->orderBy('name')->get(['id', 'name']),
            'selectedAdminId'    => $request->get('admin_id'),
            'existingCategories' => $this->distinctValues('kategori_produk'),
            'existingBrands'     => $this->distinctValues('brand_produk'),
            'existingBrandsByCategory' => $this->brandsByCategory(),
            'existingColors'     => $this->distinctValues('warna_produk'),
            'existingDiameters'  => $this->distinctValues('diameter_produk'),
            'existingMaterials'  => $this->distinctValues('bahan_produk'),
            'existingMinuses'    => $this->distinctValues('minus_produk'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->normalizeData($this->validated($request));
        unset($data['gambar_produk_tambahan']);
        $data['tampil_katalog'] = $request->boolean('tampil_katalog', true);

        if ($request->hasFile('gambar_produk')) {
            $data['gambar_produk'] = ImageCompressor::store($request->file('gambar_produk'), 'produk', 'public');
        }

        $data['admin_id'] = auth()->id();
        $produk = Produk::create($data);
        $this->storeAdditionalImages($request, $produk);
        $this->log('create', $produk);

        return redirect()->route('admin.produk.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function storeGlobal(Request $request)
    {
        $data = $this->normalizeData($this->validated($request, true));
        unset($data['gambar_produk_tambahan']);
        $data['tampil_katalog'] = $request->boolean('tampil_katalog', true);

        if ($request->hasFile('gambar_produk')) {
            $data['gambar_produk'] = ImageCompressor::store($request->file('gambar_produk'), 'produk', 'public');
        }

        $produk = Produk::create($data);
        $this->storeAdditionalImages($request, $produk);
        $this->log('create', $produk);

        return redirect()->route('super_admin.produk.global', ['admin_id' => $produk->admin_id])
            ->with('success', 'Produk cabang berhasil ditambahkan.');
    }

    public function edit(Produk $produk)
    {
        if ($produk->admin_id !== auth()->id()) {
            abort(403);
        }

        $adminId = auth()->id();
        return Inertia::render('Produk/Edit', [
            'produk'     => $produk->load('images'),
            'routeBase'  => 'admin.produk',
            'backRoute'  => 'admin.produk.index',
            'admins'     => [],
            'existingCategories' => $this->distinctValues('kategori_produk', $adminId),
            'existingBrands'     => $this->distinctValues('brand_produk', $adminId),
            'existingBrandsByCategory' => $this->brandsByCategory($adminId),
            'existingColors'     => $this->distinctValues('warna_produk', $adminId),
            'existingDiameters'  => $this->distinctValues('diameter_produk', $adminId),
            'existingMaterials'  => $this->distinctValues('bahan_produk', $adminId),
            'existingMinuses'    => $this->distinctValues('minus_produk', $adminId),
        ]);
    }

    public function show(Produk $produk)
    {
        if ($produk->admin_id !== auth()->id()) {
            abort(403);
        }

        return redirect()->route('admin.produk.edit', $produk);
    }

    public function editGlobal(Produk $produk)
    {
        return Inertia::render('Produk/Edit', [
            'produk'     => $produk->load('images'),
            'routeBase'  => 'super_admin.produk',
            'backRoute'  => 'super_admin.produk.global',
            'admins'     => User::where('role', 'admin')->orderBy('name')->get(['id', 'name']),
            'existingCategories' => $this->distinctValues('kategori_produk'),
            'existingBrands'     => $this->distinctValues('brand_produk'),
            'existingBrandsByCategory' => $this->brandsByCategory(),
            'existingColors'     => $this->distinctValues('warna_produk'),
            'existingDiameters'  => $this->distinctValues('diameter_produk'),
            'existingMaterials'  => $this->distinctValues('bahan_produk'),
            'existingMinuses'    => $this->distinctValues('minus_produk'),
        ]);
    }

    public function update(Request $request, Produk $produk)
    {
        if ($produk->admin_id !== auth()->id()) {
            abort(403);
        }

        $data = $this->normalizeData($this->validated($request));
        unset($data['gambar_produk_tambahan']);
        $data['tampil_katalog'] = $request->boolean('tampil_katalog', true);
        $this->replaceImage($request, $produk, $data);
        $produk->update($data);
        $this->storeAdditionalImages($request, $produk);
        $this->log('update', $produk);

        return redirect()->route('admin.produk.index')->with('success', 'Produk berhasil diupdate.');
    }

    public function updateGlobal(Request $request, Produk $produk)
    {
        $data = $this->normalizeData($this->validated($request, true));
        unset($data['gambar_produk_tambahan']);
        $data['tampil_katalog'] = $request->boolean('tampil_katalog', true);
        $this->replaceImage($request, $produk, $data);
        $produk->update($data);
        $this->storeAdditionalImages($request, $produk);
        $this->log('update', $produk);

        return redirect()->route('super_admin.produk.global', ['admin_id' => $produk->admin_id])
            ->with('success', 'Produk cabang berhasil diupdate.');
    }

    public function destroy(Produk $produk)
    {
        if ($produk->admin_id !== auth()->id() && auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        $produk->load('images');
        Storage::disk('public')->delete(array_filter([
            $produk->gambar_produk,
            ...$produk->images->pluck('path')->all(),
        ]));

        $this->log('delete', $produk);
        $produk->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    public function destroyImage(Produk $produk, ProductImage $productImage)
    {
        if ($produk->admin_id !== auth()->id() && auth()->user()->role !== 'super_admin') {
            abort(403);
        }
        abort_unless($productImage->produk_id === $produk->id, 404);

        Storage::disk('public')->delete($productImage->path);
        $productImage->delete();
        $this->log('delete_image', $produk, ['product_image_id' => $productImage->id]);

        return back()->with('success', 'Foto tambahan produk berhasil dihapus.');
    }

    public function setThumbnail(Produk $produk, ProductImage $productImage)
    {
        if ($produk->admin_id !== auth()->id() && auth()->user()->role !== 'super_admin') {
            abort(403);
        }
        abort_unless($productImage->produk_id === $produk->id, 404);

        // Reset semua foto produk ini, lalu tandai foto yang dipilih
        $produk->images()->update(['is_thumbnail' => false]);
        $productImage->update(['is_thumbnail' => true]);

        return back()->with('success', 'Thumbnail berhasil diperbarui.');
    }

    private function validated(Request $request, bool $withAdmin = false): array
    {
        $rules = [
            'nama_produk'              => 'required|string|max:255',
            'kategori_produk'          => 'required|string|max:255',
            'brand_produk'             => 'nullable|string|max:255',
            'warna_produk'             => 'nullable|string|max:100',
            'diameter_produk'          => 'nullable|string|max:50',
            'bahan_produk'             => 'nullable|string|max:100',
            'minus_produk'             => 'nullable|string|max:50',
            'jumlah_produk'            => 'required|integer|min:0',
            'harga_produk'             => 'required|numeric|min:0',
            'tanggal_masuk'            => 'nullable|date',
            'expired_produk'           => 'nullable|date',
            'deskripsi_produk'         => 'nullable|string|max:3000',
            'gambar_produk'            => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,bmp,avif|max:20480',
            'gambar_produk_tambahan'   => 'nullable|array|max:7',
            'gambar_produk_tambahan.*' => 'file|mimes:jpg,jpeg,png,gif,webp,bmp,avif|max:20480',
            'lebar_lensa'              => 'nullable|integer|min:0|max:999',
            'gagang_hidung'            => 'nullable|integer|min:0|max:999',
            'panjang_gagang'           => 'nullable|integer|min:0|max:999',
            'tampil_katalog'           => 'nullable|boolean',
        ];

        if ($withAdmin) {
            $rules['admin_id'] = ['required', Rule::exists('users', 'id')->where('role', 'admin')];
        }

        return $request->validate($rules);
    }

    /** Normalisasi kategori, brand, warna, diameter, bahan, dan minus ke lowercase tanpa spasi berlebih. */
    private function normalizeData(array $data): array
    {
        foreach (['kategori_produk', 'brand_produk', 'warna_produk', 'diameter_produk', 'bahan_produk', 'minus_produk'] as $field) {
            if (!empty($data[$field])) {
                $data[$field] = strtolower(trim($data[$field])) ?: null;
            }
        }
        return $data;
    }

    /** Ambil nilai distinct dari kolom tertentu, opsional per-admin. */
    private function distinctValues(string $column, ?int $adminId = null): \Illuminate\Support\Collection
    {
        $query = Produk::select($column)
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->distinct()
            ->orderBy($column);

        if ($adminId !== null) {
            $query->where('admin_id', $adminId);
        }

        return $query->pluck($column);
    }

    /** Kelompokkan brand_produk berdasarkan kategori_produk, supaya saran brand terpisah per kategori. */
    private function brandsByCategory(?int $adminId = null): array
    {
        $query = Produk::select('kategori_produk', 'brand_produk')
            ->whereNotNull('kategori_produk')
            ->where('kategori_produk', '!=', '')
            ->whereNotNull('brand_produk')
            ->where('brand_produk', '!=', '')
            ->distinct();

        if ($adminId !== null) {
            $query->where('admin_id', $adminId);
        }

        return $query->get()
            ->groupBy('kategori_produk')
            ->map(fn ($rows) => $rows->pluck('brand_produk')->unique()->sort()->values())
            ->toArray();
    }

    private function replaceImage(Request $request, Produk $produk, array &$data): void
    {
        if ($request->hasFile('gambar_produk')) {
            if ($produk->gambar_produk) {
                Storage::disk('public')->delete($produk->gambar_produk);
            }
            $data['gambar_produk'] = ImageCompressor::store($request->file('gambar_produk'), 'produk', 'public');
        } else {
            // Tidak upload gambar baru saat edit — jangan timpa gambar_produk yang sudah ada dengan null.
            unset($data['gambar_produk']);
        }
    }

    private function storeAdditionalImages(Request $request, Produk $produk): void
    {
        $images = $request->file('gambar_produk_tambahan', []);
        $startOrder = $produk->images()->max('sort_order') ?? 0;

        foreach ($images as $index => $image) {
            $produk->images()->create([
                'path'       => ImageCompressor::store($image, 'produk', 'public'),
                'sort_order' => $startOrder + $index + 1,
            ]);
        }
    }

    private function log(string $action, Produk $produk, array $details = []): void
    {
        ActivityLog::create([
            'user_id'  => auth()->id(),
            'action'   => $action,
            'model'    => Produk::class,
            'model_id' => $produk->id,
            'details'  => array_merge([
                'nama_produk'          => $produk->nama_produk,
                'admin_id'             => $produk->admin_id,
                'jumlah_foto_tambahan' => $produk->images()->count(),
            ], $details),
        ]);
    }
}
