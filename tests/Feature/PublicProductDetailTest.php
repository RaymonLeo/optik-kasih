<?php

// appV1.0 Rev 6 - Verifikasi detail produk publik tidak mengekspos harga dan menyertakan WhatsApp cabang.

use App\Models\ProductImage;
use App\Models\Produk;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('public product detail returns multi-image data and WhatsApp without public price', function () {
    $branch = User::factory()->create([
        'role' => 'admin',
        'name' => 'Kayu Manis',
        'branch_phone' => '081234567890',
    ]);
    $product = Produk::create([
        'admin_id' => $branch->id,
        'nama_produk' => 'Frame Klasik',
        'kategori_produk' => 'Frame',
        'jumlah_produk' => 3,
        'harga_produk' => 500000,
        'gambar_produk' => 'produk/cover.jpg',
        'deskripsi_produk' => 'Frame ringan untuk penggunaan harian.',
    ]);
    ProductImage::create([
        'produk_id' => $product->id,
        'path' => 'produk/detail.jpg',
        'sort_order' => 1,
    ]);

    $this->get(route('catalog.product.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/ProductShow')
            ->where('product.id', $product->id)
            ->where('product.images.0.url', '/storage/produk/cover.jpg')
            ->where('product.images.1.url', '/storage/produk/detail.jpg')
            ->where('branch.whatsapp_phone', '6281234567890')
            ->missing('product.price'));
});
