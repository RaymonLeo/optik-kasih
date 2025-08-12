<?php

namespace App\Http\Controllers;

use App\Models\Kesehatan;
use Illuminate\Http\Request;

class KesehatanController extends Controller
{
    public function index()
    {
        return response()->json(Kesehatan::with('pasien')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pasien_id'         => 'required|exists:pasien,id',
            'tanggal_periksa'   => 'required|date',
            'sph_kanan'         => 'nullable|string',
            'cyl_kanan'         => 'nullable|string',
            'axis_kanan'        => 'nullable|string',
            'prism_kanan'       => 'nullable|string',
            'base_kanan'        => 'nullable|string',
            'add_kanan'         => 'nullable|string',
            'pd_kanan'          => 'nullable|string',
            'sph_kiri'          => 'nullable|string',
            'cyl_kiri'          => 'nullable|string',
            'axis_kiri'         => 'nullable|string',
            'prism_kiri'        => 'nullable|string',
            'base_kiri'         => 'nullable|string',
            'add_kiri'          => 'nullable|string',
            'pd_kiri'           => 'nullable|string',
        ]);

        $kesehatan = Kesehatan::create($validated);
        return response()->json(['message' => 'Data kesehatan berhasil ditambahkan', 'data' => $kesehatan], 201);
    }

    public function show($id)
    {
        $kesehatan = Kesehatan::with('pasien')->find($id);

        if (!$kesehatan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($kesehatan);
    }

    public function update(Request $request, $id)
    {
        $kesehatan = Kesehatan::find($id);

        if (!$kesehatan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'pasien_id'         => 'required|exists:pasien,id',
            'tanggal_periksa'   => 'required|date',
            'sph_kanan'         => 'nullable|string',
            'cyl_kanan'         => 'nullable|string',
            'axis_kanan'        => 'nullable|string',
            'prism_kanan'       => 'nullable|string',
            'base_kanan'        => 'nullable|string',
            'add_kanan'         => 'nullable|string',
            'pd_kanan'          => 'nullable|string',
            'sph_kiri'          => 'nullable|string',
            'cyl_kiri'          => 'nullable|string',
            'axis_kiri'         => 'nullable|string',
            'prism_kiri'        => 'nullable|string',
            'base_kiri'         => 'nullable|string',
            'add_kiri'          => 'nullable|string',
            'pd_kiri'           => 'nullable|string',
        ]);

        $kesehatan->update($validated);
        return response()->json(['message' => 'Data berhasil diperbarui', 'data' => $kesehatan]);
    }

    public function destroy($id)
    {
        $kesehatan = Kesehatan::find($id);

        if (!$kesehatan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $kesehatan->delete();
        return response()->json(['message' => 'Data berhasil dihapus']);
    }
}
