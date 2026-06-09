import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowRight,
    CalendarCheck,
    CheckCircle2,
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

const formatRupiah = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0));

export default function Welcome({ products, categories = [], branches = [], filters = {}, contact = {} }) {
    const firstBranch = branches[0]?.id || '';
    const hasBranches = branches.length > 0;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeCategory, setActiveCategory] = useState(filters.category || '');
    const [activeBranch, setActiveBranch] = useState(filters.branch || firstBranch);

    const selectedBranch = useMemo(
        () => branches.find((branch) => branch.id === activeBranch) || branches[0],
        [branches, activeBranch],
    );

    const visitCatalog = (params = {}) => {
        router.get(
            route('home'),
            {
                branch: activeBranch,
                search: searchQuery,
                category: activeCategory,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearch = (event) => {
        event.preventDefault();
        visitCatalog({ search: searchQuery });
    };

    const handleBranchClick = (branchId) => {
        setActiveBranch(branchId);
        setActiveCategory('');
        router.get(
            route('home'),
            { branch: branchId, search: searchQuery, category: '' },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleCategoryClick = (category) => {
        const nextCategory = activeCategory === category ? '' : category;
        setActiveCategory(nextCategory);
        visitCatalog({ category: nextCategory });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setActiveCategory('');
        router.get(route('home'), activeBranch ? { branch: activeBranch } : {}, { preserveState: true, preserveScroll: true });
    };

    const productList = products?.data || [];

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf8] font-sans text-[#1d2a2c] selection:bg-[#e56020] selection:text-white">
            <Head title="Optik Kasih - Katalog Cabang" />

            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href={route('home')} className="flex items-center gap-3">
                        <img src="/images/logo-optik.png" alt="Optik Kasih" className="h-11 w-auto" />
                        <div className="leading-tight">
                            <span className="block text-xl font-black tracking-wide text-[#1f3b3d]">Optik Kasih</span>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e56020]">
                                Sejak {contact.since || '2007'}
                            </span>
                        </div>
                    </Link>

                    <div className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
                        {hasBranches && <a href="#cabang" className="hover:text-[#e56020]">Cabang</a>}
                        <a href="#katalog" className="hover:text-[#e56020]">Katalog</a>
                        <a href="#layanan" className="hover:text-[#e56020]">Layanan</a>
                        <a href="#kontak" className="hover:text-[#e56020]">Kontak</a>
                    </div>
                </div>
            </nav>

            <header className="relative overflow-hidden bg-[#18383a]">
                <div className="absolute inset-0 bg-[url('/images/bg-optik.png')] bg-cover bg-center opacity-30" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,31,33,0.95),rgba(24,56,58,0.76),rgba(245,112,39,0.36))]" />
                <div className="relative mx-auto grid min-h-[74vh] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                    <div className="w-full min-w-0 max-w-xs text-white sm:max-w-3xl">
                        <div className="ok-fade-up mb-6 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur">
                            <MapPin className="h-4 w-4 text-[#f7b267]" />
                            {selectedBranch?.name || 'Optik Kasih Kayu Manis'}
                        </div>
                        <h1 className="ok-fade-up ok-fade-up-delay-1 max-w-xs break-words text-4xl font-black leading-[0.98] tracking-normal sm:max-w-full sm:text-6xl lg:text-7xl">
                            Optik Kasih
                        </h1>
                        <p className="ok-fade-up ok-fade-up-delay-2 mt-7 max-w-xs break-words text-base leading-8 text-white/86 sm:max-w-2xl sm:text-lg">
                            Toko kacamata di Pekanbaru yang membantu pelanggan memilih frame, lensa, dan alat bantu penglihatan
                            dengan proses yang lebih rapi, cepat, dan sesuai stok yang tersedia.
                        </p>
                        <div className="ok-fade-up ok-fade-up-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
                            <a
                                href={hasBranches ? '#cabang' : '#kontak'}
                                className="ok-sheen inline-flex h-12 items-center justify-center gap-2 bg-[#e56020] px-5 text-sm font-bold text-white transition hover:bg-[#c84f18]"
                            >
                                {hasBranches ? 'Pilih Cabang' : 'Lihat Lokasi'} <ArrowRight className="h-4 w-4" />
                            </a>
                            <a
                                href="#katalog"
                                className="inline-flex h-12 items-center justify-center gap-2 border border-white/35 px-5 text-sm font-bold text-white transition hover:bg-white hover:text-[#18383a]"
                            >
                                Lihat Katalog <ShoppingBag className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="ml-auto grid max-w-md grid-cols-2 gap-3">
                            {[
                                { value: '2007', label: 'Mulai melayani pelanggan', icon: CalendarCheck },
                                { value: branches.length, label: 'Cabang tampil di katalog', icon: Store },
                                { value: productList.length, label: 'Produk tampil sesuai filter', icon: Glasses },
                                { value: '10.30-21.00', label: 'Jam operasional', icon: Clock3 },
                            ].map((item) => (
                                <div key={item.label} className="ok-float border border-white/18 bg-white/12 p-5 text-white backdrop-blur">
                                    <item.icon className="mb-5 h-6 w-6 text-[#f7b267]" />
                                    <p className="text-3xl font-black">{item.value}</p>
                                    <p className="mt-2 text-sm leading-5 text-white/75">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {hasBranches && (
                <section id="cabang" className="border-b border-slate-200 bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                            <div>
                                <p className="ok-fade-up text-sm font-black uppercase tracking-[0.18em] text-[#e56020]">Pilih cabang</p>
                                <h2 className="ok-fade-up ok-fade-up-delay-1 mt-3 max-w-full break-words text-2xl font-black leading-tight text-[#1f3b3d] sm:text-3xl md:text-4xl">
                                    Produk mengikuti cabang yang pelanggan pilih.
                                </h2>
                            </div>
                            <p className="max-w-xl text-base leading-7 text-slate-600">
                                Setiap admin cabang memiliki stok produk sendiri. Saat pelanggan memilih cabang, katalog akan
                                menampilkan produk dari cabang tersebut saja.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {branches.map((branch) => {
                                const isActive = branch.id === activeBranch;

                                return (
                                    <button
                                        key={branch.id}
                                        type="button"
                                        onClick={() => handleBranchClick(branch.id)}
                                        className={`ok-fade-up min-h-[184px] border p-5 text-left transition hover:-translate-y-1 ${
                                            isActive
                                                ? 'border-[#e56020] bg-[#fff7f1] shadow-[0_18px_45px_rgba(229,96,32,0.12)]'
                                                : 'border-slate-200 bg-white hover:border-[#e56020]/60 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex h-11 w-11 items-center justify-center bg-[#1f3b3d] text-white">
                                                <Store className="h-5 w-5" />
                                            </div>
                                            {isActive && (
                                                <span className="inline-flex items-center gap-1 bg-[#e56020] px-2.5 py-1 text-xs font-bold text-white">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Dipilih
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="mt-5 text-xl font-black text-[#1f3b3d]">{branch.name}</h3>
                                        <p className="mt-3 flex gap-2 text-sm leading-6 text-slate-600">
                                            <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#e56020]" />
                                            {branch.address || 'Alamat cabang belum diisi'}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                                            <span className="bg-slate-100 px-2.5 py-1">{branch.hours || contact.hours}</span>
                                            <span className="bg-slate-100 px-2.5 py-1">{branch.product_count} produk</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
                )}

                <section id="katalog" className="bg-[#f8faf8] py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="ok-fade-up text-sm font-black uppercase tracking-[0.18em] text-[#e56020]">
                                    Katalog {selectedBranch?.name || 'Optik Kasih'}
                                </p>
                                <h2 className="ok-fade-up ok-fade-up-delay-1 mt-3 max-w-full break-words text-2xl font-black leading-tight text-[#1f3b3d] sm:text-3xl md:text-4xl">
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
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        className="h-12 w-full border-slate-300 bg-white pl-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#e56020] focus:ring-[#e56020]"
                                        placeholder="Cari nama produk..."
                                    />
                                </label>
                                <button
                                    type="submit"
                                    className="inline-flex h-12 items-center justify-center gap-2 bg-[#1f3b3d] px-4 text-sm font-bold text-white transition hover:bg-[#2c5558]"
                                >
                                    <Search className="h-4 w-4" /> Cari
                                </button>
                            </form>
                        </div>

                        <div className="mb-8 flex flex-wrap items-center gap-2">
                            <span className="mr-2 inline-flex items-center gap-1 text-sm font-bold text-slate-600">
                                <Filter className="h-4 w-4" /> Kategori
                            </span>
                            <button
                                type="button"
                                onClick={() => handleCategoryClick('')}
                                className={`h-10 border px-4 text-sm font-bold transition ${
                                    activeCategory === ''
                                        ? 'border-[#1f3b3d] bg-[#1f3b3d] text-white'
                                        : 'border-slate-300 bg-white text-slate-700 hover:border-[#e56020]'
                                }`}
                            >
                                Semua
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => handleCategoryClick(category)}
                                    className={`h-10 border px-4 text-sm font-bold capitalize transition ${
                                        activeCategory === category
                                            ? 'border-[#e56020] bg-[#e56020] text-white'
                                            : 'border-slate-300 bg-white text-slate-700 hover:border-[#e56020]'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {productList.length > 0 ? (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {productList.map((product) => (
                                    <article
                                        key={product.id}
                                        className="group ok-fade-up overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        <div className="relative aspect-[4/3] bg-slate-100">
                                            {product.gambar_produk ? (
                                                <img
                                                    src={`/storage/${product.gambar_produk}`}
                                                    alt={product.nama_produk}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-[#e9f1ee] text-[#1f3b3d]">
                                                    <Glasses className="h-16 w-16 opacity-35" />
                                                </div>
                                            )}
                                            <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-[#e56020] shadow-sm">
                                                {product.kategori_produk}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-black leading-7 text-[#1f3b3d]">
                                                {product.nama_produk}
                                            </h3>
                                            <div className="mt-4 flex items-end justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Harga</p>
                                                    <p className="mt-1 text-xl font-black text-[#e56020]">
                                                        Rp {formatRupiah(product.harga_produk)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Stok</p>
                                                    <p className="mt-1 text-sm font-black text-[#1f3b3d]">
                                                        {product.jumlah_produk ?? 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center">
                                <Search className="mx-auto h-14 w-14 text-slate-300" />
                                <h3 className="mt-5 text-xl font-black text-[#1f3b3d]">Produk belum ditemukan</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                                    Coba ubah kategori atau hapus kata kunci pencarian.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-6 inline-flex h-11 items-center justify-center bg-[#e56020] px-4 text-sm font-bold text-white hover:bg-[#c84f18]"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        )}

                        {products?.links && products.links.length > 3 && (
                            <div className="mt-12 flex flex-wrap justify-center gap-2">
                                {products.links.map((link, index) => (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url || '#'}
                                        className={`min-w-10 rounded-lg border px-4 py-2 text-center text-sm font-bold transition ${
                                            link.active
                                                ? 'border-[#1f3b3d] bg-[#1f3b3d] text-white'
                                                : 'border-slate-300 bg-white text-slate-700 hover:border-[#e56020]'
                                        } ${!link.url ? 'pointer-events-none opacity-45' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section id="layanan" className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#e56020]">Tentang Optik Kasih</p>
                                <h2 className="mt-3 max-w-full break-words text-2xl font-black leading-tight text-[#1f3b3d] sm:text-3xl md:text-4xl">
                                    Pelayanan optik yang bergerak dari pencatatan manual ke sistem digital.
                                </h2>
                                <p className="mt-5 text-base leading-8 text-slate-600">
                                    Optik Kasih berdiri sejak 2007 di Pekanbaru dan melayani kebutuhan kacamata serta lensa
                                    kontak. Website ini membantu pelanggan melihat ketersediaan produk,
                                    sehingga proses memilih produk di toko menjadi lebih cepat dan terarah.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    {
                                        icon: Eye,
                                        title: 'Pemeriksaan kebutuhan penglihatan',
                                        desc: 'Mendukung proses pelayanan dari pemeriksaan mata sampai pemilihan produk.',
                                    },
                                    {
                                        icon: Glasses,
                                        title: 'Frame dan lensa tertata',
                                        desc: 'Produk yang tampil mengikuti data stok yang sudah dimasukkan ke sistem.',
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: 'Data stok lebih tertata',
                                        desc: 'Katalog publik mengambil data dari pengelolaan produk di sistem internal.',
                                    },
                                    {
                                        icon: HeartPulse,
                                        title: 'Pengalaman pelanggan lebih nyaman',
                                        desc: 'Pelanggan bisa menyiapkan pilihan sebelum berkonsultasi langsung di toko.',
                                    },
                                ].map((service) => (
                                    <div key={service.title} className="rounded-lg border border-slate-200 bg-[#f8faf8] p-5">
                                        <service.icon className="h-7 w-7 text-[#e56020]" />
                                        <h3 className="mt-5 text-lg font-black text-[#1f3b3d]">{service.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{service.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="kontak" className="bg-[#18383a] py-16 text-white">
                    <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f7b267]">Kontak dan lokasi</p>
                            <h2 className="mt-3 max-w-full break-words text-2xl font-black leading-tight sm:text-3xl md:text-4xl">Kunjungi Optik Kasih Kayu Manis.</h2>
                            <div className="mt-7 grid gap-4 sm:grid-cols-3">
                                <div className="border border-white/15 p-4">
                                    <MapPin className="mb-4 h-6 w-6 text-[#f7b267]" />
                                    <p className="text-sm font-bold leading-6 text-white/82">{contact.address}</p>
                                </div>
                                <div className="border border-white/15 p-4">
                                    <Clock3 className="mb-4 h-6 w-6 text-[#f7b267]" />
                                    <p className="text-sm font-bold leading-6 text-white/82">{contact.hours}</p>
                                </div>
                                <div className="border border-white/15 p-4">
                                    <Phone className="mb-4 h-6 w-6 text-[#f7b267]" />
                                    <p className="text-sm font-bold leading-6 text-white/82">{contact.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/15 bg-white p-6 text-[#1f3b3d]">
                            <Sparkles className="h-8 w-8 text-[#e56020]" />
                            <h3 className="mt-5 text-2xl font-black">Catatan layanan</h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                Produk pada katalog bersifat referensi stok. Untuk pemasangan lensa dan penyesuaian
                                frame, pelanggan tetap disarankan datang langsung agar ukuran lebih pas dan nyaman dipakai.
                            </p>
                            <a
                                href={hasBranches ? '#cabang' : '#katalog'}
                                className="mt-6 inline-flex h-11 items-center justify-center gap-2 bg-[#e56020] px-4 text-sm font-bold text-white hover:bg-[#c84f18]"
                            >
                                {hasBranches ? 'Pilih cabang' : 'Lihat katalog'} <ArrowRight className="h-4 w-4" />
                            </a>
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
