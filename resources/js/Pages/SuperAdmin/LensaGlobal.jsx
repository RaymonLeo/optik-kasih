// appV1.0 Rev 4 - Tambah aksi edit/hapus dan tombol Tambah Lensa.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Filter, Glasses, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';

const fmtSignedVal = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = parseFloat(v);
    if (isNaN(n)) return String(v);
    return (n > 0 ? '+' : '') + n.toFixed(2);
};

function DetailRow({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
            <span className="font-semibold text-slate-500">{label}</span>
            <span className="text-right font-bold text-slate-900">{value}</span>
        </div>
    );
}

export default function LensaGlobal({ rows, admins = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [adminId, setAdminId] = useState(filters.admin_id || '');
    const [deleting, setDeleting] = useState(null);
    const [detail, setDetail] = useState(null);

    const confirmDelete = (row) => setDeleting(row);
    const cancelDelete = () => setDeleting(null);
    const doDelete = () => {
        if (!deleting) return;
        router.delete(route('super_admin.lensa.destroy', deleting.id_lensa), {
            onFinish: () => setDeleting(null),
            preserveScroll: true,
        });
    };

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
                        <div className="flex-1">
                            <h2 className="text-2xl font-extrabold text-slate-950">Database lensa global</h2>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                                Superadmin dapat melihat stok lensa semua cabang. Struktur ini memudahkan pengecekan jenis,
                                coating, indeks, dan tanggal barang masuk.
                            </p>
                        </div>
                        <Link href={route('super_admin.lensa.create')} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#E56020] px-4 text-sm font-bold text-white hover:bg-orange-700">
                            <Plus className="h-4 w-4" /> Tambah Lensa
                        </Link>
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
                        <table className="w-full min-w-[980px] text-sm">
                            <thead className="bg-slate-950 text-left text-white">
                                <tr>
                                    <th className="px-4 py-3">Gambar</th>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Nama Lensa</th>
                                    <th className="px-4 py-3">Cabang</th>
                                    <th className="px-4 py-3">Jenis</th>
                                    <th className="px-4 py-3">Coating</th>
                                    <th className="px-4 py-3">Indeks</th>
                                    <th className="px-4 py-3 text-right">Stok</th>
                                    <th className="px-4 py-3">Tanggal Masuk</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {rows.data.map((row) => (
                                    <tr key={row.id_lensa} className="hover:bg-orange-50/50">
                                        <td className="px-4 py-3">
                                            {row.gambar_lensa ? (
                                                <img
                                                    src={`/storage/${row.gambar_lensa}`}
                                                    alt={row.nama_lensa || 'Lensa'}
                                                    className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
                                                    <Glasses className="h-5 w-5" />
                                                </div>
                                            )}
                                        </td>
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
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setDetail(row)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                                    <Eye className="h-3.5 w-3.5" /> Detail
                                                </button>
                                                <Link href={route('super_admin.lensa.edit', row.id_lensa)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                                    Edit
                                                </Link>
                                                <button onClick={() => confirmDelete(row)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rows.data.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-10 text-center text-slate-500">Belum ada lensa pada filter ini.</td>
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

            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="text-lg font-extrabold text-slate-900">Detail Lensa</h3>
                            <button onClick={() => setDetail(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 flex gap-4">
                            {detail.gambar_lensa ? (
                                <img
                                    src={`/storage/${detail.gambar_lensa}`}
                                    alt={detail.nama_lensa || 'Lensa'}
                                    className="h-24 w-24 shrink-0 rounded-lg border border-slate-200 object-cover"
                                />
                            ) : (
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
                                    <Glasses className="h-8 w-8" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-xl font-extrabold text-slate-950">{detail.nama_lensa || '-'}</p>
                                <p className="mt-1 text-sm font-bold text-[#E56020]">{detail.admin?.name || '-'}</p>
                                {detail.is_pesanan ? (
                                    <span className="mt-2 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                                        Lensa pesanan{detail.nama_pesanan ? `: ${detail.nama_pesanan}` : ''}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Informasi Umum</p>
                            <DetailRow label="Jenis" value={detail.jenis_lensa} />
                            <DetailRow label="Coating" value={detail.coating_lensa} />
                            <DetailRow label="Indeks" value={detail.indeks_lensa} />
                            <DetailRow label="Stok" value={detail.stok_lensa ?? 0} />
                            <DetailRow label="Tanggal Masuk" value={detail.tanggal_masuk} />
                        </div>

                        <div className="mt-5">
                            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Ukuran / Spesifikasi</p>
                            <DetailRow label="SPH" value={fmtSignedVal(detail.sph_lensa)} />
                            <DetailRow label="CYL" value={fmtSignedVal(detail.cyl_lensa)} />
                            <DetailRow label="AXIS" value={detail.axis_lensa} />
                            <DetailRow label="ADD" value={fmtSignedVal(detail.add_lensa)} />
                            <DetailRow label="PRISM" value={detail.prism_lensa} />
                            <DetailRow label="BASE" value={detail.base_lensa} />
                        </div>

                        {detail.deskripsi && (
                            <div className="mt-5">
                                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Deskripsi</p>
                                <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{detail.deskripsi}</p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <Link href={route('super_admin.lensa.edit', detail.id_lensa)} className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                Edit Lensa
                            </Link>
                            <button onClick={() => setDetail(null)} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-extrabold text-slate-900">Hapus Lensa?</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            <span className="font-semibold">{deleting.nama_lensa || 'Lensa ini'}</span> akan dihapus secara permanen.
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button onClick={cancelDelete} className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
                            <button onClick={doDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}
