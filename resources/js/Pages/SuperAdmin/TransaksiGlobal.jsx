// appV1.0 Rev 4 - Tambah tombol Detail per baris untuk lihat detail transaksi lintas cabang.

import SidebarLayout from '@/Components/SidebarLayout';
import TransaksiDetailModal from '@/Components/TransaksiDetailModal';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarRange, Eye, Filter, ReceiptText, Search, TrendingDown, Wallet } from 'lucide-react';
import { useState } from 'react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

function SummaryCard({ label, value, helper, icon: Icon, tone }) {
    const tones = {
        income: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        expense: 'bg-red-50 text-red-700 border-red-100',
        profit: 'bg-orange-50 text-[#E56020] border-orange-100',
    };

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-950">Rp {money(value)}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{helper}</p>
                </div>
                <div className={`rounded-lg border p-3 ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </section>
    );
}

export default function TransaksiGlobal({ transactions, admins = [], summary = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [adminId, setAdminId] = useState(filters.admin_id || '');
    const [range, setRange] = useState(filters.range || 'all');
    const [date, setDate] = useState(filters.date || '');
    const [to, setTo] = useState(filters.to || '');
    const [sortHarga, setSortHarga] = useState(filters.sort_harga || 'desc');
    const [selectedTrx, setSelectedTrx] = useState(null);

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
        <SidebarLayout
            title="Transaksi Semua Cabang"
            subtitle="Pantau pendapatan, pengeluaran, selisih, dan transaksi tiap cabang."
        >
            <Head title="Transaksi Semua Cabang" />

            <div className="space-y-5">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E56020] text-white">
                            <ReceiptText className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-950">Monitor transaksi global</h2>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                                Pilih cabang, periode, dan urutan harga untuk meninjau performa penjualan serta biaya operasional.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard label="Pendapatan" value={summary.pendapatan} helper="Total transaksi sesuai filter" icon={Wallet} tone="income" />
                    <SummaryCard label="Pengeluaran" value={summary.pengeluaran} helper="Total biaya sesuai filter" icon={TrendingDown} tone="expense" />
                    <SummaryCard label="Selisih" value={summary.laba} helper="Pendapatan dikurangi pengeluaran" icon={CalendarRange} tone="profit" />
                </div>

                <form onSubmit={apply} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-4 xl:grid-cols-7">
                        <label className="relative lg:col-span-2">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-11 w-full rounded-lg border-slate-300 pl-10 text-sm"
                                placeholder="Cari transaksi, pasien, cabang"
                            />
                        </label>
                        <select value={adminId} onChange={(event) => setAdminId(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm">
                            <option value="">Semua cabang</option>
                            {admins.map((admin) => (
                                <option key={admin.id} value={admin.id}>{admin.name}</option>
                            ))}
                        </select>
                        <select value={range} onChange={(event) => setRange(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm">
                            <option value="all">Semua waktu</option>
                            <option value="day">Per hari</option>
                            <option value="week">Per minggu</option>
                            <option value="month">Per bulan</option>
                            <option value="year">Per tahun</option>
                            <option value="custom">Tanggal custom</option>
                        </select>
                        <input type="date" value={date || ''} onChange={(event) => setDate(event.target.value)} disabled={!dateEnabled} className="h-11 rounded-lg border-slate-300 text-sm disabled:bg-slate-100" />
                        <input type="date" value={to || ''} onChange={(event) => setTo(event.target.value)} disabled={range !== 'custom'} className="h-11 rounded-lg border-slate-300 text-sm disabled:bg-slate-100" />
                        <select value={sortHarga} onChange={(event) => setSortHarga(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm">
                            <option value="desc">Harga tertinggi</option>
                            <option value="asc">Harga terendah</option>
                        </select>
                    </div>
                    <button className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
                        <Filter className="h-4 w-4" />
                        Terapkan Filter
                    </button>
                </form>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1040px] text-sm">
                            <thead className="bg-slate-950 text-left text-white">
                                <tr>
                                    <th className="px-4 py-3">Nota</th>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Cabang</th>
                                    <th className="px-4 py-3">Pasien</th>
                                    <th className="px-4 py-3">Produk/Lensa</th>
                                    <th className="px-4 py-3">Metode</th>
                                    <th className="px-4 py-3 text-right">Harga</th>
                                    <th className="px-4 py-3 text-right">Sisa</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {transactions.data.map((row) => (
                                    <tr key={row.id} className="hover:bg-orange-50/50">
                                        <td className="px-4 py-3 font-extrabold text-slate-950">#{row.id}</td>
                                        <td className="px-4 py-3 text-slate-700">{row.tanggal_pesan || '-'}</td>
                                        <td className="px-4 py-3 font-bold text-[#E56020]">{row.admin?.name || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{row.pasien?.nama_pasien || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{row.produk?.nama_produk || row.lensa?.nama_lensa || row.lensa_pelanggan || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{row.metode_pembayaran_1 || '-'}{row.metode_pembayaran_2 ? ` / ${row.metode_pembayaran_2}` : ''}</td>
                                        <td className="px-4 py-3 text-right font-extrabold text-slate-950">Rp {money(row.harga)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-700">Rp {money(row.sisa)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedTrx(row)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#E56020] hover:text-[#E56020]"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-10 text-center text-slate-500">Belum ada transaksi pada filter ini.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {transactions.links.map((link, index) => (
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

            {selectedTrx && (
                <TransaksiDetailModal trx={selectedTrx} onClose={() => setSelectedTrx(null)} />
            )}
        </SidebarLayout>
    );
}
