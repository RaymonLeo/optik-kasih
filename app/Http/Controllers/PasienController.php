<?php

namespace App\Http\Controllers;

use App\Models\Pasien;
use Illuminate\Http\Request;

class PasienController extends Controller
{
    public function index()
    {
        return response()->json(Pasien::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pasien'   => 'required|string|max:255',
            'tanggal_buat'  => 'nullable|date',
            'alamat_pasien' => 'nullable|string',
            'nohp_pasien'   => 'nullable|string|max:20',
            'tanggal_lahir' => 'nullable|date',
        ]);

        $pasien = Pasien::create($validated);
        return response()->json(['message' => 'Pasien berhasil ditambahkan', 'data' => $pasien], 201);
    }

    public function show($id)
    {
        $pasien = Pasien::find($id);

        if (!$pasien) {
            return response()->json(['message' => 'Pasien tidak ditemukan'], 404);
        }

        return response()->json($pasien);
    }

    public function update(Request $request, $id)
    {
        $pasien = Pasien::find($id);

        if (!$pasien) {
            return response()->json(['message' => 'Pasien tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'nama_pasien'   => 'required|string|max:255',
            'tanggal_buat'  => 'nullable|date',
            'alamat_pasien' => 'nullable|string',
            'nohp_pasien'   => 'nullable|string|max:20',
            'tanggal_lahir' => 'nullable|date',
        ]);

        $pasien->update($validated);
        return response()->json(['message' => 'Pasien berhasil diperbarui', 'data' => $pasien]);
    }

    public function destroy($id)
    {
        $pasien = Pasien::find($id);

        if (!$pasien) {
            return response()->json(['message' => 'Pasien tidak ditemukan'], 404);
        }

        $pasien->delete();
        return response()->json(['message' => 'Pasien berhasil dihapus']);
    }
}
