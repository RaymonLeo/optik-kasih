import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Filter, PackagePlus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

export default function ProdukGlobal({ auth, products, admins = [], categories = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [adminId, setAdminId] = useState(filters.admin_id || '');
    const [category, setCategory] = useState(filters.category || '');

    const apply = (event) => {
        event?.preventDefault?.();
        router.get(route('super_admin.produk.global'), { search, admin_id: adminId, category }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Produk Semua Cabang</h2>}
        >
            <Head title="Produk Semua Cabang" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <form onSubmit={apply} className="rounded-2xl border bg-white p-4 shadow-sm">
                        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto_auto]">
                            <label className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="h-11 w-full rounded-lg border-gray-300 pl-10"
                                    placeholder="Cari produk"
                                />
                            </label>
                            <select
                                value={adminId}
                                onChange={(event) => setAdminId(event.target.value)}
                                className="h-11 rounded-lg border-gray-300"
                            >
                                <option value="">Semua cabang</option>
                                {admins.map((admin) => (
                                    <option key={admin.id} value={admin.id}>{admin.name}</option>
                                ))}
                            </select>
                            <select
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="h-11 rounded-lg border-gray-300"
                            >
                                <option value="">Semua kategori</option>
                                {categories.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 font-semibold text-white">
                                <Filter className="h-4 w-4" /> Filter
                            </button>
                            <Link
                                href={route('super_admin.produk.create', adminId ? { admin_id: adminId } : {})}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 font-semibold text-white"
                            >
                                <PackagePlus className="h-4 w-4" /> Tambah
                            </Link>
                        </div>
                    </form>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {products.data.map((product) => (
                            <article key={product.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                                <div className="aspect-[4/3] bg-gray-100">
                                    {product.gambar_produk ? (
                                        <img src={`/storage/${product.gambar_produk}`} alt={product.nama_produk} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">Tidak ada gambar</div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{product.nama_produk}</h3>
                                            <p className="mt-1 text-sm text-gray-500">{product.kategori_produk}</p>
                                            <p className="mt-1 text-sm font-semibold text-orange-700">{product.admin?.name || 'Tanpa cabang'}</p>
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
                                            href={route('super_admin.produk.edit', product.id)}
                                            className="inline-flex items-center gap-1 rounded-lg bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700"
                                        >
                                            <Edit className="h-4 w-4" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('Hapus produk ini?')) {
                                                    router.delete(route('super_admin.produk.destroy', product.id), { preserveScroll: true });
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
                        <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
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
            </div>
        </AuthenticatedLayout>
    );
}
