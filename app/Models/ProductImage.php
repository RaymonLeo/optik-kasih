<?php

// appV1.0 Rev 7 - Tambah is_thumbnail untuk menandai foto mana yang jadi thumbnail.

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    protected $fillable = [
        'produk_id',
        'path',
        'sort_order',
        'is_thumbnail',
    ];

    protected function casts(): array
    {
        return [
            'sort_order'   => 'integer',
            'is_thumbnail' => 'boolean',
        ];
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
}
