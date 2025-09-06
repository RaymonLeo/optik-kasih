<?php

namespace App\Http\Controllers;

use App\Models\Pasien;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PasienController extends Controller
{
    // GET /pasien
    public function index()
    {
        $patients = Pasien::orderByDesc('id')
            ->paginate(10)
            ->through(fn (Pasien $p) => [
                'id'             => $p->id,
                'kode_pasien'    => $p->kode_pasien,                                  // ⬅️ tampilkan di UI
                'nama_pasien'    => $p->nama_pasien,
                'alamat_pasien'  => $p->alamat_pasien,
                'tanggal_lahir'  => optional($p->tanggal_lahir)->toDateString(),
                'tanggal_buat'   => optional($p->tanggal_buat)->toDateString(),
                'nohp_pasien'    => $p->nohp_pasien,
            ]);

        return Inertia::render('Pasien/Index', ['patients' => $patients]);
    }

    public function create()
    {
        return Inertia::render('Pasien/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode_pasien'   => 'required|string|max:20|unique:pasien,kode_pasien',
            'nama_pasien'   => 'required|string|max:255',
            'tanggal_buat'  => 'nullable|date',
            'alamat_pasien' => 'nullable|string',
            // telepon hanya angka 8-15 digit:
            'nohp_pasien'   => ['nullable', 'regex:/^\d{8,15}$/'],
            'tanggal_lahir' => 'nullable|date',
        ]);

        Pasien::create($data);

        return redirect()->route('pasien.index')->with('success', 'Pasien berhasil ditambahkan.');
    }

    public function show(Pasien $pasien)
    {
        $healths = $pasien->kesehatan()
            ->latest('tanggal_periksa')
            ->get()
            ->map(function ($h) {
                return [
                    'id'               => $h->id,
                    'tanggal_periksa'  => optional($h->tanggal_periksa)->toDateString(),
                    'kanan' => [
                        'sph'   => $h->sph_kanan,
                        'cyl'   => $h->cyl_kanan,
                        'axis'  => $h->axis_kanan,
                        'prism' => $h->prism_kanan,
                        'base'  => $h->base_kanan,
                        'add'   => $h->add_kanan,
                        'mpd'   => $h->pd_kanan,
                    ],
                    'kiri' => [
                        'sph'   => $h->sph_kiri,
                        'cyl'   => $h->cyl_kiri,
                        'axis'  => $h->axis_kiri,
                        'prism' => $h->prism_kiri,
                        'base'  => $h->base_kiri,
                        'add'   => $h->add_kiri,
                        'mpd'   => $h->pd_kiri,
                    ],
                ];
            });

        return Inertia::render('Pasien/Show', [
            'patient' => [
                'id'            => $pasien->id,
                'kode_pasien'   => $pasien->kode_pasien,                             // ⬅️ kirim ke UI
                'nama_pasien'   => $pasien->nama_pasien,
                'tanggal_buat'  => optional($pasien->tanggal_buat)->toDateString(),
                'alamat_pasien' => $pasien->alamat_pasien,
                'nohp_pasien'   => $pasien->nohp_pasien,
                'tanggal_lahir' => optional($pasien->tanggal_lahir)->toDateString(),
            ],
            'healths' => $healths,
        ]);
    }

    public function edit(Pasien $pasien)
    {
        return Inertia::render('Pasien/Edit', [
            'patient' => [
                'id'            => $pasien->id,
                'kode_pasien'   => $pasien->kode_pasien,
                'nama_pasien'   => $pasien->nama_pasien,
                'tanggal_buat'  => optional($pasien->tanggal_buat)->toDateString(),
                'alamat_pasien' => $pasien->alamat_pasien,
                'nohp_pasien'   => $pasien->nohp_pasien,
                'tanggal_lahir' => optional($pasien->tanggal_lahir)->toDateString(),
            ],
        ]);
    }

    public function update(Request $request, Pasien $pasien)
    {
        $data = $request->validate([
            'kode_pasien'   => 'required|string|max:20|unique:pasien,kode_pasien,' . $pasien->id,
            'nama_pasien'   => 'required|string|max:255',
            'tanggal_buat'  => 'nullable|date',
            'alamat_pasien' => 'nullable|string',
            'nohp_pasien'   => ['nullable', 'regex:/^\d{8,15}$/'],  // ⬅️ angka saja
            'tanggal_lahir' => 'nullable|date',
        ]);

        $pasien->update($data);

        return redirect()->route('pasien.edit', $pasien)->with('success', 'Pasien berhasil diperbarui.');
    }

    public function destroy(Pasien $pasien)
    {
        $pasien->delete();
        return redirect()->route('pasien.index')->with('success', 'Pasien berhasil dihapus.');
    }
}
