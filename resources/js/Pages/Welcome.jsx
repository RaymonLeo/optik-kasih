// appV1.0 Rev 9 - Hapus tombol masuk admin dari halaman publik; gunakan branch_map_link untuk embed peta.

import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowRight,
    CalendarCheck,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    Filter,
    Glasses,
    HeartPulse,
    MapPin,
    Phone,
    Search,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Store,
} from 'lucide-react';

/* ─── Sub-komponen ─────────────────────────────────────────────────────── */

function BranchCard({ branch, isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group w-full overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 ${
                isActive
                    ? 'border-[#e56020] bg-[#fff7f1] shadow-[0_18px_45px_rgba(229,96,32,0.15)]'
                    : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15'
            }`}
        >
            {branch.photos?.[0] ? (
                <img
                    src={branch.photos[0].url}
                    alt={branch.name}
                    className="aspect-[16/7] w-full object-cover transition duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex aspect-[16/7] w-full items-center justify-center bg-white/5">
                    <Store className="h-12 w-12 opacity-30" />
                </div>
            )}
            <div className="p-5">
                {isActive && (
                    <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-[#e56020] px-2.5 py-1 text-xs font-bold text-white">
                        <CheckCircle2 className="h-3 w-3" /> Dipilih
                    </span>
                )}
                <h3 className={`text-xl font-black ${isActive ? 'text-[#1f3b3d]' : 'text-white'}`}>{branch.name}</h3>
                {branch.description && (
                    <p className={`mt-2 line-clamp-2 text-sm leading-6 ${isActive ? 'text-slate-600' : 'text-white/70'}`}>
                        {branch.description}
                    </p>
                )}
                <p className={`mt-3 flex items-start gap-2 text-sm ${isActive ? 'text-slate-600' : 'text-white/70'}`}>
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e56020]" />
                    {branch.address || 'Alamat belum diisi'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                    <span className={`rounded-full px-2.5 py-1 ${isActive ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-white/80'}`}>
                        {branch.hours || '10.30-21.00 WIB'}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 ${isActive ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-white/80'}`}>
                        {branch.product_count} produk
                    </span>
                </div>
            </div>
        </button>
    );
}

function PhotoCarousel({ photos, className = '' }) {
    const [idx, setIdx] = useState(0);
    const len = photos.length;

    useEffect(() => {
        if (len < 2) return;
        const t = setInterval(() => setIdx((i) => (i + 1) % len), 5000);
        return () => clearInterval(t);
    }, [len]);

    if (!len) return null;

    return (
        <div className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${className}`}>
            <img
                src={photos[idx].url}
                alt={photos[idx].caption || 'Foto toko'}
                className="aspect-[4/3] w-full object-cover transition duration-700"
            />
            {len > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => setIdx((i) => (i - 1 + len) % len)}
                        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-white hover:bg-slate-950"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIdx((i) => (i + 1) % len)}
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/60 text-white hover:bg-slate-950"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {photos.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setIdx(i)}
                                className={`h-2 w-2 rounded-full transition ${i === idx ? 'bg-white' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                </>
            )}
            {photos[idx].caption && (
                <p className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/70 px-4 pb-3 pt-6 text-sm font-semibold text-white">
                    {photos[idx].caption}
                </p>
            )}
        </div>
    );
}

/* ─── Halaman Tidak Ada Cabang ─────────────────────────────────────────── */
function NoBranchPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#18383a] p-6 text-center text-white">
            <Head title="Optik Kasih" />
            <img src="/images/logo-optik.png" alt="Optik Kasih" className="h-20 w-auto" />
            <h1 className="mt-6 text-3xl font-black">Optik Kasih</h1>
            <p className="mt-3 max-w-md text-base leading-7 text-white/75">
                Sistem sedang dipersiapkan. Belum ada cabang yang aktif saat ini. Silakan hubungi pengelola untuk informasi lebih lanjut.
            </p>
            <p className="mt-8 text-xs text-white/40">&copy; {new Date().getFullYear()} Optik Kasih</p>
        </div>
    );
}

