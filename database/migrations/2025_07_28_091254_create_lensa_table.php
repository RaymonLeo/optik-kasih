<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('lensa', function (Blueprint $table) {
            $table->id('id_lensa');

            $table->string('nama_lensa')->nullable();
            $table->string('jenis_lensa')->nullable();
            $table->string('coating_lensa')->nullable();
            $table->string('indeks_lensa')->nullable();

            $table->string('gambar_lensa')->nullable(); // <- OPSIONAL (path file)
            $table->unsignedInteger('stok_lensa')->default(0);

            // OD (kanan)
            $table->string('sph_kanan')->nullable();
            $table->string('cyl_kanan')->nullable();
            $table->string('axis_kanan')->nullable();
            $table->string('prism_kanan')->nullable();
            $table->string('base_kanan')->nullable();
            $table->string('add_kanan')->nullable();

            // OS (kiri)
            $table->string('sph_kiri')->nullable();
            $table->string('cyl_kiri')->nullable();
            $table->string('axis_kiri')->nullable();
            $table->string('prism_kiri')->nullable();
            $table->string('base_kiri')->nullable();
            $table->string('add_kiri')->nullable();

            $table->timestamps();

            $table->index(['nama_lensa', 'jenis_lensa']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('lensa');
    }
};
