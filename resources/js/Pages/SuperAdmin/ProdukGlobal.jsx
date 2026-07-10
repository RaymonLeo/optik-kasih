// appV1.0 Rev 7 - Tambah animasi hover-only (floating + outline oranye) konsisten dengan Produk cabang.

import SidebarLayout from '@/Components/SidebarLayout';
import ProdukDetailModal from '@/Components/ProdukDetailModal';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit, Filter, PackagePlus, Search, Tag, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

const DEFAULT_CATEGORIES = ['kacamata', 'soflen', 'air soflen', 'produk lainnya'];
const DEFAULT_COLORS = ['hitam', 'putih', 'coklat', 'abu-abu', 'tortoise/motif', 'emas', 'perak', 'merah', 'biru', 'hijau', 'kuning', 'bening'];
const DEFAULT_DIAMETERS = ['13.8', '14.0', '14.2', '14.5'];
const DEFAULT_MATERIALS = ['plastik', 'besi'];
const DEFAULT_MINUSES = [
    'plano', '-0.50', '-1.00', '-1.50', '-2.00', '-2.50', '-3.00', '-3.50', '-4.00', '-4.50', '-5.00', '-5.50', '-6.00',
    '+0.50', '+1.00', '+1.50', '+2.00',
];
const toArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

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
                    <span className="text-xs italic text-gray-400">Belum ada data</span>
                )}
            </div>
        </div>
    );
}

