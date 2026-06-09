import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Search } from 'lucide-react';
import { useState } from 'react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

export default function TransaksiGlobal({ transactions, admins = [], summary = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [adminId, setAdminId] = useState(filters.admin_id || '');
    const [range, setRange] = useState(filters.range || 'all');
    const [date, setDate] = useState(filters.date || '');
    const [to, setTo] = useState(filters.to || '');
    const [sortHarga, setSortHarga] = useState(filters.sort_harga || 'desc');

    const apply = (event) => {
        event.preventDefault();
        router.get(route('super_admin.transaksi.global'), {
            search,
            admin_id: adminId,
            range,
            date,
            to,
            sort_harga: sortHarga,
        }, { preserveState: true, replace: true });
    };

    const dateEnabled = ['day', 'week', 'month', 'year', 'custom'].includes(range);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Transaksi Semua Cabang</h2>}>
            <Head title="Transaksi Semua Cabang" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Pendapatan</p>
                            <p className="mt-2 text-2xl font-bold text-emerald-700">Rp {money(summary.pendapatan)}</p>
                        </div>
                        <div className="rounded-2xl border bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Pengeluaran</p>
                            <p className="mt-2 text-2xl font-bold text-red-700">Rp {money(summary.pengeluaran)}</p>
                        </div>
                        <div className="rounded-2xl border bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Selisih</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">Rp {money(summary.laba)}</p>
                        </div>
                    </div>

                    <form onSubmit={apply} className="rounded-2xl border bg-white p-4 shadow-sm">
                        <div className="grid gap-3 lg:grid-cols-4 xl:grid-cols-7">
                            <label className="relative lg:col-span-2">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="h-11 w-full rounded-lg border-gray-300 pl-10"
                                    placeholder="Cari transaksi, pasien, cabang"
                                />
                            </label>
                            <select value={adminId} onChange={(event) => setAdminId(event.target.value)} className="h-11 rounded-lg border-gray-300">
                                <option value="">Semua cabang</option>
                                {admins.map((admin) => (
                                    <option key={admin.id} value={admin.id}>{admin.name}</option>
                                ))}
                            </select>
                            <select value={range} onChange={(event) => setRange(event.target.value)} className="h-11 rounded-lg border-gray-300">
                                <option value="all">Semua waktu</option>
                                <option value="day">Per hari</option>
                                <option value="week">Per minggu</option>
                                <option value="month">Per bulan</option>
                                <option value="year">Per tahun</option>
                                <option value="custom">Tanggal custom</option>
                            </select>
                            <input type="date" value={date || ''} onChange={(event) => setDate(event.target.value)} disabled={!dateEnabled} className="h-11 rounded-lg border-gray-300 disabled:bg-gray-100" />
                            <input type="date" value={to || ''} onChange={(event) => setTo(event.target.value)} disabled={range !== 'custom'} className="h-11 rounded-lg border-gray-300 disabled:bg-gray-100" />
                            <select value={sortHarga} onChange={(event) => setSortHarga(event.target.value)} className="h-11 rounded-lg border-gray-300">
                                <option value="desc">Harga tertinggi</option>
                                <option value="asc">Harga terendah</option>
                            </select>
                        </div>
                        <button className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 font-semibold text-white">
                            <Filter className="h-4 w-4" /> Terapkan Filter
                        </button>
                    </form>

                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Cabang</th>
                                    <th className="px-4 py-3">Pasien</th>
                                    <th className="px-4 py-3">Produk/Lensa</th>
                                    <th className="px-4 py-3">Metode</th>
                                    <th className="px-4 py-3 text-right">Harga</th>
                                    <th className="px-4 py-3 text-right">Sisa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data.map((row) => (
                                    <tr key={row.id} className="border-t">
                                        <td className="px-4 py-3 font-semibold">#{row.id}</td>
                                        <td className="px-4 py-3">{row.tanggal_pesan || '-'}</td>
                                        <td className="px-4 py-3 text-orange-700">{row.admin?.name || '-'}</td>
                                        <td className="px-4 py-3">{row.pasien?.nama_pasien || '-'}</td>
                                        <td className="px-4 py-3">{row.produk?.nama_produk || row.lensa?.nama_lensa || row.lensa_pelanggan || '-'}</td>
                                        <td className="px-4 py-3">{row.metode_pembayaran_1 || '-'}{row.metode_pembayaran_2 ? ` / ${row.metode_pembayaran_2}` : ''}</td>
                                        <td className="px-4 py-3 text-right font-semibold">Rp {money(row.harga)}</td>
                                        <td className="px-4 py-3 text-right">Rp {money(row.sisa)}</td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-10 text-center text-gray-500">Belum ada transaksi pada filter ini.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center gap-2">
                        {transactions.links.map((link, index) => (
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
