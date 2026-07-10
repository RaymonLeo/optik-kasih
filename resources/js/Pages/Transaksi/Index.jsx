// appV1.0 Rev 7 - Klik baris transaksi langsung ke halaman detail (konsisten dengan daftar pasien).

import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";

const IDR = (v) => Number(v || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

const BADGE_BAYAR = {
  panjar: "bg-amber-100 text-amber-800 border-amber-300",
  lunas:  "bg-green-100 text-green-800 border-green-300",
};
const BADGE_KACAMATA = {
  belum_selesai: "bg-blue-100 text-blue-700 border-blue-300",
  sudah_selesai: "bg-green-100 text-green-700 border-green-300",
};
const BADGE_AMBIL = {
  belum_diambil: "bg-slate-100 text-slate-600 border-slate-300",
  sudah_diambil: "bg-emerald-100 text-emerald-700 border-emerald-300",
};
const BADGE_KATEGORI = {
  kacamata:      "bg-violet-100 text-violet-700",
  produk_lainnya:"bg-sky-100 text-sky-700",
  resep:         "bg-orange-100 text-orange-700",
};

function StatusBadge({ cls, label }) {
  return <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls}`}>{label}</span>;
}

function updateStatusRow(id, field, value) {
  router.patch(route("admin.transaksi.update_status", id), { [field]: value }, { preserveScroll: true });
}

export default function Index() {
  const { props } = usePage();
  const { transactions, totalHariIni, pendingKacamata = [], query = {} } = props;
  const isAdmin = props.auth?.user?.role === "admin";

  const [search,    setSearch]    = useState(query.search || "");
  const [date,      setDate]      = useState(query.date   || "");
  const [to,        setTo]        = useState(query.to     || "");
  const [range,     setRange]     = useState(query.range  || "day");
  const [statusByr, setStatusByr] = useState(query.status_pembayaran || "");
  const [kategori,  setKategori]  = useState(query.kategori || "");

  // Export date range
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo,   setExportTo]   = useState(new Date().toISOString().slice(0, 10));
  const [showExport, setShowExport] = useState(false);

  const isCustom = range === "custom";

  function apply(e) {
    e?.preventDefault?.();
    const params = { search, range, status_pembayaran: statusByr, kategori };
    if (range !== "all") params.date = date;
    if (isCustom)        params.to   = to;
    router.get(route("admin.transaksi.index"), params, { preserveState: true, replace: true });
  }

  function doExport() {
    const url = route("admin.transaksi.export") + (exportFrom ? `?from=${exportFrom}&to=${exportTo}` : "");
    window.open(url, "_blank");
    setShowExport(false);
  }

  const requestDelete = (row) => {
    const confirmed = window.confirm(isAdmin
      ? "Kirim permintaan penghapusan transaksi ke superadmin?"
      : "Hapus transaksi ini secara permanen?");
    if (!confirmed) return;
    const reason = isAdmin ? window.prompt("Alasan penghapusan transaksi:") : null;
    if (isAdmin && !reason?.trim()) return;
    router.delete(route("admin.transaksi.destroy", row.id), { data: isAdmin ? { delete_reason: reason.trim() } : {}, preserveScroll: true });
  };

  return (
    <div className="p-6">
      {/* Pending kacamata widget */}
      {pendingKacamata.length > 0 && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="mb-2 font-semibold text-green-800">Kacamata sudah selesai — siap diambil:</p>
          <ul className="space-y-1">
            {pendingKacamata.map((k) => (
              <li key={k.id} className="flex items-center gap-2 text-sm text-green-700">
                <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-green-500" />
                <b>#{k.id}</b> — {k.nama_pasien || "(tanpa pasien)"} — <span className="text-green-600">{k.tanggal}</span>
                <Link href={route("admin.transaksi.show", k.id)} className="ml-auto text-xs font-semibold text-green-700 underline hover:text-green-900">
                  Lihat
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Kartu total */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="inline-flex flex-col rounded-xl bg-white px-4 py-3 shadow">
          <span className="text-xs text-gray-500">Total sesuai filter</span>
          <span className="text-3xl font-extrabold text-orange-600">{IDR(totalHariIni)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExport(v => !v)}
            className="flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
          >
            ⬇ Export Excel
          </button>
          <Link href={route("admin.transaksi.create")} className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
            + Tambah Transaksi
          </Link>
        </div>
      </div>

      {/* Export panel */}
      {showExport && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="mb-3 text-sm font-semibold text-green-800">Export Excel Transaksi</p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Dari Tanggal
              <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} className="h-9 rounded-lg border border-slate-300 px-3 text-sm" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Sampai Tanggal
              <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} className="h-9 rounded-lg border border-slate-300 px-3 text-sm" />
            </label>
            <button onClick={doExport} className="h-9 rounded-lg bg-green-700 px-4 text-sm font-semibold text-white hover:bg-green-800">
              Download
            </button>
            <button onClick={() => { setExportFrom(""); setShowExport(false); }} className="h-9 rounded-lg border px-4 text-sm text-gray-600 hover:bg-gray-50">
              Batal
            </button>
          </div>
          <p className="mt-2 text-xs text-green-700">Kosongkan "Dari Tanggal" untuk export semua transaksi.</p>
        </div>
      )}

      <div className="rounded-xl bg-white p-4 shadow">
        {/* Filter */}
        <form onSubmit={apply} className="flex flex-wrap items-end gap-3">
          {/* Periode */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Periode</label>
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={range} onChange={e => setRange(e.target.value)}>
              <option value="day">Hari ini</option>
              <option value="week">Minggu ini</option>
              <option value="month">Bulan ini</option>
              <option value="year">Tahun ini</option>
              <option value="all">Semua</option>
              <option value="custom">Jangka Waktu</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">{isCustom ? "Dari Tanggal" : "Tanggal Acuan"}</label>
            <input type="date" value={date || ""} onChange={e => setDate(e.target.value)} disabled={range === "all"}
              className="h-10 rounded-lg border border-slate-300 px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={`text-xs font-semibold ${isCustom ? "text-slate-500" : "text-slate-300"}`}>Sampai Tanggal</label>
            <input type="date" value={to || ""} onChange={e => setTo(e.target.value)} min={date || undefined} disabled={!isCustom}
              className="h-10 rounded-lg border border-slate-300 px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100" />
          </div>

          {/* Filter status bayar */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Status Bayar</label>
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={statusByr} onChange={e => setStatusByr(e.target.value)}>
              <option value="">Semua</option>
              <option value="panjar">Panjar</option>
              <option value="lunas">Lunas</option>
            </select>
          </div>

          {/* Filter kategori */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Kategori</label>
            <select className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={kategori} onChange={e => setKategori(e.target.value)}>
              <option value="">Semua</option>
              <option value="kacamata">Kacamata</option>
              <option value="produk_lainnya">Produk Lainnya</option>
            </select>
          </div>

          {/* Cari */}
          <div className="ml-auto flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Cari</label>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ID, lensa, pasien..."
                className="h-10 min-w-[180px] rounded-lg border border-slate-300 px-3 text-sm" />
            </div>
            <button className="h-10 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white" type="submit">Terapkan</button>
          </div>
        </form>

        {/* Tabel */}
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold">Kategori</th>
                <th className="px-4 py-3 text-left font-semibold">Pasien</th>
                <th className="px-4 py-3 text-left font-semibold">Frame / Produk</th>
                <th className="px-4 py-3 text-left font-semibold">Harga</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data.map((row, idx) => (
                <tr key={row.id} className="cursor-pointer border-t hover:bg-orange-50/40" onClick={() => router.visit(route("admin.transaksi.show", row.id))}>
                  <td className="px-4 py-3 font-semibold text-gray-700">{transactions.from + idx}</td>
                  <td className="px-4 py-3 text-gray-600">{row.tanggal_pesanan}</td>
                  <td className="px-4 py-3">
                    {row.kategori_transaksi && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE_KATEGORI[row.kategori_transaksi] || "bg-gray-100 text-gray-600"}`}>
                        {row.kategori_transaksi === "kacamata" ? "Kacamata" : row.kategori_transaksi === "produk_lainnya" ? "Produk" : row.kategori_transaksi}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{row.nama_pasien || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.frame || row.produk || row.lensa || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {IDR(row.harga)}
                    {Number(row.panjar) > 0 && row.status_pembayaran !== "lunas" && <div className="text-xs text-gray-400">panjar {IDR(row.panjar)}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {row.status_pembayaran && (
                        <StatusBadge cls={BADGE_BAYAR[row.status_pembayaran] || "bg-gray-100 text-gray-600"} label={row.status_pembayaran === "lunas" ? "Lunas" : "Panjar"} />
                      )}
                      {row.status_kacamata && (
                        <StatusBadge cls={BADGE_KACAMATA[row.status_kacamata] || "bg-gray-100"} label={row.status_kacamata === "sudah_selesai" ? "Selesai" : "Proses"} />
                      )}
                      {row.status_pengambilan && (
                        <StatusBadge cls={BADGE_AMBIL[row.status_pengambilan] || "bg-gray-100"} label={row.status_pengambilan === "sudah_diambil" ? "Diambil" : "Blm Diambil"} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={route("admin.transaksi.print_bon", row.id)}
                        className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100" title="Print Bon">🖨️</Link>
                      <Link href={route("admin.transaksi.edit", row.id)}
                        className="rounded-lg bg-violet-50 p-2 text-violet-700 hover:bg-violet-100" title="Edit">✏️</Link>
                      <Link href={route("admin.transaksi.show", row.id)}
                        className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200" title="Detail">🔍</Link>
                      <button onClick={() => requestDelete(row)}
                        className="rounded-lg bg-rose-50 p-2 text-rose-700 hover:bg-rose-100" title="Hapus">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.data.length === 0 && (
                <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={8}>Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Status cepat - update langsung di row (kacamata only) */}
        {transactions.data.some(r => r.kategori_transaksi === "kacamata") && (
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
            Tip: Klik <b>🔍 Detail</b> pada transaksi kacamata untuk mengubah status selesai / sudah diambil.
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2">
          {transactions.links.map((l, i) => (
            <Link key={i} href={l.url || "#"}
              className={`rounded-lg px-3 py-1.5 text-sm ${l.active ? "bg-orange-600 text-white" : "border bg-white"}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ))}
        </div>
      </div>
    </div>
  );
}

Index.layout = (page) => <SidebarLayout title="Transaksi Cabang">{page}</SidebarLayout>;
