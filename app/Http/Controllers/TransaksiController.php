<?php

// appV1.0 Rev 6 - Cari pasien juga lewat No. HP; item manual produk lainnya bisa dikategorikan.

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Pasien;
use App\Models\Kesehatan;
use App\Models\Lensa;
use App\Models\Produk;
use App\Models\User;
use App\Models\Pengeluaran;
use App\Models\ActivityLog;
use App\Models\DeletionRequest;
use App\Support\SystemNotifier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class TransaksiController extends Controller
{
    // ─── INDEX ────────────────────────────────────────────────────────────────
    public function index(Request $r)
    {
        $range    = $r->get('range', 'day');
        $date     = $r->get('date');
        $search   = $r->get('search');
        $statusByr = $r->get('status_pembayaran', '');
        $kategori  = $r->get('kategori', '');

        $q = Transaksi::query()
            ->with(['pasien:id,nama_pasien,kode_pasien', 'lensa:id_lensa,nama_lensa', 'produk:id,nama_produk'])
            ->where('admin_id', auth()->id());

        $anchor = $date ? Carbon::parse($date) : now();

        switch ($range) {
            case 'day':   $q->whereDate('tanggal_pesan', $anchor->toDateString()); break;
            case 'week':  $q->whereBetween('tanggal_pesan', [$anchor->copy()->startOfWeek(), $anchor->copy()->endOfWeek()]); break;
            case 'month': $q->whereYear('tanggal_pesan', $anchor->year)->whereMonth('tanggal_pesan', $anchor->month); break;
            case 'year':  $q->whereYear('tanggal_pesan', $anchor->year); break;
            case 'custom':
                if ($date) {
                    $to = $r->get('to', $anchor->toDateString());
                    $q->whereBetween('tanggal_pesan', [$anchor->toDateString(), Carbon::parse($to)->toDateString()]);
                }
                break;
            case 'all':
            default:
                break;
        }

        if ($search) {
            $q->where(function ($x) use ($search) {
                $x->where('id', 'like', "%$search%")
                  ->orWhere('lensa_pelanggan', 'like', "%$search%")
                  ->orWhere('gagang_pelanggan', 'like', "%$search%")
                  ->orWhereHas('pasien', fn ($p) => $p->where('nama_pasien', 'like', "%$search%"));
            });
        }

        if ($statusByr !== '') $q->where('status_pembayaran', $statusByr);
        if ($kategori  !== '') $q->where('kategori_transaksi', $kategori);

        $totalFilter = (clone $q)->sum('harga');

        $transactions = $q->orderByDesc('id')
            ->paginate(10)->withQueryString()
            ->through(fn (Transaksi $t) => $this->transactionCard($t));

        // Pending kacamata: sudah lunas ATAU belum_selesai — perlu perhatian
        $pendingKacamata = Transaksi::query()
            ->with(['pasien:id,nama_pasien,kode_pasien'])
            ->where('admin_id', auth()->id())
            ->where('kategori_transaksi', 'kacamata')
            ->where('status_kacamata', 'sudah_selesai')
            ->where('status_pengambilan', 'belum_diambil')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn ($t) => [
                'id'          => $t->id,
                'nama_pasien' => $t->pasien?->nama_pasien,
                'tanggal'     => optional($t->tanggal_pesan)->format('Y-m-d'),
            ]);

        return Inertia::render('Transaksi/Index', [
            'transactions'    => $transactions,
            'totalHariIni'    => $totalFilter,
            'pendingKacamata' => $pendingKacamata,
            'query' => [
                'range'             => $range,
                'date'              => $anchor->toDateString(),
                'search'            => $search,
                'to'                => $r->get('to'),
                'status_pembayaran' => $statusByr,
                'kategori'          => $kategori,
            ],
        ]);
    }

    public function indexGlobal(Request $r)
    {
        $search    = $r->get('search');
        $range     = $r->get('range', 'all');
        $date      = $r->get('date');
        $to        = $r->get('to');
        $sortHarga = $r->get('sort_harga', 'desc');
        $q         = Transaksi::with(['pasien', 'admin', 'produk', 'lensa']);

        if ($search) {
            $q->where(function ($query) use ($search) {
                $query->where('id', 'like', "%$search%")
                    ->orWhereHas('pasien', fn($p) => $p->where('nama_pasien', 'like', "%$search%"))
                    ->orWhereHas('admin', fn($a) => $a->where('name', 'like', "%$search%"));
            });
        }

        if ($r->filled('admin_id')) {
            $q->where('admin_id', $r->admin_id);
        }

        $anchor = $date ? Carbon::parse($date) : now();
        if ($range === 'day')         $q->whereDate('tanggal_pesan', $anchor->toDateString());
        elseif ($range === 'week')    $q->whereBetween('tanggal_pesan', [$anchor->copy()->startOfWeek(), $anchor->copy()->endOfWeek()]);
        elseif ($range === 'month')   $q->whereYear('tanggal_pesan', $anchor->year)->whereMonth('tanggal_pesan', $anchor->month);
        elseif ($range === 'year')    $q->whereYear('tanggal_pesan', $anchor->year);
        elseif ($range === 'custom' && $date) $q->whereBetween('tanggal_pesan', [$anchor->toDateString(), Carbon::parse($to ?: $date)->toDateString()]);

        $pendapatan = (clone $q)->sum('harga');
        $pengeluaranQuery = Pengeluaran::query();
        if ($r->filled('admin_id')) $pengeluaranQuery->where('admin_id', $r->admin_id);
        if ($range === 'day')         $pengeluaranQuery->whereDate('tanggal', $anchor->toDateString());
        elseif ($range === 'week')    $pengeluaranQuery->whereBetween('tanggal', [$anchor->copy()->startOfWeek(), $anchor->copy()->endOfWeek()]);
        elseif ($range === 'month')   $pengeluaranQuery->whereYear('tanggal', $anchor->year)->whereMonth('tanggal', $anchor->month);
        elseif ($range === 'year')    $pengeluaranQuery->whereYear('tanggal', $anchor->year);
        elseif ($range === 'custom' && $date) $pengeluaranQuery->whereBetween('tanggal', [$anchor->toDateString(), Carbon::parse($to ?: $date)->toDateString()]);

        $pengeluaran = $pengeluaranQuery->sum('jumlah');

        $transactions = $q->orderBy('harga', $sortHarga === 'asc' ? 'asc' : 'desc')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SuperAdmin/TransaksiGlobal', [
            'transactions' => $transactions,
            'admins'       => User::where('role', 'admin')->orderBy('name')->get(['id', 'name']),
            'summary'      => ['pendapatan' => $pendapatan, 'pengeluaran' => $pengeluaran, 'laba' => $pendapatan - $pengeluaran],
            'filters' => [
                'search' => $search, 'admin_id' => $r->get('admin_id', ''),
                'range' => $range, 'date' => $anchor->toDateString(), 'to' => $to, 'sort_harga' => $sortHarga,
            ],
        ]);
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────
    public function create()
    {
        $adminId = auth()->id();

        $produkKacamata = Produk::where('admin_id', $adminId)
            ->where('kategori_produk', 'kacamata')
            ->where('jumlah_produk', '>', 0)
            ->orderBy('nama_produk')
            ->get(['id', 'nama_produk', 'harga_produk', 'jumlah_produk', 'gambar_produk']);

        $produkLainnya = Produk::where('admin_id', $adminId)
            ->where(function ($q) {
                $q->where('kategori_produk', '!=', 'kacamata')->orWhereNull('kategori_produk');
            })
            ->where('jumlah_produk', '>', 0)
            ->orderBy('nama_produk')
            ->get(['id', 'nama_produk', 'kategori_produk', 'harga_produk', 'jumlah_produk', 'gambar_produk']);

        $lensaStok = Lensa::where('admin_id', $adminId)
            ->where(function ($q) {
                $q->where('stok_lensa', '>', 0)->orWhere('is_pesanan', true);
            })
            ->orderByRaw('is_pesanan DESC')->orderBy('nama_lensa')
            ->get(['id_lensa', 'nama_lensa', 'jenis_lensa', 'coating_lensa', 'indeks_lensa', 'stok_lensa', 'is_pesanan', 'gambar_lensa']);

        return Inertia::render('Transaksi/Create', [
            'produkKacamata' => $produkKacamata->map(fn ($p) => [
                'id'           => $p->id,
                'nama_produk'  => $p->nama_produk,
                'harga_produk' => (float) $p->harga_produk,
                'stok'         => $p->jumlah_produk,
                'gambar_url'   => $p->gambar_produk ? asset('storage/'.$p->gambar_produk) : null,
            ]),
            'produkLainnya' => $produkLainnya->map(fn ($p) => [
                'id'            => $p->id,
                'nama_produk'   => $p->nama_produk,
                'kategori'      => $p->kategori_produk,
                'harga_produk'  => (float) $p->harga_produk,
                'stok'          => $p->jumlah_produk,
                'gambar_url'    => $p->gambar_produk ? asset('storage/'.$p->gambar_produk) : null,
            ]),
            'lensaStok' => $lensaStok->map(fn ($l) => [
                'id_lensa'    => $l->id_lensa,
                'nama_lensa'  => $l->nama_lensa,
                'jenis_lensa' => $l->jenis_lensa,
                'coating'     => $l->coating_lensa,
                'indeks'      => $l->indeks_lensa,
                'stok'        => $l->stok_lensa,
                'is_pesanan'  => (bool) $l->is_pesanan,
                'gambar_url'  => $l->gambar_lensa ? asset('storage/'.$l->gambar_lensa) : null,
            ]),
        ]);
    }

    // ─── STORE ────────────────────────────────────────────────────────────────
    public function store(Request $r)
    {
        $type = $r->input('type', 'resep');

        if ($type === 'resep') {
            $data = $r->validate([
                'kode_pasien'        => ['required', 'string', 'exists:pasien,kode_pasien'],
                'tanggal_pesanan'    => ['required', 'date'],
                'tanggal_selesai'    => ['nullable', 'date', 'after_or_equal:tanggal_pesanan'],
                'frame'              => ['nullable', 'string', 'max:200'],
                'lensa'              => ['nullable', 'string', 'max:200'],
                'exam_date'          => ['nullable', 'date'],
                'harga'              => ['required', 'numeric', 'min:0'],
                'panjar'             => ['required', 'numeric', 'min:0'],
                'sisa'               => ['required', 'numeric', 'min:0'],
                'lensa_id'           => ['nullable', Rule::exists('lensa', 'id_lensa')],
                'produk_id'          => ['nullable', 'exists:produk,id'],
                'metode_pembayaran_1'=> ['required', 'string'],
                'metode_pembayaran_2'=> ['nullable', 'string'],
                'jumlah_bayar_1'     => ['nullable', 'numeric', 'min:0'],
                'jumlah_bayar_2'     => ['nullable', 'numeric', 'min:0'],
            ]);

            $pasien = Pasien::where('kode_pasien', $data['kode_pasien'])->firstOrFail();

            $kesehatanId = null;
            if (!empty($data['exam_date'])) {
                $kesehatanId = Kesehatan::where('pasien_id', $pasien->id)
                    ->whereDate('tanggal_periksa', $data['exam_date'])
                    ->value('id');
            }

            $statusByr = ((float)($data['panjar'] ?? 0) > 0 && (float)($data['sisa'] ?? 0) > 0)
                ? 'panjar' : 'lunas';

            $trx = Transaksi::create([
                'pasien_id'           => $pasien->id,
                'produk_id'           => $data['produk_id'] ?? null,
                'kesehatan_id'        => $kesehatanId,
                'lensa_id'            => $data['lensa_id'] ?? null,
                'kategori_transaksi'  => 'kacamata',
                'tanggal_pesan'       => $data['tanggal_pesanan'],
                'tanggal_selesai'     => $data['tanggal_selesai'] ?? null,
                'lensa_pelanggan'     => $data['lensa'] ?? null,
                'gagang_pelanggan'    => $data['frame'] ?? null,
                'harga'               => $data['harga'],
                'panjar'              => $data['panjar'],
                'sisa'                => $data['sisa'],
                'status_pembayaran'   => $statusByr,
                'status_kacamata'     => 'belum_selesai',
                'status_pengambilan'  => 'belum_diambil',
                'admin_id'            => auth()->id(),
                'metode_pembayaran_1' => $data['metode_pembayaran_1'],
                'metode_pembayaran_2' => $data['metode_pembayaran_2'] ?? null,
                'jumlah_bayar_1'      => $data['jumlah_bayar_1'] ?? null,
                'jumlah_bayar_2'      => $data['jumlah_bayar_2'] ?? null,
            ]);

            // Kurangi stok lensa
            if ($trx->lensa_id) {
                Lensa::where('id_lensa', $trx->lensa_id)
                     ->where('stok_lensa', '>', 0)
                     ->decrement('stok_lensa');
            }

            $this->log('create', $trx);
            return redirect()->route('admin.transaksi.show', $trx->id)->with('success', 'Transaksi kacamata tersimpan.');
        }

        // ── produk_lainnya ────────────────────────────────────────────────────
        $data = $r->validate([
            'tanpa_pasien'        => ['boolean'],
            'kode_pasien'         => ['nullable', 'string'],
            'tanggal_pesanan'     => ['required', 'date'],
            'produk_id'           => ['nullable', 'exists:produk,id'],
            'qty'                 => ['nullable', 'integer', 'min:1'],
            'items'               => ['nullable', 'array'],
            'harga'               => ['required', 'numeric', 'min:0'],
            'panjar'              => ['nullable', 'numeric', 'min:0'],
            'sisa'                => ['nullable', 'numeric', 'min:0'],
            'metode_pembayaran_1' => ['required', 'string'],
            'metode_pembayaran_2' => ['nullable', 'string'],
            'jumlah_bayar_1'      => ['nullable', 'numeric', 'min:0'],
            'jumlah_bayar_2'      => ['nullable', 'numeric', 'min:0'],
        ]);

        $patientId = null;
        if (!(bool)($data['tanpa_pasien'] ?? false)) {
            $p = Pasien::where('kode_pasien', $data['kode_pasien'])->first();
            if (!$p) return back()->withErrors(['kode_pasien' => 'Kode pasien tidak ditemukan'])->onlyInput();
            $patientId = $p->id;
        }

        $sisa = $data['sisa'] ?? max(0, (float)$data['harga'] - (float)($data['panjar'] ?? 0));
        $statusByr = ((float)($data['panjar'] ?? 0) > 0 && (float)$sisa > 0) ? 'panjar' : 'lunas';

        $trx = Transaksi::create([
            'pasien_id'           => $patientId,
            'produk_id'           => $data['produk_id'] ?? null,
            'kategori_transaksi'  => 'produk_lainnya',
            'tanggal_pesan'       => $data['tanggal_pesanan'],
            'gagang_pelanggan'    => $this->composeItemsDescription($data['items'] ?? []),
            'harga'               => $data['harga'],
            'panjar'              => $data['panjar'] ?? 0,
            'sisa'                => $sisa,
            'status_pembayaran'   => $statusByr,
            'status_pengambilan'  => 'belum_diambil',
            'admin_id'            => auth()->id(),
            'metode_pembayaran_1' => $data['metode_pembayaran_1'],
            'metode_pembayaran_2' => $data['metode_pembayaran_2'] ?? null,
            'jumlah_bayar_1'      => $data['jumlah_bayar_1'] ?? null,
            'jumlah_bayar_2'      => $data['jumlah_bayar_2'] ?? null,
        ]);

        // Kurangi stok produk
        if ($trx->produk_id) {
            $qty = max(1, (int)($data['qty'] ?? 1));
            Produk::where('id', $trx->produk_id)
                  ->where('jumlah_produk', '>=', $qty)
                  ->decrement('jumlah_produk', $qty);
        }

        $this->log('create', $trx);
        return redirect()->route('admin.transaksi.show', $trx->id)->with('success', 'Transaksi produk tersimpan.');
    }

    // ─── SHOW ─────────────────────────────────────────────────────────────────
    public function show(Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) abort(403);

        $transaksi->load(['pasien', 'kesehatan', 'lensa', 'produk', 'admin']);

        $rx = [];
        if ($transaksi->kesehatan) {
            $rx[] = ['eye'=>'OD','SPH'=>$transaksi->kesehatan->sph_kanan,'CYL'=>$transaksi->kesehatan->cyl_kanan,'AXIS'=>$transaksi->kesehatan->axis_kanan,'PRISM'=>$transaksi->kesehatan->prism_kanan,'BASE'=>$transaksi->kesehatan->base_kanan,'ADD'=>$transaksi->kesehatan->add_kanan,'MPD'=>$transaksi->kesehatan->pd_kanan];
            $rx[] = ['eye'=>'OS','SPH'=>$transaksi->kesehatan->sph_kiri,'CYL'=>$transaksi->kesehatan->cyl_kiri,'AXIS'=>$transaksi->kesehatan->axis_kiri,'PRISM'=>$transaksi->kesehatan->prism_kiri,'BASE'=>$transaksi->kesehatan->base_kiri,'ADD'=>$transaksi->kesehatan->add_kiri,'MPD'=>$transaksi->kesehatan->pd_kiri];
        }

        return Inertia::render('Transaksi/Show', [
            'trx' => [
                'id'                  => $transaksi->id,
                'kode'                => $transaksi->id,
                'kategori_transaksi'  => $transaksi->kategori_transaksi,
                'status_pembayaran'   => $transaksi->status_pembayaran,
                'status_kacamata'     => $transaksi->status_kacamata,
                'status_pengambilan'  => $transaksi->status_pengambilan,
                'tanggal_pesanan'     => optional($transaksi->tanggal_pesan)->format('Y-m-d'),
                'tanggal_selesai'     => optional($transaksi->tanggal_selesai)->format('Y-m-d'),
                'frame'               => $transaksi->gagang_pelanggan,
                'lensa'               => $transaksi->lensa_pelanggan ?: $transaksi->lensa?->nama_lensa,
                'produk'              => $transaksi->produk?->nama_produk,
                'harga'               => $transaksi->harga,
                'panjar'              => $transaksi->panjar,
                'sisa'                => $transaksi->sisa,
                'total'               => max(0, (float)$transaksi->harga - (float)$transaksi->panjar),
                'metode_pembayaran_1' => $transaksi->metode_pembayaran_1,
                'metode_pembayaran_2' => $transaksi->metode_pembayaran_2,
                'branch_name'         => $transaksi->admin?->name,
                'pasien' => $transaksi->pasien ? [
                    'id'          => $transaksi->pasien->id,
                    'kode_pasien' => $transaksi->pasien->kode_pasien,
                    'nama_pasien' => $transaksi->pasien->nama_pasien,
                    'alamat'      => $transaksi->pasien->alamat_pasien,
                    'telepon'     => $transaksi->pasien->nohp_pasien,
                ] : null,
            ],
            'rx'    => $rx,
            'items' => [],
        ]);
    }

    // ─── EDIT ─────────────────────────────────────────────────────────────────
    public function edit(Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) abort(403);

        $transaksi->load(['pasien', 'kesehatan', 'lensa', 'produk']);

        $prefill = [
            'id'                  => $transaksi->id,
            'kode'                => $transaksi->id,
            'type'                => $transaksi->produk_id ? 'produk' : 'resep',
            'tanggal_pesanan'     => optional($transaksi->tanggal_pesan)->format('Y-m-d'),
            'tanggal_selesai'     => optional($transaksi->tanggal_selesai)->format('Y-m-d'),
            'frame'               => $transaksi->gagang_pelanggan,
            'lensa'               => $transaksi->lensa_pelanggan ?: $transaksi->lensa?->nama_lensa,
            'lensa_id'            => $transaksi->lensa_id,
            'harga'               => $transaksi->harga,
            'panjar'              => $transaksi->panjar,
            'sisa'                => $transaksi->sisa,
            'metode_pembayaran_1' => $transaksi->metode_pembayaran_1,
            'metode_pembayaran_2' => $transaksi->metode_pembayaran_2,
            'jumlah_bayar_1'      => $transaksi->jumlah_bayar_1,
            'jumlah_bayar_2'      => $transaksi->jumlah_bayar_2,
            'exam_date'           => optional($transaksi->kesehatan?->tanggal_periksa)->format('Y-m-d'),
            'pasien' => $transaksi->pasien ? [
                'id'          => $transaksi->pasien->id,
                'kode_pasien' => $transaksi->pasien->kode_pasien,
                'nama_pasien' => $transaksi->pasien->nama_pasien,
                'alamat'      => $transaksi->pasien->alamat_pasien,
                'telepon'     => $transaksi->pasien->nohp_pasien,
            ] : null,
        ];

        if ($transaksi->kesehatan) {
            $prefill['rx'] = [
                'OD' => ['SPH'=>$transaksi->kesehatan->sph_kanan,'CYL'=>$transaksi->kesehatan->cyl_kanan,'AXIS'=>$transaksi->kesehatan->axis_kanan,'PRISM'=>$transaksi->kesehatan->prism_kanan,'BASE'=>$transaksi->kesehatan->base_kanan,'ADD'=>$transaksi->kesehatan->add_kanan,'MPD'=>$transaksi->kesehatan->pd_kanan],
                'OS' => ['SPH'=>$transaksi->kesehatan->sph_kiri,'CYL'=>$transaksi->kesehatan->cyl_kiri,'AXIS'=>$transaksi->kesehatan->axis_kiri,'PRISM'=>$transaksi->kesehatan->prism_kiri,'BASE'=>$transaksi->kesehatan->base_kiri,'ADD'=>$transaksi->kesehatan->add_kiri,'MPD'=>$transaksi->kesehatan->pd_kiri],
            ];
        }

        return Inertia::render('Transaksi/Edit', ['prefill' => $prefill]);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    public function update(Request $r, Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) abort(403);

        $type = $r->input('type', $transaksi->produk_id ? 'produk' : 'resep');

        if ($type === 'resep') {
            $data = $r->validate([
                'kode_pasien'         => ['required', 'string', 'exists:pasien,kode_pasien'],
                'tanggal_pesanan'     => ['required', 'date'],
                'tanggal_selesai'     => ['nullable', 'date', 'after_or_equal:tanggal_pesanan'],
                'frame'               => ['nullable', 'string', 'max:200'],
                'lensa'               => ['nullable', 'string', 'max:200'],
                'exam_date'           => ['nullable', 'date'],
                'harga'               => ['required', 'numeric', 'min:0'],
                'panjar'              => ['required', 'numeric', 'min:0'],
                'sisa'                => ['required', 'numeric', 'min:0'],
                'lensa_id'            => ['nullable', Rule::exists('lensa', 'id_lensa')],
                'produk_id'           => ['nullable', 'exists:produk,id'],
                'metode_pembayaran_1' => ['required', 'string'],
                'metode_pembayaran_2' => ['nullable', 'string'],
                'jumlah_bayar_1'      => ['nullable', 'numeric', 'min:0'],
                'jumlah_bayar_2'      => ['nullable', 'numeric', 'min:0'],
            ]);

            $pasien = Pasien::where('kode_pasien', $data['kode_pasien'])->firstOrFail();

            $kesehatanId = null;
            if (!empty($data['exam_date'])) {
                $kesehatanId = Kesehatan::where('pasien_id', $pasien->id)->whereDate('tanggal_periksa', $data['exam_date'])->value('id');
            }

            $statusByr = ((float)($data['panjar'] ?? 0) > 0 && (float)($data['sisa'] ?? 0) > 0) ? 'panjar' : 'lunas';

            $transaksi->update([
                'pasien_id' => $pasien->id, 'produk_id' => $data['produk_id'] ?? null,
                'kesehatan_id' => $kesehatanId, 'lensa_id' => $data['lensa_id'] ?? null,
                'kategori_transaksi' => 'kacamata',
                'tanggal_pesan' => $data['tanggal_pesanan'], 'tanggal_selesai' => $data['tanggal_selesai'] ?? null,
                'lensa_pelanggan' => $data['lensa'] ?? null, 'gagang_pelanggan' => $data['frame'] ?? null,
                'harga' => $data['harga'], 'panjar' => $data['panjar'], 'sisa' => $data['sisa'],
                'status_pembayaran' => $statusByr,
                'metode_pembayaran_1' => $data['metode_pembayaran_1'], 'metode_pembayaran_2' => $data['metode_pembayaran_2'] ?? null,
                'jumlah_bayar_1' => $data['jumlah_bayar_1'] ?? null, 'jumlah_bayar_2' => $data['jumlah_bayar_2'] ?? null,
            ]);

            $this->log('update', $transaksi);
            return redirect()->route('admin.transaksi.show', $transaksi->id)->with('success', 'Transaksi diperbarui.');
        }

        $data = $r->validate([
            'tanpa_pasien' => ['boolean'], 'kode_pasien' => ['nullable', 'string'],
            'tanggal_pesanan' => ['required', 'date'], 'produk_id' => ['nullable', 'exists:produk,id'],
            'items' => ['nullable', 'array'], 'harga' => ['required', 'numeric', 'min:0'],
            'panjar' => ['nullable', 'numeric', 'min:0'], 'sisa' => ['nullable', 'numeric', 'min:0'],
            'metode_pembayaran_1' => ['required', 'string'], 'metode_pembayaran_2' => ['nullable', 'string'],
            'jumlah_bayar_1' => ['nullable', 'numeric', 'min:0'], 'jumlah_bayar_2' => ['nullable', 'numeric', 'min:0'],
        ]);

        $patientId = null;
        if (!(bool)($data['tanpa_pasien'] ?? false)) {
            $p = Pasien::where('kode_pasien', $data['kode_pasien'])->first();
            if (!$p) return back()->withErrors(['kode_pasien' => 'Kode pasien tidak ditemukan'])->onlyInput();
            $patientId = $p->id;
        }

        $sisa = $data['sisa'] ?? max(0, (float)$data['harga'] - (float)($data['panjar'] ?? 0));
        $statusByr = ((float)($data['panjar'] ?? 0) > 0 && (float)$sisa > 0) ? 'panjar' : 'lunas';

        $transaksi->update([
            'pasien_id' => $patientId, 'produk_id' => $data['produk_id'] ?? null,
            'kesehatan_id' => null, 'lensa_id' => null, 'lensa_pelanggan' => null,
            'kategori_transaksi' => 'produk_lainnya',
            'gagang_pelanggan' => $this->composeItemsDescription($data['items'] ?? []),
            'tanggal_pesan' => $data['tanggal_pesanan'], 'harga' => $data['harga'],
            'panjar' => $data['panjar'] ?? 0, 'sisa' => $sisa,
            'status_pembayaran' => $statusByr,
            'metode_pembayaran_1' => $data['metode_pembayaran_1'], 'metode_pembayaran_2' => $data['metode_pembayaran_2'] ?? null,
            'jumlah_bayar_1' => $data['jumlah_bayar_1'] ?? null, 'jumlah_bayar_2' => $data['jumlah_bayar_2'] ?? null,
        ]);

        $this->log('update', $transaksi);
        return redirect()->route('admin.transaksi.show', $transaksi->id)->with('success', 'Transaksi produk diperbarui.');
    }

    // ─── UPDATE STATUS (PATCH) ────────────────────────────────────────────────
    public function updateStatus(Request $r, Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) abort(403);

        $allowed = [
            'status_pembayaran'  => ['panjar', 'lunas'],
            'status_kacamata'    => ['belum_selesai', 'sudah_selesai'],
            'status_pengambilan' => ['belum_diambil', 'sudah_diambil'],
        ];

        $updates = [];
        foreach ($allowed as $field => $valid) {
            if ($r->has($field) && in_array($r->input($field), $valid)) {
                $updates[$field] = $r->input($field);
            }
        }

        if (empty($updates)) {
            return back()->with('error', 'Tidak ada status yang diperbarui.');
        }

        $transaksi->update($updates);
        $this->log('update_status', $transaksi, $updates);

        return back()->with('success', 'Status transaksi diperbarui.');
    }

    // ─── PRINT BON ────────────────────────────────────────────────────────────
    public function printBon(Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) abort(403);

        $transaksi->load(['pasien', 'kesehatan', 'lensa', 'produk', 'admin']);

        $rx = [];
        if ($transaksi->kesehatan) {
            $rx['OD'] = ['SPH'=>$transaksi->kesehatan->sph_kanan,'CYL'=>$transaksi->kesehatan->cyl_kanan,'AXIS'=>$transaksi->kesehatan->axis_kanan,'ADD'=>$transaksi->kesehatan->add_kanan,'PD'=>$transaksi->kesehatan->pd_kanan,'PRISM'=>$transaksi->kesehatan->prism_kanan,'BASE'=>$transaksi->kesehatan->base_kanan];
            $rx['OS'] = ['SPH'=>$transaksi->kesehatan->sph_kiri,'CYL'=>$transaksi->kesehatan->cyl_kiri,'AXIS'=>$transaksi->kesehatan->axis_kiri,'ADD'=>$transaksi->kesehatan->add_kiri,'PD'=>$transaksi->kesehatan->pd_kiri,'PRISM'=>$transaksi->kesehatan->prism_kiri,'BASE'=>$transaksi->kesehatan->base_kiri];
        }

        return Inertia::render('Transaksi/PrintBon', [
            'trx' => [
                'id'                 => $transaksi->id,
                'tanggal'            => optional($transaksi->tanggal_pesan)->format('d/m/Y'),
                'tanggal_selesai'    => optional($transaksi->tanggal_selesai)->format('d/m/Y'),
                'kategori'           => $transaksi->kategori_transaksi,
                'frame'              => $transaksi->gagang_pelanggan,
                'lensa'              => $transaksi->lensa_pelanggan ?: $transaksi->lensa?->nama_lensa,
                'produk'             => $transaksi->produk?->nama_produk,
                'harga'              => (float) $transaksi->harga,
                'panjar'             => (float) $transaksi->panjar,
                'sisa'               => (float) $transaksi->sisa,
                'metode1'            => $transaksi->metode_pembayaran_1,
                'metode2'            => $transaksi->metode_pembayaran_2,
                'jumlah_bayar_1'     => (float) ($transaksi->jumlah_bayar_1 ?? 0),
                'jumlah_bayar_2'     => (float) ($transaksi->jumlah_bayar_2 ?? 0),
                'status_pembayaran'  => $transaksi->status_pembayaran,
                'status_kacamata'    => $transaksi->status_kacamata,
                'status_pengambilan' => $transaksi->status_pengambilan,
                'pasien' => $transaksi->pasien ? [
                    'nama'    => $transaksi->pasien->nama_pasien,
                    'kode'    => $transaksi->pasien->kode_pasien,
                    'alamat'  => $transaksi->pasien->alamat_pasien,
                    'telepon' => $transaksi->pasien->nohp_pasien,
                ] : null,
            ],
            'rx'         => $rx ?: null,
            'branchName' => $transaksi->admin?->name ?? 'Optik Kasih',
        ]);
    }

    // ─── EXPORT EXCEL ─────────────────────────────────────────────────────────
    public function exportExcel(Request $r)
    {
        $from = $r->get('from');
        $to   = $r->get('to', now()->toDateString());

        $q = Transaksi::with(['pasien', 'lensa', 'produk'])
            ->where('admin_id', auth()->id());

        if ($from) {
            $q->whereBetween('tanggal_pesan', [
                Carbon::parse($from)->startOfDay(),
                Carbon::parse($to)->endOfDay(),
            ]);
        }

        $rows = $q->orderByDesc('id')->get();

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['No', 'ID', 'Tanggal', 'Kategori', 'Pasien', 'Frame', 'Lensa/Produk', 'Harga', 'Panjar', 'Sisa', 'Status Bayar', 'Status Kacamata', 'Status Ambil', 'Metode Bayar 1', 'Metode Bayar 2'];
        foreach ($headers as $col => $header) {
            $cell = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col + 1) . '1';
            $sheet->setCellValue($cell, $header);
            $sheet->getStyle($cell)->getFont()->setBold(true);
            $sheet->getStyle($cell)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('FFFFFF00');
        }

        foreach ($rows as $idx => $t) {
            $row = $idx + 2;
            $cols = [
                $idx + 1,
                $t->id,
                optional($t->tanggal_pesan)->format('Y-m-d'),
                $t->kategori_transaksi,
                $t->pasien?->nama_pasien,
                $t->gagang_pelanggan,
                $t->lensa_pelanggan ?: $t->lensa?->nama_lensa ?: $t->produk?->nama_produk,
                (float) $t->harga,
                (float) $t->panjar,
                (float) $t->sisa,
                $t->status_pembayaran,
                $t->status_kacamata,
                $t->status_pengambilan,
                $t->metode_pembayaran_1,
                $t->metode_pembayaran_2,
            ];
            foreach ($cols as $col => $val) {
                $cell = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col + 1) . $row;
                $sheet->setCellValue($cell, $val);
            }
        }

        foreach (range(1, count($headers)) as $col) {
            $sheet->getColumnDimensionByColumn($col)->setAutoSize(true);
        }

        $writer   = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = 'transaksi_' . ($from ? "{$from}_s.d_{$to}" : 'semua') . '.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: max-age=0');
        $writer->save('php://output');
        exit;
    }

    // ─── DESTROY ─────────────────────────────────────────────────────────────
    public function destroy(Request $request, Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) abort(403);

        if (auth()->user()->role === 'admin') {
            $data = $request->validate(['delete_reason' => ['required', 'string', 'max:1000']]);

            $pending = DeletionRequest::query()
                ->where('requester_id', auth()->id())->where('subject_type', 'transaksi')
                ->where('subject_id', $transaksi->id)->where('status', DeletionRequest::PENDING)
                ->exists();

            if ($pending) return back()->with('error', 'Permintaan penghapusan transaksi ini masih menunggu persetujuan.');

            $deletionRequest = DeletionRequest::create([
                'requester_id' => auth()->id(), 'subject_type' => 'transaksi',
                'subject_id' => $transaksi->id, 'subject_label' => "Transaksi #{$transaksi->id}",
                'reason' => $data['delete_reason'], 'snapshot' => $this->transactionSnapshot($transaksi),
            ]);

            $this->log('delete_requested', $transaksi, ['deletion_request_id' => $deletionRequest->id, 'alasan_penghapusan' => $data['delete_reason']]);

            SystemNotifier::toSuperAdmins(
                'deletion_requested', 'Persetujuan penghapusan transaksi',
                sprintf('Cabang %s meminta penghapusan transaksi #%d.', auth()->user()->name, $transaksi->id),
                route('super_admin.deletion_requests.index'),
                ['deletion_request_id' => $deletionRequest->id, 'subject_type' => 'transaksi'],
            );

            return redirect()->route('admin.transaksi.index')->with('success', 'Permintaan penghapusan dikirim ke superadmin.');
        }

        $this->log('delete', $transaksi, ['snapshot' => $this->transactionSnapshot($transaksi), 'dihapus_langsung_oleh_superadmin' => true]);
        $transaksi->delete();
        return back()->with('success', 'Transaksi terhapus.');
    }

    // ─── BY PATIENT ───────────────────────────────────────────────────────────
    public function byPatient(Pasien $patient, Request $r)
    {
        $q = Transaksi::query()->with(['lensa:id_lensa,nama_lensa'])->where('pasien_id', $patient->id);

        if ($s = trim($r->get('search', ''))) {
            $q->where(function ($w) use ($s) {
                $w->where('id', 'like', "%$s%")->orWhere('lensa_pelanggan', 'like', "%$s%")->orWhere('gagang_pelanggan', 'like', "%$s%");
            });
        }

        $rows = $q->orderByDesc('id')->paginate(10)->withQueryString()
            ->through(function (Transaksi $t) {
                return [
                    'id'              => $t->id,
                    'kode'            => $t->id,
                    'tanggal_pesanan' => optional($t->tanggal_pesan)->format('Y-m-d'),
                    'lensa'           => $t->lensa_pelanggan ?: $t->lensa?->nama_lensa,
                    'frame'           => $t->gagang_pelanggan,
                    'harga'           => (float) $t->harga,
                    'panjar'          => (float) $t->panjar,
                    'total'           => max(0, (float)$t->harga - (float)$t->panjar),
                    'status_pembayaran' => $t->status_pembayaran,
                ];
            });

        return Inertia::render('Pasien/TransaksiList', [
            'patient'      => ['id' => $patient->id, 'nama_pasien' => $patient->nama_pasien, 'kode_pasien' => $patient->kode_pasien],
            'transactions' => $rows,
            'query'        => ['search' => $r->get('search', '')],
        ]);
    }

    // ─── API ──────────────────────────────────────────────────────────────────
    public function patientByCode(string $kode)
    {
        $p = Pasien::where('kode_pasien', $kode)->first();
        if (!$p) return response()->json([], 404);
        return response()->json(['id'=>$p->id,'kode_pasien'=>$p->kode_pasien,'nama_pasien'=>$p->nama_pasien,'alamat'=>$p->alamat_pasien,'telepon'=>$p->nohp_pasien]);
    }

    public function searchPatients(Request $r)
    {
        $term = trim($r->query('term', ''));
        if ($term === '') return response()->json([]);
        $rows = Pasien::query()
            ->where(function ($q) use ($term) {
                $q->where('kode_pasien', 'like', "%$term%")
                  ->orWhere('nama_pasien', 'like', "%$term%")
                  ->orWhere('nohp_pasien', 'like', "%$term%");
            })
            ->orderBy('nama_pasien')->limit(10)
            ->get(['id', 'kode_pasien', 'nama_pasien', 'alamat_pasien', 'nohp_pasien', 'tanggal_buat', 'tanggal_lahir']);
        return response()->json($rows);
    }

    public function patientExams(Request $r, Pasien $patient)
    {
        if (!$r->has('date')) {
            $dates = $patient->kesehatan()->orderByDesc('tanggal_periksa')->pluck('tanggal_periksa')->map(fn ($d) => $d->format('Y-m-d'));
            return response()->json($dates);
        }
        $exam = $patient->kesehatan()->whereDate('tanggal_periksa', $r->query('date'))->first();
        if (!$exam) return response()->json([], 404);
        return response()->json([
            'id' => $exam->id, 'tanggal' => $exam->tanggal_periksa->format('Y-m-d'),
            'rx' => [
                'OD' => ['SPH'=>$exam->sph_kanan,'CYL'=>$exam->cyl_kanan,'AXIS'=>$exam->axis_kanan,'PRISM'=>$exam->prism_kanan,'BASE'=>$exam->base_kanan,'ADD'=>$exam->add_kanan,'MPD'=>$exam->pd_kanan],
                'OS' => ['SPH'=>$exam->sph_kiri,'CYL'=>$exam->cyl_kiri,'AXIS'=>$exam->axis_kiri,'PRISM'=>$exam->prism_kiri,'BASE'=>$exam->base_kiri,'ADD'=>$exam->add_kiri,'MPD'=>$exam->pd_kiri],
            ],
        ]);
    }

    // ─── PRIVATE ──────────────────────────────────────────────────────────────

    /** Gabungkan item manual (produk_lainnya/soflen/air soflen) jadi satu deskripsi, sertakan kategori kalau ada. */
    private function composeItemsDescription(array $items): ?string
    {
        return collect($items)
            ->map(function ($item) {
                $nama = trim($item['nama'] ?? '');
                if ($nama === '') return null;
                $kategori = trim($item['kategori'] ?? '');
                return $kategori !== '' ? "[{$kategori}] {$nama}" : $nama;
            })
            ->filter()
            ->implode(', ') ?: null;
    }

    private function transactionCard(Transaksi $t): array
    {
        return [
            'id'                 => $t->id,
            'kode'               => $t->id,
            'tanggal_pesanan'    => optional($t->tanggal_pesan)->format('Y-m-d'),
            'lensa'              => $t->lensa_pelanggan ?: $t->lensa?->nama_lensa,
            'frame'              => $t->gagang_pelanggan,
            'produk'             => $t->produk?->nama_produk,
            'nama_pasien'        => $t->pasien?->nama_pasien,
            'kategori_transaksi' => $t->kategori_transaksi,
            'status_pembayaran'  => $t->status_pembayaran,
            'status_kacamata'    => $t->status_kacamata,
            'status_pengambilan' => $t->status_pengambilan,
            'harga'              => (float) $t->harga,
            'panjar'             => (float) $t->panjar,
            'sisa'               => (float) $t->sisa,
        ];
    }

    private function transactionSnapshot(Transaksi $transaksi): array
    {
        return [
            'id' => $transaksi->id, 'pasien_id' => $transaksi->pasien_id,
            'produk_id' => $transaksi->produk_id, 'lensa_id' => $transaksi->lensa_id,
            'tanggal_pesan' => optional($transaksi->tanggal_pesan)->toDateString(),
            'harga' => $transaksi->harga, 'panjar' => $transaksi->panjar,
            'sisa' => $transaksi->sisa, 'admin_id' => $transaksi->admin_id,
            'kategori_transaksi' => $transaksi->kategori_transaksi,
        ];
    }

    private function log(string $action, Transaksi $transaksi, array $details = []): void
    {
        ActivityLog::create([
            'user_id' => auth()->id(), 'action' => $action,
            'model' => Transaksi::class, 'model_id' => $transaksi->id,
            'details' => array_merge([
                'pasien_id' => $transaksi->pasien_id, 'admin_id' => $transaksi->admin_id,
                'harga' => $transaksi->harga, 'panjar' => $transaksi->panjar, 'sisa' => $transaksi->sisa,
            ], $details),
        ]);
    }
}
