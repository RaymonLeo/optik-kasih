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

            // Mata kanan
            $table->string('cyl_kanan')->nullable();
            $table->string('axis_kanan')->nullable();
            $table->string('prism_kanan')->nullable();
            $table->string('base_kanan')->nullable();
            $table->string('add_kanan')->nullable();

            // Mata kiri
            $table->string('sph_kiri')->nullable();
            $table->string('cyl_kiri')->nullable();
            $table->string('axis_kiri')->nullable();
            $table->string('prism_kiri')->nullable();
            $table->string('base_kiri')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('lensa');
    }
};
