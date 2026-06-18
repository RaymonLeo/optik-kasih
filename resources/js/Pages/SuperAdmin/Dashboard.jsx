// appV1.0 Rev 3 - Dashboard superadmin bergaya pusat manajemen toko.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CalendarDays,
    Glasses,
    History,
    Package,
    ReceiptText,
    TrendingDown,
    Wallet,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

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

function WorkCard({ title, description, href, icon: Icon, accent = 'bg-[#E56020]' }) {
    return (
        <Link href={href} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md">
            <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white ${accent}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#E56020]" />
            </div>
        </Link>
    );
}

export default function SuperAdminDashboard({ stats, admins = [], filters = {} }) {
    const [selectedBranch, setSelectedBranch] = useState(filters.branch_id || '');

    const handleFilter = (event) => {
        const branchId = event.target.value;
        setSelectedBranch(branchId);
        router.get(route('super_admin.dashboard'), { branch_id: branchId }, { preserveState: true, replace: true });
    };

    const selectedAdmin = admins.find((admin) => String(admin.id) === String(selectedBranch));

    return (
        <SidebarLayout
            title="Dashboard Superadmin"
            subtitle="Pantau performa cabang, stok, pasien, transaksi, dan aktivitas perubahan data."
        >
            <Head title="Dashboard Superadmin" />

            <div className="space-y-5">
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-sm">
                    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px] lg:p-7">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-orange-100">
                                <Building2 className="h-4 w-4 text-[#E56020]" />
                                {selectedAdmin ? `Cabang aktif: ${selectedAdmin.name}` : 'Monitoring semua cabang'}
                            </div>
                            <h2 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight sm:text-3xl">
                                Pusat kendali operasional Optik Kasih
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                Gunakan dashboard ini untuk melihat kesehatan toko, mengelola cabang, mengecek inventori,
                                meninjau transaksi, dan membaca history perubahan data.
                            </p>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-400">Filter Cabang</label>
                            <select
                                value={selectedBranch}
                                onChange={handleFilter}
                                className="mt-2 h-11 w-full rounded-lg border-white/10 bg-white text-sm font-semibold text-slate-900"
                            >
                                <option value="">Semua cabang toko</option>
                                {admins.map((admin) => (
                                    <option key={admin.id} value={admin.id}>{admin.name}</option>
                                ))}
                            </select>
                            <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-900/70 p-3">
                                <CalendarDays className="h-5 w-5 text-[#E56020]" />
                                <p className="text-sm font-medium text-slate-300">Data mengikuti filter cabang yang dipilih.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <StatCard label="Cabang/Admin" value={stats.admins} helper="Akun admin cabang aktif" icon={Building2} tone="orange" />
                    <StatCard label="Produk" value={stats.produk} helper="Total item inventori" icon={Package} tone="slate" />
                    <StatCard label="Transaksi" value={stats.transaksi} helper="Nota penjualan tercatat" icon={ReceiptText} tone="orange" />
                    <StatCard label="Pemasukan" value={`Rp ${money(stats.pendapatan)}`} helper="Akumulasi sesuai filter" icon={Wallet} tone="emerald" />
                    <StatCard label="Pengeluaran" value={`Rp ${money(stats.pengeluaran)}`} helper="Biaya operasional" icon={TrendingDown} tone="red" />
                </div>

                <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-950">Area kerja utama</h2>
                                <p className="mt-1 text-sm text-slate-500">Pilih modul sesuai pekerjaan superadmin.</p>
                            </div>
                            <Link href={route('super_admin.history')} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-orange-200 px-4 text-sm font-bold text-[#E56020] hover:bg-orange-50">
                                <History className="h-4 w-4" />
                                Lihat History
                            </Link>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            <WorkCard
                                title="Kelola Cabang Toko"
                                description="Tambah, edit, lihat detail, dan hapus akun admin cabang Optik Kasih."
                                href={route('super_admin.admins.index')}
                                icon={Building2}
                            />
                            <WorkCard
                                title="Data Pasien Global"
                                description="Pasien adalah data utama dan dapat diakses lintas cabang untuk riwayat optik."
                                href={route('pasien.index')}
                                icon={Users}
                                accent="bg-slate-900"
                            />
                            <WorkCard
                                title="Inventori Produk"
                                description="Filter produk per cabang, kategori, stok, harga, tanggal masuk, dan expired."
                                href={route('super_admin.produk.global')}
                                icon={Package}
                                accent="bg-slate-900"
                            />
                            <WorkCard
                                title="Database Lensa"
                                description="Pantau nama, jenis, coating, indeks, stok, dan tanggal masuk lensa seluruh cabang."
                                href={route('super_admin.lensa.global')}
                                icon={Glasses}
                            />
                            <WorkCard
                                title="Transaksi Global"
                                description="Lihat pendapatan, pengeluaran, selisih, rentang tanggal, dan filter cabang."
                                href={route('super_admin.transaksi.global')}
                                icon={ReceiptText}
                            />
                            <WorkCard
                                title="Audit Perubahan Data"
                                description="Review penambahan, pengeditan, dan penghapusan data berdasarkan cabang."
                                href={route('super_admin.history')}
                                icon={History}
                                accent="bg-slate-900"
                            />
                        </div>
                    </section>

                    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-extrabold text-slate-950">Prinsip akses superadmin</h2>
                        <div className="mt-4 space-y-3">
                            {[
                                'CRUD admin sebagai representasi cabang toko.',
                                'Melihat dan mengelola data produk, lensa, pasien, dan transaksi semua cabang.',
                                'Data pasien bersifat global agar riwayat pasien tetap utuh lintas cabang.',
                                'History perubahan menjadi alat audit untuk setiap aksi admin.',
                            ].map((item) => (
                                <div key={item} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#E56020]" />
                                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </SidebarLayout>
    );
}
