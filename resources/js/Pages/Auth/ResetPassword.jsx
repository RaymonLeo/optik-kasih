// appV1.0 Rev 2 - Redesign: konsisten dengan GuestLayout split-screen, eye icon SVG.

import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { useEffect, useState } from 'react';

function EyeIcon({ open }) {
    return open ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );
}

function Alert({ type, message, show, onClose }) {
    if (!show) return null;
    const styles = {
        error:   'border-red-200 bg-red-50 text-red-700',
        success: 'border-green-200 bg-green-50 text-green-700',
    };
    const icons = { error: '⚠️', success: '✅' };
    return (
        <div className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${styles[type] ?? styles.info}`}>
            <span className="mt-0.5 shrink-0 text-base">{icons[type]}</span>
            <p className="flex-1 font-medium leading-snug">{message}</p>
            <button type="button" onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
        </div>
    );
}

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const [alert, setAlert]                   = useState({ show: false, type: '', message: '' });
    const [showPassword, setShowPassword]     = useState(false);
    const [showConfirm, setShowConfirm]       = useState(false);

    const showAlert = (type, message) => setAlert({ show: true, type, message });

    const submit = (e) => {
        e.preventDefault();

        if (!data.password || !data.password_confirmation) {
            showAlert('error', 'Password dan konfirmasi password harus diisi!');
            return;
        }
        if (data.password !== data.password_confirmation) {
            showAlert('error', 'Password dan konfirmasi password tidak cocok!');
            return;
        }
        if (data.password.length < 8) {
            showAlert('error', 'Password harus minimal 8 karakter!');
            return;
        }
        if (data.password.length > 12) {
            showAlert('error', 'Password maksimal 12 karakter!');
            return;
        }
        if (!/[A-Z]/.test(data.password)) {
            showAlert('error', 'Password harus mengandung minimal 1 huruf besar!');
            return;
        }
        if (!/[0-9]/.test(data.password)) {
            showAlert('error', 'Password harus mengandung minimal 1 angka!');
            return;
        }

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => showAlert('success', 'Password berhasil diubah! Silakan login dengan password baru.'),
            onError: () => showAlert('error', 'Token tidak valid atau sudah kedaluwarsa. Buat link baru dari halaman "Lupa Password".'),
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            showAlert('error', 'Silakan periksa kembali data yang Anda masukkan.');
        }
    }, [errors]);

    return (
        <>
            <Head title="Reset Password" />

            {/* Header */}
            <div className="mb-8">
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                    🔒
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Buat Password Baru</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Masukkan password baru Anda. Gunakan 8–12 karakter dengan kombinasi huruf besar dan angka.
                </p>
            </div>

            <Alert
                type={alert.type}
                message={alert.message}
                show={alert.show}
                onClose={() => setAlert((a) => ({ ...a, show: false }))}
            />

            <form onSubmit={submit} className="space-y-5">
                <input type="hidden" value={data.token} readOnly />

                {/* Email (readonly) */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                    <input
                        type="email"
                        value={data.email}
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 cursor-not-allowed outline-none"
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                    <InputError message={errors.token} className="mt-1.5" />
                </div>

                {/* Password baru */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password Baru</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="8–12 karakter, huruf besar & angka"
                            maxLength={12}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-[#E56020] focus:ring-4 focus:ring-[#E56020]/10 transition-all duration-200 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <EyeIcon open={showPassword} />
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Konfirmasi password */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Konfirmasi Password</label>
                    <div className="relative">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Ulangi password baru"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-[#E56020] focus:ring-4 focus:ring-[#E56020]/10 transition-all duration-200 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <EyeIcon open={showConfirm} />
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E56020] py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 mt-2"
                >
                    {processing ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan Password Baru'
                    )}
                </button>

                <div className="text-center pt-1">
                    <a
                        href={route('login')}
                        className="text-sm font-medium text-[#E56020] hover:text-orange-700 hover:underline transition-colors"
                    >
                        ← Kembali ke Login
                    </a>
                </div>
            </form>
        </>
    );
}

ResetPassword.layout = (page) => <GuestLayout>{page}</GuestLayout>;
