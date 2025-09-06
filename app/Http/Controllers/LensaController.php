<?php

namespace App\Http\Controllers;

use App\Models\Lensa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LensaController extends Controller
{
    public function index(Request $r)
    {
        $q = Lensa::query();

        $search = trim($r->get('search', ''));
        if ($search !== '') {
            $q->where(function($x) use ($search) {
                $x->where('nama_lensa','like',"%$search%")
                  ->orWhere('jenis_lensa','like',"%$search%")
                  ->orWhere('coating_lensa','like',"%$search%")
                  ->orWhere('indeks_lensa','like',"%$search%");
            });
        }

        $rows = $q->orderBy('nama_lensa')
                  ->paginate(12)->withQueryString()
                  ->through(function(Lensa $l) {
                      return [
                          'id_lensa'      => $l->id_lensa,
                          'nama_lensa'    => $l->nama_lensa,
                          'jenis_lensa'   => $l->jenis_lensa,
                          'coating_lensa' => $l->coating_lensa,
                          'indeks_lensa'  => $l->indeks_lensa,
                          'stok_lensa'    => $l->stok_lensa,
                          'gambar_url'    => $l->image_url, // accessor
                          'spec' => [
                            'kanan' => ['SPH'=>$l->sph_kanan,'CYL'=>$l->cyl_kanan,'AXIS'=>$l->axis_kanan,'PRISM'=>$l->prism_kanan,'BASE'=>$l->base_kanan,'ADD'=>$l->add_kanan],
                            'kiri'  => ['SPH'=>$l->sph_kiri ,'CYL'=>$l->cyl_kiri ,'AXIS'=>$l->axis_kiri ,'PRISM'=>$l->prism_kiri ,'BASE'=>$l->base_kiri ,'ADD'=>$l->add_kiri],
                          ],
                      ];
                  });

        return Inertia::render('Lensa/Index', [
            'rows'  => $rows,
            'query' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Lensa/Create');
    }

    public function store(Request $r)
    {
        $data = $this->validated($r);

        // gambar_lensa opsional
        if ($r->hasFile('gambar_lensa')) {
            $data['gambar_lensa'] = $r->file('gambar_lensa')->store('lensa','public');
        }

        Lensa::create($data);
        return redirect()->route('lensa.index')->with('success','Lensa ditambahkan');
    }

    public function edit(Lensa $lensa)
    {
        return Inertia::render('Lensa/Edit', [
            'prefill' => array_merge(
                $lensa->only([
                    'id_lensa','nama_lensa','jenis_lensa','coating_lensa','indeks_lensa',
                    'stok_lensa','gambar_lensa',
                    'sph_kanan','cyl_kanan','axis_kanan','prism_kanan','base_kanan','add_kanan',
                    'sph_kiri','cyl_kiri','axis_kiri','prism_kiri','base_kiri','add_kiri',
                ]),
                ['gambar_url' => $lensa->image_url]
            ),
        ]);
    }

    public function update(Request $r, Lensa $lensa)
    {
        $data = $this->validated($r);

        if ($r->hasFile('gambar_lensa')) {
            // hapus lama (jika ada)
            if ($lensa->gambar_lensa) {
                Storage::disk('public')->delete($lensa->gambar_lensa);
            }
            $data['gambar_lensa'] = $r->file('gambar_lensa')->store('lensa','public');
        }

        $lensa->update($data);
        return redirect()->route('lensa.index')->with('success','Lensa diupdate');
    }

    public function destroy(Lensa $lensa)
    {
        if ($lensa->gambar_lensa) {
            Storage::disk('public')->delete($lensa->gambar_lensa);
        }
        $lensa->delete();
        return back()->with('success','Lensa dihapus');
    }

    // untuk autocomplete di form Transaksi (opsional)
    public function search(Request $r)
    {
        $term = trim($r->get('q',''));
        $q = Lensa::query();
        if ($term !== '') {
            $q->where('nama_lensa','like',"%$term%");
        }
        return $q->limit(10)->get(['id_lensa','nama_lensa'])->map(function($l){
            return ['id'=>$l->id_lensa, 'text'=>$l->nama_lensa];
        });
    }

    private function validated(Request $r): array
    {
        return $r->validate([
            'nama_lensa'    => ['nullable','string','max:120'],
            'jenis_lensa'   => ['nullable','string','max:120'],
            'coating_lensa' => ['nullable','string','max:120'],
            'indeks_lensa'  => ['nullable','string','max:50'],
            'stok_lensa'    => ['nullable','integer','min:0'],

            'gambar_lensa'  => ['nullable','image','mimes:jpg,jpeg,png,webp','max:2048'], // 2MB

            'sph_kanan'     => ['nullable','string','max:20'],
            'cyl_kanan'     => ['nullable','string','max:20'],
            'axis_kanan'    => ['nullable','string','max:20'],
            'prism_kanan'   => ['nullable','string','max:20'],
            'base_kanan'    => ['nullable','string','max:20'],
            'add_kanan'     => ['nullable','string','max:20'],

            'sph_kiri'      => ['nullable','string','max:20'],
            'cyl_kiri'      => ['nullable','string','max:20'],
            'axis_kiri'     => ['nullable','string','max:20'],
            'prism_kiri'    => ['nullable','string','max:20'],
            'base_kiri'     => ['nullable','string','max:20'],
            'add_kiri'      => ['nullable','string','max:20'],
        ]);
    }
}
