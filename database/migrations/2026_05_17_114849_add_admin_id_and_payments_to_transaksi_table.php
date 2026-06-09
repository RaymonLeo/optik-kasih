<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->foreignId('admin_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->string('metode_pembayaran_1')->nullable()->after('sisa');
            $table->string('metode_pembayaran_2')->nullable()->after('metode_pembayaran_1');
        });
    }

    public function down(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropColumn(['admin_id', 'metode_pembayaran_1', 'metode_pembayaran_2']);
        });
    }
};
