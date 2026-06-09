import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Filter } from 'lucide-react';
import { useState } from 'react';

const labels = {
    create: 'Tambah Data',
    update: 'Edit Data',
    delete: 'Hapus Data',
};

export default function History({ logs, admins = [], filters = {} }) {
    const [adminId, setAdminId] = useState(filters.admin_id || '');
    const [action, setAction] = useState(filters.action || '');

    const apply = (event) => {
        event.preventDefault();
        router.get(route('super_admin.history'), { admin_id: adminId, action }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">History Perubahan Data</h2>}>
            <Head title="History Perubahan Data" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <form onSubmit={apply} className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row">
                        <select value={adminId} onChange={(event) => setAdminId(event.target.value)} className="h-11 rounded-lg border-gray-300">
                            <option value="">Semua admin/cabang</option>
                            {admins.map((admin) => (
                                <option key={admin.id} value={admin.id}>{admin.name}</option>
                            ))}
                        </select>
                        <select value={action} onChange={(event) => setAction(event.target.value)} className="h-11 rounded-lg border-gray-300">
                            <option value="">Semua aksi</option>
                            <option value="create">Penambahan</option>
                            <option value="update">Pengeditan</option>
                            <option value="delete">Penghapusan</option>
                        </select>
                        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 font-semibold text-white">
                            <Filter className="h-4 w-4" /> Terapkan
                        </button>
                    </form>

                    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3">Waktu</th>
                                    <th className="px-4 py-3">Admin</th>
                                    <th className="px-4 py-3">Aksi</th>
                                    <th className="px-4 py-3">Model</th>
                                    <th className="px-4 py-3">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="border-t">
                                        <td className="px-4 py-3">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3 font-semibold">{log.user?.name || '-'}</td>
                                        <td className="px-4 py-3">{labels[log.action] || log.action}</td>
                                        <td className="px-4 py-3">{String(log.model || '').split('\\').pop()}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {log.details ? JSON.stringify(log.details) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-10 text-center text-gray-500">Belum ada history.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center gap-2">
                        {logs.links.map((link, index) => (
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
