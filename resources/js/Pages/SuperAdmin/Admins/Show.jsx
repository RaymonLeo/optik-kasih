// appV1.0 Rev 3 - Detail cabang/admin memakai layout superadmin.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { Building2, Clock, Mail, MapPin, Package, Phone, Receipt, Eye } from 'lucide-react';

const money = (value) => Number(value || 0).toLocaleString('id-ID');

export default function AdminShow({ admin, recentProducts = [], recentTransactions = [] }) {
    return (
        <SidebarLayout title="Detail Cabang/Admin" subtitle="Ringkasan identitas cabang, inventori, dan transaksi terbaru.">
            <Head title="Detail Cabang/Admin" />
            <div className="space-y-5">
                    <Link href={route('super_admin.admins.index')} className="font-semibold text-[#E56020] hover:underline">
                        Kembali
                    </Link>

                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
                                    <Building2 className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold text-slate-950">{admin.name}</h3>
                                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                        <Mail className="h-4 w-4 text-[#E56020]" />
                                        {admin.email}
                                    </p>
                                </div>
                            </div>
                            <Link href={route('super_admin.admins.edit', admin.id)} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#E56020] px-4 text-sm font-bold text-white hover:bg-orange-700">
                                Edit Cabang
                            </Link>
                        </div>

                        <div className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="flex items-center gap-2 font-bold text-slate-950"><Phone className="h-4 w-4 text-[#E56020]" /> Telepon</p>
                                <p className="mt-1">{admin.branch_phone || '-'}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="flex items-center gap-2 font-bold text-slate-950"><Clock className="h-4 w-4 text-[#E56020]" /> Jam Operasional</p>
                                <p className="mt-1">{admin.branch_operational_hours || '-'}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="flex items-center gap-2 font-bold text-slate-950"><MapPin className="h-4 w-4 text-[#E56020]" /> Alamat</p>
                                <p className="mt-1">{admin.branch_address || '-'}</p>
                            </div>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            {[
                                { label: 'Produk', value: admin.produk_count, icon: Package },
                                { label: 'Lensa', value: admin.lensa_count, icon: Eye },
                                { label: 'Transaksi', value: admin.transaksi_count, icon: Receipt },
                            ].map((item) => (
                                <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <item.icon className="h-6 w-6 text-[#E56020]" />
                                    <p className="mt-3 text-2xl font-extrabold text-slate-950">{item.value}</p>
                                    <p className="text-sm text-slate-500">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="mb-4 font-extrabold text-slate-950">Produk Terbaru</h4>
                            <div className="space-y-3">
                                {recentProducts.map((item) => (
                                    <div key={item.id} className="flex justify-between rounded-lg border border-slate-200 p-3 text-sm">
                                        <span>{item.nama_produk}</span>
                                        <b>Rp {money(item.harga_produk)}</b>
                                    </div>
                                ))}
                                {recentProducts.length === 0 && <p className="text-sm text-gray-500">Belum ada produk.</p>}
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="mb-4 font-extrabold text-slate-950">Transaksi Terbaru</h4>
                            <div className="space-y-3">
                                {recentTransactions.map((item) => (
                                    <div key={item.id} className="flex justify-between rounded-lg border border-slate-200 p-3 text-sm">
                                        <span>{item.pasien?.nama_pasien || 'Tanpa pasien'}</span>
                                        <b>Rp {money(item.harga)}</b>
                                    </div>
                                ))}
                                {recentTransactions.length === 0 && <p className="text-sm text-gray-500">Belum ada transaksi.</p>}
                            </div>
                        </div>
                    </div>
            </div>
        </SidebarLayout>
    );
}
