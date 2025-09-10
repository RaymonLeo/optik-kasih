// resources/js/Pages/Transaksi/Create.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, router, useForm } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";

function Section({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-4 mb-4">
      {title && <div className="mb-3 text-gray-700 font-semibold">{title}</div>}
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      {children}
    </label>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-[520px] max-w-[92vw]">
        {children}
      </div>
    </div>
  );
}

export default function Create({ mode = "create", prefill = null }) {
  const isEdit = mode === "edit";

  const defaultForm = useMemo(() => ({
    type: "resep",
    kode_pasien: "",
    pasien: { id: null, nama: "", umur: "", alamat: "", telepon: "" },
    tanggal_pesanan: "",
    tanggal_selesai: "",
    frame: "",
    lensa: "",
    lensa_id: "",
    rx: {
      OD: { SPH: 0, CYL: 0, AXIS: 0, PRISM: 0, BASE: 0, ADD: 0, MPD: 0 },
      OS: { SPH: 0, CYL: 0, AXIS: 0, PRISM: 0, BASE: 0, ADD: 0, MPD: 0 },
    },
    harga: 0,
    panjar: 0,
    sisa: 0,
    exam_date: "",
    items: [{ nama: "", qty: 1, harga: 0 }],
    tanpa_pasien: false,
    _id: null,
    _kode: null,
  }), []);

  const initial = useMemo(() => {
    if (!prefill) return defaultForm;
    return {
      ...defaultForm,
      ...prefill,
      kode_pasien: prefill.pasien?.kode_pasien || "",
      pasien: {
        id: prefill.pasien?.id || null,
        nama: prefill.pasien?.nama_pasien || "",
        alamat: prefill.pasien?.alamat || "",
        telepon: prefill.pasien?.telepon || "",
      }
    };
  }, [prefill]);

  const { data, setData, post, put, processing, reset, errors } = useForm(initial);

  // hitung sisa dinamis
  useEffect(() => {
    const s = Number(data.harga || 0) - Number(data.panjar || 0);
    setData("sisa", s > 0 ? s : 0);
  }, [data.harga, data.panjar]);

  // ---------- Auto isi pasien berdasarkan kode ----------
  async function fetchByCode(kode) {
    try {
      const res = await fetch(route("api.patient.byCode", { kode }));
      if (!res.ok) return;
      const json = await res.json();
      if (json?.id) {
        setData("pasien", {
          id: json.id,
          nama: json.nama_pasien || "",
          alamat: json.alamat || "",
          telepon: json.telepon || "",
        });
      }
    } catch {}
  }

  function onKodeChange(kode) {
    setData("kode_pasien", kode);
    if (kode) fetchByCode(kode);
  }

  // ---------- Dropdown search kode/nama ----------
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  useEffect(() => {
    const t = setTimeout(async () => {
      const term = data.kode_pasien?.trim();
      if (!term) { setSuggestions([]); return; }
      const res = await fetch(route("api.patient.search") + `?term=${encodeURIComponent(term)}`);
      if (res.ok) {
        const rows = await res.json();
        setSuggestions(rows);
        setShowSug(true);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [data.kode_pasien]);

  // ---------- daftar tanggal pemeriksaan ----------
  const [examDates, setExamDates] = useState([]);
  useEffect(() => {
    if (!data.pasien?.id) { setExamDates([]); return; }
    fetch(route("api.patient.exams", { patient: data.pasien.id }))
      .then(r => r.ok ? r.json() : [])
      .then(list => setExamDates(list || []))
      .catch(() => setExamDates([]));
  }, [data.pasien?.id]);

  async function onPickExamDate(tgl) {
    setData("exam_date", tgl);
    if (!tgl || !data.pasien?.id) return;
    const url = route("api.patient.exams", { patient: data.pasien.id }) + `?date=${encodeURIComponent(tgl)}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const ex = await res.json();
    if (ex?.rx) setData("rx", ex.rx);
  }

  // ---------- TAB ----------
  const [tab, setTab] = useState(() => data.type === "produk" ? "lain" : "resep");
  useEffect(() => setTab(data.type === "produk" ? "lain" : "resep"), [data.type]);

  const TabBtn = ({ value, children }) => (
    <button
      type="button"
      onClick={() => { setTab(value); setData("type", value === "resep" ? "resep" : "produk"); }}
      className={`px-4 py-2 rounded-full border ${tab === value ? "bg-orange-500 text-white border-orange-500" : "bg-white"}`}
    >
      {children}
    </button>
  );

  // ---------- Modal confirm ----------
  const [openConfirm, setOpenConfirm] = useState(false);
  const totalHitung = Math.max(0, Number(data.harga || 0) - Number(data.panjar || 0));
  function trySubmit() {
    setOpenConfirm(true);
  }
  function doSubmit() {
    setOpenConfirm(false);
    if (isEdit) {
      put(route("transaksi.update", data._id), { preserveScroll: true });
    } else {
      post(route("transaksi.store"), { onSuccess: () => reset(defaultForm) });
    }
  }

  function RowRX({ eye }) {
    const fields = ["SPH", "CYL", "AXIS", "PRISM", "BASE", "ADD", "MPD"];
    return (
      <tr className="border-t">
        <td className="px-3 py-2 font-semibold">{eye}</td>
        {fields.map(f => (
          <td key={f} className="px-2 py-2">
            <input
              type="number" step="0.25"
              className="w-full h-10 px-2 border rounded"
              value={data.rx[eye][f]}
              onChange={e => setData("rx", { ...data.rx, [eye]: { ...data.rx[eye], [f]: e.target.value } })}
            />
          </td>
        ))}
      </tr>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={route("transaksi.index")} className="text-orange-600 font-semibold">← Kembali</Link>
        <h1 className="text-4xl font-extrabold text-orange-500">{isEdit ? "Edit Transaksi" : "Input Transaksi"}</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <TabBtn value="resep">Kacamata Resep</TabBtn>
        <TabBtn value="lain">Produk Lain</TabBtn>
      </div>

      {tab === "resep" ? (
        <>
          <Section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Kode Pasien">
                <div className="relative">
                  <input
                    value={data.kode_pasien}
                    onChange={(e) => onKodeChange(e.target.value)}
                    onFocus={()=> setShowSug(true)}
                    placeholder="Ketik Kode / Nama Pasien"
                    className="h-10 px-3 rounded border w-full"
                  />
                  {showSug && suggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border rounded-xl shadow max-h-60 overflow-auto">
                      {suggestions.map((p)=>(
                        <button
                          type="button"
                          key={p.id}
                          className="w-full text-left px-3 py-2 hover:bg-orange-50"
                          onClick={()=>{ setData("kode_pasien", p.kode_pasien); fetchByCode(p.kode_pasien); setShowSug(false); }}
                        >
                          <b>{p.kode_pasien}</b> — {p.nama_pasien}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.kode_pasien && <div className="text-red-600 text-sm mt-1">{errors.kode_pasien}</div>}
              </Field>

              <Field label="Nama Pasien">
                <input value={data.pasien.nama} readOnly className="h-10 px-3 rounded border w-full bg-gray-100" />
              </Field>

              <Field label="Tanggal Pesanan">
                <input type="date" value={data.tanggal_pesanan} onChange={(e)=>setData("tanggal_pesanan", e.target.value)} className="h-10 px-3 rounded border w-full" />
              </Field>

              <Field label="Alamat">
                <textarea value={data.pasien.alamat} readOnly className="h-10 px-3 rounded border w-full bg-gray-100" />
              </Field>

              <Field label="Frame">
                <input value={data.frame} onChange={(e)=>setData("frame", e.target.value)} className="h-10 px-3 rounded border w-full" placeholder="Inputkan Frame Pasien" />
              </Field>

              <Field label="Lensa (ketik manual)">
                <input value={data.lensa} onChange={(e)=>setData("lensa", e.target.value)} className="h-10 px-3 rounded border w-full" placeholder="Contoh: CRMC Bluray" />
              </Field>

              <Field label="Pilih Lensa Master (opsional)">
                <input value={data.lensa_id || ""} onChange={(e)=>setData("lensa_id", e.target.value)} className="h-10 px-3 rounded border w-full" placeholder="isi id_lensa jika ingin link ke master" />
              </Field>

              <Field label="Tanggal Selesai">
                <input type="date" value={data.tanggal_selesai} onChange={(e)=>setData("tanggal_selesai", e.target.value)} className="h-10 px-3 rounded border w-full" />
              </Field>
            </div>
          </Section>

          <Section title="Auto isi dari pemeriksaan pasien">
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Tanggal Pemeriksaan">
                <select
                  value={data.exam_date}
                  onChange={(e)=>onPickExamDate(e.target.value)}
                  className="h-10 px-3 rounded border w-full"
                  disabled={!data.pasien?.id}
                >
                  <option value="">Pilih tanggal</option>
                  { (examDates || []).map((d) => <option key={d} value={d}>{d}</option>) }
                </select>
              </Field>
            </div>
          </Section>

          <Section>
            <div className="overflow-auto">
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
                  <RowRX eye="OD" />
                  <RowRX eye="OS" />
                </tbody>
              </table>
            </div>
          </Section>

          <Section>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Harga">
                <input type="number" value={data.harga} onChange={(e)=>setData("harga", e.target.value)} className="h-10 px-3 rounded border w-full" />
                {errors.harga && <div className="text-red-600 text-sm mt-1">{errors.harga}</div>}
              </Field>
              <Field label="Panjar">
                <input type="number" value={data.panjar} onChange={(e)=>setData("panjar", e.target.value)} className="h-10 px-3 rounded border w-full" />
                {errors.panjar && <div className="text-red-600 text-sm mt-1">{errors.panjar}</div>}
              </Field>
              <Field label="Sisa">
                <input readOnly value={data.sisa} className="h-10 px-3 rounded border w-full bg-gray-100" />
              </Field>
            </div>
          </Section>
        </>
      ) : (
        <Section>
          <div className="flex items-center gap-3 mb-3">
            <input id="tp" type="checkbox" checked={data.tanpa_pasien} onChange={(e)=>setData("tanpa_pasien", e.target.checked)} />
            <label htmlFor="tp" className="text-sm">Transaksi tanpa pasien</label>
          </div>

          {!data.tanpa_pasien && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Field label="Kode Pasien">
                <input value={data.kode_pasien} onChange={(e)=>onKodeChange(e.target.value)} className="h-10 px-3 rounded border w-full" placeholder="Ketik Kode Pasien" />
              </Field>
              <Field label="Nama Pasien">
                <input value={data.pasien.nama} readOnly className="h-10 px-3 rounded border w-full bg-gray-100" />
              </Field>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left">Nama Barang</th>
                  <th className="px-2 py-2 text-left">Qty</th>
                  <th className="px-2 py-2 text-left">Harga</th>
                  <th className="px-2 py-2 text-right">Subtotal</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((it, idx) => {
                  const subtotal = Number(it.qty || 0) * Number(it.harga || 0);
                  return (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-2">
                        <input className="h-10 px-2 border rounded w-full" value={it.nama} onChange={(e)=>{
                          const items = [...data.items]; items[idx].nama = e.target.value; setData("items", items);
                        }} placeholder="Misal, Soflen / Pembersih / Gagang" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="1" className="h-10 px-2 border rounded w-24" value={it.qty} onChange={(e)=>{
                          const items = [...data.items]; items[idx].qty = e.target.value; setData("items", items);
                        }} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" className="h-10 px-2 border rounded w-36" value={it.harga} onChange={(e)=>{
                          const items = [...data.items]; items[idx].harga = e.target.value; setData("items", items);
                        }} />
                      </td>
                      <td className="px-2 py-2 text-right">{subtotal.toLocaleString("id-ID")}</td>
                      <td className="px-2 py-2 text-right">
                        <button type="button" className="px-2 py-1 bg-red-100 text-red-700 rounded"
                          onClick={()=>{ const items = data.items.filter((_,i)=>i!==idx); setData("items", items.length ? items : [{ nama:"", qty:1, harga:0 }]); }}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3 flex items-center gap-3">
              <button type="button" className="px-3 py-2 bg-gray-900 text-white rounded"
                onClick={()=>setData("items", [...data.items, { nama:"", qty:1, harga:0 }])}>+ Tambah Item</button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Field label="Tanggal Transaksi">
              <input type="date" value={data.tanggal_pesanan} onChange={(e)=>setData("tanggal_pesanan", e.target.value)} className="h-10 px-3 rounded border w-full" />
            </Field>
            <Field label="Harga Total">
              <input type="number" value={data.harga} onChange={(e)=>setData("harga", e.target.value)} className="h-10 px-3 rounded border w-full" />
            </Field>
          </div>
        </Section>
      )}

      <div className="flex items-center justify-end gap-3 mt-6">
        <Link href={route("transaksi.index")} className="h-10 px-4 rounded-lg border">Cancel</Link>
        <button onClick={trySubmit} disabled={processing} className="h-10 px-4 rounded-lg bg-orange-600 text-white">
          {isEdit ? "Edit" : "Kirim"}
        </button>
      </div>

      {/* Modal Konfirmasi */}
      <Modal open={openConfirm} onClose={()=>setOpenConfirm(false)}>
        <div className="text-lg font-bold mb-3">Total Biaya</div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between"><span>Harga</span><b>{Number(data.harga||0).toLocaleString("id-ID")}</b></div>
          <div className="flex items-center justify-between"><span>Panjar</span><b>{Number(data.panjar||0).toLocaleString("id-ID")}</b></div>
          <div className="border-t pt-2 flex items-center justify-between text-lg">
            <span>Total</span><b>{Number(totalHitung||0).toLocaleString("id-ID")}</b>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={()=>setOpenConfirm(false)} className="px-4 h-10 rounded-lg border">Kembali</button>
          <button onClick={doSubmit} className="px-4 h-10 rounded-lg bg-orange-600 text-white">{isEdit ? "Simpan" : "Simpan"}</button>
        </div>
      </Modal>
    </div>
  );
}

// pasang layout
Create.layout = (page) => <SidebarLayout title="Input Transaksi">{page}</SidebarLayout>;
