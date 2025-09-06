<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Pasien;
use App\Models\Kesehatan;
use App\Models\Lensa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class TransaksiController extends Controller
{
    // ----------------- PAGE: INDEX -----------------
    public function index(Request $r)
    {
        // filter: range = all|day|week|month|custom
        $range = $r->get('range', 'day'); // default hari ini
        $date  = $r->get('date');         // anchor untuk custom/day/week/month
        $search= $r->get('search');

        $q = Transaksi::query()->with(['pasien:id,nama_pasien,kode_pasien', 'lensa:id_lensa,nama_lensa']);

        // waktu
        $anchor = $date ? Carbon::parse($date) : now();
        if ($range === 'day') {
            $q->whereDate('tanggal_pesan', $anchor->toDateString());
        } elseif ($range === 'week') {
            $q->whereBetween('tanggal_pesan', [
                $anchor->copy()->startOfWeek(), $anchor->copy()->endOfWeek()
            ]);
        } elseif ($range === 'month') {
            $q->whereYear('tanggal_pesan', $anchor->year)
              ->whereMonth('tanggal_pesan', $anchor->month);
        } elseif ($range === 'custom' && $date) {
            // kalau custom, harapkan ?date=YYYY-MM-DD to YYYY-MM-DD pakai 's/d' atau 'to' param
            $to = $r->get('to', $anchor->toDateString());
            $q->whereBetween('tanggal_pesan', [$anchor->toDateString(), Carbon::parse($to)->toDateString()]);
        }

        // search
        if ($search) {
            $q->where(function($x) use ($search){
                $x->where('id', 'like', "%$search%")
                  ->orWhere('lensa_pelanggan', 'like', "%$search%")
                  ->orWhere('gagang_pelanggan', 'like', "%$search%")
                  ->orWhereHas('pasien', fn($p)=>$p->where('nama_pasien','like',"%$search%"));
            });
        }

        $transactions = $q->orderByDesc('id')->paginate(10)->withQueryString()
            ->through(function(Transaksi $t){
                return [
                    'id'              => $t->id,
                    'kode'            => $t->id,
                    'tanggal_pesanan' => optional($t->tanggal_pesan)->format('Y-m-d'),
                    'lensa'           => $t->lensa_pelanggan ?: $t->lensa?->nama_lensa,
                    'frame'           => $t->gagang_pelanggan,
                    'nama_pasien'     => $t->pasien->nama_pasien ?? null,
                ];
            });

        // Total ringkas sesuai rentang yang sama
        $totalHariIni = (clone $q)->sum('harga');

        return Inertia::render('Transaksi/Index', [
            'transactions' => $transactions,
            'totalHariIni' => $totalHariIni,
            'query' => [
                'range'  => $range,
                'date'   => $anchor->toDateString(),
                'search' => $search,
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
        $type = $r->input('type', 'resep'); // resep | produk (produk lain)

        if ($type === 'resep') {
            $data = $r->validate([
                'kode_pasien'      => ['required','string','exists:pasien,kode_pasien'],
                'tanggal_pesanan'  => ['required','date'],
                'tanggal_selesai'  => ['nullable','date','after_or_equal:tanggal_pesanan'],
                'frame'            => ['nullable','string','max:100'],
                'lensa'            => ['nullable','string','max:100'],
                'exam_date'        => ['nullable','date'],
                'harga'            => ['required','numeric','min:0'],
                'panjar'           => ['required','numeric','min:0'],
                'sisa'             => ['required','numeric','min:0'],
                // optional pilih master lensa
                'lensa_id'         => ['nullable', Rule::exists('lensa','id_lensa')],
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
            ]);

            return redirect()->route('transaksi.show', $trx->id)->with('success','Transaksi tersimpan');
        }

        // Produk lain (sederhana: 1 transaksi = 1 produk)
        $data = $r->validate([
            'tanpa_pasien'     => ['boolean'],
            'kode_pasien'      => ['nullable','string'],
            'tanggal_pesanan'  => ['required','date'],
            'produk_id'        => ['required','exists:produk,id'],
            'harga'            => ['required','numeric','min:0'],
        ]);

        $patientId = null;
        if (!(bool)($data['tanpa_pasien'] ?? false)) {
            $p = Pasien::where('kode_pasien', $data['kode_pasien'])->first();
            if (!$p) return back()->withErrors(['kode_pasien'=>'Kode pasien tidak ditemukan'])->onlyInput();
            $patientId = $p->id;
        }

        $trx = Transaksi::create([
            'pasien_id'        => $patientId,
            'produk_id'        => $data['produk_id'],
            'tanggal_pesan'    => $data['tanggal_pesanan'],
            'harga'            => $data['harga'],
            'panjar'           => 0,
            'sisa'             => 0,
        ]);

        return redirect()->route('transaksi.show', $trx->id)->with('success','Transaksi produk tersimpan');
    }

    // ----------------- SHOW -----------------
    public function show(Transaksi $transaksi)
    {
        $transaksi->load(['pasien','kesehatan','lensa','produk']);

        $rx = [];
        if ($transaksi->kesehatan) {
            $rx[] = [
                'eye'=>'OD','SPH'=>$transaksi->kesehatan->sph_kanan,'CYL'=>$transaksi->kesehatan->cyl_kanan,
                'AXIS'=>$transaksi->kesehatan->axis_kanan,'PRISM'=>$transaksi->kesehatan->prism_kanan,
                'BASE'=>$transaksi->kesehatan->base_kanan,'ADD'=>$transaksi->kesehatan->add_kanan,'MPD'=>$transaksi->kesehatan->mpd_kanan
            ];
            $rx[] = [
                'eye'=>'OS','SPH'=>$transaksi->kesehatan->sph_kiri,'CYL'=>$transaksi->kesehatan->cyl_kiri,
                'AXIS'=>$transaksi->kesehatan->axis_kiri,'PRISM'=>$transaksi->kesehatan->prism_kiri,
                'BASE'=>$transaksi->kesehatan->base_kiri,'ADD'=>$transaksi->kesehatan->add_kiri,'MPD'=>$transaksi->kesehatan->mpd_kiri
            ];
        }

        return Inertia::render('Transaksi/Show', [
            'trx' => [
                'id' => $transaksi->id,
                'kode' => $transaksi->id,
                'tanggal_pesanan' => optional($transaksi->tanggal_pesan)->format('Y-m-d'),
                'tanggal_selesai' => optional($transaksi->tanggal_selesai)->format('Y-m-d'),
                'frame' => $transaksi->gagang_pelanggan,
                'lensa' => $transaksi->lensa_pelanggan ?: $transaksi->lensa?->nama_lensa,
                'harga' => $transaksi->harga,
                'panjar'=> $transaksi->panjar,
                'sisa'  => $transaksi->sisa,
                'total' => max(0, (float)$transaksi->harga - (float)$transaksi->panjar),
                'pasien' => $transaksi->pasien ? [
                    'id' => $transaksi->pasien->id,
                    'kode_pasien' => $transaksi->pasien->kode_pasien ?? null,
                    'nama_pasien' => $transaksi->pasien->nama_pasien,
                    'alamat' => $transaksi->pasien->alamat_pasien,
                    'telepon'=> $transaksi->pasien->nohp_pasien,
                ] : null,
            ],
            'rx' => $rx,
            'items' => [],
        ]);
    }

    // ----------------- EDIT -----------------
    public function edit(Transaksi $transaksi)
    {
        $transaksi->load(['pasien','kesehatan','lensa','produk']);

        $prefill = [
            'id' => $transaksi->id,
            'kode' => $transaksi->id,
            'type' => $transaksi->produk_id ? 'produk' : 'resep',
            'tanggal_pesanan' => optional($transaksi->tanggal_pesan)->format('Y-m-d'),
            'tanggal_selesai' => optional($transaksi->tanggal_selesai)->format('Y-m-d'),
            'frame' => $transaksi->gagang_pelanggan,
            'lensa' => $transaksi->lensa_pelanggan ?: $transaksi->lensa?->nama_lensa,
            'lensa_id' => $transaksi->lensa_id,
            'harga' => $transaksi->harga,
            'panjar' => $transaksi->panjar,
            'sisa'  => $transaksi->sisa,
            'exam_date' => optional($transaksi->kesehatan?->tanggal_periksa)->format('Y-m-d'),
            'pasien' => $transaksi->pasien ? [
                'id' => $transaksi->pasien->id,
                'kode_pasien' => $transaksi->pasien->kode_pasien ?? null,
                'nama_pasien' => $transaksi->pasien->nama_pasien,
                'alamat' => $transaksi->pasien->alamat_pasien,
                'telepon'=> $transaksi->pasien->nohp_pasien,
            ] : null,
        ];

        // mapping RX untuk form
        if ($transaksi->kesehatan) {
            $prefill['rx'] = [
                'OD' => [
                    'SPH'=>$transaksi->kesehatan->sph_kanan, 'CYL'=>$transaksi->kesehatan->cyl_kanan, 'AXIS'=>$transaksi->kesehatan->axis_kanan,
                    'PRISM'=>$transaksi->kesehatan->prism_kanan, 'BASE'=>$transaksi->kesehatan->base_kanan, 'ADD'=>$transaksi->kesehatan->add_kanan, 'MPD'=>$transaksi->kesehatan->mpd_kanan,
                ],
                'OS' => [
                    'SPH'=>$transaksi->kesehatan->sph_kiri, 'CYL'=>$transaksi->kesehatan->cyl_kiri, 'AXIS'=>$transaksi->kesehatan->axis_kiri,
                    'PRISM'=>$transaksi->kesehatan->prism_kiri, 'BASE'=>$transaksi->kesehatan->base_kiri, 'ADD'=>$transaksi->kesehatan->add_kiri, 'MPD'=>$transaksi->kesehatan->mpd_kiri,
                ],
            ];
        }

        return Inertia::render('Transaksi/Edit', ['prefill' => $prefill]);
    }

    // ----------------- UPDATE -----------------
    public function update(Request $r, Transaksi $transaksi)
    {
        $type = $r->input('type', $transaksi->produk_id ? 'produk' : 'resep');

        if ($type === 'resep') {
            $data = $r->validate([
                'kode_pasien'      => ['required','string','exists:pasien,kode_pasien'],
                'tanggal_pesanan'  => ['required','date'],
                'tanggal_selesai'  => ['nullable','date','after_or_equal:tanggal_pesanan'],
                'frame'            => ['nullable','string','max:100'],
                'lensa'            => ['nullable','string','max:100'],
                'exam_date'        => ['nullable','date'],
                'harga'            => ['required','numeric','min:0'],
                'panjar'           => ['required','numeric','min:0'],
                'sisa'             => ['required','numeric','min:0'],
                'lensa_id'         => ['nullable', Rule::exists('lensa','id_lensa')],
            ]);

            $pasien = Pasien::where('kode_pasien', $data['kode_pasien'])->firstOrFail();
            $kesehatanId = null;
            if (!empty($data['exam_date'])) {
                $kesehatanId = Kesehatan::where('pasien_id', $pasien->id)
                    ->whereDate('tanggal_periksa', $data['exam_date'])
                    ->value('id');
            }

            $transaksi->update([
                'pasien_id'         => $pasien->id,
                'produk_id'         => null,
                'kesehatan_id'      => $kesehatanId,
                'lensa_id'          => $data['lensa_id'] ?? null,
                'tanggal_pesan'     => $data['tanggal_pesanan'],
                'tanggal_selesai'   => $data['tanggal_selesai'] ?? null,
                'lensa_pelanggan'   => $data['lensa'] ?? null,
                'gagang_pelanggan'  => $data['frame'] ?? null,
                'harga'             => $data['harga'],
                'panjar'            => $data['panjar'],
                'sisa'              => $data['sisa'],
            ]);

            return redirect()->route('transaksi.show', $transaksi->id)->with('success','Transaksi diperbarui');
        }

        $data = $r->validate([
            'tanpa_pasien'     => ['boolean'],
            'kode_pasien'      => ['nullable','string'],
            'tanggal_pesanan'  => ['required','date'],
            'produk_id'        => ['required','exists:produk,id'],
            'harga'            => ['required','numeric','min:0'],
        ]);

        $patientId = null;
        if (!(bool)($data['tanpa_pasien'] ?? false)) {
            $p = Pasien::where('kode_pasien', $data['kode_pasien'])->first();
            if (!$p) return back()->withErrors(['kode_pasien'=>'Kode pasien tidak ditemukan'])->onlyInput();
            $patientId = $p->id;
        }

        $transaksi->update([
            'pasien_id' => $patientId,
            'produk_id' => $data['produk_id'],
            'kesehatan_id' => null,
            'lensa_id' => null,
            'lensa_pelanggan' => null,
            'gagang_pelanggan' => null,
            'tanggal_pesan' => $data['tanggal_pesanan'],
            'harga' => $data['harga'],
            'panjar' => 0,
            'sisa' => 0,
        ]);

        return redirect()->route('transaksi.show', $transaksi->id)->with('success','Transaksi produk diperbarui');
    }

    // ----------------- DESTROY -----------------
    public function destroy(Transaksi $transaksi)
    {
        $transaksi->delete();
        return back()->with('success','Transaksi terhapus');
    }

    // ====================== API ======================

    // Auto-isi by KODE PASIEN
    public function patientByCode(string $kode)
    {
        $p = Pasien::where('kode_pasien', $kode)->first();
        if (!$p) return response()->json([], 404);
        return response()->json([
            'id' => $p->id,
            'kode_pasien' => $p->kode_pasien,
            'nama_pasien' => $p->nama_pasien,
            'alamat' => $p->alamat_pasien,
            'telepon' => $p->nohp_pasien,
        ]);
    }

    // Dropdown search kode/nama pasien
    public function searchPatients(Request $r)
    {
        $term = trim($r->query('term', ''));
        if ($term === '') return response()->json([]);

        $rows = Pasien::query()
            ->where('kode_pasien','like',"%$term%")
            ->orWhere('nama_pasien','like',"%$term%")
            ->orderBy('nama_pasien')
            ->limit(10)
            ->get(['id','kode_pasien','nama_pasien']);

        return response()->json($rows);
    }

    // Daftar tanggal pemeriksaan & detail RX pada ?date=
    public function patientExams(Request $r, Pasien $patient)
    {
        if (!$r->has('date')) {
            $dates = $patient->kesehatans()->orderByDesc('tanggal_periksa')
                ->pluck('tanggal_periksa')->map(fn($d)=>$d->format('Y-m-d'));
            return response()->json($dates);
        }

        $exam = $patient->kesehatans()
            ->whereDate('tanggal_periksa', $r->query('date'))
            ->first();

        if (!$exam) return response()->json([], 404);

        return response()->json([
            'id' => $exam->id,
            'tanggal' => $exam->tanggal_periksa->format('Y-m-d'),
            'rx' => [
                'OD' => [
                    'SPH'=>$exam->sph_kanan, 'CYL'=>$exam->cyl_kanan, 'AXIS'=>$exam->axis_kanan,
                    'PRISM'=>$exam->prism_kanan, 'BASE'=>$exam->base_kanan, 'ADD'=>$exam->add_kanan, 'MPD'=>$exam->mpd_kanan,
                ],
                'OS' => [
                    'SPH'=>$exam->sph_kiri, 'CYL'=>$exam->cyl_kiri, 'AXIS'=>$exam->axis_kiri,
                    'PRISM'=>$exam->prism_kiri, 'BASE'=>$exam->base_kiri, 'ADD'=>$exam->add_kiri, 'MPD'=>$exam->mpd_kiri,
                ],
            ],
        ]);
    }
}
