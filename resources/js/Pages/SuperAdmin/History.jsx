// appV1.0 Rev 4 - History perubahan data dan keputusan persetujuan superadmin.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Clock3, Filter, History as HistoryIcon, PlusCircle, PencilLine, Trash2 } from 'lucide-react';
import { useState } from 'react';

const labels = {
    create: 'Tambah Data',
    update: 'Edit Data',
    delete: 'Hapus Data',
    delete_requested: 'Permintaan Hapus',
    delete_rejected: 'Permintaan Hapus Ditolak',
};

const icons = {
    create: PlusCircle,
    update: PencilLine,
    delete: Trash2,
    delete_requested: Clock3,
    delete_rejected: Trash2,
};

const tones = {
    create: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    update: 'bg-orange-50 text-[#E56020] border-orange-100',
    delete: 'bg-red-50 text-red-700 border-red-100',
    delete_requested: 'bg-amber-50 text-amber-700 border-amber-100',
    delete_rejected: 'bg-red-50 text-red-700 border-red-100',
};

function formatDetails(details) {
    if (!details) {
        return '-';
    }

    try {
        const parsed = typeof details === 'string' ? JSON.parse(details) : details;
        return Object.entries(parsed)
            .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value ?? '-'}`)
            .join(' | ');
    } catch {
        return String(details);
    }
}

export default function History({ logs, admins = [], filters = {} }) {
    const [adminId, setAdminId] = useState(filters.admin_id || '');
    const [action, setAction] = useState(filters.action || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const apply = (event) => {
        event.preventDefault();
        router.get(route('super_admin.history'), { admin_id: adminId, action, date_from: dateFrom, date_to: dateTo }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <SidebarLayout
            title="History Perubahan Data"
            subtitle="Audit setiap penambahan, pengeditan, penghapusan, dan keputusan persetujuan oleh admin maupun superadmin."
        >
            <Head title="History Perubahan Data" />

            <div className="space-y-5">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E56020] text-white">
                            <HistoryIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-950">Audit aktivitas cabang</h2>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                                Gunakan halaman ini untuk melihat perubahan data seluruh pengguna atau fokus pada satu admin cabang tertentu.
                            </p>
                        </div>
                    </div>
                </section>

                <form onSubmit={apply} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(180px,1fr)_minmax(160px,1fr)_160px_160px_auto] md:items-end">
                    <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-slate-500">Admin / Cabang</span>
                        <select value={adminId} onChange={(event) => setAdminId(event.target.value)} className="h-11 w-full rounded-lg border-slate-300 text-sm">
                            <option value="">Semua admin/cabang</option>
                            {admins.map((admin) => (
                                <option key={admin.id} value={admin.id}>{admin.name}</option>
                            ))}
                        </select>
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-slate-500">Jenis Aksi</span>
                        <select value={action} onChange={(event) => setAction(event.target.value)} className="h-11 w-full rounded-lg border-slate-300 text-sm">
                            <option value="">Semua aksi</option>
                            <option value="create">Penambahan</option>
                            <option value="update">Pengeditan</option>
                            <option value="delete">Penghapusan</option>
                            <option value="delete_requested">Permintaan penghapusan</option>
                            <option value="delete_rejected">Penolakan penghapusan</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-slate-500">Dari tanggal</span>
                        <input
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(event) => setDateFrom(event.target.value)}
                            className="h-11 w-full rounded-lg border-slate-300 text-sm"
                        />
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-slate-500">Sampai tanggal</span>
                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(event) => setDateTo(event.target.value)}
                            className="h-11 w-full rounded-lg border-slate-300 text-sm"
                        />
                    </label>
                    <button className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
                        <Filter className="h-4 w-4" />
                        Terapkan Filter
                    </button>
                </form>

                <div className="space-y-3">
                    {logs.data.map((log) => {
                        const Icon = icons[log.action] || HistoryIcon;
                        return (
                            <article key={log.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex gap-4">
                                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${tones[log.action] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-extrabold text-slate-950">{labels[log.action] || log.action}</h3>
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                                    {String(log.model || '').split('\\').pop()}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Oleh <span className="font-bold text-[#E56020]">{log.user?.name || '-'}</span>
                                            </p>
                                            <p className="mt-3 break-words rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                                                {formatDetails(log.details)}
                                            </p>
                                        </div>
                                    </div>
                                    <time className="shrink-0 text-sm font-semibold text-slate-500">
                                        {new Date(log.created_at).toLocaleString('id-ID')}
                                    </time>
                                </div>
                            </article>
                        );
                    })}

                    {logs.data.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                            Belum ada history pada filter ini.
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {logs.links.map((link, index) => (
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
