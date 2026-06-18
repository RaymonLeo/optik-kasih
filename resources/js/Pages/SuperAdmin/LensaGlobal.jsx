// appV1.0 Rev 3 - Lensa global superadmin dengan tabel inventori optik.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Glasses, Search } from 'lucide-react';
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
        <SidebarLayout
            title="Lensa Semua Cabang"
            subtitle="Pantau nama lensa, jenis, coating, indeks, stok, dan tanggal masuk lensa."
        >
            <Head title="Lensa Semua Cabang" />

            <div className="space-y-5">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E56020] text-white">
                            <Glasses className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-950">Database lensa global</h2>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                                Superadmin dapat melihat stok lensa semua cabang. Struktur ini memudahkan pengecekan jenis,
                                coating, indeks, dan tanggal barang masuk.
                            </p>
                        </div>
                    </div>
                </section>

                <form onSubmit={apply} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_240px_auto]">
                    <label className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="h-11 w-full rounded-lg border-slate-300 pl-10 text-sm"
                            placeholder="Cari nama, jenis, coating, indeks"
                        />
                    </label>
                    <select value={adminId} onChange={(event) => setAdminId(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm">
                        <option value="">Semua cabang</option>
                        {admins.map((admin) => (
                            <option key={admin.id} value={admin.id}>{admin.name}</option>
                        ))}
                    </select>
                    <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
                        <Filter className="h-4 w-4" />
                        Terapkan Filter
                    </button>
                </form>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[920px] text-sm">
                            <thead className="bg-slate-950 text-left text-white">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Nama Lensa</th>
                                    <th className="px-4 py-3">Cabang</th>
                                    <th className="px-4 py-3">Jenis</th>
                                    <th className="px-4 py-3">Coating</th>
                                    <th className="px-4 py-3">Indeks</th>
                                    <th className="px-4 py-3 text-right">Stok</th>
                                    <th className="px-4 py-3">Tanggal Masuk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {rows.data.map((row) => (
                                    <tr key={row.id_lensa} className="hover:bg-orange-50/50">
                                        <td className="px-4 py-3 font-bold text-slate-500">#{row.id_lensa}</td>
                                        <td className="px-4 py-3 font-extrabold text-slate-950">{row.nama_lensa || '-'}</td>
                                        <td className="px-4 py-3 font-bold text-[#E56020]">{row.admin?.name || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{row.jenis_lensa || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{row.coating_lensa || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{row.indeks_lensa || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                                {row.stok_lensa ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{row.tanggal_masuk || '-'}</td>
                                    </tr>
                                ))}
                                {rows.data.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-10 text-center text-slate-500">Belum ada lensa pada filter ini.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {rows.links.map((link, index) => (
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
        </SidebarLayout>
    );
}
