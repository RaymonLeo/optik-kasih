// resources/js/Pages/Pasien/TransaksiList.jsx
import React, { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";
import Pagination from "@/Components/ui/Pagination";

function Currency({ v }) {
  const n = Number(v || 0);
  return <span>{n.toLocaleString("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 })}</span>;
}

function TransaksiList() {
  const { props } = usePage();
  const { patient, transactions, query = {} } = props;

  const [search, setSearch] = useState(query.search || "");

  const apply = (e) => {
    e?.preventDefault?.();
    router.get(route("transaksi.byPatient", patient.id), { search }, { preserveState:true, replace:true });
  };

  return (
    <div className="p-0">
      <div className="mb-4 flex items-center gap-4">
        <Link href={route("pasien.show", patient.id)} className="text-orange-700 hover:underline">← Kembali ke Detail Pasien</Link>
        <h1 className="text-2xl font-bold">Transaksi • {patient.nama_pasien}</h1>
        <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs text-orange-700">{patient.kode_pasien || "—"}</span>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <form onSubmit={apply} className="mb-3 flex items-center gap-2">
          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="h-10 min-w-[260px] rounded-lg border px-3"
            placeholder="Cari ID, lensa, gagang…"
          />
          <button className="h-10 rounded-lg bg-gray-900 px-4 text-white">Terapkan</button>
          <Link href={route("transaksi.create")} className="ml-auto h-10 rounded-lg bg-orange-600 px-4 text-white">+ Tambah Transaksi</Link>
        </form>

        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Lensa</th>
                <th className="px-4 py-3">Gagang</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Panjar</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data.map((t) => (
                <tr key={t.id} className="odd:bg-violet-50/30">
                  <td className="px-4 py-3 font-semibold">#{t.kode}</td>
                  <td className="px-4 py-3">{t.tanggal_pesanan}</td>
                  <td className="px-4 py-3">{t.lensa || "-"}</td>
                  <td className="px-4 py-3">{t.frame || "-"}</td>
                  <td className="px-4 py-3"><Currency v={t.harga} /></td>
                  <td className="px-4 py-3"><Currency v={t.panjar} /></td>
                  <td className="px-4 py-3 text-right"><Currency v={t.total} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={route("transaksi.show", t.id)} className="rounded-lg bg-gray-100 px-3 py-1.5">Detail</Link>
                  </td>
                </tr>
              ))}
              {!transactions.data.length && (
                <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={8}>Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <Pagination links={transactions.links || []} />
        </div>
      </div>
    </div>
  );
}

TransaksiList.layout = (page) => (
  <SidebarLayout title="Riwayat Transaksi">{page}</SidebarLayout>
);

export default TransaksiList;
