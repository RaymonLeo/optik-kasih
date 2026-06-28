// appV1.0 Rev 4 - Halaman persetujuan penghapusan data global oleh superadmin.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Clock3, FileWarning, Filter, XCircle } from 'lucide-react';
import { useState } from 'react';

const statusStyle = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusLabel = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
};

function snapshotRows(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return [];

    return Object.entries(snapshot).filter(([key]) => !['created_at', 'updated_at'].includes(key));
}

export default function DeletionApprovals({ requests, admins = [], filters = {} }) {
    const [status, setStatus] = useState(filters.status || 'pending');
    const [adminId, setAdminId] = useState(filters.admin_id || '');
    const [rejecting, setRejecting] = useState(null);
    const [note, setNote] = useState('');

    const applyFilter = (event) => {
        event.preventDefault();
        router.get(route('super_admin.deletion_requests.index'), { status, admin_id: adminId }, { preserveState: true, replace: true });
    };

    const approve = (item) => {
        if (window.confirm(`Setujui penghapusan ${item.subject_label}? Data akan dihapus permanen.`)) {
            router.patch(route('super_admin.deletion_requests.approve', item.id), {}, { preserveScroll: true });
        }
    };

    const reject = () => {
        if (!note.trim()) return;
        router.patch(route('super_admin.deletion_requests.reject', rejecting.id), { reviewer_note: note.trim() }, {
            preserveScroll: true,
            onSuccess: () => { setRejecting(null); setNote(''); },
        });
    };

    return (
        <SidebarLayout title="Persetujuan Penghapusan" subtitle="Tinjau alasan dan snapshot data sebelum menghapus data pasien atau transaksi.">
            <Head title="Persetujuan Penghapusan" />

            <div className="space-y-5">
                <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                    <div className="flex gap-4">
                        <FileWarning className="mt-1 h-6 w-6 shrink-0 text-amber-700" />
                        <div>
                            <h2 className="font-extrabold text-amber-950">Penghapusan data global memerlukan keputusan superadmin</h2>
                            <p className="mt-1 text-sm leading-6 text-amber-800">Setujui hanya setelah alasan dan snapshot data sesuai. Keputusan serta penghapusan dicatat pada history audit.</p>
                        </div>
                    </div>
                </section>

                <form onSubmit={applyFilter} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[220px_260px_auto]">
                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm">
                        <option value="">Semua status</option>
                        {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <select value={adminId} onChange={(event) => setAdminId(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm">
                        <option value="">Semua cabang</option>
                        {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name}</option>)}
                    </select>
                    <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
                        <Filter className="h-4 w-4" /> Terapkan filter
                    </button>
                </form>

                <div className="space-y-4">
                    {requests.data.map((item) => (
                        <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-extrabold text-slate-950">{item.subject_label}</h3>
                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle[item.status]}`}>{statusLabel[item.status] || item.status}</span>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 capitalize">{item.subject_type}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">Diajukan oleh <b className="text-[#E56020]">{item.requester?.name || '-'}</b> pada {new Date(item.created_at).toLocaleString('id-ID')}.</p>
                                    <div className="mt-4 rounded-lg bg-slate-50 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Alasan penghapusan</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-800">{item.reason}</p>
                                    </div>
                                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                        {snapshotRows(item.snapshot).map(([key, value]) => (
                                            <div key={key} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                                <span className="font-bold text-slate-500">{key}: </span>
                                                <span className="break-words text-slate-800">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {item.reviewer_note && <p className="mt-4 text-sm text-slate-600"><b>Catatan keputusan:</b> {item.reviewer_note}</p>}
                                </div>
                                {item.status === 'pending' && (
                                    <div className="flex shrink-0 items-start gap-2">
                                        <button onClick={() => approve(item)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700">
                                            <CheckCircle2 className="h-4 w-4" /> Setujui
                                        </button>
                                        <button onClick={() => { setRejecting(item); setNote(''); }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-600 hover:bg-red-50">
                                            <XCircle className="h-4 w-4" /> Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}

                    {requests.data.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                            <Clock3 className="mx-auto h-8 w-8 text-slate-300" />
                            <p className="mt-3">Tidak ada permintaan pada filter ini.</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {requests.links.map((link, index) => (
                        <Link key={index} href={link.url || '#'} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${link.active ? 'border-[#E56020] bg-[#E56020] text-white' : 'border-slate-200 bg-white text-slate-700'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                    ))}
                </div>
            </div>

            {rejecting && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
                        <h2 className="text-lg font-extrabold text-slate-950">Tolak penghapusan</h2>
                        <p className="mt-1 text-sm text-slate-600">Sampaikan alasan penolakan kepada cabang pemohon.</p>
                        <textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-4 min-h-28 w-full rounded-lg border-slate-300" placeholder="Alasan penolakan" />
                        <div className="mt-4 flex justify-end gap-3">
                            <button onClick={() => setRejecting(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700">Batal</button>
                            <button onClick={reject} disabled={!note.trim()} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white disabled:opacity-50">Tolak permintaan</button>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}
