import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Search } from 'lucide-react';
import { useState } from 'react';

export default function LensaGlobal({ rows, admins = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [adminId, setAdminId] = useState(filters.admin_id || '');

    const apply = (event) => {
        event.preventDefault();
        router.get(route('super_admin.lensa.global'), { search, admin_id: adminId }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Lensa Semua Cabang</h2>}>
            <Head title="Lensa Semua Cabang" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <form onSubmit={apply} className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[1fr_240px_auto]">
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-11 w-full rounded-lg border-gray-300 pl-10"
                                placeholder="Cari nama, jenis, coating, indeks"
                            />
                        </label>
                        <select value={adminId} onChange={(event) => setAdminId(event.target.value)} className="h-11 rounded-lg border-gray-300">
                            <option value="">Semua cabang</option>
                            {admins.map((admin) => (
                                <option key={admin.id} value={admin.id}>{admin.name}</option>
                            ))}
                        </select>
                        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 font-semibold text-white">
                            <Filter className="h-4 w-4" /> Filter
                        </button>
                    </form>

                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-4 py-3">Cabang</th>
                                    <th className="px-4 py-3">Jenis</th>
                                    <th className="px-4 py-3">Coating</th>
                                    <th className="px-4 py-3">Indeks</th>
                                    <th className="px-4 py-3">Stok</th>
                                    <th className="px-4 py-3">Tanggal Masuk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.data.map((row) => (
                                    <tr key={row.id_lensa} className="border-t">
                                        <td className="px-4 py-3 font-semibold text-gray-900">{row.nama_lensa || '-'}</td>
                                        <td className="px-4 py-3 text-orange-700">{row.admin?.name || '-'}</td>
                                        <td className="px-4 py-3">{row.jenis_lensa || '-'}</td>
                                        <td className="px-4 py-3">{row.coating_lensa || '-'}</td>
                                        <td className="px-4 py-3">{row.indeks_lensa || '-'}</td>
                                        <td className="px-4 py-3">{row.stok_lensa ?? 0}</td>
                                        <td className="px-4 py-3">{row.tanggal_masuk || '-'}</td>
                                    </tr>
                                ))}
                                {rows.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-10 text-center text-gray-500">Belum ada lensa pada filter ini.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center gap-2">
                        {rows.links.map((link, index) => (
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
