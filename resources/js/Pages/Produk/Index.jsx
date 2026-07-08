// appV1.0 Rev 7 - Klik card buka drawer detail (dengan Edit/Hapus); hapus outline kuning stok rendah, hover-only lift+outline.

import SidebarLayout from '@/Components/SidebarLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Edit, Filter, PackagePlus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_CATEGORIES = ['kacamata', 'soflen', 'air soflen', 'produk lainnya'];
const DEFAULT_COLORS = ['hitam', 'putih', 'coklat', 'abu-abu', 'tortoise/motif', 'emas', 'perak', 'merah', 'biru', 'hijau', 'kuning', 'bening'];
const DEFAULT_DIAMETERS = ['13.8', '14.0', '14.2', '14.5'];
const DEFAULT_MATERIALS = ['plastik', 'besi'];
const DEFAULT_MINUSES = [
    'plano', '-0.50', '-1.00', '-1.50', '-2.00', '-2.50', '-3.00', '-3.50', '-4.00', '-4.50', '-5.00', '-5.50', '-6.00',
    '+0.50', '+1.00', '+1.50', '+2.00',
];

const money  = (value) => Number(value || 0).toLocaleString('id-ID');
const today  = new Date().toISOString().slice(0, 10);
const toArr  = (v) => (Array.isArray(v) ? v : v ? [v] : []);

function CheckboxGroup({ title, options = [], selected = [], onToggle }) {
    return (
        <div className="min-w-[130px]">
            <div className="mb-2 flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-700">{title}</span>
                {selected.length > 0 && (
                    <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                        {selected.length}
                    </span>
                )}
            </div>
            <div className="space-y-1.5">
                {options.map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 accent-orange-600"
                            checked={selected.includes(opt)}
                            onChange={() => onToggle(opt)}
                        />
                        <span className={selected.includes(opt) ? 'font-semibold' : ''}>{opt}</span>
                    </label>
                ))}
                {options.length === 0 && (
                    <span className="text-xs italic text-gray-400">Belum ada kategori</span>
                )}
            </div>
        </div>
    );
}

function alertDismissKey(type, userId) {
    return `produk_alert_${type}_${userId}_${today}`;
}

