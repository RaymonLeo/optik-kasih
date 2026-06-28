<?php
// appV1.0 Rev 1 - Tambah kolom status ke tabel pasien (aktif/nonaktif).

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pasien', function (Blueprint $table) {
            $table->string('status', 20)->default('aktif')->after('tanggal_lahir');
        });
    }

    public function down(): void
    {
        Schema::table('pasien', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
