// appV1.0 Rev 4 - Halaman inbox notifikasi operasional admin dan superadmin.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, CheckCheck, CircleAlert, Info, ShieldAlert } from 'lucide-react';

const iconByType = {
    deletion_requested: ShieldAlert,
    deletion_approved: CheckCheck,
    deletion_rejected: CircleAlert,
    patient_updated: Info,
};

export default function NotificationsIndex({ notifications }) {
    const markRead = (notification) => {
        if (notification.read_at) return;

        router.patch(route('notifications.read', notification.id), {}, { preserveScroll: true });
    };

    return (
        <SidebarLayout title="Notifikasi" subtitle="Persetujuan, perubahan data penting, dan hasil keputusan operasional.">
            <Head title="Notifikasi" />

            <div className="space-y-5">
                <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#E56020]">
                            <Bell className="h-6 w-6" />
                        </span>
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-950">Inbox operasional</h2>
                            <p className="mt-1 text-sm text-slate-600">Notifikasi belum dibaca ditandai dengan latar oranye muda.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.patch(route('notifications.read_all'), {}, { preserveScroll: true })}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800"
                    >
                        <CheckCheck className="h-4 w-4" /> Tandai semua dibaca
                    </button>
                </section>

                <div className="space-y-3">
                    {notifications.data.map((notification) => {
                        const Icon = iconByType[notification.type] || Bell;
                        return (
                            <article
                                key={notification.id}
                                className={`rounded-lg border p-4 shadow-sm ${notification.read_at ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50/60'}`}
                            >
                                <div className="flex gap-4">
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${notification.read_at ? 'bg-slate-100 text-slate-600' : 'bg-[#E56020] text-white'}`}>
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <h3 className="font-extrabold text-slate-950">{notification.title}</h3>
                                                <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                                            </div>
                                            <time className="shrink-0 text-xs font-semibold text-slate-500">
                                                {new Date(notification.created_at).toLocaleString('id-ID')}
                                            </time>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {notification.url && (
                                                <Link
                                                    href={notification.url}
                                                    onClick={() => markRead(notification)}
                                                    className="inline-flex h-9 items-center rounded-lg bg-[#E56020] px-3 text-sm font-bold text-white hover:bg-orange-700"
                                                >
                                                    Buka terkait
                                                </Link>
                                            )}
                                            {!notification.read_at && (
                                                <button
                                                    onClick={() => markRead(notification)}
                                                    className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                                >
                                                    Tandai dibaca
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}

                    {notifications.data.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                            Belum ada notifikasi.
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {notifications.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${link.active ? 'border-[#E56020] bg-[#E56020] text-white' : 'border-slate-200 bg-white text-slate-700'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </SidebarLayout>
    );
}
