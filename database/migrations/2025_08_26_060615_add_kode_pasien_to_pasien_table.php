<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('pasien', function (Blueprint $table) {
            $table->string('kode_pasien', 20)->nullable()->after('id');
            $table->index('kode_pasien', 'pasien_kode_pasien_index');
            $table->unique('kode_pasien', 'pasien_kode_pasien_unique');
        });
    }

    public function down(): void {
        Schema::table('pasien', function (Blueprint $table) {
            $table->dropUnique('pasien_kode_pasien_unique');
            $table->dropIndex('pasien_kode_pasien_index');
            $table->dropColumn('kode_pasien');
        });
    }
};
