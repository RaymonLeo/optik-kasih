// appV1.0 Rev 2 - Global session-expiry overlay: 419 ditangkap dan user diarahkan ke login.

import './bootstrap';
import '../css/app.css';

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import AppSplashScreen from '@/Components/AppSplashScreen';

/* ─── Overlay muncul saat sesi habis (HTTP 419) ───────────────────── */
function SessionExpiredOverlay() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Inertia v1: event 'invalid' = respons bukan Inertia yang valid (mis. 419 HTML)
        const unsub = router.on('invalid', (event) => {
            if (event.detail.response.status === 419) {
                event.preventDefault(); // jangan lempar error browser
                // Simpan URL saat ini agar bisa balik setelah login
                sessionStorage.setItem('auth_intended', window.location.pathname + window.location.search);
                setVisible(true);
            }
        });
        return unsub;
    }, []);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(4px)' }}
        >
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
                    ⏱️
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Sesi Anda Berakhir</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Demi keamanan, sesi login Anda telah berakhir karena tidak ada aktivitas.
                    <br />
                    <span className="font-semibold text-orange-700">
                        Data form yang sedang diisi akan dipulihkan setelah Anda login kembali.
                    </span>
                </p>
                <button
                    onClick={() => { window.location.href = '/login'; }}
                    className="mt-6 w-full rounded-xl bg-[#E56020] py-3 font-bold text-white hover:bg-orange-700 transition"
                >
                    Login Kembali
                </button>
            </div>
        </div>
    );
}

createInertiaApp({
    progress: { color: '#ea580c' },
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        ),
    setup({ el, App, props }) {
        createRoot(el).render(
            <AppSplashScreen>
                <App {...props} />
                <SessionExpiredOverlay />
            </AppSplashScreen>
        );
    },
});
