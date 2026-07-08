<?php

// appV1.0 Rev 1 - Resize & kompres gambar upload otomatis (admin tidak perlu compress manual).

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ImageCompressor
{
    /** Sisi terpanjang gambar dibatasi ke ukuran ini (px), tidak pernah diperbesar. */
    private const MAX_DIMENSION = 1600;

    /** Kualitas encode untuk format lossy (jpg/webp), 0-100. */
    private const QUALITY = 78;

    /**
     * Resize (jika perlu) dan kompres file upload, lalu simpan ke disk.
     * GIF dibiarkan apa adanya supaya animasi tidak rusak.
     *
     * @return string path relatif hasil simpan, sama seperti UploadedFile::store()
     */
    public static function store(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'gif') {
            return $file->store($directory, $disk);
        }

        $manager = new ImageManager(Driver::class);
        $image = $manager->decodePath($file->getRealPath());
        $image->scaleDown(self::MAX_DIMENSION, self::MAX_DIMENSION);

        $targetExtension = match ($extension) {
            'png'  => 'png',
            'webp' => 'webp',
            default => 'jpg',
        };

        $encoded = $image->encodeUsingFileExtension($targetExtension, quality: self::QUALITY);

        $path = trim($directory, '/') . '/' . Str::random(40) . '.' . $targetExtension;
        Storage::disk($disk)->put($path, (string) $encoded);

        return $path;
    }
}
