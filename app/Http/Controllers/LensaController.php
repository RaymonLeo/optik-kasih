<?php
// appV1.0 Rev 9 - Wrap log dalam try-catch; tambah stockAlerts untuk notifikasi stok habis.

namespace App\Http\Controllers;

use App\Models\Lensa;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LensaController extends Controller
{
    public function index(Request $r)
    {
        $adminId = auth()->id();
        $q = Lensa::query()->where('admin_id', $adminId);

        $search  = trim($r->get('search', ''));
        $jenis   = trim($r->get('jenis', ''));
        $coating = trim($r->get('coating', ''));

        if ($search !== '') {
            $q->where(function ($x) use ($search) {
                $x->where('nama_lensa',   'like', "%$search%")
                  ->orWhere('jenis_lensa',   'like', "%$search%")
                  ->orWhere('coating_lensa', 'like', "%$search%")
                  ->orWhere('indeks_lensa',  'like', "%$search%");
            });
        }

        if ($jenis   !== '') $q->where('jenis_lensa', $jenis);
        if ($coating !== '') $q->where('coating_lensa', $coating);

        $rows = $q->orderBy('nama_lensa')
                  ->paginate(12)->withQueryString()
                  ->through(fn (Lensa $l) => $this->lensaCard($l));

        $baseQ = Lensa::query()->where('admin_id', $adminId);
        $filterOptions = [
            'jenis'   => (clone $baseQ)->whereNotNull('jenis_lensa')->distinct()->orderBy('jenis_lensa')->pluck('jenis_lensa'),
            'coating' => (clone $baseQ)->whereNotNull('coating_lensa')->distinct()->orderBy('coating_lensa')->pluck('coating_lensa'),
        ];

        $stockAlerts = Lensa::query()
            ->where('admin_id', $adminId)
            ->where('stok_lensa', 0)
            ->get(['id_lensa', 'nama_lensa', 'jenis_lensa', 'coating_lensa']);

        return Inertia::render('Lensa/Index', [
            'rows'          => $rows,
            'filterOptions' => $filterOptions,
            'query'         => compact('search', 'jenis', 'coating'),
            'stockAlerts'   => $stockAlerts,
        ]);
    }

    public function indexGlobal(Request $r)
    {
        $q = Lensa::with('admin');
        $search = trim($r->get('search', ''));

        if ($search !== '') {
            $q->where(function ($x) use ($search) {
                $x->where('nama_lensa',   'like', "%$search%")
                  ->orWhere('jenis_lensa',   'like', "%$search%")
                  ->orWhere('coating_lensa', 'like', "%$search%")
                  ->orWhere('indeks_lensa',  'like', "%$search%");
            });
        }

        if ($r->filled('admin_id')) {
            $q->where('admin_id', $r->admin_id);
        }

        return Inertia::render('SuperAdmin/LensaGlobal', [
            'rows'    => $q->orderBy('nama_lensa')->paginate(15)->withQueryString(),
            'admins'  => User::where('role', 'admin')->orderBy('name')->get(['id', 'name']),
            'filters' => $r->only(['search', 'admin_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Lensa/Create', array_merge($this->lensaOptions(), [
            'routeBase' => 'admin.lensa',
            'backRoute'  => 'admin.lensa.index',
        ]));
    }

    public function createGlobal()
    {
        return Inertia::render('Lensa/Create', array_merge($this->lensaOptions(), [
            'admins'    => User::where('role', 'admin')->orderBy('name')->get(['id', 'name']),
            'routeBase' => 'super_admin.lensa',
            'backRoute'  => 'super_admin.lensa.global',
        ]));
    }

    public function store(Request $r)
    {
        $data = $this->validated($r);

        if ($r->hasFile('gambar_lensa')) {
            $data['gambar_lensa'] = $r->file('gambar_lensa')->store('lensa', 'public');
        }

        $data['admin_id'] = auth()->id();

        $lensa = Lensa::create($data);
        try { $this->log('create', $lensa); } catch (\Throwable $e) {}

        return redirect()->route('admin.lensa.index')->with('success', 'Lensa ditambahkan');
    }

    public function storeGlobal(Request $r)
    {
        $data = $this->validated($r, true);

        if ($r->hasFile('gambar_lensa')) {
            $data['gambar_lensa'] = $r->file('gambar_lensa')->store('lensa', 'public');
        }

        $lensa = Lensa::create($data);
        try { $this->log('create', $lensa); } catch (\Throwable $e) {}

        return redirect()->route('super_admin.lensa.global')->with('success', 'Lensa cabang berhasil ditambahkan');
    }

    public function edit(Lensa $lensa)
    {
        if ($lensa->admin_id !== auth()->id()) abort(403);

        return Inertia::render('Lensa/Edit', array_merge($this->lensaOptions(), [
            'prefill'   => $this->lensaPrefill($lensa),
            'routeBase' => 'admin.lensa',
            'backRoute'  => 'admin.lensa.index',
        ]));
    }

    public function editGlobal(Lensa $lensa)
    {
        return Inertia::render('Lensa/Edit', array_merge($this->lensaOptions(), [
            'prefill'   => $this->lensaPrefill($lensa),
            'admins'    => User::where('role', 'admin')->orderBy('name')->get(['id', 'name']),
            'routeBase' => 'super_admin.lensa',
            'backRoute'  => 'super_admin.lensa.global',
        ]));
    }

    public function update(Request $r, Lensa $lensa)
    {
        if ($lensa->admin_id !== auth()->id()) abort(403);

        $data = $this->validated($r);

        if ($r->hasFile('gambar_lensa')) {
            if ($lensa->gambar_lensa) Storage::disk('public')->delete($lensa->gambar_lensa);
            $data['gambar_lensa'] = $r->file('gambar_lensa')->store('lensa', 'public');
        }

        $lensa->update($data);
        try { $this->log('update', $lensa); } catch (\Throwable $e) {}

        return redirect()->route('admin.lensa.index')->with('success', 'Lensa diupdate');
    }

    public function updateGlobal(Request $r, Lensa $lensa)
    {
        $data = $this->validated($r, true);

        if ($r->hasFile('gambar_lensa')) {
            if ($lensa->gambar_lensa) Storage::disk('public')->delete($lensa->gambar_lensa);
            $data['gambar_lensa'] = $r->file('gambar_lensa')->store('lensa', 'public');
        }

        $lensa->update($data);
        try { $this->log('update', $lensa); } catch (\Throwable $e) {}

        return redirect()->route('super_admin.lensa.global')->with('success', 'Lensa cabang berhasil diupdate');
    }

    public function show(Lensa $lensa)
    {
        if ($lensa->admin_id !== auth()->id()) abort(403);
        return redirect()->route('admin.lensa.edit', $lensa);
    }

    public function destroy(Lensa $lensa)
    {
        if ($lensa->admin_id !== auth()->id() && auth()->user()->role !== 'super_admin') {
            abort(403);
        }

        if ($lensa->gambar_lensa) Storage::disk('public')->delete($lensa->gambar_lensa);
        try { $this->log('delete', $lensa); } catch (\Throwable $e) {}
        $lensa->delete();

        return back()->with('success', 'Lensa dihapus');
    }

    public function search(Request $r)
    {
        $term = trim($r->get('q', ''));
        $q = Lensa::query();
        if ($term !== '') $q->where('nama_lensa', 'like', "%$term%");

        return $q->limit(10)->get(['id_lensa', 'nama_lensa'])->map(fn ($l) => [
            'id' => $l->id_lensa, 'text' => $l->nama_lensa,
        ]);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function lensaOptions(): array
    {
        return [
            'existingNama'    => Lensa::whereNotNull('nama_lensa')->where('nama_lensa','<>','')->distinct()->orderBy('nama_lensa')->pluck('nama_lensa'),
            'existingJenis'   => Lensa::whereNotNull('jenis_lensa')->where('jenis_lensa','<>','')->distinct()->orderBy('jenis_lensa')->pluck('jenis_lensa'),
            'existingCoating' => Lensa::whereNotNull('coating_lensa')->where('coating_lensa','<>','')->distinct()->orderBy('coating_lensa')->pluck('coating_lensa'),
        ];
    }

    private function lensaPrefill(Lensa $lensa): array
    {
        return array_merge(
            $lensa->only([
                'id_lensa','admin_id','nama_lensa','jenis_lensa','coating_lensa','indeks_lensa',
                'stok_lensa','gambar_lensa','deskripsi','tanggal_masuk',
                'sph_lensa','cyl_lensa','axis_lensa','add_lensa','prism_lensa','base_lensa',
            ]),
            ['gambar_url' => $lensa->image_url]
        );
    }

    private function lensaCard(Lensa $l): array
    {
        return [
            'id_lensa'      => $l->id_lensa,
            'nama_lensa'    => $l->nama_lensa,
            'jenis_lensa'   => $l->jenis_lensa,
            'coating_lensa' => $l->coating_lensa,
            'indeks_lensa'  => $l->indeks_lensa,
            'stok_lensa'    => $l->stok_lensa,
            'deskripsi'     => $l->deskripsi,
            'tanggal_masuk' => optional($l->tanggal_masuk)->toDateString(),
            'gambar_url'    => $l->image_url,
            'spec' => [
                'SPH'   => $l->sph_lensa,
                'CYL'   => $l->cyl_lensa,
                'AXIS'  => $l->axis_lensa,
                'ADD'   => $l->add_lensa,
                'PRISM' => $l->prism_lensa,
                'BASE'  => $l->base_lensa,
            ],
        ];
    }

    private function validated(Request $r, bool $withAdmin = false): array
    {
        $rules = [
            'nama_lensa'    => ['nullable', 'string', 'max:120'],
            'jenis_lensa'   => ['nullable', 'string', 'max:120'],
            'coating_lensa' => ['nullable', 'string', 'max:120'],
            'indeks_lensa'  => ['nullable', 'string', 'max:50'],
            'stok_lensa'    => ['nullable', 'integer', 'min:0'],
            'deskripsi'     => ['nullable', 'string'],
            'tanggal_masuk' => ['nullable', 'date'],
            'gambar_lensa'  => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'sph_lensa'     => ['nullable', 'string', 'max:20'],
            'cyl_lensa'     => ['nullable', 'string', 'max:20'],
            'axis_lensa'    => ['nullable', 'string', 'max:20'],
            'add_lensa'     => ['nullable', 'string', 'max:20'],
            'prism_lensa'   => ['nullable', 'string', 'max:20'],
            'base_lensa'    => ['nullable', 'string', 'max:20'],
        ];

        if ($withAdmin) {
            $rules['admin_id'] = ['required', 'exists:users,id'];
        }

        return $r->validate($rules);
    }

    private function log(string $action, Lensa $lensa): void
    {
        ActivityLog::create([
            'user_id'  => auth()->id(),
            'action'   => $action,
            'model'    => Lensa::class,
            'model_id' => $lensa->id_lensa,
            'details'  => ['nama_lensa' => $lensa->nama_lensa, 'admin_id' => $lensa->admin_id],
        ]);
    }
}
