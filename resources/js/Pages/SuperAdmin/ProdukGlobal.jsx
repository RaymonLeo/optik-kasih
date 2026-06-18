// appV1.0 Rev 3 - Produk global superadmin dengan katalog manajemen dan panel detail.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit, Filter, PackagePlus, Search, Tag, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

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

export default function ProdukGlobal({ products, admins = [], categories = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [adminId, setAdminId] = useState(filters.admin_id || '');
    const [category, setCategory] = useState(filters.category || '');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const selectedAdmin = useMemo(
        () => admins.find((admin) => String(admin.id) === String(adminId)),
        [admins, adminId],
    );

    const apply = (event) => {
        event?.preventDefault?.();
        router.get(route('super_admin.produk.global'), { search, admin_id: adminId, category }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        setSearch('');
        setAdminId('');
        setCategory('');
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
                    <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto_auto]">
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
                        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm">
                            <option value="">Semua kategori</option>
                            {categories.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>
                        <button type="button" onClick={resetFilter} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
                            Reset
                        </button>
                    </div>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {products.data.map((product) => (
                        <article key={product.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-orange-200 hover:shadow-md">
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
                <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/45 p-0 sm:p-4" onClick={() => setSelectedProduct(null)}>
                    <aside className="h-full w-full max-w-xl overflow-y-auto rounded-none bg-white shadow-2xl sm:rounded-lg" onClick={(event) => event.stopPropagation()}>
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-950">Detail Produk</h3>
                                <p className="text-sm text-slate-500">{selectedProduct.admin?.name || 'Tanpa cabang'}</p>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                <ProductImage product={selectedProduct} />
                            </div>

                            <h2 className="mt-5 text-2xl font-extrabold text-slate-950">{selectedProduct.nama_produk}</h2>
                            <p className="mt-1 text-sm font-bold text-[#E56020]">{selectedProduct.kategori_produk || 'Tanpa kategori'}</p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {[
                                    ['Harga', `Rp ${money(selectedProduct.harga_produk)}`],
                                    ['Stok', selectedProduct.jumlah_produk ?? 0],
                                    ['Tanggal Masuk', selectedProduct.tanggal_masuk || '-'],
                                    ['Expired Produk', selectedProduct.expired_produk || '-'],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                                        <p className="mt-2 text-base font-extrabold text-slate-950">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Link href={route('super_admin.produk.edit', selectedProduct.id)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#E56020] px-4 text-sm font-bold text-white hover:bg-orange-700">
                                    <Edit className="h-4 w-4" />
                                    Edit Produk
                                </Link>
                                <button onClick={() => removeProduct(selectedProduct)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </SidebarLayout>
    );
}
