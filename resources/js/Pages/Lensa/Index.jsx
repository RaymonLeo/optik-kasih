import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";

function SpecRow({ title, spec }) {
  return (
    <div className="text-xs grid grid-cols-7 gap-1">
      <div className="font-semibold w-8">{title}</div>
      {["SPH","CYL","AXIS","PRISM","BASE","ADD"].map(k => (
        <div key={k} className="px-2 py-0.5 bg-gray-50 rounded border text-center">{spec?.[k] ?? "-"}</div>
      ))}
    </div>
  );
}

export default function Index() {
  const { props } = usePage();
  const { rows, query } = props;
  const [search, setSearch] = useState(query?.search || "");

  function apply(e){
    e.preventDefault();
    router.get(route('lensa.index'), { search }, { preserveState:true, replace:true });
  }

  return (
    <SidebarLayout title="Daftar Lensa">
      <div className="bg-white p-4 rounded-xl border">
        <form onSubmit={apply} className="flex gap-2 mb-4">
          <input
            className="h-10 px-3 rounded-lg border min-w-[280px]"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Cari nama / jenis / coating / indeks"
          />
          <button className="h-10 px-4 rounded-lg bg-gray-900 text-white">Cari</button>
          <div className="ml-auto">
            <Link href={route('lensa.create')} className="h-10 px-4 rounded-lg bg-orange-500 text-white flex items-center">+ Tambah Lensa</Link>
          </div>
        </form>

        <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
          {rows.data.map(card => (
            <div key={card.id_lensa} className="border rounded-xl p-4 bg-white">
              <div className="flex items-start gap-3">
                <div className="w-24 h-24 rounded-lg bg-gray-50 border flex items-center justify-center overflow-hidden">
                  {card.gambar_url ? (
                    <img src={card.gambar_url} alt={card.nama_lensa} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">{card.nama_lensa || "-"}</div>
                  <div className="text-sm text-gray-500">{card.jenis_lensa || "-"}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Indeks: <b>{card.indeks_lensa || "-"}</b> &nbsp;•&nbsp;
                    Coating: <b>{card.coating_lensa || "-"}</b> &nbsp;•&nbsp;
                    Stok: <b>{card.stok_lensa}</b>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <SpecRow title="OD" spec={card.spec?.kanan} />
                <SpecRow title="OS" spec={card.spec?.kiri} />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Link href={route('lensa.edit', card.id_lensa)} className="px-3 py-1 rounded bg-violet-100 text-violet-800">Edit</Link>
                <button
                  className="px-3 py-1 rounded bg-red-100 text-red-700"
                  onClick={()=>{
                    if(confirm('Hapus lensa ini?')) router.delete(route('lensa.destroy', card.id_lensa));
                  }}
                >Hapus</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {rows.links.map((l, i) => (
            <Link
              key={i}
              href={l.url || "#"}
              className={`px-3 py-1 rounded ${l.active ? "bg-orange-500 text-white" : "bg-gray-100"}`}
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
