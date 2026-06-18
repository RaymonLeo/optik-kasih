// appV1.0 Rev 3 - Halaman kelola cabang/admin dengan layout superadmin.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Edit, Eye, Mail, MapPin, Plus, ReceiptText, Search, Trash2, Package, Glasses } from 'lucide-react';
import { useState } from 'react';

function Metric({ label, value, icon: Icon }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Icon className="h-4 w-4 text-[#E56020]" />
                {label}
            </div>
            <p className="mt-2 text-xl font-extrabold text-slate-950">{value ?? 0}</p>
        </div>
    );
}

export default function AdminsIndex({ admins, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const apply = (event) => {
        event.preventDefault();
        router.get(route('super_admin.admins.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <SidebarLayout title="Kelola Cabang Toko" subtitle="Admin adalah representasi cabang Optik Kasih.">
            <Head title="Kelola Cabang/Admin" />

            <div className="space-y-5">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#E56020]">
                                <Building2 className="h-4 w-4" />
                                Cabang dan akses admin
                            </div>
                            <h2 className="mt-3 text-2xl font-extrabold text-slate-950">Daftar cabang toko</h2>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                                Kelola akun admin cabang beserta ringkasan produk, lensa, dan transaksi yang mereka tangani.
                            </p>
                        </div>
                        <Link
                            href={route('super_admin.admins.create')}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#E56020] px-4 text-sm font-bold text-white shadow-sm hover:bg-orange-700"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Cabang
                        </Link>
                    </div>
                </section>

                <form onSubmit={apply} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]">
                    <label className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="h-11 w-full rounded-lg border-slate-300 pl-10 text-sm"
                            placeholder="Cari nama cabang atau email admin"
                        />
                    </label>
                    <button className="h-11 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white hover:bg-slate-800">
                        Cari Cabang
                    </button>
                </form>

                <div className="grid gap-4 xl:grid-cols-2">
                    {admins.data.map((admin) => (
                        <article key={admin.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div className="flex min-w-0 gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-lg font-extrabold text-slate-950">{admin.name}</h3>
                                        <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-600">
                                            <Mail className="h-4 w-4 shrink-0 text-[#E56020]" />
                                            {admin.email}
                                        </p>
                                        <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            Cabang Optik Kasih
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Link href={route('super_admin.admins.show', admin.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50" title="Detail">
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                    <Link href={route('super_admin.admins.edit', admin.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 text-[#E56020] hover:bg-orange-50" title="Edit">
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (confirm('Hapus cabang/admin ini?')) {
                                                router.delete(route('super_admin.admins.destroy', admin.id), { preserveScroll: true });
                                            }
                                        }}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                                        title="Hapus"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <Metric label="Produk" value={admin.produk_count} icon={Package} />
                                <Metric label="Lensa" value={admin.lensa_count} icon={Glasses} />
                                <Metric label="Transaksi" value={admin.transaksi_count} icon={ReceiptText} />
                            </div>
                        </article>
                    ))}
                </div>

                {admins.data.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                        Belum ada cabang/admin pada pencarian ini.
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-2">
                    {admins.links.map((link, index) => (
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
