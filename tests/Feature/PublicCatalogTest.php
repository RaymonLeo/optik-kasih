<?php

// appV1.0 Rev 5 - Verifikasi katalog publik memisahkan produk berdasarkan cabang dan filter harga.

use App\Models\Produk;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('public catalog only returns products from the selected branch and applies category filter', function () {
    $kayuManis = User::factory()->create(['role' => 'admin', 'name' => 'Kayu Manis']);
    $otherBranch = User::factory()->create(['role' => 'admin', 'name' => 'Cabang Lain']);

    $matchingProduct = Produk::create([
        'admin_id' => $kayuManis->id,
        'nama_produk' => 'Frame Kayu Manis',
        'kategori_produk' => 'Frame',
        'jumlah_produk' => 5,
        'harga_produk' => 250000,
    ]);
    Produk::create([
        'admin_id' => $kayuManis->id,
        'nama_produk' => 'Lensa Cabang Kayu Manis',
        'kategori_produk' => 'Lensa',
        'jumlah_produk' => 2,
        'harga_produk' => 900000,
    ]);
    Produk::create([
        'admin_id' => $otherBranch->id,
        'nama_produk' => 'Produk Cabang Lain',
        'kategori_produk' => 'Frame',
        'jumlah_produk' => 4,
        'harga_produk' => 100000,
    ]);

    $this->get(route('catalog', ['branch' => $kayuManis->id, 'category' => 'Frame']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Catalog')
            ->where('filters.branch', (string) $kayuManis->id)
            ->has('products.data', 1)
            ->where('products.data.0.id', $matchingProduct->id)
            ->where('products.data.0.admin.id', $kayuManis->id)
            ->missing('products.data.0.harga_produk'));
});
