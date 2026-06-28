<?php

// appV1.0 Rev 8 - Impersonasi: superadmin dapat masuk langsung ke akun admin cabang.

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Produk;
use App\Models\Transaksi;
use App\Models\Pengeluaran;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SuperAdminController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->get('search', ''));
        $query = User::where('role', 'admin')
            ->withCount(['produk', 'lensa', 'transaksi']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return Inertia::render('SuperAdmin/Admins/Index', [
            'admins' => $query->orderBy('name')->paginate(12)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function dashboard(Request $request)
    {
        $adminCount = User::where('role', 'admin')->count();
        $produkCount = Produk::count();
        $transaksiCount = Transaksi::count();
        $totalPendapatan = Transaksi::sum('harga');
        $totalPengeluaran = Pengeluaran::sum('jumlah');

        $branchId = $request->get('branch_id');
        if ($branchId) {
            $totalPendapatan = Transaksi::where('admin_id', $branchId)->sum('harga');
            $totalPengeluaran = Pengeluaran::where('admin_id', $branchId)->sum('jumlah');
            $transaksiCount = Transaksi::where('admin_id', $branchId)->count();
        }

        // Grafik penjualan harian
        $period = $request->get('period', '7');
        $days = match ($period) {
            'kemarin' => 1,
            '30'      => 30,
            '365'     => 365,
            default   => 7,
        };

        $chartQ = Transaksi::query()
            ->selectRaw('DATE(tanggal_pesan) as tanggal, SUM(harga) as total, COUNT(*) as jumlah')
            ->where('tanggal_pesan', '>=', now()->subDays($days)->toDateString())
            ->groupByRaw('DATE(tanggal_pesan)')
            ->orderBy('tanggal');

        if ($branchId) {
            $chartQ->where('admin_id', $branchId);
        }

        $chartData = $chartQ->get()->map(fn($row) => [
            'tanggal' => $row->tanggal,
            'total'   => (float) $row->total,
            'jumlah'  => (int) $row->jumlah,
        ]);

        $admins = User::where('role', 'admin')->get();

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'admins'      => $adminCount,
                'produk'      => $produkCount,
                'transaksi'   => $transaksiCount,
                'pendapatan'  => $totalPendapatan,
                'pengeluaran' => $totalPengeluaran,
            ],
            'chartData' => $chartData,
            'admins'    => $admins,
            'filters'   => $request->only(['branch_id', 'period']),
        ]);
    }

    public function history(Request $request)
    {
        $query = ActivityLog::with('user')->latest();
        
        if ($request->has('admin_id') && $request->admin_id != '') {
            $query->where('user_id', $request->admin_id);
        }
        if ($request->has('action') && $request->action != '') {
            $query->where('action', $request->action);
        }

        $logs = $query->paginate(20)->withQueryString();
        $admins = User::where('role', 'admin')->get();

        return Inertia::render('SuperAdmin/History', [
            'logs' => $logs,
            'admins' => $admins,
            'filters' => $request->only(['admin_id', 'action'])
        ]);
    }

    public function create()
    {
        return Inertia::render('SuperAdmin/Admins/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'branch_phone' => ['nullable', 'regex:/^(?:0|62)?8\d{8,13}$/'],
            'branch_operational_hours' => ['nullable', 'string', 'max:120'],
            'branch_address' => ['nullable', 'string'],
            'branch_description' => ['nullable', 'string', 'max:2000'],
            'branch_map_link' => ['nullable', 'string', 'max:2000'],
        ]);

        $admin = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'admin',
            'branch_phone' => $data['branch_phone'] ?? null,
            'branch_operational_hours' => $data['branch_operational_hours'] ?? null,
            'branch_address' => $data['branch_address'] ?? null,
            'branch_description' => $data['branch_description'] ?? null,
            'branch_map_link' => $data['branch_map_link'] ?? null,
        ]);

        $this->log('create', $admin);

        return redirect()->route('super_admin.admins.index')->with('success', 'Cabang/admin berhasil ditambahkan.');
    }

    public function show(User $admin)
    {
        abort_unless($admin->role === 'admin', 404);

        $admin->loadCount(['produk', 'lensa', 'transaksi']);
        $recentProducts = Produk::where('admin_id', $admin->id)->latest()->take(6)->get();
        $recentTransactions = Transaksi::with('pasien')->where('admin_id', $admin->id)->latest()->take(6)->get();

        return Inertia::render('SuperAdmin/Admins/Show', [
            'admin' => $admin,
            'recentProducts' => $recentProducts,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    public function edit(User $admin)
    {
        abort_unless($admin->role === 'admin', 404);

        return Inertia::render('SuperAdmin/Admins/Edit', [
            'admin' => $admin->only([
                'id',
                'name',
                'email',
                'branch_phone',
                'branch_operational_hours',
                'branch_address',
                'branch_description',
                'branch_map_link',
            ]),
        ]);
    }

    public function update(Request $request, User $admin)
    {
        abort_unless($admin->role === 'admin', 404);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'branch_phone' => ['nullable', 'regex:/^(?:0|62)?8\d{8,13}$/'],
            'branch_operational_hours' => ['nullable', 'string', 'max:120'],
            'branch_address' => ['nullable', 'string'],
            'branch_description' => ['nullable', 'string', 'max:2000'],
            'branch_map_link' => ['nullable', 'string', 'max:2000'],
        ]);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'branch_phone' => $data['branch_phone'] ?? null,
            'branch_operational_hours' => $data['branch_operational_hours'] ?? null,
            'branch_address' => $data['branch_address'] ?? null,
            'branch_description' => $data['branch_description'] ?? null,
            'branch_map_link' => $data['branch_map_link'] ?? null,
        ];

        if (!empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $admin->update($payload);
        $this->log('update', $admin);

        return redirect()->route('super_admin.admins.index')->with('success', 'Cabang/admin berhasil diperbarui.');
    }

    public function destroy(User $admin)
    {
        abort_unless($admin->role === 'admin', 404);

        $this->log('delete', $admin);
        $admin->delete();

        return redirect()->route('super_admin.admins.index')->with('success', 'Cabang/admin berhasil dihapus.');
    }

    public function impersonate(User $admin)
    {
        abort_unless($admin->role === 'admin', 404);

        session(['impersonating_by' => auth()->id()]);
        auth()->loginUsingId($admin->id);

        return redirect()->route('admin.dashboard');
    }

    public function stopImpersonation()
    {
        $originalId = session('impersonating_by');
        if (! $originalId) {
            return redirect()->route('admin.dashboard');
        }

        auth()->loginUsingId($originalId);
        session()->forget('impersonating_by');

        return redirect()->route('super_admin.admins.index');
    }

    private function log(string $action, User $admin): void
    {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model' => User::class,
            'model_id' => $admin->id,
            'details' => [
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
                'branch_phone' => $admin->branch_phone,
                'branch_address' => $admin->branch_address,
                'branch_description' => $admin->branch_description,
            ],
        ]);
    }
}
