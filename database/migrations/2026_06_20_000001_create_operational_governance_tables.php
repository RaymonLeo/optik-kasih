<?php

// appV1.0 Rev 4 - Notifikasi, persetujuan penghapusan, dan galeri publik cabang.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('branch_description')->nullable()->after('branch_address');
        });

        Schema::create('branch_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->string('path');
            $table->string('caption')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['admin_id', 'is_featured']);
        });

        Schema::create('deletion_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject_type', 40);
            $table->unsignedBigInteger('subject_id');
            $table->string('subject_label');
            $table->text('reason');
            $table->json('snapshot')->nullable();
            $table->string('status', 20)->default('pending');
            $table->text('reviewer_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['subject_type', 'subject_id', 'status']);
        });

        Schema::create('system_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 80);
            $table->string('title');
            $table->text('message');
            $table->string('url')->nullable();
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['recipient_id', 'read_at', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_notifications');
        Schema::dropIfExists('deletion_requests');
        Schema::dropIfExists('branch_photos');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('branch_description');
        });
    }
};
