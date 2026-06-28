// appV1.0 Rev 2 - Dashboard admin cabang: SidebarLayout, grafik penjualan, quick actions.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    Glasses,
    Images,
    Package,
    ReceiptText,
    TrendingDown,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

const money = (v) => Number(v || 0).toLocaleString('id-ID');

function StatCard({ label, value, helper, icon: Icon, tone = 'orange' }) {
    const tones = {
        orange: 'bg-orange-50 text-[#E56020] border-orange-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        slate: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="mt-2 truncate text-2xl font-extrabold text-slate-950">{value}</p>
                    {helper && <p className="mt-1 text-xs font-medium text-slate-500">{helper}</p>}
                </div>
                <div className={`rounded-lg border p-3 ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </section>
    );
}

function QuickCard({ title, description, href, icon: Icon, accent = 'bg-[#E56020]' }) {
    return (
        <Link href={href} className="group flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${accent}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="font-extrabold text-slate-950">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
            </div>
        </Link>
    );
}

const PERIODS = [
    { key: 'kemarin', label: 'Kemarin' },
    { key: '7',       label: '7 Hari'  },
    { key: '30',      label: '30 Hari' },
    { key: '365',     label: '1 Tahun' },
];

function SalesChart({ data = [] }) {
    if (!data.length) {
        return (
            <div className="flex h-44 items-center justify-center text-sm text-slate-400">
                Belum ada data transaksi pada periode ini.
            </div>
        );
    }

    const maxTotal = Math.max(...data.map((d) => d.total), 1);
    const chartH = 150;
    const barW = Math.max(8, Math.min(40, Math.floor(560 / data.length) - 4));
    const gap  = Math.max(2, Math.min(8, Math.floor(560 / data.length) * 0.15));
    const totalW = data.length * (barW + gap);
    const svgW = Math.max(totalW, 400);

    const fmt = (v) => {
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
        return String(v);
    };
    const fmtDate = (s) => { const d = new Date(s); return `${d.getDate()}/${d.getMonth() + 1}`; };

    return (
        <div className="overflow-x-auto">
            <svg width={svgW} height={chartH + 40} viewBox={`0 0 ${svgW} ${chartH + 40}`} className="min-w-full">
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = chartH - frac * chartH;
                    return (
                        <g key={frac}>
                            <line x1="0" y1={y} x2={svgW} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                            <text x="2" y={y - 2} fontSize="9" fill="#94a3b8">{fmt(maxTotal * frac)}</text>
                        </g>
                    );
                })}
                {data.map((d, i) => {
                    const barH = Math.max(2, (d.total / maxTotal) * chartH);
                    const x = i * (barW + gap);
                    const y = chartH - barH;
                    return (
                        <g key={d.tanggal}>
                            <rect x={x} y={y} width={barW} height={barH} rx="2" fill="#E56020" opacity="0.85" />
                            {barH > 20 && (
                                <text x={x + barW / 2} y={y + 12} fontSize="8" fill="white" textAnchor="middle">{fmt(d.total)}</text>
                            )}
                            <text x={x + barW / 2} y={chartH + 14} fontSize="9" fill="#64748b" textAnchor="middle">{fmtDate(d.tanggal)}</text>
                            <text x={x + barW / 2} y={chartH + 26} fontSize="8" fill="#94a3b8" textAnchor="middle">{d.jumlah}x</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export default function AdminDashboard({ stats, chartData = [], branchName = '' }) {
    const [period, setPeriod] = useState('7');

    const handlePeriod = (p) => {
        setPeriod(p);
        router.get(route('admin.dashboard'), { period: p }, { preserveState: true, replace: true });
    };

    return (
        <SidebarLayout
            title="Dashboard Cabang"
            subtitle={`Pantau penjualan, stok, pasien, dan aktivitas cabang${branchName ? ` ${branchName}` : ''}.`}
        >
            <Head title="Dashboard Admin" />

            <div className="space-y-5">
                {/* Hero */}
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-sm">
                    <div className="p-6 lg:p-7">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-orange-100">
                            <Building2 className="h-4 w-4 text-[#E56020]" />
                            {branchName || 'Cabang Optik Kasih'}
                        </div>
                        <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">Pusat operasional cabang</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                            Kelola produk, lensa, pasien, transaksi, dan foto galeri cabang dari panel ini.
                        </p>
                    </div>
                </section>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Produk"     value={stats.produk}                          helper="Item inventori cabang"     icon={Package}     tone="slate"    />
                    <StatCard label="Total Transaksi"  value={stats.transaksi}                       helper="Nota penjualan tercatat"   icon={ReceiptText} tone="orange"   />
                    <StatCard label="Pemasukan"        value={`Rp ${money(stats.pendapatan)}`}       helper="Akumulasi semua transaksi" icon={Wallet}      tone="emerald"  />
                    <StatCard label="Pengeluaran"      value={`Rp ${money(stats.pengeluaran)}`}      helper="Biaya operasional cabang"  icon={TrendingDown} tone="red"    />
                </div>

                {/* Grafik Penjualan */}
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-950">Grafik Penjualan Harian</h2>
                            <p className="mt-1 text-sm text-slate-500">Total pendapatan per hari sesuai periode dipilih</p>
                        </div>
                        <div className="flex gap-2">
                            {PERIODS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => handlePeriod(key)}
                                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                                        period === key
                                            ? 'border-[#E56020] bg-[#E56020] text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SalesChart data={chartData} />
                    {chartData.length > 0 && (
                        <p className="mt-2 text-right text-xs text-slate-400">
                            Total: Rp {money(chartData.reduce((s, d) => s + d.total, 0))} dari {chartData.reduce((s, d) => s + d.jumlah, 0)} transaksi
                        </p>
                    )}
                </section>

                {/* Shortcut & Transaksi Terbaru */}
                <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-lg font-extrabold text-slate-950">Transaksi Terbaru</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        <th className="pb-3 pr-4">Tanggal</th>
                                        <th className="pb-3 pr-4">Pasien</th>
                                        <th className="pb-3 pr-4 text-right">Harga</th>
                                        <th className="pb-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.recentTransaksi?.length > 0 ? stats.recentTransaksi.map((t) => (
                                        <tr key={t.id} className="hover:bg-orange-50/40">
                                            <td className="py-3 pr-4 text-slate-600">{t.tanggal_pesan || '-'}</td>
                                            <td className="py-3 pr-4 font-semibold text-slate-900">{t.pasien?.nama_pasien || 'Tanpa pasien'}</td>
                                            <td className="py-3 pr-4 text-right font-bold text-slate-900">Rp {money(t.harga)}</td>
                                            <td className="py-3 text-center">
                                                {t.sisa > 0
                                                    ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">Panjar</span>
                                                    : <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">Lunas</span>
                                                }
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="py-8 text-center text-slate-400">Belum ada transaksi</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Link href={route('admin.transaksi.index')} className="text-sm font-semibold text-[#E56020] hover:underline">
                                Lihat Semua Transaksi →
                            </Link>
                        </div>
                    </section>

                    <aside className="space-y-3">
                        <h2 className="text-base font-extrabold text-slate-950">Menu Cepat</h2>
                        <QuickCard title="Data Pasien"      description="Lihat, tambah, atau edit data pasien"          href={route('pasien.index')}          icon={Users}      accent="bg-slate-900" />
                        <QuickCard title="Produk"           description="Kelola stok dan harga produk cabang"           href={route('admin.produk.index')}    icon={Package}    accent="bg-slate-900" />
                        <QuickCard title="Lensa"            description="Tambah atau edit data lensa kacamata"          href={route('admin.lensa.index')}     icon={Glasses}                         />
                        <QuickCard title="Transaksi"        description="Buat dan kelola nota penjualan"                href={route('admin.transaksi.index')} icon={ReceiptText} accent="bg-slate-900" />
                        <QuickCard title="Galeri / Info Cabang" description="Upload foto toko dan atur info publik"    href={route('admin.branch.gallery')}  icon={Images}     accent="bg-slate-700" />
                    </aside>
                </div>
            </div>
        </SidebarLayout>
    );
}