function BannerBlock({ items, type, userId, title, subtitle, borderClass, bgClass, dotClass, badgeFn }) {
    const key = alertDismissKey(type, userId);
    const [show, setShow] = useState(() => {
        try { return items.length > 0 && !localStorage.getItem(key); }
        catch (_) { return items.length > 0; }
    });

    if (!show || items.length === 0) return null;

    const dismiss = () => {
        try { localStorage.setItem(key, '1'); } catch (_) {}
        setShow(false);
    };

    return (
        <div className={`flex items-start gap-3 rounded-xl border ${borderClass} ${bgClass} px-4 py-3 shadow-sm`}>
            <div className="flex-1">
                <p className="font-semibold text-gray-800">{title}</p>
                <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
                    {items.map((p) => (
                        <li key={p.id} className="flex items-center gap-2">
                            <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
                            <b>{p.nama_produk}</b>
                            {p.kategori_produk && <span className="text-gray-500">— {p.kategori_produk}</span>}
                            {badgeFn && badgeFn(p)}
                        </li>
                    ))}
                </ul>
                {subtitle && <p className="mt-2 text-xs text-gray-500">{subtitle}</p>}
            </div>
            <button type="button" onClick={dismiss}
                className="shrink-0 rounded-lg p-1 text-gray-400 transition hover:bg-black/5 hover:text-gray-700">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export default function ProdukIndex() {
    const { props } = usePage();
    const {
        products, categories = [], colors = [], diameters = [], materials = [], minuses = [], filters = {}, routeBase = 'admin.produk',
        lowStockAlerts = [], outOfStockAlerts = [], expiringAlerts = [],
    } = props;
    const userId = props.auth?.user?.id;

    const [search,      setSearch]      = useState(filters.search  || '');
    const [category,    setCategory]    = useState(toArr(filters.category));
    const [warna,       setWarna]       = useState(toArr(filters.warna));
    const [diameter,    setDiameter]    = useState(toArr(filters.diameter));
    const [bahan,       setBahan]       = useState(toArr(filters.bahan));
    const [minus,       setMinus]       = useState(toArr(filters.minus));
    const [habis,       setHabis]       = useState(!!filters.habis);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showFilter,  setShowFilter]  = useState(
        toArr(filters.category).length > 0 || toArr(filters.warna).length > 0 || toArr(filters.diameter).length > 0
        || toArr(filters.bahan).length > 0 || toArr(filters.minus).length > 0
    );

    const allCategories = useMemo(() => {
        const fromDb = categories.map((c) => String(c || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_CATEGORIES, ...fromDb])].sort();
    }, [categories]);

    const allColors = useMemo(() => {
        const fromDb = colors.map((c) => String(c || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_COLORS, ...fromDb])].sort();
    }, [colors]);

    const allDiameters = useMemo(() => {
        const fromDb = diameters.map((d) => String(d || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_DIAMETERS, ...fromDb])].sort();
    }, [diameters]);

    const allMaterials = useMemo(() => {
        const fromDb = materials.map((m) => String(m || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_MATERIALS, ...fromDb])].sort();
    }, [materials]);

    const allMinuses = useMemo(() => {
        const fromDb = minuses.map((m) => String(m || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_MINUSES, ...fromDb])];
    }, [minuses]);

    const nav = (params) =>
        router.get(route(`${routeBase}.index`), params, { preserveState: true, replace: true });

    const apply = (overrides = {}) => {
        const params = { search, category, warna, diameter, bahan, minus, habis: habis ? '1' : '', ...overrides };
        if (!params.habis) delete params.habis;
        nav(params);
    };

    const toggleCategory = (val) => {
        const next = category.includes(val) ? category.filter(v => v !== val) : [...category, val];
        setCategory(next);
        nav({ search, category: next, warna, diameter, bahan, minus, habis: habis ? '1' : '' });
    };

    const toggleWarna = (val) => {
        const next = warna.includes(val) ? warna.filter(v => v !== val) : [...warna, val];
        setWarna(next);
        nav({ search, category, warna: next, diameter, bahan, minus, habis: habis ? '1' : '' });
    };

    const toggleDiameter = (val) => {
        const next = diameter.includes(val) ? diameter.filter(v => v !== val) : [...diameter, val];
        setDiameter(next);
        nav({ search, category, warna, diameter: next, bahan, minus, habis: habis ? '1' : '' });
    };

    const toggleBahan = (val) => {
        const next = bahan.includes(val) ? bahan.filter(v => v !== val) : [...bahan, val];
        setBahan(next);
        nav({ search, category, warna, diameter, bahan: next, minus, habis: habis ? '1' : '' });
    };

    const toggleMinus = (val) => {
        const next = minus.includes(val) ? minus.filter(v => v !== val) : [...minus, val];
        setMinus(next);
        nav({ search, category, warna, diameter, bahan, minus: next, habis: habis ? '1' : '' });
    };

    const handleHabis = (val) => {
        setHabis(val);
        nav({ search, category, warna, diameter, bahan, minus, habis: val ? '1' : '' });
    };

    const totalActive = category.length + warna.length + diameter.length + bahan.length + minus.length + (habis ? 1 : 0);

    return (
        <SidebarLayout title="Produk Cabang">
            <div className="space-y-4">

                {/* Expired / soon-expiring banner (sekali per hari) */}
                <BannerBlock
                    type="expired" userId={userId} items={expiringAlerts}
                    title="Produk berikut sudah atau hampir kadaluarsa:"
                    subtitle="Periksa produk ini dan pertimbangkan untuk menariknya dari stok."
                    borderClass="border-red-200" bgClass="bg-red-50" dotClass="bg-red-500"
                    badgeFn={(p) => {
                        const isExp = p.expired_produk < today;
                        return (
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isExp ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                {isExp ? 'KADALUARSA' : `Exp: ${p.expired_produk}`}
                            </span>
                        );
                    }}
                />

                {/* Out of stock banner */}
                <BannerBlock
                    type="outofstock" userId={userId} items={outOfStockAlerts}
                    title="Produk berikut stoknya telah habis:"
                    subtitle="Segera lakukan restock atau hapus dari daftar jika sudah tidak tersedia."
                    borderClass="border-red-200" bgClass="bg-red-50" dotClass="bg-red-500"
                />

                {/* Low stock banner (≤5) */}
                <BannerBlock
                    type="lowstock" userId={userId} items={lowStockAlerts}
                    title="Stok produk berikut hampir habis (≤ 5 unit):"
                    subtitle="Segera lakukan restock sebelum stok habis."
                    borderClass="border-amber-200" bgClass="bg-amber-50" dotClass="bg-amber-500"
                    badgeFn={(p) => (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            Stok: {p.jumlah_produk}
                        </span>
                    )}
                />

                {/* Filter bar */}
                <div className="rounded-xl border bg-white p-4">
                    <form onSubmit={(e) => { e.preventDefault(); apply(); }}
                        className="flex flex-wrap items-center gap-3">
                        <label className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 w-full rounded-lg border border-gray-300 pl-10 text-sm"
                                placeholder="Cari nama atau kategori produk"
                            />
                        </label>

                        {/* Filter toggle button */}
                        <button
                            type="button"
                            onClick={() => setShowFilter((f) => !f)}
                            className={`flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                                showFilter || totalActive - (habis ? 1 : 0) > 0
                                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                            {(category.length + warna.length + diameter.length + bahan.length + minus.length) > 0 && (
                                <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    {category.length + warna.length + diameter.length + bahan.length + minus.length}
                                </span>
                            )}
                        </button>

                        {/* Filter stok habis */}
                        <button
                            type="button"
                            onClick={() => handleHabis(!habis)}
                            className={`flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                                habis
                                    ? 'border-red-400 bg-red-50 text-red-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {habis ? <X className="h-4 w-4" /> : null}
                            Stok Habis
                            {outOfStockAlerts.length > 0 && !habis && (
                                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                                    {outOfStockAlerts.length}
                                </span>
                            )}
                        </button>

                        <button type="submit" className="h-11 rounded-lg bg-gray-900 px-4 font-semibold text-white">
                            Cari
                        </button>

                        {(search || totalActive > 0) && (
                            <button type="button"
                                className="h-11 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                onClick={() => { setSearch(''); setCategory([]); setWarna([]); setDiameter([]); setBahan([]); setMinus([]); setHabis(false); nav({}); }}>
                                Reset
                            </button>
                        )}

                        <Link
                            href={route(`${routeBase}.create`)}
                            className="ml-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 font-semibold text-white"
                        >
                            <PackagePlus className="h-4 w-4" /> Tambah Produk
                        </Link>
                    </form>

                    {/* Checkbox filter panel */}
                    {showFilter && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                            <div className="flex flex-wrap gap-8">
                                <CheckboxGroup
                                    title="Kategori Produk"
                                    options={allCategories}
                                    selected={category}
                                    onToggle={toggleCategory}
                                />
                                <CheckboxGroup
                                    title="Warna"
                                    options={allColors}
                                    selected={warna}
                                    onToggle={toggleWarna}
                                />
                                <CheckboxGroup
                                    title="Diameter (Soflen)"
                                    options={allDiameters}
                                    selected={diameter}
                                    onToggle={toggleDiameter}
                                />
                                <CheckboxGroup
                                    title="Bahan (Kacamata)"
                                    options={allMaterials}
                                    selected={bahan}
                                    onToggle={toggleBahan}
                                />
                                <CheckboxGroup
                                    title="Minus / Plus (Soflen)"
                                    options={allMinuses}
                                    selected={minus}
                                    onToggle={toggleMinus}
                                />
                            </div>
                        </div>
                    )}

                    {/* Active filter chips */}
                    {(category.length > 0 || warna.length > 0 || diameter.length > 0 || bahan.length > 0 || minus.length > 0 || habis) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {category.map((v) => (
                                <span key={`c-${v}`} className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                                    {v}
                                    <button type="button" onClick={() => toggleCategory(v)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                            {warna.map((v) => (
                                <span key={`w-${v}`} className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                                    {v}
                                    <button type="button" onClick={() => toggleWarna(v)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                            {diameter.map((v) => (
                                <span key={`d-${v}`} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                                    {v}
                                    <button type="button" onClick={() => toggleDiameter(v)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                            {bahan.map((v) => (
                                <span key={`b-${v}`} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                                    {v}
                                    <button type="button" onClick={() => toggleBahan(v)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                            {minus.map((v) => (
                                <span key={`m-${v}`} className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-800">
                                    {v}
                                    <button type="button" onClick={() => toggleMinus(v)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                            {habis && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                                    Stok Habis
                                    <button type="button" onClick={() => handleHabis(false)}><X className="h-3 w-3" /></button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {products.data.map((product) => {
                        const isHabis   = product.jumlah_produk === 0;
                        const isLow     = product.jumlah_produk > 0 && product.jumlah_produk <= 5;
                        const isExpired = product.expired_produk && product.expired_produk < today;
                        const isExpiring = product.expired_produk && !isExpired && product.expired_produk <= new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

                        return (
                            <article key={product.id}
                                className={`overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg ${
                                    isHabis   ? 'border-red-200'
                                    : isExpired ? 'border-red-300'
                                    : 'border-gray-200'
                                }`}>
                                <button type="button" onClick={() => setSelectedProduct(product)} className="block w-full text-left">
                                    <div className="relative aspect-[4/3] bg-gray-100">
                                        {product.gambar_produk ? (
                                            <img
                                                src={`/storage/${product.gambar_produk}`}
                                                alt={product.nama_produk}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                Tidak ada gambar
                                            </div>
                                        )}
                                        {(isHabis || isExpired) && (
                                            <div className="absolute inset-0 flex items-start justify-end gap-1 p-2">
                                                {isHabis && (
                                                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow">
                                                        HABIS
                                                    </span>
                                                )}
                                                {isExpired && (
                                                    <span className="rounded-full bg-red-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow">
                                                        KADALUARSA
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-lg font-bold text-gray-900">{product.nama_produk}</h3>
                                                <p className="mt-0.5 text-sm text-gray-500">
                                                    {product.kategori_produk}
                                                    {product.warna_produk && <> · {product.warna_produk}</>}
                                                    {product.diameter_produk && <> · Ø{product.diameter_produk}</>}
                                                    {product.bahan_produk && <> · {product.bahan_produk}</>}
                                                    {product.minus_produk && <> · {product.minus_produk}</>}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                                                isHabis ? 'bg-red-100 text-red-700'
                                                : isLow ? 'bg-amber-100 text-amber-700'
                                                : 'bg-orange-50 text-orange-700'
                                            }`}>
                                                Stok {product.jumlah_produk}
                                            </span>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-500">Harga</p>
                                                <p className="font-bold text-gray-900">Rp {money(product.harga_produk)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Tanggal Masuk</p>
                                                <p className="font-bold text-gray-900">{product.tanggal_masuk || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Expired</p>
                                                <p className={`font-bold ${isExpired ? 'text-red-600' : isExpiring ? 'text-orange-600' : 'text-gray-900'}`}>
                                                    {product.expired_produk || '-'}
                                                    {isExpired && ' ⚠'}
                                                    {isExpiring && !isExpired && ' (segera)'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                                <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-3">
                                    <button type="button" onClick={() => setSelectedProduct(product)} className="text-sm font-semibold text-gray-600 hover:text-orange-700">
                                        Lihat Detail
                                    </button>
                                    <div className="flex gap-2">
                                        <Link
                                            href={route(`${routeBase}.edit`, product.id)}
                                            className="inline-flex items-center gap-1 rounded-lg bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700"
                                        >
                                            <Edit className="h-4 w-4" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('Hapus produk ini?')) {
                                                    router.delete(route(`${routeBase}.destroy`, product.id), { preserveScroll: true });
                                                }
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {products.data.length === 0 && (
                    <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
                        {habis ? 'Tidak ada produk dengan stok habis.' : 'Tidak ada produk pada filter ini.'}
                    </div>
                )}

                <div className="flex justify-center gap-2">
                    {products.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-orange-600 text-white' : 'border bg-white'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            {selectedProduct && (
                <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/45 p-0 sm:p-4" onClick={() => setSelectedProduct(null)}>
                    <aside className="h-full w-full max-w-xl overflow-y-auto rounded-none bg-white shadow-2xl sm:rounded-lg" onClick={(event) => event.stopPropagation()}>
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
                            <h3 className="text-lg font-extrabold text-gray-900">Detail Produk</h3>
                            <button onClick={() => setSelectedProduct(null)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                {selectedProduct.gambar_produk ? (
                                    <img src={`/storage/${selectedProduct.gambar_produk}`} alt={selectedProduct.nama_produk} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">Tidak ada gambar</div>
                                )}
                            </div>

                            <h2 className="mt-5 text-2xl font-extrabold text-gray-900">{selectedProduct.nama_produk}</h2>
                            <p className="mt-1 text-sm font-bold text-orange-700">{selectedProduct.kategori_produk}</p>

                            {selectedProduct.deskripsi_produk && (
                                <p className="mt-3 text-sm leading-6 text-gray-600">{selectedProduct.deskripsi_produk}</p>
                            )}

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {[
                                    ['Harga', `Rp ${money(selectedProduct.harga_produk)}`],
                                    ['Stok', selectedProduct.jumlah_produk ?? 0],
                                    selectedProduct.warna_produk && ['Warna', selectedProduct.warna_produk],
                                    selectedProduct.bahan_produk && ['Bahan', selectedProduct.bahan_produk],
                                    selectedProduct.diameter_produk && ['Diameter', selectedProduct.diameter_produk],
                                    selectedProduct.minus_produk && ['Minus / Plus', selectedProduct.minus_produk],
                                    ['Tanggal Masuk', selectedProduct.tanggal_masuk || '-'],
                                    ['Expired Produk', selectedProduct.expired_produk || '-'],
                                ].filter(Boolean).map(([label, value]) => (
                                    <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
                                        <p className="mt-2 text-base font-extrabold text-gray-900">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Link href={route(`${routeBase}.edit`, selectedProduct.id)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700">
                                    <Edit className="h-4 w-4" /> Edit Produk
                                </Link>
                                <button
                                    onClick={() => {
                                        if (confirm('Hapus produk ini?')) {
                                            router.delete(route(`${routeBase}.destroy`, selectedProduct.id), { preserveScroll: true });
                                            setSelectedProduct(null);
                                        }
                                    }}
                                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" /> Hapus
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </SidebarLayout>
    );
}
