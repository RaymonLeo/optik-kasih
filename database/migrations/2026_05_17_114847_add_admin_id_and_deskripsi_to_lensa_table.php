<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lensa', function (Blueprint $table) {
            $table->foreignId('admin_id')->nullable()->after('id_lensa')->constrained('users')->nullOnDelete();
            $table->text('deskripsi')->nullable()->after('indeks_lensa');
        });
    }

    public function down(): void
    {
        Schema::table('lensa', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropColumn(['admin_id', 'deskripsi']);
        });
    }
};
