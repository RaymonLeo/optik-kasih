<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Produk;
use App\Models\User;
use App\Models\ActivityLog;
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
        return Inertia::render('Produk/Create', [
            'routeBase' => 'admin.produk',
            'backRoute' => 'admin.produk.index',
            'admins' => [],
        ]);
    }

    public function createGlobal(Request $request)
    {
        return Inertia::render('Produk/Create', [
            'routeBase' => 'super_admin.produk',
            'backRoute' => 'super_admin.produk.global',
            'admins' => User::where('role', 'admin')->orderBy('name')->get(['id', 'name']),
            'selectedAdminId' => $request->get('admin_id'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        if ($request->hasFile('gambar_produk')) {
            $data['gambar_produk'] = $request->file('gambar_produk')->store('produk', 'public');
        }

        $data['admin_id'] = auth()->id();
        $produk = Produk::create($data);
        $this->log('create', $produk);

        return redirect()->route('admin.produk.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function storeGlobal(Request $request)
    {
        $data = $this->validated($request, true);

        if ($request->hasFile('gambar_produk')) {
            $data['gambar_produk'] = $request->file('gambar_produk')->store('produk', 'public');
        }

        $produk = Produk::create($data);
        $this->log('create', $produk);

        return redirect()->route('super_admin.produk.global', ['admin_id' => $produk->admin_id])
            ->with('success', 'Produk cabang berhasil ditambahkan.');
    }

    public function edit(Produk $produk)
    {
        if ($produk->admin_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Produk/Edit', [
            'produk' => $produk,
            'routeBase' => 'admin.produk',
            'backRoute' => 'admin.produk.index',
            'admins' => [],
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
            'produk' => $produk,
            'routeBase' => 'super_admin.produk',
            'backRoute' => 'super_admin.produk.global',
            'admins' => User::where('role', 'admin')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Produk $produk)
    {
        if ($produk->admin_id !== auth()->id()) {
            abort(403);
        }

        $data = $this->validated($request);
        $this->replaceImage($request, $produk, $data);
        $produk->update($data);
        $this->log('update', $produk);

        return redirect()->route('admin.produk.index')->with('success', 'Produk berhasil diupdate.');
    }

    public function updateGlobal(Request $request, Produk $produk)
    {
        $data = $this->validated($request, true);
        $this->replaceImage($request, $produk, $data);
        $produk->update($data);
        $this->log('update', $produk);

        return redirect()->route('super_admin.produk.global', ['admin_id' => $produk->admin_id])
            ->with('success', 'Produk cabang berhasil diupdate.');
    }

    public function destroy(Produk $produk)
    {
        if ($produk->admin_id !== auth()->id() && auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        if ($produk->gambar_produk) {
            Storage::disk('public')->delete($produk->gambar_produk);
        }

        $this->log('delete', $produk);
        $produk->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    private function validated(Request $request, bool $withAdmin = false): array
    {
        $rules = [
            'nama_produk' => 'required|string|max:255',
            'kategori_produk' => 'required|string|max:255',
            'jumlah_produk' => 'required|integer|min:0',
            'harga_produk' => 'required|numeric|min:0',
            'tanggal_masuk' => 'nullable|date',
            'expired_produk' => 'nullable|date',
            'gambar_produk' => 'nullable|image|max:2048',
        ];

        if ($withAdmin) {
            $rules['admin_id'] = ['required', Rule::exists('users', 'id')->where('role', 'admin')];
        }

        return $request->validate($rules);
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

    private function log(string $action, Produk $produk): void
    {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model' => Produk::class,
            'model_id' => $produk->id,
            'details' => [
                'nama_produk' => $produk->nama_produk,
                'admin_id' => $produk->admin_id,
            ],
        ]);
    }
}
