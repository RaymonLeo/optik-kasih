<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropForeign(['pasien_id']);
        });

        Schema::table('transaksi', function (Blueprint $table) {
            $table->foreignId('pasien_id')->nullable()->change();
            $table->foreign('pasien_id')->references('id')->on('pasien')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropForeign(['pasien_id']);
        });

        Schema::table('transaksi', function (Blueprint $table) {
            $table->foreignId('pasien_id')->nullable(false)->change();
            $table->foreign('pasien_id')->references('id')->on('pasien')->cascadeOnDelete();
        });
    }
};
