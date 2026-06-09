import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminsIndex({ admins, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const apply = (event) => {
        event.preventDefault();
        router.get(route('super_admin.admins.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Kelola Cabang/Admin</h2>}>
            <Head title="Kelola Cabang/Admin" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <form onSubmit={apply} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row">
                        <label className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-11 w-full rounded-lg border-gray-300 pl-10"
                                placeholder="Cari nama cabang atau email"
                            />
                        </label>
                        <button className="h-11 rounded-lg bg-gray-900 px-4 font-semibold text-white">Cari</button>
                        <Link
                            href={route('super_admin.admins.create')}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 font-semibold text-white"
                        >
                            <Plus className="h-4 w-4" /> Tambah Cabang
                        </Link>
                    </form>

                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3">Cabang/Admin</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Produk</th>
                                    <th className="px-4 py-3">Lensa</th>
                                    <th className="px-4 py-3">Transaksi</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.data.map((admin) => (
                                    <tr key={admin.id} className="border-t">
                                        <td className="px-4 py-3 font-semibold text-gray-900">{admin.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                                        <td className="px-4 py-3">{admin.produk_count}</td>
                                        <td className="px-4 py-3">{admin.lensa_count}</td>
                                        <td className="px-4 py-3">{admin.transaksi_count}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('super_admin.admins.show', admin.id)} className="rounded-lg bg-gray-100 p-2 text-gray-700">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link href={route('super_admin.admins.edit', admin.id)} className="rounded-lg bg-violet-100 p-2 text-violet-700">
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Hapus cabang/admin ini?')) {
                                                            router.delete(route('super_admin.admins.destroy', admin.id), { preserveScroll: true });
                                                        }
                                                    }}
                                                    className="rounded-lg bg-red-100 p-2 text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {admins.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-10 text-center text-gray-500">Belum ada cabang/admin.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center gap-2">
                        {admins.links.map((link, index) => (
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
