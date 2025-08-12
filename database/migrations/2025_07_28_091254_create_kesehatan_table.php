<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('kesehatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pasien_id')->constrained('pasien')->onDelete('cascade');
            $table->date('tanggal_periksa');
            
            $table->string('sph_kanan')->nullable();
            $table->string('cyl_kanan')->nullable();
            $table->string('axis_kanan')->nullable();
            $table->string('prism_kanan')->nullable();
            $table->string('base_kanan')->nullable();
            $table->string('add_kanan')->nullable();
            $table->string('pd_kanan')->nullable();

            $table->string('sph_kiri')->nullable();
            $table->string('cyl_kiri')->nullable();
            $table->string('axis_kiri')->nullable();
            $table->string('prism_kiri')->nullable();
            $table->string('base_kiri')->nullable();
            $table->string('add_kiri')->nullable();
            $table->string('pd_kiri')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('kesehatan');
    }
};

