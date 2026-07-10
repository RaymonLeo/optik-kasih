// resources/js/Pages/Transaksi/Show.jsx
import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import ConfirmDialog from "@/Components/ui/ConfirmDialog";
import Toast from "@/Components/ui/Toast";
import SidebarLayout from "@/Components/SidebarLayout";

const IDR = (v) => Number(v || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

const BADGE_KATEGORI = {
  kacamata:       "bg-violet-100 text-violet-700",
  produk_lainnya: "bg-sky-100 text-sky-700",
  resep:          "bg-orange-100 text-orange-700",
};
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

function StatusBadge({ cls, label }) {
  return <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${cls}`}>{label}</span>;
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

function Show() {
  const { props } = usePage();
  const { trx, rx = [], items = [] } = props;

  const [toDelete, setToDelete] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });

  const doDelete = () => {
    router.delete(route("admin.transaksi.destroy", trx.id), {
      onSuccess: () => router.visit(route("admin.transaksi.index")),
      onError: () => { setToDelete(false); setToast({ open: true, type: "error", message: "Gagal menghapus transaksi." }); },
    });
  };

  return (
    <>
      <Head title="Detail Transaksi" />
      <div className="p-0">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => history.back()} className="text-orange-700 hover:underline">← Kembali</button>
          <div className="flex items-center gap-1.5">
            <Link href={route("admin.transaksi.print_bon", trx.id)}
              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">🖨️ Print Bon</Link>
            <Link href={route("admin.transaksi.edit", trx.id)}
              className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100">✏️ Edit</Link>
            <button onClick={() => setToDelete(true)}
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">🗑 Hapus</button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">Transaksi #{trx.id}</h2>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_KATEGORI[trx.kategori_transaksi] || "bg-gray-100 text-gray-600"}`}>
              {trx.kategori_transaksi}
            </span>
            {trx.status_pembayaran && (
              <StatusBadge cls={BADGE_BAYAR[trx.status_pembayaran] || "bg-gray-100 text-gray-600"} label={trx.status_pembayaran === "lunas" ? "Lunas" : "Panjar"} />
            )}
            {trx.status_kacamata && (
              <StatusBadge cls={BADGE_KACAMATA[trx.status_kacamata] || "bg-gray-100"} label={trx.status_kacamata === "sudah_selesai" ? "Selesai" : "Proses"} />
            )}
            {trx.status_pengambilan && (
              <StatusBadge cls={BADGE_AMBIL[trx.status_pengambilan] || "bg-gray-100"} label={trx.status_pengambilan === "sudah_diambil" ? "Diambil" : "Blm Diambil"} />
            )}
            {trx.branch_name && <span className="ml-auto text-sm text-gray-500">Cabang: {trx.branch_name}</span>}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-gray-700">Data Pasien</h3>
              <div><span className="font-semibold">Kode :</span> {trx.pasien?.kode_pasien || "-"}</div>
              <div><span className="font-semibold">Nama :</span> {trx.pasien?.nama_pasien || "-"}</div>
              <div><span className="font-semibold">No Hp :</span> {trx.pasien?.telepon || "-"}</div>
              <div><span className="font-semibold">Alamat :</span> {trx.pasien?.alamat || "-"}</div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-700">Data Pesanan</h3>
              <div><span className="font-semibold">Tanggal Pesanan :</span> {trx.tanggal_pesanan || "-"}</div>
              <div><span className="font-semibold">Tanggal Selesai :</span> {trx.tanggal_selesai || "-"}</div>
              {trx.frame && <div><span className="font-semibold">Frame :</span> {trx.frame}</div>}
              {trx.lensa && <div><span className="font-semibold">Lensa :</span> {trx.lensa}</div>}
              {trx.produk && <div><span className="font-semibold">Produk :</span> {trx.produk}</div>}
            </div>
          </div>
        </div>

        {rx.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b bg-violet-50 px-4 py-2 font-semibold text-gray-700">Resep Mata</div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">RX</th>
                  {["SPH", "CYL", "AXIS", "PRISM", "BASE", "ADD", "MPD"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rx.map((r) => (
                  <tr key={r.eye} className="border-t">
                    <td className="px-3 py-2 font-semibold">{r.eye}</td>
                    {["SPH", "CYL", "AXIS", "PRISM", "BASE", "ADD", "MPD"].map((f) => (
                      <td key={f} className="px-3 py-2">{r[f] ?? "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b bg-gray-50 px-4 py-2 font-semibold text-gray-700">Item Produk</div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Nama</th>
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Harga</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{it.nama}</td>
                    <td className="px-3 py-2">{it.qty}</td>
                    <td className="px-3 py-2">{IDR(it.harga)}</td>
                    <td className="px-3 py-2 text-right">{IDR(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-semibold text-gray-700">Pembayaran</h3>
          <div className="max-w-md">
            <Row label="Harga Total">{IDR(trx.harga)}</Row>
            <Row label="Panjar">{IDR(trx.panjar)}</Row>
            <Row label="Sisa">{IDR(trx.sisa)}</Row>
            <div className="my-2 border-t" />
            <Row label={`Metode Bayar 1${trx.metode_pembayaran_1 ? ` (${trx.metode_pembayaran_1})` : ""}`}>{IDR(trx.jumlah_bayar_1)}</Row>
            {trx.metode_pembayaran_2 && (
              <Row label={`Metode Bayar 2 (${trx.metode_pembayaran_2})`}>{IDR(trx.jumlah_bayar_2)}</Row>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={toDelete}
        danger
        title="Apakah anda ingin menghapus transaksi ini?"
        description="Data transaksi akan dihapus secara permanen. Yakin?"
        confirmText="Hapus"
        onCancel={() => setToDelete(false)}
        onConfirm={doDelete}
      />
      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={() => setToast((s) => ({ ...s, open: false }))} />
    </>
  );
}
Show.layout = (page) => <SidebarLayout title="Detail Transaksi">{page}</SidebarLayout>;
export default Show;
