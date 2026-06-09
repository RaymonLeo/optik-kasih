import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Package, Receipt, Wallet, TrendingDown } from 'lucide-react';

export default function AdminDashboard({ auth, stats, recentTransaksi }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Admin (Cabang)</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                <Package className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Produk</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.produk}</p>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                <Receipt className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.transaksi}</p>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Pemasukan</p>
                                <p className="text-xl font-bold text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(stats.pendapatan)}</p>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                                <TrendingDown className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
                                <p className="text-xl font-bold text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(stats.pengeluaran)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Transaksi Terbaru</h3>
                                <Link href={route('admin.transaksi.index')} className="text-sm text-blue-600 hover:underline font-medium">Lihat Semua</Link>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-t-lg">
                                        <tr>
                                            <th className="px-6 py-3">Tanggal</th>
                                            <th className="px-6 py-3">Pasien</th>
                                            <th className="px-6 py-3">Harga</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransaksi.length > 0 ? (
                                            recentTransaksi.map(t => (
                                                <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-6 py-4">{t.tanggal_pesan}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{t.pasien?.nama_pasien || 'N/A'}</td>
                                                    <td className="px-6 py-4">Rp {new Intl.NumberFormat('id-ID').format(t.harga)}</td>
                                                    <td className="px-6 py-4">
                                                        {t.sisa > 0 ? (
                                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Panjar</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Lunas</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center">Belum ada transaksi</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
