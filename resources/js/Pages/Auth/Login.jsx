// appV1.0 Rev 3 - Redesign: eye icon SVG, spacing diperbaiki, konsisten dengan semua halaman auth.

import { Head, router, useForm } from '@inertiajs/react';
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

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert]               = useState({ show: false, type: '', message: '' });

    const showAlert = (type, message) => setAlert({ show: true, type, message });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.email || !data.password) {
            showAlert('error', 'Email dan password harus diisi terlebih dahulu!');
            return;
        }

        post(route('login'), {
            onFinish: () => reset('password'),
            onSuccess: () => {
                const intended = sessionStorage.getItem('auth_intended');
                if (intended) {
                    sessionStorage.removeItem('auth_intended');
                    router.visit(intended);
                }
            },
            onError: () => {
                showAlert('error', 'Email atau password yang Anda masukkan salah. Silakan coba lagi.');
            },
        });
    };

    useEffect(() => {
        if (errors.email || errors.password) {
            showAlert('error', 'Pastikan email dan password telah diisi dengan benar.');
        }
    }, [errors]);

    const inputClass = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#E56020] focus:ring-4 focus:ring-[#E56020]/10 transition-all duration-200 outline-none';

    return (
        <>
            <Head title="Login Admin" />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Selamat Datang</h1>
                <p className="text-slate-500 text-sm">Silakan masukkan kredensial Anda untuk melanjutkan.</p>
            </div>

            {/* Alert */}
            {alert.show && (
                <div className={`mb-5 flex items-center gap-3 rounded-xl border p-4 text-sm ${
                    alert.type === 'error'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-green-200 bg-green-50 text-green-700'
                }`}>
                    <span className="shrink-0">{alert.type === 'error' ? '⚠️' : '✅'}</span>
                    <p className="flex-1 font-medium">{alert.message}</p>
                    <button
                        type="button"
                        onClick={() => setAlert((a) => ({ ...a, show: false }))}
                        className="shrink-0 opacity-60 hover:opacity-100"
                    >
                        ✕
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="admin@optikkasih.com"
                        autoComplete="email"
                        className={inputClass}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Password */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">Password</label>
                        <a
                            href={route('password.request')}
                            className="text-xs font-medium text-[#E56020] hover:text-orange-700 hover:underline transition-colors"
                        >
                            Lupa Password?
                        </a>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className={`${inputClass} pr-12`}
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

                {/* Submit */}
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
                            Memproses...
                        </>
                    ) : (
                        'Masuk Ke Sistem'
                    )}
                </button>
            </form>
        </>
    );
}

Login.layout = (page) => <GuestLayout>{page}</GuestLayout>;
