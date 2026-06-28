// appV1.0 Rev 3 - Branding panel: bg-optik.png lebih terlihat, E56020 sebagai warna utama.

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex selection:bg-[#E56020] selection:text-white">

            {/* ── Kiri: Branding Panel ─────────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden items-center justify-center"
                 style={{ backgroundColor: '#E56020' }}>

                {/* bg-optik.png sebagai pola berulang — putih semi-transparan di atas orange */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "url('/images/bg-optik.png')",
                        backgroundSize: '420px',
                        backgroundRepeat: 'repeat',
                        opacity: 0.18,
                    }}
                />

                {/* Gradasi gelap dari bawah agar teks tetap terbaca */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                {/* Glow accent di sudut */}
                <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white opacity-5 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-white opacity-5 blur-3xl" />

                {/* Konten */}
                <div className="relative z-10 px-12 py-16 text-white max-w-lg flex flex-col items-center text-center">
                    {/* Logo */}
                    <img
                        src="/images/logo-optik.png"
                        alt="Logo Optik Kasih"
                        className="h-28 mb-8 drop-shadow-2xl"
                    />

                    <h1 className="text-4xl font-extrabold leading-tight mb-3 tracking-tight drop-shadow-md">
                        Optik Kasih
                    </h1>
                    <p className="text-lg font-semibold text-white/90 mb-4 drop-shadow">
                        Management System
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed mb-10">
                        Kelola cabang, inventaris, pasien, dan transaksi optik Anda dalam satu sistem terpadu yang aman dan efisien.
                    </p>

                    {/* Feature bullets */}
                    <div className="w-full space-y-3 text-left">
                        {[
                            { icon: '👁', text: 'Kelola data pasien & rekam medis mata' },
                            { icon: '📦', text: 'Inventaris produk & lensa multi-cabang' },
                            { icon: '💳', text: 'Pencatatan transaksi real-time' },
                            { icon: '🔒', text: 'Keamanan data & kontrol akses peran' },
                        ].map(({ icon, text }) => (
                            <div
                                key={text}
                                className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                            >
                                <span className="text-xl shrink-0">{icon}</span>
                                <span className="text-sm text-white font-medium">{text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <p className="mt-10 text-xs text-white/50">
                        © {new Date().getFullYear()} Optik Kasih · Sistem Manajemen Optik
                    </p>
                </div>
            </div>

            {/* ── Kanan: Form Panel ────────────────────────────────────── */}
            <div className="w-full lg:w-[48%] flex items-center justify-center bg-white px-6 py-12 sm:px-12">
                <div className="w-full max-w-[420px]">
                    {/* Logo mobile-only */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <img src="/images/logo-optik.png" alt="Logo Optik Kasih" className="h-20" />
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
