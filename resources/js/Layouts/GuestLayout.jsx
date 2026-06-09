export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex selection:bg-[#E56020] selection:text-white">
            {/* Left Side: Branding & Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('/images/bg-optik.png')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/90 to-[#E56020]/30"></div>
                
                <div className="relative z-10 p-12 text-center text-white max-w-lg flex flex-col items-center">
                    <img src="/images/logo-optik.png" alt="Logo Optik Kasih" className="h-32 mb-8 transform hover:scale-105 transition-transform duration-300" />
                    <h1 className="text-4xl font-bold mb-4">Optik Kasih Management System</h1>
                    <p className="text-slate-300 text-lg">
                        Selamat datang kembali. Akses sistem manajemen untuk mengelola cabang, inventaris, dan transaksi dengan mudah dan cepat.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8 sm:p-12">
                <div className="ok-page-transition ok-fade-up w-full max-w-md">
                    <div className="lg:hidden flex justify-center mb-8">
                        <img src="/images/logo-optik.png" alt="Logo Optik Kasih" className="h-24" />
                    </div>
                    
                    {children}
                </div>
            </div>
        </div>
    );
}
