// resources/js/Pages/Transaksi/Show.jsx
import React from "react";
import { Link, usePage } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";

function Currency({ v }) {
  return <span>{Number(v||0).toLocaleString("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 })}</span>;
}

export default function Show() {
  const { props } = usePage();
  const { trx, rx = [], items = [] } = props;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={route("transaksi.index")} className="text-orange-600 font-semibold">← Kembali</Link>
        <h1 className="text-4xl font-extrabold text-orange-500">Detail Transaksi</h1>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p>Id Pasien : <b>{trx.pasien?.kode_pasien || "-"}</b></p>
            <p>Nama Pasien : <b>{trx.pasien?.nama_pasien || "-"}</b></p>
            <p>Alamat : {trx.pasien?.alamat || "-"}</p>
            <p>No Hp : {trx.pasien?.telepon || "-"}</p>
            <p>Frame : <b>{trx.frame || "-"}</b></p>
            <p>Lensa : <b>{trx.lensa || "-"}</b></p>
          </div>
          <div>
            <p>Tanggal Pesanan : <b>{trx.tanggal_pesanan}</b></p>
            <p>Tanggal Selesai : <b>{trx.tanggal_selesai || "-"}</b></p>
          </div>
        </div>

        {rx.length > 0 && (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-violet-50">
                <tr>
                  <th className="px-3 py-2 text-left">RX</th>
                  {["SPH","CYL","AXIS","PRISM","BASE","ADD","MPD"].map(h => (
                    <th key={h} className="px-2 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rx.map(r => (
                  <tr key={r.eye} className="border-t">
                    <td className="px-3 py-2 font-semibold">{r.eye}</td>
                    {["SPH","CYL","AXIS","PRISM","BASE","ADD","MPD"].map(f => (
                      <td key={f} className="px-2 py-2">{r[f]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Item Produk</h3>
            <table className="w-full text-sm border rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left">Nama</th>
                  <th className="px-2 py-2 text-left">Qty</th>
                  <th className="px-2 py-2 text-left">Harga</th>
                  <th className="px-2 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it,i)=>(
                  <tr key={i} className="border-t">
                    <td className="px-2 py-2">{it.nama}</td>
                    <td className="px-2 py-2">{it.qty}</td>
                    <td className="px-2 py-2"><Currency v={it.harga} /></td>
                    <td className="px-2 py-2 text-right"><Currency v={it.subtotal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 max-w-md">
          <div className="flex items-center justify-between">
            <span>Harga</span>
            <b><Currency v={trx.harga} /></b>
          </div>
          <div className="flex items-center justify-between">
            <span>Panjar</span>
            <b><Currency v={trx.panjar} /></b>
          </div>
          <div className="border-t my-2" />
          <div className="flex items-center justify-between text-lg">
            <span>Total</span>
            <b><Currency v={trx.total} /></b>
          </div>
        </div>
      </div>
    </div>
  );
}

// pasang layout
Show.layout = (page) => <SidebarLayout title="Detail Transaksi">{page}</SidebarLayout>;
