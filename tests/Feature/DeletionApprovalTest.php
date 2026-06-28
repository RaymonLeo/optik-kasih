<?php

// appV1.0 Rev 4 - Verifikasi alur persetujuan hapus dan notifikasi data pasien.

use App\Models\ActivityLog;
use App\Models\DeletionRequest;
use App\Models\Pasien;
use App\Models\SystemNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makePatient(): Pasien
{
    return Pasien::create([
        'kode_pasien' => 'PX-001',
        'nama_pasien' => 'Pasien Uji',
        'tanggal_buat' => '2026-06-20',
        'alamat_pasien' => 'Pekanbaru',
        'nohp_pasien' => '081234567890',
        'tanggal_lahir' => '2000-01-01',
    ]);
}

test('admin deletion request keeps patient data and notifies superadmin', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $admin = User::factory()->create(['role' => 'admin', 'name' => 'Cabang Uji']);
    $patient = makePatient();

    $this->actingAs($admin)
        ->delete(route('pasien.destroy', $patient), ['delete_reason' => 'Data duplikat'])
        ->assertRedirect(route('pasien.index'));

    $request = DeletionRequest::firstOrFail();

    expect($request->status)->toBe(DeletionRequest::PENDING)
        ->and($request->subject_type)->toBe('pasien')
        ->and($request->subject_id)->toBe($patient->id)
        ->and(Pasien::find($patient->id))->not->toBeNull();

    $this->assertDatabaseHas('system_notifications', [
        'recipient_id' => $superAdmin->id,
        'type' => 'deletion_requested',
    ]);
    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $admin->id,
        'action' => 'delete_requested',
        'model_id' => $patient->id,
    ]);
});

test('superadmin approval deletes requested patient and notifies requester', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin', 'name' => 'Pusat']);
    $admin = User::factory()->create(['role' => 'admin']);
    $patient = makePatient();
    $request = DeletionRequest::create([
        'requester_id' => $admin->id,
        'subject_type' => 'pasien',
        'subject_id' => $patient->id,
        'subject_label' => "Pasien #{$patient->id} - {$patient->nama_pasien}",
        'reason' => 'Data duplikat',
        'snapshot' => $patient->toArray(),
    ]);

    $this->actingAs($superAdmin)
        ->patch(route('super_admin.deletion_requests.approve', $request))
        ->assertSessionHas('success');

    expect($request->fresh()->status)->toBe(DeletionRequest::APPROVED)
        ->and(Pasien::find($patient->id))->toBeNull();

    $this->assertDatabaseHas('system_notifications', [
        'recipient_id' => $admin->id,
        'type' => 'deletion_approved',
    ]);
    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $superAdmin->id,
        'action' => 'delete',
        'model_id' => $patient->id,
    ]);
});

test('admin patient edits require a reason and notify superadmin', function () {
    $superAdmin = User::factory()->create(['role' => 'super_admin']);
    $admin = User::factory()->create(['role' => 'admin', 'name' => 'Cabang Utama']);
    $patient = makePatient();
    $payload = [
        'kode_pasien' => $patient->kode_pasien,
        'nama_pasien' => 'Pasien Diperbarui',
        'tanggal_buat' => '2026-06-20',
        'alamat_pasien' => 'Alamat baru',
        'nohp_pasien' => '081234567890',
        'tanggal_lahir' => '2000-01-01',
    ];

    $this->actingAs($admin)
        ->put(route('pasien.update', $patient), $payload)
        ->assertSessionHasErrors('change_reason');

    $this->actingAs($admin)
        ->put(route('pasien.update', $patient), [...$payload, 'change_reason' => 'Koreksi alamat dari pasien'])
        ->assertRedirect(route('pasien.edit', $patient));

    expect($patient->fresh()->nama_pasien)->toBe('Pasien Diperbarui');

    $this->assertDatabaseHas('system_notifications', [
        'recipient_id' => $superAdmin->id,
        'type' => 'patient_updated',
    ]);
    expect(ActivityLog::query()->where('action', 'update')->firstOrFail()->details['alasan_perubahan'])
        ->toBe('Koreksi alamat dari pasien');
});
