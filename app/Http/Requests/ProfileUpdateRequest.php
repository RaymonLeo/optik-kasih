<?php

// appV1.0 Rev 2 - Validasi profil dengan penguncian email utama superadmin.

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->user()?->role !== 'super_admin') {
                    return;
                }

                $superAdminEmail = config('optik.super_admin.email');

                if ($this->string('email')->lower()->toString() !== strtolower($superAdminEmail)) {
                    $validator->errors()->add(
                        'email',
                        'Email superadmin utama harus tetap '.$superAdminEmail.' agar reset password dan verifikasi tetap terhubung.'
                    );
                }
            },
        ];
    }
}