function ProductImage({ product }) {
    if (product.gambar_produk) {
        return (
            <img
                src={`/storage/${product.gambar_produk}`}
                alt={product.nama_produk}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-semibold text-slate-400">
            Tidak ada gambar
        </div>
    );
}

export default function ProdukGlobal({ products, admins = [], categories = [], colors = [], diameters = [], materials = [], minuses = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [adminId, setAdminId] = useState(filters.admin_id || '');
    const [category, setCategory] = useState(toArr(filters.category));
    const [warna, setWarna] = useState(toArr(filters.warna));
    const [diameter, setDiameter] = useState(toArr(filters.diameter));
    const [bahan, setBahan] = useState(toArr(filters.bahan));
    const [minus, setMinus] = useState(toArr(filters.minus));
    const [showFilter, setShowFilter] = useState(
        toArr(filters.category).length > 0 || toArr(filters.warna).length > 0 || toArr(filters.diameter).length > 0
        || toArr(filters.bahan).length > 0 || toArr(filters.minus).length > 0
    );
    const [selectedProduct, setSelectedProduct] = useState(null);

    const selectedAdmin = useMemo(
        () => admins.find((admin) => String(admin.id) === String(adminId)),
        [admins, adminId],
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
        router.get(route('super_admin.produk.global'), params, { preserveState: true, replace: true });

    const apply = (event) => {
        event?.preventDefault?.();
        nav({ search, admin_id: adminId, category, warna, diameter, bahan, minus });
    };

    const toggleCategory = (val) => {
        const next = category.includes(val) ? category.filter(v => v !== val) : [...category, val];
        setCategory(next);
        nav({ search, admin_id: adminId, category: next, warna, diameter, bahan, minus });
    };

    const toggleWarna = (val) => {
        const next = warna.includes(val) ? warna.filter(v => v !== val) : [...warna, val];
        setWarna(next);
        nav({ search, admin_id: adminId, category, warna: next, diameter, bahan, minus });
    };

    const toggleDiameter = (val) => {
        const next = diameter.includes(val) ? diameter.filter(v => v !== val) : [...diameter, val];
        setDiameter(next);
        nav({ search, admin_id: adminId, category, warna, diameter: next, bahan, minus });
    };

    const toggleBahan = (val) => {
        const next = bahan.includes(val) ? bahan.filter(v => v !== val) : [...bahan, val];
        setBahan(next);
        nav({ search, admin_id: adminId, category, warna, diameter, bahan: next, minus });
    };

    const toggleMinus = (val) => {
        const next = minus.includes(val) ? minus.filter(v => v !== val) : [...minus, val];
        setMinus(next);
        nav({ search, admin_id: adminId, category, warna, diameter, bahan, minus: next });
    };

    const totalActive = category.length + warna.length + diameter.length + bahan.length + minus.length;

    const resetFilter = () => {
        setSearch('');
        setAdminId('');
        setCategory([]);
        setWarna([]);
        setDiameter([]);
        setBahan([]);
        setMinus([]);
        router.get(route('super_admin.produk.global'), {}, { preserveState: true, replace: true });
    };

    const removeProduct = (product) => {
        if (confirm(`Hapus produk "${product.nama_produk}"?`)) {
            router.delete(route('super_admin.produk.destroy', product.id), { preserveScroll: true });
        }
    };

    return (
        <SidebarLayout
            title="Produk Semua Cabang"
            subtitle="Kelola produk per cabang, kategori, stok, harga, tanggal masuk, dan expired produk."
        >
            <Head title="Produk Semua Cabang" />

            <div className="space-y-5">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#E56020]">
                                <Tag className="h-4 w-4" />
                                {selectedAdmin ? `Cabang: ${selectedAdmin.name}` : 'Semua cabang'}
                            </div>
                            <h2 className="mt-3 text-2xl font-extrabold text-slate-950">Katalog inventori produk</h2>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                                Klik card untuk melihat detail. Gunakan filter untuk mengelola produk cabang tertentu.
                            </p>
                        </div>
                        <Link
                            href={route('super_admin.produk.create', adminId ? { admin_id: adminId } : {})}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#E56020] px-4 text-sm font-bold text-white shadow-sm hover:bg-orange-700"
                        >
                            <PackagePlus className="h-4 w-4" />
                            Tambah Produk
                        </Link>
                    </div>
                </section>

                <form onSubmit={apply} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto_auto]">
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-11 w-full rounded-lg border-slate-300 pl-10 text-sm"
                                placeholder="Cari nama produk atau kategori"
                            />
                        </label>
                        <select value={adminId} onChange={(event) => setAdminId(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm">
                            <option value="">Semua cabang</option>
                            {admins.map((admin) => (
                                <option key={admin.id} value={admin.id}>{admin.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setShowFilter((f) => !f)}
                            className={`flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
                                showFilter || totalActive > 0
                                    ? 'border-orange-400 bg-orange-50 text-[#E56020]'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                            {totalActive > 0 && (
                                <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    {totalActive}
                                </span>
                            )}
                        </button>
                        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
                            Cari
                        </button>
                        <button type="button" onClick={resetFilter} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
                            Reset
                        </button>
                    </div>

                    {showFilter && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <div className="flex flex-wrap gap-8">
                                <CheckboxGroup title="Kategori Produk" options={allCategories} selected={category} onToggle={toggleCategory} />
                                <CheckboxGroup title="Warna" options={allColors} selected={warna} onToggle={toggleWarna} />
                                <CheckboxGroup title="Diameter (Soflen)" options={allDiameters} selected={diameter} onToggle={toggleDiameter} />
                                <CheckboxGroup title="Bahan (Kacamata)" options={allMaterials} selected={bahan} onToggle={toggleBahan} />
                                <CheckboxGroup title="Minus / Plus (Soflen)" options={allMinuses} selected={minus} onToggle={toggleMinus} />
                            </div>
                        </div>
                    )}

                    {totalActive > 0 && (
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
                        </div>
                    )}
                </form>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {products.data.map((product) => (
                        <article key={product.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">
                            <button type="button" onClick={() => setSelectedProduct(product)} className="block w-full text-left">
                                <div className="aspect-square overflow-hidden bg-slate-100">
                                    <ProductImage product={product} />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="line-clamp-2 min-h-[44px] text-sm font-extrabold leading-5 text-slate-950">{product.nama_produk}</h3>
                                            <p className="mt-1 truncate text-xs font-bold text-[#E56020]">{product.admin?.name || 'Tanpa cabang'}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                            Stok {product.jumlah_produk}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-lg font-extrabold text-[#E56020]">Rp {money(product.harga_produk)}</p>
                                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                        Masuk: {product.tanggal_masuk || '-'}
                                    </div>
                                </div>
                            </button>
                            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                                <button onClick={() => setSelectedProduct(product)} className="text-sm font-bold text-slate-700 hover:text-[#E56020]">
                                    Detail
                                </button>
                                <div className="flex gap-2">
                                    <Link href={route('super_admin.produk.edit', product.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 text-[#E56020] hover:bg-orange-50" title="Edit">
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                    <button onClick={() => removeProduct(product)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" title="Hapus">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {products.data.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                        Tidak ada produk pada filter ini.
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-2">
                    {products.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                                link.active ? 'border-[#E56020] bg-[#E56020] text-white' : 'border-slate-200 bg-white text-slate-700'
                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            {selectedProduct && (
                <ProdukDetailModal
                    product={selectedProduct}
                    editHref={route('super_admin.produk.edit', selectedProduct.id)}
                    onClose={() => setSelectedProduct(null)}
                    onDelete={() => {
                        removeProduct(selectedProduct);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </SidebarLayout>
    );
}