/* ─── Halaman Pilih Cabang ─────────────────────────────────────────────── */
function BranchPickerPage({ branches, onPick }) {
    return (
        <div className="min-h-screen bg-[#18383a] text-white">
            <Head title="Optik Kasih - Pilih Cabang" />

            <nav className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-[#18383a]/90 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo-optik.png" alt="Optik Kasih" className="h-11 w-auto" />
                        <div className="leading-tight">
                            <span className="block text-xl font-black tracking-wide">Optik Kasih</span>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f7b267]">Sejak 2007</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 pb-20 pt-36 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f7b267]">Selamat datang</p>
                    <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                        Pilih cabang Optik Kasih<br className="hidden sm:block" /> yang ingin Anda kunjungi
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70">
                        Katalog produk, foto toko, dan informasi kontak disesuaikan dengan cabang yang Anda pilih.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {branches.map((branch) => (
                        <BranchCard key={branch.id} branch={branch} isActive={false} onClick={() => onPick(branch.id)} />
                    ))}
                </div>
            </main>

            <footer className="border-t border-white/10 py-6 text-center text-sm text-white/40">
                &copy; {new Date().getFullYear()} Optik Kasih. Semua hak dilindungi.
            </footer>
        </div>
    );
}

/* ─── Komponen utama ───────────────────────────────────────────────────── */
export default function Welcome({ products, categories = [], branches = [], filters = {}, contact = {} }) {
    const hasBranches = branches.length > 0;

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeCategory, setActiveCategory] = useState(filters.category || '');
    const [activeBranch, setActiveBranch] = useState(filters.branch || '');
    const [carouselIndex, setCarouselIndex] = useState(0);

    const selectedBranch = useMemo(
        () => branches.find((b) => b.id === activeBranch) || null,
        [branches, activeBranch],
    );

    const handleBranchClick = (branchId) => {
        setActiveBranch(branchId);
        setActiveCategory('');
        router.get(route('home'), { branch: branchId, search: '', category: '' }, { preserveState: true });
    };

    const visitCatalog = (params = {}) => {
        router.get(route('home'), { branch: activeBranch, search: searchQuery, category: activeCategory, ...params }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => { e.preventDefault(); visitCatalog({ search: searchQuery }); };
    const handleCategoryClick = (cat) => {
        const next = activeCategory === cat ? '' : cat;
        setActiveCategory(next);
        visitCatalog({ category: next });
    };
    const clearFilters = () => {
        setSearchQuery('');
        setActiveCategory('');
        router.get(route('home'), activeBranch ? { branch: activeBranch } : {}, { preserveState: true, preserveScroll: true });
    };

    const productList = products?.data || [];
    const carouselPhotos = selectedBranch?.photos || [];

    useEffect(() => { setCarouselIndex(0); }, [activeBranch]);
    useEffect(() => {
        if (carouselPhotos.length < 2) return;
        const t = setInterval(() => setCarouselIndex((i) => (i + 1) % carouselPhotos.length), 5000);
        return () => clearInterval(t);
    }, [carouselPhotos.length]);

    // Peta dinamis: prioritaskan branch_map_link dari database, fallback ke alamat
    const mapEmbedUrl = useMemo(() => {
        const raw = selectedBranch?.map_link || '';
        if (raw) {
            // Jika disimpan sebagai HTML iframe, ekstrak src
            const iframeSrcMatch = raw.match(/src="([^"]+)"/);
            if (iframeSrcMatch) return iframeSrcMatch[1];
            // Sudah URL embed
            if (raw.includes('/maps/embed') || raw.includes('output=embed')) return raw;
            // Ekstrak koordinat
            const coordMatch = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordMatch) return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed&z=16`;
            try {
                const u = new URL(raw);
                const q = u.searchParams.get('q');
                if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&z=16`;
            } catch (_) { /* */ }
        }
        // Fallback ke alamat
        const addr = selectedBranch?.address || contact.address || '';
        if (!addr) return null;
        return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&output=embed&z=16`;
    }, [selectedBranch?.map_link, selectedBranch?.address, contact.address]);

    const mapUrl = useMemo(() => {
        const addr = selectedBranch?.address || contact.address || '';
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    }, [selectedBranch?.address, contact.address]);

    /* ─── Render bersyarat ─────────────────────────────────────────────── */
    if (!hasBranches) return <NoBranchPage />;
    if (!filters.branch) return <BranchPickerPage branches={branches} onPick={handleBranchClick} />;

    /* ─── Homepage penuh ─────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#f8faf8] pt-20 font-sans text-[#1d2a2c] selection:bg-[#e56020] selection:text-white">
            <Head title={`Optik Kasih${selectedBranch ? ` – ${selectedBranch.name}` : ''}`} />

            {/* Navbar */}
            <nav className="fixed inset-x-0 top-0 z-[100] border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href={route('home')} className="flex items-center gap-3">
                        <img src="/images/logo-optik.png" alt="Optik Kasih" className="h-11 w-auto" />
                        <div className="leading-tight">
                            <span className="block text-xl font-black tracking-wide text-[#1f3b3d]">Optik Kasih</span>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e56020]">Sejak {contact.since || '2007'}</span>
                        </div>
                    </Link>
                    <div className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
                        <button type="button" onClick={() => router.get(route('home'), {}, { preserveState: false })} className="hover:text-[#e56020]">
                            Pilih Cabang
                        </button>
                        <Link href={route('catalog', activeBranch ? { branch: activeBranch } : {})} className="hover:text-[#e56020]">Katalog Produk</Link>
                        <a href="#layanan" className="hover:text-[#e56020]">Layanan</a>
                        <a href="#kontak" className="hover:text-[#e56020]">Kontak</a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <header className="relative overflow-hidden bg-[#18383a]">
                <div className="absolute inset-0 bg-[url('/images/bg-optik.png')] bg-cover bg-center opacity-30" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,31,33,0.95),rgba(24,56,58,0.76),rgba(245,112,39,0.36))]" />
                <div className="relative mx-auto grid min-h-[74vh] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                    <div className="text-white">
                        <div className="mb-6 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur">
                            <MapPin className="h-4 w-4 text-[#f7b267]" />
                            {selectedBranch?.name || 'Optik Kasih'}
                        </div>
                        <h1 className="text-4xl font-black leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl">Optik Kasih</h1>
                        <p className="mt-7 max-w-2xl text-base leading-8 text-white/86 sm:text-lg">
                            {selectedBranch?.description || 'Toko kacamata di Pekanbaru yang membantu pelanggan memilih frame, lensa, dan alat bantu penglihatan.'}
                        </p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => router.get(route('home'), {}, { preserveState: false })}
                                className="inline-flex h-12 items-center justify-center gap-2 bg-[#e56020] px-5 text-sm font-bold text-white transition hover:bg-[#c84f18]"
                            >
                                Ganti Cabang <ArrowRight className="h-4 w-4" />
                            </button>
                            <Link
                                href={route('catalog', activeBranch ? { branch: activeBranch } : {})}
                                className="inline-flex h-12 items-center justify-center gap-2 border border-white/35 px-5 text-sm font-bold text-white transition hover:bg-white hover:text-[#18383a]"
                            >
                                Lihat Semua Produk <ShoppingBag className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="w-full">
                        {carouselPhotos.length > 0 ? (
                            <div className="ml-auto max-w-md overflow-hidden rounded-lg border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
                                <img
                                    src={carouselPhotos[carouselIndex]?.url}
                                    alt={carouselPhotos[carouselIndex]?.caption || selectedBranch?.name}
                                    className="aspect-[4/3] w-full rounded-md object-cover"
                                />
                                <div className="mt-3 flex items-center justify-between gap-3 text-white">
                                    <p className="min-h-5 text-sm font-semibold text-white/85">
                                        {carouselPhotos[carouselIndex]?.caption || `Suasana ${selectedBranch?.name}`}
                                    </p>
                                    <div className="flex gap-1.5">
                                        {carouselPhotos.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setCarouselIndex(i)}
                                                className={`h-2.5 w-2.5 rounded-full ${i === carouselIndex ? 'bg-[#f7b267]' : 'bg-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="ml-auto grid max-w-md grid-cols-2 gap-3">
                                {[
                                    { value: '2007', label: 'Melayani pelanggan sejak', icon: CalendarCheck },
                                    { value: '10.30-21.00', label: 'Jam operasional toko', icon: Clock3 },
                                ].map((item) => (
                                    <div key={item.label} className="border border-white/18 bg-white/12 p-5 text-white backdrop-blur">
                                        <item.icon className="mb-5 h-6 w-6 text-[#f7b267]" />
                                        <p className="text-3xl font-black">{item.value}</p>
                                        <p className="mt-2 text-sm leading-5 text-white/75">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* Pilih Cabang Lain */}
                <section id="cabang" className="border-b border-slate-200 bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#e56020]">Semua cabang</p>
                                <h2 className="mt-3 text-2xl font-black leading-tight text-[#1f3b3d] sm:text-3xl md:text-4xl">
                                    Produk mengikuti cabang yang pelanggan pilih.
                                </h2>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {branches.map((branch) => (
                                <BranchCard
                                    key={branch.id}
                                    branch={branch}
                                    isActive={branch.id === activeBranch}
                                    onClick={() => handleBranchClick(branch.id)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Katalog */}
                <section id="katalog" className="bg-[#f8faf8] py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#e56020]">
                                    Katalog {selectedBranch?.name || 'Optik Kasih'}
                                </p>
                                <h2 className="mt-3 text-2xl font-black leading-tight text-[#1f3b3d] sm:text-3xl md:text-4xl">
                                    Cari frame, lensa, dan softlens yang tersedia.
                                </h2>
                            </div>
                            <form onSubmit={handleSearch} className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
                                <label className="relative flex-1">
                                    <span className="sr-only">Cari produk</span>
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-12 w-full border-slate-300 bg-white pl-10 text-sm"
                                        placeholder="Cari nama produk..."
                                    />
                                </label>
                                <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 bg-[#1f3b3d] px-4 text-sm font-bold text-white hover:bg-[#2c5558]">
                                    <Search className="h-4 w-4" /> Cari
                                </button>
                            </form>
                        </div>

                        <div className="mb-6 flex justify-end">
                            <Link href={route('catalog', activeBranch ? { branch: activeBranch } : {})} className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#e56020] bg-white px-4 text-sm font-bold text-[#e56020] hover:bg-orange-50">
                                Lihat semua produk & filter <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="mb-8 flex flex-wrap items-center gap-2">
                            <span className="mr-2 inline-flex items-center gap-1 text-sm font-bold text-slate-600">
                                <Filter className="h-4 w-4" /> Kategori
                            </span>
                            <button type="button" onClick={() => handleCategoryClick('')} className={`h-10 border px-4 text-sm font-bold transition ${activeCategory === '' ? 'border-[#1f3b3d] bg-[#1f3b3d] text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-[#e56020]'}`}>
                                Semua
                            </button>
                            {categories.map((cat) => (
                                <button key={cat} type="button" onClick={() => handleCategoryClick(cat)} className={`h-10 border px-4 text-sm font-bold capitalize transition ${activeCategory === cat ? 'border-[#e56020] bg-[#e56020] text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-[#e56020]'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {productList.length > 0 ? (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {productList.map((product) => (
                                    <article key={product.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                                        <div className="relative aspect-[4/3] bg-slate-100">
                                            {product.gambar_produk ? (
                                                <img src={`/storage/${product.gambar_produk}`} alt={product.nama_produk} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                            ) : product.images?.[0]?.path ? (
                                                <img src={`/storage/${product.images[0].path}`} alt={product.nama_produk} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-[#e9f1ee] text-[#1f3b3d]"><Glasses className="h-16 w-16 opacity-35" /></div>
                                            )}
                                            <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-[#e56020] shadow-sm">{product.kategori_produk}</span>
                                        </div>
                                        <div className="p-5">
                                            <Link href={route('catalog.product.show', product.id)} className="line-clamp-2 min-h-[3.5rem] text-lg font-black leading-7 text-[#1f3b3d] hover:text-[#e56020]">{product.nama_produk}</Link>
                                            <div className="mt-4 flex items-end justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Informasi</p>
                                                    <p className="mt-1 text-sm font-bold text-[#1f3b3d]">Detail & WhatsApp cabang</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Stok</p>
                                                    <p className="mt-1 text-sm font-black text-[#1f3b3d]">{product.jumlah_produk ?? 0}</p>
                                                </div>
                                            </div>
                                            <Link href={route('catalog.product.show', product.id)} className="mt-4 inline-flex text-sm font-extrabold text-[#e56020] hover:underline">Lihat produk</Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center">
                                <Search className="mx-auto h-14 w-14 text-slate-300" />
                                <h3 className="mt-5 text-xl font-black text-[#1f3b3d]">Produk belum ditemukan</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Coba ubah kategori atau hapus kata kunci pencarian.</p>
                                <button type="button" onClick={clearFilters} className="mt-6 inline-flex h-11 items-center justify-center bg-[#e56020] px-4 text-sm font-bold text-white hover:bg-[#c84f18]">Reset Filter</button>
                            </div>
                        )}

                        {products?.links && products.links.length > 3 && (
                            <div className="mt-12 flex flex-wrap justify-center gap-2">
                                {products.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'} className={`min-w-10 rounded-lg border px-4 py-2 text-center text-sm font-bold transition ${link.active ? 'border-[#1f3b3d] bg-[#1f3b3d] text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-[#e56020]'} ${!link.url ? 'pointer-events-none opacity-45' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Tentang Optik Kasih */}
                <section id="layanan" className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#e56020]">Tentang Optik Kasih</p>
                                <h2 className="mt-3 text-2xl font-black leading-tight text-[#1f3b3d] sm:text-3xl md:text-4xl">
                                    Pelayanan optik yang bergerak dari pencatatan manual ke sistem digital.
                                </h2>
                                <p className="mt-5 text-base leading-8 text-slate-600">
                                    Optik Kasih berdiri sejak 2007 di Pekanbaru dan melayani kebutuhan kacamata serta lensa kontak. Website ini membantu pelanggan melihat ketersediaan produk sehingga proses memilih menjadi lebih cepat dan terarah.
                                </p>
                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    {[
                                        { icon: Eye, title: 'Pemeriksaan kebutuhan penglihatan', desc: 'Mendukung proses pelayanan dari pemeriksaan mata sampai pemilihan produk.' },
                                        { icon: Glasses, title: 'Frame dan lensa tertata', desc: 'Produk yang tampil mengikuti data stok yang sudah dimasukkan ke sistem.' },
                                        { icon: ShieldCheck, title: 'Data stok lebih tertata', desc: 'Katalog publik mengambil data dari pengelolaan produk di sistem internal.' },
                                        { icon: HeartPulse, title: 'Pengalaman pelanggan lebih nyaman', desc: 'Pelanggan bisa menyiapkan pilihan sebelum berkonsultasi langsung di toko.' },
                                    ].map((s) => (
                                        <div key={s.title} className="rounded-lg border border-slate-200 bg-[#f8faf8] p-5">
                                            <s.icon className="h-7 w-7 text-[#e56020]" />
                                            <h3 className="mt-4 text-base font-black text-[#1f3b3d]">{s.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{s.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Foto cabang — carousel jika ada, placeholder jika tidak */}
                            <div className="flex flex-col gap-4">
                                {carouselPhotos.length > 0 ? (
                                    <>
                                        <p className="text-sm font-bold text-slate-500">Foto {selectedBranch?.name}</p>
                                        <PhotoCarousel photos={carouselPhotos} />
                                        {carouselPhotos.length > 1 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {carouselPhotos.slice(0, 3).map((photo, i) => (
                                                    <img key={i} src={photo.url} alt={photo.caption || ''} className="aspect-square w-full rounded-lg object-cover" />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center p-8">
                                        <Store className="h-14 w-14 text-slate-300" />
                                        <p className="mt-4 font-bold text-slate-500">Foto toko belum tersedia</p>
                                        <p className="mt-2 text-sm text-slate-400">Admin cabang dapat mengunggah foto dari menu Galeri Cabang.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Kontak & Peta Dinamis */}
                <section id="kontak" className="bg-[#18383a] py-16 text-white">
                    <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f7b267]">Kontak dan lokasi</p>
                            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl md:text-4xl">
                                Kunjungi {selectedBranch?.name || 'Optik Kasih'}.
                            </h2>
                            <div className="mt-7 grid gap-4 sm:grid-cols-3">
                                <div className="border border-white/15 p-4">
                                    <MapPin className="mb-4 h-6 w-6 text-[#f7b267]" />
                                    <p className="text-sm font-bold leading-6 text-white/82">
                                        {selectedBranch?.address || contact.address || '-'}
                                    </p>
                                </div>
                                <div className="border border-white/15 p-4">
                                    <Clock3 className="mb-4 h-6 w-6 text-[#f7b267]" />
                                    <p className="text-sm font-bold leading-6 text-white/82">
                                        {selectedBranch?.hours || contact.hours || '10.30-21.00 WIB'}
                                    </p>
                                </div>
                                <div className="border border-white/15 p-4">
                                    <Phone className="mb-4 h-6 w-6 text-[#f7b267]" />
                                    <p className="text-sm font-bold leading-6 text-white/82">
                                        {selectedBranch?.phone || contact.phone || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-white/15 bg-white text-[#1f3b3d] shadow-xl">
                            {mapEmbedUrl ? (
                                <iframe
                                    key={mapEmbedUrl}
                                    title={`Lokasi ${selectedBranch?.name || 'Optik Kasih'}`}
                                    src={mapEmbedUrl}
                                    className="h-72 w-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="flex h-72 w-full items-center justify-center bg-slate-100 text-slate-400">
                                    <MapPin className="h-10 w-10" />
                                </div>
                            )}
                            <div className="p-5">
                                <Sparkles className="h-7 w-7 text-[#e56020]" />
                                <h3 className="mt-3 text-xl font-black">Lokasi {selectedBranch?.name || 'Optik Kasih'}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Gunakan peta untuk memperbesar area, melihat rute, atau membuka navigasi Google Maps.</p>
                                <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-10 items-center justify-center gap-2 bg-[#e56020] px-4 text-sm font-bold text-white hover:bg-[#c84f18]">
                                    Buka di Google Maps <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-200 bg-white py-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm font-semibold text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo-optik.png" alt="Optik Kasih" className="h-8 w-auto" />
                        <span className="text-[#1f3b3d]">Optik Kasih</span>
                    </div>
                    <p>&copy; {new Date().getFullYear()} Optik Kasih. Semua hak dilindungi.</p>
                </div>
            </footer>
        </div>
    );
}
