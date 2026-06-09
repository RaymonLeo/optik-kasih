import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Package, Receipt, Eye } from 'lucide-react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

export default function AdminShow({ admin, recentProducts = [], recentTransactions = [] }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Detail Cabang/Admin</h2>}>
            <Head title="Detail Cabang/Admin" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <Link href={route('super_admin.admins.index')} className="font-semibold text-orange-700 hover:underline">
                        Kembali
                    </Link>

                    <div className="rounded-2xl border bg-white p-5 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900">{admin.name}</h3>
                        <p className="mt-1 text-gray-600">{admin.email}</p>
                        <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-3">
                            <div className="rounded-xl border bg-gray-50 p-3">
                                <p className="font-semibold text-gray-900">Telepon</p>
                                <p className="mt-1">{admin.branch_phone || '-'}</p>
                            </div>
                            <div className="rounded-xl border bg-gray-50 p-3">
                                <p className="font-semibold text-gray-900">Jam Operasional</p>
                                <p className="mt-1">{admin.branch_operational_hours || '-'}</p>
                            </div>
                            <div className="rounded-xl border bg-gray-50 p-3">
                                <p className="font-semibold text-gray-900">Alamat</p>
                                <p className="mt-1">{admin.branch_address || '-'}</p>
                            </div>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            {[
                                { label: 'Produk', value: admin.produk_count, icon: Package },
                                { label: 'Lensa', value: admin.lensa_count, icon: Eye },
                                { label: 'Transaksi', value: admin.transaksi_count, icon: Receipt },
                            ].map((item) => (
                                <div key={item.label} className="rounded-xl border bg-gray-50 p-4">
                                    <item.icon className="h-6 w-6 text-orange-600" />
                                    <p className="mt-3 text-2xl font-bold text-gray-900">{item.value}</p>
                                    <p className="text-sm text-gray-500">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <div className="rounded-2xl border bg-white p-5 shadow-sm">
                            <h4 className="mb-4 font-bold text-gray-900">Produk Terbaru</h4>
                            <div className="space-y-3">
                                {recentProducts.map((item) => (
                                    <div key={item.id} className="flex justify-between rounded-lg border p-3 text-sm">
                                        <span>{item.nama_produk}</span>
                                        <b>Rp {money(item.harga_produk)}</b>
                                    </div>
                                ))}
                                {recentProducts.length === 0 && <p className="text-sm text-gray-500">Belum ada produk.</p>}
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-white p-5 shadow-sm">
                            <h4 className="mb-4 font-bold text-gray-900">Transaksi Terbaru</h4>
                            <div className="space-y-3">
                                {recentTransactions.map((item) => (
                                    <div key={item.id} className="flex justify-between rounded-lg border p-3 text-sm">
                                        <span>{item.pasien?.nama_pasien || 'Tanpa pasien'}</span>
                                        <b>Rp {money(item.harga)}</b>
                                    </div>
                                ))}
                                {recentTransactions.length === 0 && <p className="text-sm text-gray-500">Belum ada transaksi.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
