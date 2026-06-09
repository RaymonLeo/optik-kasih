import SidebarLayout from '@/Components/SidebarLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, Filter, PackagePlus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

export default function ProdukIndex({ products, categories = [], filters = {}, routeBase = 'admin.produk' }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');

    const apply = (event) => {
        event?.preventDefault?.();
        router.get(route(`${routeBase}.index`), { search, category }, { preserveState: true, replace: true });
    };

    return (
        <SidebarLayout title="Produk Cabang">
            <div className="space-y-5">
                <div className="rounded-xl border bg-white p-4">
                    <form onSubmit={apply} className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <label className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-11 w-full rounded-lg border-gray-300 pl-10"
                                placeholder="Cari nama atau kategori produk"
                            />
                        </label>
                        <label className="relative min-w-56">
                            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <select
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="h-11 w-full rounded-lg border-gray-300 pl-10"
                            >
                                <option value="">Semua kategori</option>
                                {categories.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </label>
                        <button type="submit" className="h-11 rounded-lg bg-gray-900 px-4 font-semibold text-white">
                            Terapkan
                        </button>
                        <Link
                            href={route(`${routeBase}.create`)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 font-semibold text-white"
                        >
                            <PackagePlus className="h-4 w-4" /> Tambah Produk
                        </Link>
                    </form>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {products.data.map((product) => (
                        <article key={product.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                            <div className="aspect-[4/3] bg-gray-100">
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
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{product.nama_produk}</h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.kategori_produk}</p>
                                    </div>
                                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
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
                                        <p className="font-bold text-gray-900">{product.expired_produk || '-'}</p>
                                    </div>
                                </div>
                                <div className="mt-5 flex justify-end gap-2">
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
                    ))}
                </div>

                {products.data.length === 0 && (
                    <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
                        Tidak ada produk pada filter ini.
                    </div>
                )}

                <div className="flex justify-center gap-2">
                    {products.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-orange-600 text-white' : 'bg-white border'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </SidebarLayout>
    );
}
