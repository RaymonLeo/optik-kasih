<?php

// appV1.0 Rev 4 - Audit transaksi dan permintaan persetujuan penghapusan cabang.

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Pasien;
use App\Models\Kesehatan;
use App\Models\Lensa;
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
    // ----------------- PAGE: INDEX -----------------
    public function index(Request $r)
    {
        // range: all|day|week|month|year|custom
        $range  = $r->get('range', 'day');
        $date   = $r->get('date');
        $search = $r->get('search');

        $q = Transaksi::query()
            ->with(['pasien:id,nama_pasien,kode_pasien', 'lensa:id_lensa,nama_lensa'])
            ->where('admin_id', auth()->id());

        // Anchor tanggal untuk semua mode yang butuh tanggal
        $anchor = $date ? Carbon::parse($date) : now();

        switch ($range) {
            case 'day':
                $q->whereDate('tanggal_pesan', $anchor->toDateString());
                break;

            case 'week':
                $q->whereBetween('tanggal_pesan', [
                    $anchor->copy()->startOfWeek(), $anchor->copy()->endOfWeek()
                ]);
                break;

            case 'month':
                $q->whereYear('tanggal_pesan', $anchor->year)
                  ->whereMonth('tanggal_pesan', $anchor->month);
                break;

            case 'year':
                $q->whereYear('tanggal_pesan', $anchor->year);
                break;

            case 'custom':
                if ($date) {
                    $to = $r->get('to', $anchor->toDateString());
                    $q->whereBetween('tanggal_pesan', [
                        $anchor->toDateString(), Carbon::parse($to)->toDateString()
                    ]);
                }
                break;

            case 'all':
            default:
                // tanpa filter tanggal
                break;
        }

        // search
        if ($search) {
            $q->where(function ($x) use ($search) {
                $x->where('id', 'like', "%$search%")
                  ->orWhere('lensa_pelanggan', 'like', "%$search%")
                  ->orWhere('gagang_pelanggan', 'like', "%$search%")
                  ->orWhereHas('pasien', fn ($p) => $p->where('nama_pasien', 'like', "%$search%"));
            });
        }

        // Total sesuai filter (pakai query yang sama)
        $totalFilter = (clone $q)->sum('harga');

        $transactions = $q->orderByDesc('id')
            ->paginate(10)->withQueryString()
            ->through(function (Transaksi $t) {
                return [
                    'id'              => $t->id,
                    'kode'            => $t->id,
                    'tanggal_pesanan' => optional($t->tanggal_pesan)->format('Y-m-d'),
                    'lensa'           => $t->lensa_pelanggan ?: $t->lensa?->nama_lensa,
                    'frame'           => $t->gagang_pelanggan,
                    'nama_pasien'     => $t->pasien->nama_pasien ?? null,
                ];
            });

        return Inertia::render('Transaksi/Index', [
            'transactions' => $transactions,
            // nama prop dipertahankan untuk kompatibilitas UI
            'totalHariIni' => $totalFilter,
            'query' => [
                'range'  => $range,
                'date'   => $anchor->toDateString(),
                'search' => $search,
            ],
        ]);
    }

    public function indexGlobal(Request $r)
    {
        $search = $r->get('search');
        $range = $r->get('range', 'all');
        $date = $r->get('date');
        $to = $r->get('to');
        $sortHarga = $r->get('sort_harga', 'desc');
        $q = Transaksi::with(['pasien', 'admin', 'produk', 'lensa']);

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
        if ($range === 'day') {
            $q->whereDate('tanggal_pesan', $anchor->toDateString());
        } elseif ($range === 'week') {
            $q->whereBetween('tanggal_pesan', [$anchor->copy()->startOfWeek(), $anchor->copy()->endOfWeek()]);
        } elseif ($range === 'month') {
            $q->whereYear('tanggal_pesan', $anchor->year)->whereMonth('tanggal_pesan', $anchor->month);
        } elseif ($range === 'year') {
            $q->whereYear('tanggal_pesan', $anchor->year);
        } elseif ($range === 'custom' && $date) {
            $q->whereBetween('tanggal_pesan', [$anchor->toDateString(), Carbon::parse($to ?: $date)->toDateString()]);
        }

        $pendapatan = (clone $q)->sum('harga');
        $pengeluaranQuery = Pengeluaran::query();
        if ($r->filled('admin_id')) {
            $pengeluaranQuery->where('admin_id', $r->admin_id);
        }
        if ($range === 'day') {
            $pengeluaranQuery->whereDate('tanggal', $anchor->toDateString());
        } elseif ($range === 'week') {
            $pengeluaranQuery->whereBetween('tanggal', [$anchor->copy()->startOfWeek(), $anchor->copy()->endOfWeek()]);
        } elseif ($range === 'month') {
            $pengeluaranQuery->whereYear('tanggal', $anchor->year)->whereMonth('tanggal', $anchor->month);
        } elseif ($range === 'year') {
            $pengeluaranQuery->whereYear('tanggal', $anchor->year);
        } elseif ($range === 'custom' && $date) {
            $pengeluaranQuery->whereBetween('tanggal', [$anchor->toDateString(), Carbon::parse($to ?: $date)->toDateString()]);
        }

        $transactions = $q->orderBy('harga', $sortHarga === 'asc' ? 'asc' : 'desc')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SuperAdmin/TransaksiGlobal', [
            'transactions' => $transactions,
            'admins' => User::where('role', 'admin')->orderBy('name')->get(['id', 'name']),
            'summary' => [
                'pendapatan' => $pendapatan,
                'pengeluaran' => $pengeluaranQuery->sum('jumlah'),
                'laba' => $pendapatan - $pengeluaranQuery->sum('jumlah'),
            ],
            'filters' => [
                'search' => $search,
                'admin_id' => $r->get('admin_id', ''),
                'range' => $range,
                'date' => $anchor->toDateString(),
                'to' => $to,
                'sort_harga' => $sortHarga,
            ],
        ]);
    }

    // ----------------- PAGE: CREATE -----------------
    public function create()
    {
        return Inertia::render('Transaksi/Create');
    }

    // ----------------- STORE -----------------
    public function store(Request $r)
    {
        $type = $r->input('type', 'resep'); // resep | produk

        if ($type === 'resep') {
            $data = $r->validate([
                'kode_pasien'      => ['required', 'string', 'exists:pasien,kode_pasien'],
                'tanggal_pesanan'  => ['required', 'date'],
                'tanggal_selesai'  => ['nullable', 'date', 'after_or_equal:tanggal_pesanan'],
                'frame'            => ['nullable', 'string', 'max:100'],
                'lensa'            => ['nullable', 'string', 'max:100'],
                'exam_date'        => ['nullable', 'date'],
                'harga'            => ['required', 'numeric', 'min:0'],
                'panjar'           => ['required', 'numeric', 'min:0'],
                'sisa'             => ['required', 'numeric', 'min:0'],
                'lensa_id'         => ['nullable', Rule::exists('lensa', 'id_lensa')],
                'metode_pembayaran_1' => ['required', 'string'],
                'metode_pembayaran_2' => ['nullable', 'string'],
            ]);

            $pasien = Pasien::where('kode_pasien', $data['kode_pasien'])->firstOrFail();

            $kesehatanId = null;
            if (!empty($data['exam_date'])) {
                $kesehatanId = Kesehatan::where('pasien_id', $pasien->id)
                    ->whereDate('tanggal_periksa', $data['exam_date'])
                    ->value('id');
            }

            $trx = Transaksi::create([
                'pasien_id'         => $pasien->id,
                'kesehatan_id'      => $kesehatanId,
                'lensa_id'          => $data['lensa_id'] ?? null,
                'tanggal_pesan'     => $data['tanggal_pesanan'],
                'tanggal_selesai'   => $data['tanggal_selesai'] ?? null,
                'lensa_pelanggan'   => $data['lensa'] ?? null,
                'gagang_pelanggan'  => $data['frame'] ?? null,
                'harga'             => $data['harga'],
                'panjar'            => $data['panjar'],
                'sisa'              => $data['sisa'],
                'admin_id'          => auth()->id(),
                'metode_pembayaran_1' => $data['metode_pembayaran_1'],
                'metode_pembayaran_2' => $data['metode_pembayaran_2'] ?? null,
            ]);

            $this->log('create', $trx);
            return redirect()->route('admin.transaksi.show', $trx->id)->with('success', 'Transaksi tersimpan');
        }

        // produk lain
        $data = $r->validate([
            'tanpa_pasien'     => ['boolean'],
            'kode_pasien'      => ['nullable', 'string'],
            'tanggal_pesanan'  => ['required', 'date'],
            'produk_id'        => ['nullable', 'exists:produk,id'],
            'items'            => ['nullable', 'array'],
            'harga'            => ['required', 'numeric', 'min:0'],
            'panjar'           => ['nullable', 'numeric', 'min:0'],
            'sisa'             => ['nullable', 'numeric', 'min:0'],
            'metode_pembayaran_1' => ['required', 'string'],
            'metode_pembayaran_2' => ['nullable', 'string'],
        ]);

        $patientId = null;
        if (!(bool)($data['tanpa_pasien'] ?? false)) {
            $p = Pasien::where('kode_pasien', $data['kode_pasien'])->first();
            if (!$p) {
                return back()->withErrors(['kode_pasien' => 'Kode pasien tidak ditemukan'])->onlyInput();
            }
            $patientId = $p->id;
        }

        $trx = Transaksi::create([
            'pasien_id'        => $patientId,
            'produk_id'        => $data['produk_id'] ?? null,
            'tanggal_pesan'    => $data['tanggal_pesanan'],
            'gagang_pelanggan' => collect($data['items'] ?? [])->pluck('nama')->filter()->implode(', ') ?: null,
            'harga'            => $data['harga'],
            'panjar'           => $data['panjar'] ?? 0,
            'sisa'             => $data['sisa'] ?? max(0, (float) $data['harga'] - (float) ($data['panjar'] ?? 0)),
            'admin_id'         => auth()->id(),
            'metode_pembayaran_1' => $data['metode_pembayaran_1'],
            'metode_pembayaran_2' => $data['metode_pembayaran_2'] ?? null,
        ]);

        $this->log('create', $trx);
        return redirect()->route('admin.transaksi.show', $trx->id)->with('success', 'Transaksi produk tersimpan');
    }

    // ----------------- SHOW -----------------
    public function show(Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) {
            abort(403);
        }

        $transaksi->load(['pasien', 'kesehatan', 'lensa', 'produk']);

        $rx = [];
        if ($transaksi->kesehatan) {
            $rx[] = [
                'eye'  => 'OD',
                'SPH'  => $transaksi->kesehatan->sph_kanan,
                'CYL'  => $transaksi->kesehatan->cyl_kanan,
                'AXIS' => $transaksi->kesehatan->axis_kanan,
                'PRISM'=> $transaksi->kesehatan->prism_kanan,
                'BASE' => $transaksi->kesehatan->base_kanan,
                'ADD'  => $transaksi->kesehatan->add_kanan,
                'MPD'  => $transaksi->kesehatan->pd_kanan, // konsisten PD
            ];
            $rx[] = [
                'eye'  => 'OS',
                'SPH'  => $transaksi->kesehatan->sph_kiri,
                'CYL'  => $transaksi->kesehatan->cyl_kiri,
                'AXIS' => $transaksi->kesehatan->axis_kiri,
                'PRISM'=> $transaksi->kesehatan->prism_kiri,
                'BASE' => $transaksi->kesehatan->base_kiri,
                'ADD'  => $transaksi->kesehatan->add_kiri,
                'MPD'  => $transaksi->kesehatan->pd_kiri,   // konsisten PD
            ];
        }

        return Inertia::render('Transaksi/Show', [
            'trx' => [
                'id'               => $transaksi->id,
                'kode'             => $transaksi->id,
                'tanggal_pesanan'  => optional($transaksi->tanggal_pesan)->format('Y-m-d'),
                'tanggal_selesai'  => optional($transaksi->tanggal_selesai)->format('Y-m-d'),
                'frame'            => $transaksi->gagang_pelanggan,
                'lensa'            => $transaksi->lensa_pelanggan ?: $transaksi->lensa?->nama_lensa,
                'harga'            => $transaksi->harga,
                'panjar'           => $transaksi->panjar,
                'sisa'             => $transaksi->sisa,
                'total'            => max(0, (float)$transaksi->harga - (float)$transaksi->panjar),
                'pasien' => $transaksi->pasien ? [
                    'id'          => $transaksi->pasien->id,
                    'kode_pasien' => $transaksi->pasien->kode_pasien ?? null,
                    'nama_pasien' => $transaksi->pasien->nama_pasien,
                    'alamat'      => $transaksi->pasien->alamat_pasien,
                    'telepon'     => $transaksi->pasien->nohp_pasien,
                ] : null,
            ],
            'rx'    => $rx,
            'items' => [],
        ]);
    }

    // ----------------- EDIT -----------------
    public function edit(Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) {
            abort(403);
        }

        $transaksi->load(['pasien', 'kesehatan', 'lensa', 'produk']);

        $prefill = [
            'id'               => $transaksi->id,
            'kode'             => $transaksi->id,
            'type'             => $transaksi->produk_id ? 'produk' : 'resep',
            'tanggal_pesanan'  => optional($transaksi->tanggal_pesan)->format('Y-m-d'),
            'tanggal_selesai'  => optional($transaksi->tanggal_selesai)->format('Y-m-d'),
            'frame'            => $transaksi->gagang_pelanggan,
            'lensa'            => $transaksi->lensa_pelanggan ?: $transaksi->lensa?->nama_lensa,
            'lensa_id'         => $transaksi->lensa_id,
            'harga'            => $transaksi->harga,
            'panjar'           => $transaksi->panjar,
            'sisa'             => $transaksi->sisa,
            'metode_pembayaran_1' => $transaksi->metode_pembayaran_1,
            'metode_pembayaran_2' => $transaksi->metode_pembayaran_2,
            'exam_date'        => optional($transaksi->kesehatan?->tanggal_periksa)->format('Y-m-d'),
            'pasien' => $transaksi->pasien ? [
                'id'          => $transaksi->pasien->id,
                'kode_pasien' => $transaksi->pasien->kode_pasien ?? null,
                'nama_pasien' => $transaksi->pasien->nama_pasien,
                'alamat'      => $transaksi->pasien->alamat_pasien,
                'telepon'     => $transaksi->pasien->nohp_pasien,
            ] : null,
        ];

        if ($transaksi->kesehatan) {
            $prefill['rx'] = [
                'OD' => [
                    'SPH'  => $transaksi->kesehatan->sph_kanan,
                    'CYL'  => $transaksi->kesehatan->cyl_kanan,
                    'AXIS' => $transaksi->kesehatan->axis_kanan,
                    'PRISM'=> $transaksi->kesehatan->prism_kanan,
                    'BASE' => $transaksi->kesehatan->base_kanan,
                    'ADD'  => $transaksi->kesehatan->add_kanan,
                    'MPD'  => $transaksi->kesehatan->pd_kanan, // konsisten PD
                ],
                'OS' => [
                    'SPH'  => $transaksi->kesehatan->sph_kiri,
                    'CYL'  => $transaksi->kesehatan->cyl_kiri,
                    'AXIS' => $transaksi->kesehatan->axis_kiri,
                    'PRISM'=> $transaksi->kesehatan->prism_kiri,
                    'BASE' => $transaksi->kesehatan->base_kiri,
                    'ADD'  => $transaksi->kesehatan->add_kiri,
                    'MPD'  => $transaksi->kesehatan->pd_kiri,  // konsisten PD
                ],
            ];
        }

        return Inertia::render('Transaksi/Edit', ['prefill' => $prefill]);
    }

    // ----------------- UPDATE -----------------
    public function update(Request $r, Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) {
            abort(403);
        }

        $type = $r->input('type', $transaksi->produk_id ? 'produk' : 'resep');

        if ($type === 'resep') {
            $data = $r->validate([
                'kode_pasien'      => ['required', 'string', 'exists:pasien,kode_pasien'],
                'tanggal_pesanan'  => ['required', 'date'],
                'tanggal_selesai'  => ['nullable', 'date', 'after_or_equal:tanggal_pesanan'],
                'frame'            => ['nullable', 'string', 'max:100'],
                'lensa'            => ['nullable', 'string', 'max:100'],
                'exam_date'        => ['nullable', 'date'],
                'harga'            => ['required', 'numeric', 'min:0'],
                'panjar'           => ['required', 'numeric', 'min:0'],
                'sisa'             => ['required', 'numeric', 'min:0'],
                'lensa_id'         => ['nullable', Rule::exists('lensa', 'id_lensa')],
                'metode_pembayaran_1' => ['required', 'string'],
                'metode_pembayaran_2' => ['nullable', 'string'],
            ]);

            $pasien = Pasien::where('kode_pasien', $data['kode_pasien'])->firstOrFail();

            $kesehatanId = null;
            if (!empty($data['exam_date'])) {
                $kesehatanId = Kesehatan::where('pasien_id', $pasien->id)
                    ->whereDate('tanggal_periksa', $data['exam_date'])
                    ->value('id');
            }

            $transaksi->update([
                'pasien_id'        => $pasien->id,
                'produk_id'        => null,
                'kesehatan_id'     => $kesehatanId,
                'lensa_id'         => $data['lensa_id'] ?? null,
                'tanggal_pesan'    => $data['tanggal_pesanan'],
                'tanggal_selesai'  => $data['tanggal_selesai'] ?? null,
                'lensa_pelanggan'  => $data['lensa'] ?? null,
                'gagang_pelanggan' => $data['frame'] ?? null,
                'harga'            => $data['harga'],
                'panjar'           => $data['panjar'],
                'sisa'             => $data['sisa'],
                'metode_pembayaran_1' => $data['metode_pembayaran_1'],
                'metode_pembayaran_2' => $data['metode_pembayaran_2'] ?? null,
            ]);

            $this->log('update', $transaksi);
            return redirect()->route('admin.transaksi.show', $transaksi->id)->with('success', 'Transaksi diperbarui');
        }

        // produk lain
        $data = $r->validate([
            'tanpa_pasien'     => ['boolean'],
            'kode_pasien'      => ['nullable', 'string'],
            'tanggal_pesanan'  => ['required', 'date'],
            'produk_id'        => ['nullable', 'exists:produk,id'],
            'items'            => ['nullable', 'array'],
            'harga'            => ['required', 'numeric', 'min:0'],
            'panjar'           => ['nullable', 'numeric', 'min:0'],
            'sisa'             => ['nullable', 'numeric', 'min:0'],
            'metode_pembayaran_1' => ['required', 'string'],
            'metode_pembayaran_2' => ['nullable', 'string'],
        ]);

        $patientId = null;
        if (!(bool)($data['tanpa_pasien'] ?? false)) {
            $p = Pasien::where('kode_pasien', $data['kode_pasien'])->first();
            if (!$p) {
                return back()->withErrors(['kode_pasien' => 'Kode pasien tidak ditemukan'])->onlyInput();
            }
            $patientId = $p->id;
        }

        $transaksi->update([
            'pasien_id'        => $patientId,
            'produk_id'        => $data['produk_id'] ?? null,
            'kesehatan_id'     => null,
            'lensa_id'         => null,
            'lensa_pelanggan'  => null,
            'gagang_pelanggan' => collect($data['items'] ?? [])->pluck('nama')->filter()->implode(', ') ?: null,
            'tanggal_pesan'    => $data['tanggal_pesanan'],
            'harga'            => $data['harga'],
            'panjar'           => $data['panjar'] ?? 0,
            'sisa'             => $data['sisa'] ?? max(0, (float) $data['harga'] - (float) ($data['panjar'] ?? 0)),
            'metode_pembayaran_1' => $data['metode_pembayaran_1'],
            'metode_pembayaran_2' => $data['metode_pembayaran_2'] ?? null,
        ]);

        $this->log('update', $transaksi);
        return redirect()->route('admin.transaksi.show', $transaksi->id)->with('success', 'Transaksi produk diperbarui');
    }

    // ----------------- DESTROY -----------------
    public function destroy(Request $request, Transaksi $transaksi)
    {
        if (auth()->user()->role !== 'super_admin' && $transaksi->admin_id !== auth()->id()) {
            abort(403);
        }

        if (auth()->user()->role === 'admin') {
            $data = $request->validate([
                'delete_reason' => ['required', 'string', 'max:1000'],
            ]);

            $pending = DeletionRequest::query()
                ->where('requester_id', auth()->id())
                ->where('subject_type', 'transaksi')
                ->where('subject_id', $transaksi->id)
                ->where('status', DeletionRequest::PENDING)
                ->exists();

            if ($pending) {
                return back()->with('error', 'Permintaan penghapusan transaksi ini masih menunggu persetujuan.');
            }

            $deletionRequest = DeletionRequest::create([
                'requester_id' => auth()->id(),
                'subject_type' => 'transaksi',
                'subject_id' => $transaksi->id,
                'subject_label' => "Transaksi #{$transaksi->id}",
                'reason' => $data['delete_reason'],
                'snapshot' => $this->transactionSnapshot($transaksi),
            ]);

            $this->log('delete_requested', $transaksi, [
                'cabang' => auth()->user()->name,
                'deletion_request_id' => $deletionRequest->id,
                'alasan_penghapusan' => $data['delete_reason'],
                'snapshot' => $deletionRequest->snapshot,
            ]);

            SystemNotifier::toSuperAdmins(
                'deletion_requested',
                'Persetujuan penghapusan transaksi',
                sprintf('Cabang %s meminta penghapusan transaksi #%d.', auth()->user()->name, $transaksi->id),
                route('super_admin.deletion_requests.index'),
                ['deletion_request_id' => $deletionRequest->id, 'subject_type' => 'transaksi'],
            );

            return redirect()->route('admin.transaksi.index')->with('success', 'Permintaan penghapusan dikirim ke superadmin.');
        }

        $this->log('delete', $transaksi, [
            'snapshot' => $this->transactionSnapshot($transaksi),
            'dihapus_langsung_oleh_superadmin' => true,
        ]);
        $transaksi->delete();
        return back()->with('success', 'Transaksi terhapus');
    }

    // ----------------- LIST TRANSAKSI MILIK 1 PASIEN -----------------
    public function byPatient(Pasien $patient, Request $r)
    {
        $q = Transaksi::query()
            ->with(['lensa:id_lensa,nama_lensa'])
            ->where('pasien_id', $patient->id);

        if ($s = trim($r->get('search', ''))) {
            $q->where(function ($w) use ($s) {
                $w->where('id', 'like', "%$s%")
                  ->orWhere('lensa_pelanggan', 'like', "%$s%")
                  ->orWhere('gagang_pelanggan', 'like', "%$s%");
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
                ];
            });

        return Inertia::render('Pasien/TransaksiList', [
            'patient' => [
                'id'          => $patient->id,
                'nama_pasien' => $patient->nama_pasien,
                'kode_pasien' => $patient->kode_pasien,
            ],
            'transactions' => $rows,
            'query'        => ['search' => $r->get('search', '')],
        ]);
    }

    // ====================== API ======================

    // Auto-isi by KODE PASIEN
    public function patientByCode(string $kode)
    {
        $p = Pasien::where('kode_pasien', $kode)->first();
        if (!$p) return response()->json([], 404);

        return response()->json([
            'id'          => $p->id,
            'kode_pasien' => $p->kode_pasien,
            'nama_pasien' => $p->nama_pasien,
            'alamat'      => $p->alamat_pasien,
            'telepon'     => $p->nohp_pasien,
        ]);
    }

    // Dropdown search kode/nama pasien
    public function searchPatients(Request $r)
    {
        $term = trim($r->query('term', ''));
        if ($term === '') return response()->json([]);

        $rows = Pasien::query()
            ->where('kode_pasien', 'like', "%$term%")
            ->orWhere('nama_pasien', 'like', "%$term%")
            ->orderBy('nama_pasien')
            ->limit(10)
            ->get(['id', 'kode_pasien', 'nama_pasien']);

        return response()->json($rows);
    }

    // Daftar tanggal pemeriksaan & detail RX pada ?date=
    public function patientExams(Request $r, Pasien $patient)
    {
        // daftar tanggal
        if (!$r->has('date')) {
            $dates = $patient->kesehatan()
                ->orderByDesc('tanggal_periksa')
                ->pluck('tanggal_periksa')
                ->map(fn ($d) => $d->format('Y-m-d'));
            return response()->json($dates);
        }

        // detail RX pada tanggal tertentu
        $exam = $patient->kesehatan()
            ->whereDate('tanggal_periksa', $r->query('date'))
            ->first();

        if (!$exam) return response()->json([], 404);

        return response()->json([
            'id'      => $exam->id,
            'tanggal' => $exam->tanggal_periksa->format('Y-m-d'),
            'rx'      => [
                'OD' => [
                    'SPH'  => $exam->sph_kanan,
                    'CYL'  => $exam->cyl_kanan,
                    'AXIS' => $exam->axis_kanan,
                    'PRISM'=> $exam->prism_kanan,
                    'BASE' => $exam->base_kanan,
                    'ADD'  => $exam->add_kanan,
                    'MPD'  => $exam->pd_kanan, // konsisten PD
                ],
                'OS' => [
                    'SPH'  => $exam->sph_kiri,
                    'CYL'  => $exam->cyl_kiri,
                    'AXIS' => $exam->axis_kiri,
                    'PRISM'=> $exam->prism_kiri,
                    'BASE' => $exam->base_kiri,
                    'ADD'  => $exam->add_kiri,
                    'MPD'  => $exam->pd_kiri,  // konsisten PD
                ],
            ],
        ]);
    }

    private function transactionSnapshot(Transaksi $transaksi): array
    {
        return [
            'id' => $transaksi->id,
            'pasien_id' => $transaksi->pasien_id,
            'produk_id' => $transaksi->produk_id,
            'lensa_id' => $transaksi->lensa_id,
            'tanggal_pesan' => optional($transaksi->tanggal_pesan)->toDateString(),
            'harga' => $transaksi->harga,
            'panjar' => $transaksi->panjar,
            'sisa' => $transaksi->sisa,
            'admin_id' => $transaksi->admin_id,
        ];
    }

    private function log(string $action, Transaksi $transaksi, array $details = []): void
    {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model' => Transaksi::class,
            'model_id' => $transaksi->id,
            'details' => array_merge([
                'pasien_id' => $transaksi->pasien_id,
                'admin_id' => $transaksi->admin_id,
                'harga' => $transaksi->harga,
                'panjar' => $transaksi->panjar,
                'sisa' => $transaksi->sisa,
            ], $details),
        ]);
    }
}
