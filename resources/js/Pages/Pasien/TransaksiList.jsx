// appV1.0 Rev 3 - Perbaiki nama route agar tidak crash (admin.transaksi.*) + sidebar.

import React, { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";
import Pagination from "@/Components/ui/Pagination";
import { ReceiptText, Search } from "lucide-react";

function Currency({ v }) {
    const n = Number(v || 0);
    return <span>{n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</span>;
}

function TransaksiList() {
    const { props } = usePage();
    const { patient, transactions, query = {} } = props;

    const [search, setSearch] = useState(query.search || "");

    const apply = (e) => {
        e?.preventDefault?.();
        router.get(route("transaksi.byPatient", patient.id), { search }, { preserveState: true, replace: true });
    };

    return (
        <div className="p-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <button onClick={() => history.back()} className="rounded-lg border px-3 py-1.5 text-sm text-orange-700 hover:bg-orange-50">← Kembali</button>
                <h1 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h1>
                <span className="font-semibold text-orange-600">{patient.nama_pasien}</span>
                {patient.kode_pasien && (
                    <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs text-orange-700">{patient.kode_pasien}</span>
                )}
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <form onSubmit={apply} className="flex flex-1 items-center gap-2">
                        <div className="relative min-w-[240px]">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm"
                                placeholder="Cari ID, lensa, gagang…"
                            />
                        </div>
                        <button className="h-10 rounded-lg bg-gray-900 px-4 text-sm text-white hover:bg-gray-800">Cari</button>
                    </form>
                    <Link href={route("admin.transaksi.create")} className="ml-auto inline-flex h-10 items-center gap-1 rounded-lg bg-orange-600 px-4 text-sm text-white hover:bg-orange-700">
                        + Tambah Transaksi
                    </Link>
                </div>

                {transactions.data.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-left">
                                    <th className="px-4 py-3 font-semibold text-slate-700">Kode</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Tanggal</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Lensa</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Gagang</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Harga</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Panjar</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Sisa</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-orange-50/30">
                                        <td className="px-4 py-3 font-semibold text-orange-700">#{t.kode}</td>
                                        <td className="px-4 py-3 text-slate-600">{t.tanggal_pesanan || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{t.lensa || "-"}</td>
                                        <td className="px-4 py-3 text-slate-700">{t.frame || "-"}</td>
                                        <td className="px-4 py-3 font-semibold"><Currency v={t.harga} /></td>
                                        <td className="px-4 py-3"><Currency v={t.panjar} /></td>
                                        <td className="px-4 py-3 text-right font-semibold text-emerald-700"><Currency v={t.total} /></td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={route("admin.transaksi.show", t.id)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm hover:bg-slate-200">Detail</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                        <ReceiptText className="h-14 w-14 text-slate-300" />
                        <h3 className="mt-4 text-lg font-bold text-slate-700">Belum ada transaksi</h3>
                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            Riwayat transaksi dari <strong>{patient.nama_pasien}</strong> akan muncul di sini setelah transaksi dibuat.
                        </p>
                        <Link href={route("admin.transaksi.create")} className="mt-5 inline-flex h-10 items-center gap-1 rounded-lg bg-orange-600 px-4 text-sm text-white hover:bg-orange-700">
                            + Buat Transaksi Pertama
                        </Link>
                    </div>
                )}

                {transactions.data.length > 0 && (
                    <div className="mt-3">
                        <Pagination links={transactions.links || []} />
                    </div>
                )}
            </div>
        </div>
    );
}

TransaksiList.layout = (page) => (
    <SidebarLayout title="Riwayat Transaksi">{page}</SidebarLayout>
);

export default TransaksiList;
