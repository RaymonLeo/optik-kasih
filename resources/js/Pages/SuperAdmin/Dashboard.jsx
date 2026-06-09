import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Users, Package, Receipt, Wallet, TrendingDown, History } from 'lucide-react';
import { useState } from 'react';

export default function SuperAdminDashboard({ auth, stats, admins, filters }) {
    const [selectedBranch, setSelectedBranch] = useState(filters.branch_id || '');

    const handleFilter = (e) => {
        setSelectedBranch(e.target.value);
        router.get(route('super_admin.dashboard'), { branch_id: e.target.value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Super Admin Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <Link href={route('super_admin.history')} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                            <History className="w-4 h-4" /> Log Perubahan
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Super Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Branch Filter */}
                    <div className="mb-6 flex justify-end">
                        <select 
                            value={selectedBranch}
                            onChange={handleFilter}
                            className="border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Semua Cabang (Global)</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.id}>{admin.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Cabang/Admin</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                <Package className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Produk</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.produk}</p>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                <Receipt className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Transaksi</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.transaksi}</p>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pemasukan</p>
                                <p className="text-lg font-bold text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(stats.pendapatan)}</p>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 flex items-center border border-gray-100">
                            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                                <TrendingDown className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pengeluaran</p>
                                <p className="text-lg font-bold text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(stats.pengeluaran)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Features Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href={route('super_admin.admins.index')} className="block group">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Kelola Cabang / Admin</h3>
                                <p className="text-gray-500 text-sm">Tambah, edit, atau hapus akses cabang toko Optik Kasih.</p>
                            </div>
                        </Link>
                        
                        <Link href={route('pasien.index')} className="block group">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md group-hover:blue-green-200 transition-all">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Data Pasien Global</h3>
                                <p className="text-gray-500 text-sm">Lihat seluruh riwayat medis, ukuran mata, dan rekam medis pasien di semua cabang.</p>
                            </div>
                        </Link>

                        <Link href={route('super_admin.lensa.global')} className="block group">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md group-hover:border-purple-200 transition-all">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Database Lensa Utama</h3>
                                <p className="text-gray-500 text-sm">Tetapkan indeks, nama, dan jenis lensa yang akan tersedia untuk semua cabang.</p>
                            </div>
                        </Link>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
