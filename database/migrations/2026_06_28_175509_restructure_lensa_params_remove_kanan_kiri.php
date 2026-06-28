<?php
// appV1.0 Rev 1 - Hapus kolom kanan/kiri (OD/OS), ganti dengan satu set parameter lensa.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lensa', function (Blueprint $table) {
            $table->dropColumn([
                'sph_kanan','cyl_kanan','axis_kanan','prism_kanan','base_kanan','add_kanan',
                'sph_kiri','cyl_kiri','axis_kiri','prism_kiri','base_kiri','add_kiri',
            ]);

            $table->string('sph_lensa')->nullable()->after('indeks_lensa');
            $table->string('cyl_lensa')->nullable()->after('sph_lensa');
            $table->string('axis_lensa')->nullable()->after('cyl_lensa');
            $table->string('add_lensa')->nullable()->after('axis_lensa');
            $table->string('prism_lensa')->nullable()->after('add_lensa');
            $table->string('base_lensa')->nullable()->after('prism_lensa');
        });
    }

    public function down(): void
    {
        Schema::table('lensa', function (Blueprint $table) {
            $table->dropColumn(['sph_lensa','cyl_lensa','axis_lensa','add_lensa','prism_lensa','base_lensa']);

            $table->string('sph_kanan')->nullable();
            $table->string('cyl_kanan')->nullable();
            $table->string('axis_kanan')->nullable();
            $table->string('prism_kanan')->nullable();
            $table->string('base_kanan')->nullable();
            $table->string('add_kanan')->nullable();
            $table->string('sph_kiri')->nullable();
            $table->string('cyl_kiri')->nullable();
            $table->string('axis_kiri')->nullable();
            $table->string('prism_kiri')->nullable();
            $table->string('base_kiri')->nullable();
            $table->string('add_kiri')->nullable();
        });
    }
};
