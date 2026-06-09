<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('branch_phone')->nullable()->after('email');
            $table->string('branch_operational_hours')->nullable()->after('branch_phone');
            $table->text('branch_address')->nullable()->after('branch_operational_hours');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['branch_phone', 'branch_operational_hours', 'branch_address']);
        });
    }
};
