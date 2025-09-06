// resources/js/Pages/Transaksi/Index.jsx
import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";

function Currency({ value }) {
  const number = Number(value || 0);
  return <span>{number.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</span>;
}

export default function Index() {
  const { props } = usePage();
  const { transactions, totalHariIni, query = {} } = props;

  const [search, setSearch] = useState(query.search || "");
  const [date, setDate]     = useState(query.date || "");
  const [range, setRange]   = useState(query.range || "day");

  function apply(e) {
    e?.preventDefault?.();
    router.get(route("transaksi.index"), { search, date, range }, { preserveState: true, replace: true });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-orange-500">Daftar Transaksi</h1>
        <div className="text-4xl font-bold bg-white shadow rounded px-4 py-1">
          <Currency value={totalHariIni} />
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-4">
        <form onSubmit={apply} className="flex flex-wrap items-center gap-3">
          <select className="h-10 px-3 rounded-lg border" value={range} onChange={e=>setRange(e.target.value)}>
            <option value="day">Hari ini</option>
            <option value="week">Minggu ini</option>
            <option value="month">Bulan ini</option>
            <option value="all">Semua</option>
            <option value="custom">Custom (pilih tanggal)</option>
          </select>

          <input
            type="date"
            value={date || ""}
            onChange={(e)=>setDate(e.target.value)}
            className="h-10 px-3 rounded-lg border"
            disabled={range !== "day" && range !== "week" && range !== "month" && range !== "custom"}
          />

          <div className="ml-auto flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
              className="h-10 px-3 rounded-lg border min-w-[260px]"
            />
            <button className="h-10 px-4 rounded-lg bg-gray-900 text-white" type="submit">Terapkan</button>
            <Link href={route("transaksi.create")} className="h-10 px-4 rounded-lg bg-orange-500 text-white flex items-center">+ Tambah Transaksi</Link>
          </div>
        </form>

        <div className="mt-4 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left font-semibold px-4 py-3">ID Transaksi</th>
                <th className="text-left font-semibold px-4 py-3">Tanggal_Transaksi</th>
                <th className="text-left font-semibold px-4 py-3">Lensa Pelanggan</th>
                <th className="text-left font-semibold px-4 py-3">Gagang Pelanggan</th>
                <th className="text-left font-semibold px-4 py-3">Nama Pasien</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data.map(row => (
                <tr key={row.id} className="odd:bg-violet-50">
                  <td className="px-4 py-3 font-semibold">#{row.kode}</td>
                  <td className="px-4 py-3">{row.tanggal_pesanan}</td>
                  <td className="px-4 py-3">{row.lensa || "-"}</td>
                  <td className="px-4 py-3">{row.frame || "-"}</td>
                  <td className="px-4 py-3">{row.nama_pasien || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link href={route("transaksi.edit", row.id)} className="p-2 rounded-lg bg-violet-100 text-violet-700">✏️</Link>
                      <Link href={route("transaksi.show", row.id)} className="p-2 rounded-lg bg-gray-100">🔍</Link>
                      <button
                        onClick={() => {
                          if (confirm("Hapus transaksi ini secara permanen?")) {
                            router.delete(route("transaksi.destroy", row.id));
                          }
                        }}
                        className="p-2 rounded-lg bg-red-100 text-red-700"
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.data.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={6}>Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          {transactions.links.map((l, i) => (
            <Link
              key={i}
              href={l.url || "#"}
              className={`px-3 py-1 rounded ${l.active ? "bg-orange-500 text-white" : "bg-gray-100"}`}
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// pasang layout
Index.layout = (page) => <SidebarLayout title="Daftar Transaksi">{page}</SidebarLayout>;
