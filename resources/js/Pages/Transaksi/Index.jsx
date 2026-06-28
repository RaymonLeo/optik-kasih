// appV1.0 Rev 5 - Filter tanggal: 2 input (dari-sampai) aktif hanya saat "Jangka Waktu" dipilih.

import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";

function Currency({ value }) {
  const number = Number(value || 0);
  return (
    <span>
      {number.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      })}
    </span>
  );
}

export default function Index() {
  const { props } = usePage();
  const { transactions, totalHariIni, query = {} } = props;
  const isAdmin = props.auth?.user?.role === "admin";

  const [search, setSearch] = useState(query.search || "");
  const [date,   setDate]   = useState(query.date   || "");
  const [to,     setTo]     = useState(query.to     || "");
  const [range,  setRange]  = useState(query.range  || "day");

  // "custom" = jangka waktu. Semua range lain: tanggal ke-2 dikunci.
  const isCustom = range === "custom";

  function apply(e) {
    e?.preventDefault?.();
    const params = { search, range };
    if (range !== "all") params.date = date;
    if (isCustom)        params.to   = to;
    router.get(route("admin.transaksi.index"), params, { preserveState: true, replace: true });
  }

  const requestDelete = (row) => {
    const confirmed = window.confirm(isAdmin
      ? "Kirim permintaan penghapusan transaksi ke superadmin?"
      : "Hapus transaksi ini secara permanen?");
    if (!confirmed) return;

    const reason = isAdmin ? window.prompt("Alasan penghapusan transaksi:") : null;
    if (isAdmin && !reason?.trim()) return;

    router.delete(route("admin.transaksi.destroy", row.id), {
      data: isAdmin ? { delete_reason: reason.trim() } : {},
      preserveScroll: true,
    });
  };

  return (
    <div className="p-6">
      {/* Kartu total ringkas */}
      <div className="mb-4">
        <div className="inline-flex flex-col rounded-xl bg-white shadow px-4 py-3">
          <span className="text-xs text-gray-500">Total sesuai filter</span>
          <span className="text-3xl font-extrabold text-orange-600">
            <Currency value={totalHariIni} />
          </span>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-4">
        {/* Filter */}
        <form onSubmit={apply} className="flex flex-wrap items-end gap-3">
          {/* Pilihan periode */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Periode</label>
            <select
              className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="day">Hari ini</option>
              <option value="week">Minggu ini</option>
              <option value="month">Bulan ini</option>
              <option value="year">Tahun ini</option>
              <option value="all">Semua</option>
              <option value="custom">Jangka Waktu</option>
            </select>
          </div>

          {/* Dari tanggal */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">
              {isCustom ? "Dari Tanggal" : "Tanggal Acuan"}
            </label>
            <input
              type="date"
              value={date || ""}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-300 text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              disabled={range === "all"}
            />
          </div>

          {/* Sampai tanggal — aktif hanya saat "Jangka Waktu" */}
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-semibold ${isCustom ? "text-slate-500" : "text-slate-300"}`}>
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={to || ""}
              onChange={(e) => setTo(e.target.value)}
              min={date || undefined}
              className="h-10 px-3 rounded-lg border border-slate-300 text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              disabled={!isCustom}
              title={!isCustom ? "Pilih 'Jangka Waktu' untuk mengaktifkan" : ""}
            />
          </div>

          {/* Search + actions */}
          <div className="ml-auto flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Cari</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID, lensa, pasien..."
                className="h-10 px-3 rounded-lg border border-slate-300 text-sm min-w-[220px]"
              />
            </div>
            <button className="h-10 px-4 rounded-lg bg-gray-900 text-white text-sm font-semibold" type="submit">
              Terapkan
            </button>
            <Link
              href={route("admin.transaksi.create")}
              className="h-10 px-4 rounded-lg bg-orange-600 text-white text-sm font-semibold flex items-center whitespace-nowrap"
            >
              + Tambah Transaksi
            </Link>
          </div>
        </form>

        {/* Tabel */}
        <div className="mt-4 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left font-semibold px-4 py-3">ID Transaksi</th>
                <th className="text-left font-semibold px-4 py-3">Tanggal Transaksi</th>
                <th className="text-left font-semibold px-4 py-3">Lensa Pelanggan</th>
                <th className="text-left font-semibold px-4 py-3">Gagang Pelanggan</th>
                <th className="text-left font-semibold px-4 py-3">Nama Pasien</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data.map((row) => (
                <tr key={row.id} className="odd:bg-violet-50">
                  <td className="px-4 py-3 font-semibold">#{row.kode}</td>
                  <td className="px-4 py-3">{row.tanggal_pesanan}</td>
                  <td className="px-4 py-3">{row.lensa || "-"}</td>
                  <td className="px-4 py-3">{row.frame || "-"}</td>
                  <td className="px-4 py-3">{row.nama_pasien || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link href={route("admin.transaksi.edit", row.id)} className="p-2 rounded-lg bg-violet-100 text-violet-700" title="Edit">✏️</Link>
                      <Link href={route("admin.transaksi.show", row.id)} className="p-2 rounded-lg bg-gray-100" title="Detail">🔍</Link>
                      <button
                        onClick={() => requestDelete(row)}
                        className="p-2 rounded-lg bg-rose-100 text-rose-700"
                        title="Hapus"
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

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {transactions.links.map((l, i) => (
            <Link
              key={i}
              href={l.url || "#"}
              className={`px-3 py-1 rounded ${l.active ? "bg-orange-600 text-white" : "bg-gray-100"}`}
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

Index.layout = (page) => <SidebarLayout title="Transaksi Cabang">{page}</SidebarLayout>;
