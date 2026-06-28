// appV1.0 Rev 2 - Redesign: konsisten dengan GuestLayout split-screen.

import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { useEffect, useState } from 'react';

function Alert({ type, message, show, onClose }) {
    if (!show) return null;
    const styles = {
        error:   'border-red-200 bg-red-50 text-red-700',
        success: 'border-green-200 bg-green-50 text-green-700',
        info:    'border-blue-200 bg-blue-50 text-blue-700',
    };
    const icons = { error: '⚠️', success: '✅', info: 'ℹ️' };
    return (
        <div className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${styles[type] ?? styles.info}`}>
            <span className="mt-0.5 shrink-0 text-base">{icons[type] ?? 'ℹ️'}</span>
            <p className="flex-1 font-medium leading-snug">{message}</p>
            <button type="button" onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
        </div>
    );
}

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const [alert, setAlert]     = useState({ show: false, type: '', message: '' });
    const [cooldown, setCooldown] = useState(0);

    const showAlert = (type, message) => setAlert({ show: true, type, message });

    const submit = (e) => {
        e.preventDefault();
        if (!data.email) { showAlert('error', 'Email harus diisi terlebih dahulu!'); return; }

        post(route('password.email'), {
            onSuccess: () => {
                showAlert('success', 'Link reset password telah dikirim. Silakan cek inbox atau folder spam Anda.');
                setCooldown(60);
            },
            onError: () => {
                showAlert('error', 'Email tidak ditemukan atau Anda sudah meminta link baru-baru ini. Mohon tunggu sebentar.');
            },
        });
    };

    useEffect(() => {
        if (status) showAlert('success', status);
    }, [status]);

    useEffect(() => {
        if (errors.email) showAlert('error', 'Email tidak valid atau tidak terdaftar.');
    }, [errors.email]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => (c <= 1 ? (clearInterval(t), 0) : c - 1)), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    return (
        <>
            <Head title="Lupa Password" />

            {/* Header */}
            <div className="mb-8">
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                    🔑
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Lupa Password?</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Tidak perlu khawatir. Masukkan email Anda dan kami akan mengirimkan link untuk membuat password baru.
                </p>
            </div>

            <Alert
                type={alert.type}
                message={alert.message}
                show={alert.show}
                onClose={() => setAlert((a) => ({ ...a, show: false }))}
            />

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Alamat Email</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="admin@optikkasih.com"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#E56020] focus:ring-4 focus:ring-[#E56020]/10 transition-all duration-200 outline-none"
                        autoComplete="email"
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {cooldown > 0 && (
                    <p className="text-center text-sm text-orange-600 font-medium">
                        Kirim ulang tersedia dalam <strong>{cooldown}</strong> detik
                    </p>
                )}

                <button
                    type="submit"
                    disabled={processing || cooldown > 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E56020] py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                >
                    {processing ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Mengirim...
                        </>
                    ) : (
                        'Kirim Link Reset Password'
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

ForgotPassword.layout = (page) => <GuestLayout>{page}</GuestLayout>;
