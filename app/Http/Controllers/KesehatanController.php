<?php

namespace App\Http\Controllers;

use App\Models\Kesehatan;
use App\Models\Pasien;
use Illuminate\Http\Request;

class KesehatanController extends Controller
{
    public function store(Request $request, Pasien $pasien)
    {
        $this->validateReq($request, true);

        $payload = $this->mapToColumns($request, $pasien->id);
        Kesehatan::create($payload);

        return redirect()->route('pasien.show', $pasien)->with('success', 'Data mata berhasil ditambahkan.');
    }

    public function update(Request $request, Kesehatan $kesehatan)
    {
        $this->validateReq($request, false);

        $payload = $this->mapToColumns($request, $kesehatan->pasien_id);
        $kesehatan->update($payload);

        return redirect()->route('pasien.show', $kesehatan->pasien_id)->with('success', 'Data mata berhasil diupdate.');
    }

    public function destroy(Kesehatan $kesehatan)
    {
        $pasienId = $kesehatan->pasien_id;
        $kesehatan->delete();

        return redirect()->route('pasien.show', $pasienId)->with('success', 'Data mata telah dihapus.');
    }

    private function validateReq(Request $request, bool $requireDate): void
    {
        $request->validate([
            'tanggal_periksa' => ($requireDate ? 'required' : 'sometimes') . '|date',
            'kanan'           => 'nullable|array',
            'kiri'            => 'nullable|array',
            'kanan.*'         => 'nullable|string',
            'kiri.*'          => 'nullable|string',
        ]);
    }

    private function mapToColumns(Request $request, int $pasienId): array
    {
        $kanan = $request->input('kanan', []);
        $kiri  = $request->input('kiri', []);

        return [
            'pasien_id'       => $pasienId,
            'tanggal_periksa' => $request->input('tanggal_periksa'),

            'sph_kanan' => $kanan['sph'] ?? null,
            'cyl_kanan' => $kanan['cyl'] ?? null,
            'axis_kanan'=> $kanan['axis'] ?? null,
            'prism_kanan'=> $kanan['prism'] ?? null,
            'base_kanan' => $kanan['base'] ?? null,
            'add_kanan'  => $kanan['add'] ?? null,
            'pd_kanan'   => $kanan['mpd'] ?? ($kanan['pd'] ?? null),

            'sph_kiri'  => $kiri['sph'] ?? null,
            'cyl_kiri'  => $kiri['cyl'] ?? null,
            'axis_kiri' => $kiri['axis'] ?? null,
            'prism_kiri'=> $kiri['prism'] ?? null,
            'base_kiri' => $kiri['base'] ?? null,
            'add_kiri'  => $kiri['add'] ?? null,
            'pd_kiri'   => $kiri['mpd'] ?? ($kiri['pd'] ?? null),
        ];
    }
}
