<?php

// appV1.0 Rev 7 - Brand produk, normalisasi lowercase, dan setThumbnail untuk foto galeri.

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Produk;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\ProductImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $query = Produk::where('admin_id', auth()->id());

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                  ->orWhere('kategori_produk', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('kategori_produk', $request->category);
        }

        $products = $query->latest()->paginate(10)->withQueryString();
        $categories = Produk::where('admin_id', auth()->id())
            ->select('kategori_produk')
            ->whereNotNull('kategori_produk')
            ->distinct()
            ->orderBy('kategori_produk')
            ->pluck('kategori_produk');

        return Inertia::render('Produk/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
            'routeBase' => 'admin.produk',
        ]);
    }

    public function indexGlobal(Request $request)
    {
        $search = $request->get('search');
        $query = Produk::with('admin');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                  ->orWhere('kategori_produk', 'like', "%{$search}%");
            });
        }

        if ($request->filled('admin_id')) {
            $query->where('admin_id', $request->admin_id);
        }

        if ($request->filled('category')) {
            $query->where('kategori_produk', $request->category);
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
            'filters' => $request->only(['search', 'admin_id', 'category'])
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
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->normalizeData($this->validated($request));
        unset($data['gambar_produk_tambahan']);

        if ($request->hasFile('gambar_produk')) {
            $data['gambar_produk'] = $request->file('gambar_produk')->store('produk', 'public');
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

        if ($request->hasFile('gambar_produk')) {
            $data['gambar_produk'] = $request->file('gambar_produk')->store('produk', 'public');
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
        ]);
    }

    public function update(Request $request, Produk $produk)
    {
        if ($produk->admin_id !== auth()->id()) {
            abort(403);
        }

        $data = $this->normalizeData($this->validated($request));
        unset($data['gambar_produk_tambahan']);
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
            'jumlah_produk'            => 'required|integer|min:0',
            'harga_produk'             => 'required|numeric|min:0',
            'tanggal_masuk'            => 'nullable|date',
            'expired_produk'           => 'nullable|date',
            'deskripsi_produk'         => 'nullable|string|max:3000',
            'gambar_produk'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'gambar_produk_tambahan'   => 'nullable|array|max:7',
            'gambar_produk_tambahan.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
        ];

        if ($withAdmin) {
            $rules['admin_id'] = ['required', Rule::exists('users', 'id')->where('role', 'admin')];
        }

        return $request->validate($rules);
    }

    /** Normalisasi kategori dan brand ke lowercase tanpa spasi berlebih. */
    private function normalizeData(array $data): array
    {
        foreach (['kategori_produk', 'brand_produk'] as $field) {
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

    private function replaceImage(Request $request, Produk $produk, array &$data): void
    {
        if ($request->hasFile('gambar_produk')) {
            if ($produk->gambar_produk) {
                Storage::disk('public')->delete($produk->gambar_produk);
            }
            $data['gambar_produk'] = $request->file('gambar_produk')->store('produk', 'public');
        }
    }

    private function storeAdditionalImages(Request $request, Produk $produk): void
    {
        $images = $request->file('gambar_produk_tambahan', []);
        $startOrder = $produk->images()->max('sort_order') ?? 0;

        foreach ($images as $index => $image) {
            $produk->images()->create([
                'path'       => $image->store('produk', 'public'),
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
