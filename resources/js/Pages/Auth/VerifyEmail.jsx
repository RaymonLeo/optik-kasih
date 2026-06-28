// appV1.0 Rev 2 - Redesign: konsisten dengan GuestLayout split-screen.

import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useEffect, useState } from 'react';

function Alert({ type, message, show, onClose }) {
    if (!show) return null;
    const styles = {
        success: 'border-green-200 bg-green-50 text-green-700',
        info:    'border-blue-200  bg-blue-50  text-blue-700',
        error:   'border-red-200   bg-red-50   text-red-700',
    };
    const icons = { success: '✅', info: 'ℹ️', error: '⚠️' };
    return (
        <div className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${styles[type] ?? styles.info}`}>
            <span className="mt-0.5 shrink-0 text-base">{icons[type] ?? 'ℹ️'}</span>
            <p className="flex-1 font-medium leading-snug">{message}</p>
            <button type="button" onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
        </div>
    );
}

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    const showAlert = (type, message) => setAlert({ show: true, type, message });

    useEffect(() => {
        if (status === 'verification-link-sent') {
            showAlert('success', 'Link verifikasi baru sudah dikirim ke email Anda. Silakan cek inbox atau folder spam.');
        } else if (status) {
            showAlert('info', status);
        }
    }, [status]);

    const resend = (e) => {
        e.preventDefault();
        post(route('verification.send'), {
            onSuccess: () => showAlert('success', 'Link verifikasi baru sudah dikirim. Silakan cek inbox/spam.'),
        });
    };

    return (
        <>
            <Head title="Verifikasi Email" />

            {/* Header */}
            <div className="mb-8">
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                    📧
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Verifikasi Email</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Terima kasih sudah mendaftar! Sebelum memulai, harap verifikasi alamat email Anda dengan mengklik tautan yang baru saja kami kirimkan.
                </p>
            </div>

            <Alert
                type={alert.type}
                message={alert.message}
                show={alert.show}
                onClose={() => setAlert((a) => ({ ...a, show: false }))}
            />

            {/* Info card */}
            <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="leading-relaxed">
                    Jika Anda belum menerima email verifikasi, kami dengan senang hati akan mengirimkannya kembali menggunakan tombol di bawah ini.
                </p>
            </div>

            <div className="space-y-3">
                <button
                    onClick={resend}
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E56020] py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                >
                    {processing ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Mengirim...
                        </>
                    ) : (
                        'Kirim Ulang Email Verifikasi'
                    )}
                </button>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full flex items-center justify-center rounded-xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm"
                >
                    Keluar dari Akun
                </Link>
            </div>

            <div className="mt-6 text-center">
                <Link
                    href={route('login')}
                    className="text-sm font-medium text-[#E56020] hover:text-orange-700 hover:underline transition-colors"
                >
                    ← Kembali ke Login
                </Link>
            </div>
        </>
    );
}

VerifyEmail.layout = (page) => <GuestLayout>{page}</GuestLayout>;
