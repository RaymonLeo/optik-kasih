<?php

// appV1.0 Rev 2 - Test profil termasuk penguncian dan notifikasi akun superadmin.

use App\Models\User;
use App\Notifications\AccountSecurityNotification;
use Illuminate\Support\Facades\Notification;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $user->refresh();

    $this->assertSame('Test User', $user->name);
    $this->assertSame('test@example.com', $user->email);
    $this->assertNull($user->email_verified_at);
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/profile', [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertNotNull($user->refresh()->email_verified_at);
});

test('superadmin email cannot be changed from profile', function () {
    $user = User::factory()->create([
        'email' => config('optik.super_admin.email'),
        'role' => 'super_admin',
        'email_verified_at' => now(),
    ]);

    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->patch('/profile', [
            'name' => 'Optik Kasih',
            'email' => 'owner@example.com',
        ]);

    $response
        ->assertSessionHasErrors('email')
        ->assertRedirect('/profile');

    $this->assertSame(config('optik.super_admin.email'), $user->refresh()->email);
});

test('superadmin profile update sends security notification', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email' => config('optik.super_admin.email'),
        'role' => 'super_admin',
        'email_verified_at' => now(),
    ]);

    $response = $this
        ->actingAs($user)
        ->patch('/profile', [
            'name' => 'Optik Kasih Pusat',
            'email' => config('optik.super_admin.email'),
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    Notification::assertSentTo($user, AccountSecurityNotification::class);
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete('/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    $this->assertNull($user->fresh());
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->delete('/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/profile');

    $this->assertNotNull($user->fresh());
});
