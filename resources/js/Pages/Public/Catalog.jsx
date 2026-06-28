// appV1.0 Rev 7 - Katalog publik dengan navbar fixed saat halaman digulir.

import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, Filter, Glasses, MapPin, Search, SlidersHorizontal, Store, X } from 'lucide-react';
import { useMemo, useState } from 'react';

function ProductImage({ product }) {
    if (product.gambar_produk) {
        return <img src={`/storage/${product.gambar_produk}`} alt={product.nama_produk} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />;
    }

    if (product.images?.[0]?.path) {
        return <img src={`/storage/${product.images[0].path}`} alt={product.nama_produk} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />;
    }

    return <div className="flex h-full w-full items-center justify-center bg-[#e9f1ee] text-[#1f3b3d]"><Glasses className="h-14 w-14 opacity-35" /></div>;
}

export default function Catalog({ products, categories = [], branches = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [branch, setBranch] = useState(filters.branch || '');
    const [category, setCategory] = useState(filters.category || '');
    const [sort, setSort] = useState(filters.sort || 'latest');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const selectedBranch = useMemo(
        () => branches.find((item) => String(item.id) === String(branch)),
        [branches, branch],
    );

    const query = () => ({
        branch,
        search,
        category,
        sort,
    });

    const apply = (event) => {
        event?.preventDefault?.();
        setShowMobileFilters(false);
        router.get(route('catalog'), query(), { preserveState: true, replace: true });
    };

    const reset = () => {
        const firstBranch = branches[0]?.id || '';
        setShowMobileFilters(false);
        setSearch('');
        setBranch(firstBranch);
        setCategory('');
        setSort('latest');
        router.get(route('catalog'), { branch: firstBranch }, { preserveState: true, replace: true });
    };

    const FilterFields = () => (
        <>
            <label className="block text-sm font-bold text-slate-700">
                Cabang toko
                <select value={branch} onChange={(event) => setBranch(event.target.value)} className="mt-2 h-11 w-full rounded-lg border-slate-300 bg-white text-sm">
                    {branches.length === 0 && <option value="">Belum ada cabang aktif</option>}
                    {branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
            </label>

            <div>
                <p className="text-sm font-bold text-slate-700">Kategori</p>
                <div className="mt-2 space-y-1">
                    <button type="button" onClick={() => setCategory('')} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${category === '' ? 'bg-[#1f3b3d] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                        Semua kategori {category === '' && <span>✓</span>}
                    </button>
                    {categories.map((item) => (
                        <button key={item} type="button" onClick={() => setCategory(item)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${category === item ? 'bg-[#e56020] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                            {item} {category === item && <span>✓</span>}
                        </button>
                    ))}
                </div>
            </div>

        </>
    );

    return (
        <div className="min-h-screen bg-[#f8faf8] pt-[72px] text-[#1d2a2c]">
            <Head title="Katalog Produk Optik Kasih" />

            <nav className="fixed inset-x-0 top-0 z-[100] border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link href={route('home')} className="flex items-center gap-3">
                        <img src="/images/logo-optik.png" alt="Optik Kasih" className="h-10 w-auto" />
                        <span className="text-lg font-black text-[#1f3b3d]">Optik Kasih</span>
                    </Link>
                    <Link href={route('home', branch ? { branch } : {})} className="inline-flex items-center gap-2 text-sm font-bold text-[#e56020] hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Beranda
                    </Link>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <section className="rounded-xl bg-[#1f3b3d] px-5 py-7 text-white sm:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f7b267]">Katalog lengkap</p>
                            <h1 className="mt-3 text-3xl font-black sm:text-4xl">Semua produk {selectedBranch ? `di ${selectedBranch.name}` : 'Optik Kasih'}</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">Gunakan filter cabang, kategori, pencarian, dan urutan produk untuk menemukan produk yang tersedia.</p>
                        </div>
                        {selectedBranch?.address && <p className="inline-flex items-center gap-2 text-sm font-semibold text-white/85"><MapPin className="h-4 w-4 text-[#f7b267]" /> {selectedBranch.address}</p>}
                    </div>
                </section>

                <form onSubmit={apply} className="mt-6 flex gap-3 lg:hidden">
                    <button type="button" onClick={() => setShowMobileFilters(true)} className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700">
                        <SlidersHorizontal className="h-4 w-4" /> Filter
                    </button>
                    <label className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 w-full rounded-lg border-slate-300 pl-9 text-sm" placeholder="Cari produk" />
                    </label>
                    <button className="h-11 rounded-lg bg-[#e56020] px-4 text-sm font-bold text-white">Cari</button>
                </form>

                <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <form onSubmit={apply} className="hidden h-fit space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-4"><Filter className="h-5 w-5 text-[#e56020]" /><h2 className="font-extrabold text-slate-950">Filter produk</h2></div>
                        <FilterFields />
                        <div className="flex gap-2 pt-1">
                            <button className="h-10 flex-1 rounded-lg bg-[#e56020] text-sm font-bold text-white hover:bg-orange-700">Terapkan</button>
                            <button type="button" onClick={reset} className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700">Reset</button>
                        </div>
                    </form>

                    <section className="min-w-0">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-semibold text-slate-600">{products.total || 0} produk ditemukan</p>
                            <form onSubmit={apply} className="hidden gap-3 sm:flex">
                                <label className="relative min-w-[280px]">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-full rounded-lg border-slate-300 pl-9 text-sm" placeholder="Cari nama produk" />
                                </label>
                                <button className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white">Cari</button>
                            </form>
                            <label className="relative">
                                <select value={sort} onChange={(event) => { const nextSort = event.target.value; setSort(nextSort); router.get(route('catalog'), { ...query(), sort: nextSort }, { preserveState: true, replace: true }); }} className="h-10 appearance-none rounded-lg border-slate-300 bg-white py-0 pl-3 pr-9 text-sm font-semibold text-slate-700">
                                    <option value="latest">Terbaru</option>
                                    <option value="name_asc">Nama A-Z</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                            </label>
                        </div>

                        {products.data.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {products.data.map((product) => (
                                    <article key={product.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100"><ProductImage product={product} /><span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-black text-[#e56020] shadow-sm">{product.kategori_produk}</span></div>
                                        <div className="p-4">
                                            <Link href={route('catalog.product.show', product.id)} className="line-clamp-2 min-h-12 text-base font-extrabold leading-6 text-[#1f3b3d] hover:text-[#e56020]">{product.nama_produk}</Link>
                                            <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{product.deskripsi_produk || 'Lihat detail produk dan hubungi cabang untuk informasi lebih lanjut.'}</p>
                                            <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500"><span className="inline-flex items-center gap-1"><Store className="h-3.5 w-3.5" /> {product.admin?.name || selectedBranch?.name}</span><span>Stok {product.jumlah_produk ?? 0}</span></div>
                                            <Link href={route('catalog.product.show', product.id)} className="mt-4 inline-flex text-sm font-extrabold text-[#e56020] hover:underline">Lihat detail & WhatsApp</Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center"><Search className="mx-auto h-12 w-12 text-slate-300" /><h2 className="mt-4 text-lg font-extrabold text-[#1f3b3d]">Produk belum ditemukan</h2><p className="mt-2 text-sm text-slate-600">Ubah kata kunci atau filter yang digunakan.</p><button onClick={reset} className="mt-5 h-10 rounded-lg bg-[#e56020] px-4 text-sm font-bold text-white">Reset filter</button></div>
                        )}

                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            {products.links.map((link, index) => <Link key={index} href={link.url || '#'} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${link.active ? 'border-[#e56020] bg-[#e56020] text-white' : 'border-slate-200 bg-white text-slate-700'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}
                        </div>
                    </section>
                </div>
            </main>

            {showMobileFilters && (
                <div className="fixed inset-0 z-[70] bg-slate-950/55 lg:hidden">
                    <form onSubmit={apply} className="ml-auto flex h-full w-full max-w-sm flex-col bg-white p-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4"><h2 className="font-extrabold text-slate-950">Filter produk</h2><button type="button" onClick={() => setShowMobileFilters(false)} className="rounded-lg border border-slate-200 p-2"><X className="h-4 w-4" /></button></div>
                        <div className="flex-1 space-y-6 overflow-y-auto py-5"><FilterFields /></div>
                        <div className="flex gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={reset} className="h-11 flex-1 rounded-lg border border-slate-200 text-sm font-bold text-slate-700">Reset</button><button className="h-11 flex-1 rounded-lg bg-[#e56020] text-sm font-bold text-white">Terapkan</button></div>
                    </form>
                </div>
            )}
        </div>
    );
}
