// appV1.0 Rev 5 - Fix bug: qty item manual dengan angka nol di depan bisa tersimpan salah.

import React, { useEffect, useMemo, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";

/* ── UI helpers ───────────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="mb-4 rounded-xl border bg-white p-4">
      {title && <div className="mb-3 font-semibold text-gray-700">{title}</div>}
      {children}
    </div>
  );
}
function Field({ label, required, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-gray-600">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </div>
      {children}
    </label>
  );
}
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div className="relative max-h-[90vh] w-[640px] max-w-[96vw] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

const toNumber = (txt) => { const raw = String(txt ?? "").replace(/[^\d]/g, ""); return raw ? parseInt(raw, 10) : 0; };
const fmtIDR  = (n)   => Number(n || 0).toLocaleString("id-ID");

/* ── Picker modal ─────────────────────────────────────────────────────────── */
function ProdukPicker({ open, onClose, list, title, onSelect }) {
  const [q, setQ] = useState("");
  const filtered = list.filter(p => (p.nama_produk + (p.kategori || "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-800">{title}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari produk…"
        className="mb-3 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" />
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map(p => (
          <button key={p.id} type="button" onClick={() => { onSelect(p); onClose(); setQ(""); }}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-orange-400 hover:bg-orange-50 transition">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
              {p.gambar_url
                ? <img src={p.gambar_url} alt={p.nama_produk} className="h-full w-full object-cover" />
                : <span className="text-xl">📦</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-gray-800">{p.nama_produk}</div>
              {p.kategori && <div className="text-xs text-gray-500">{p.kategori}</div>}
              <div className="mt-0.5 text-xs font-semibold text-orange-700">Rp {fmtIDR(p.harga_produk)}</div>
              <div className={`text-xs font-semibold ${p.stok === 0 ? "text-red-600" : "text-green-700"}`}>
                Stok: {p.stok}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="col-span-2 py-10 text-center text-sm text-gray-500">Tidak ada produk.</div>}
      </div>
    </Modal>
  );
}

function LensaPicker({ open, onClose, list, onSelect }) {
  const [q, setQ] = useState("");
  const filtered = list.filter(l => (l.nama_lensa + (l.jenis_lensa || "") + (l.coating || "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-800">Pilih Lensa dari Stok</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari lensa…"
        className="mb-3 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" />
      <div className="space-y-2">
        {filtered.map(l => (
          <button key={l.id_lensa} type="button" onClick={() => { onSelect(l); onClose(); setQ(""); }}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-violet-400 hover:bg-violet-50 transition">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
              {l.gambar_url
                ? <img src={l.gambar_url} alt={l.nama_lensa} className="h-full w-full object-cover" />
                : <span>🔍</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1">
                <span className="truncate font-semibold text-gray-800">{l.nama_lensa}</span>
                {l.is_pesanan && <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">PESAN</span>}
              </div>
              <div className="text-xs text-gray-500">
                {[l.jenis_lensa, l.coating, l.indeks && `Indeks ${l.indeks}`].filter(Boolean).join(" • ")}
              </div>
              <div className={`text-xs font-semibold ${l.stok === 0 && !l.is_pesanan ? "text-red-600" : "text-green-700"}`}>
                {l.is_pesanan ? "Lensa Pesanan" : `Stok: ${l.stok}`}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="py-8 text-center text-sm text-gray-500">Tidak ada lensa tersedia.</div>}
      </div>
    </Modal>
  );
}

/* ── Module-level components (must NOT be defined inside Create) ──────────── */
const MoneyInput = ({ value, onChange, readOnly }) => (
  <input type="text" inputMode="numeric"
    value={value ? fmtIDR(value) : ""}
    onChange={e => onChange(toNumber(e.target.value))}
    placeholder="Rp 0" readOnly={readOnly}
    className={`h-10 w-full rounded border px-3 ${readOnly ? "bg-gray-100" : ""}`} />
);

const StatusBadge = ({ statusBayar }) => (
  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${statusBayar === "lunas" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
    <span className={`inline-block h-2 w-2 rounded-full ${statusBayar === "lunas" ? "bg-green-500" : "bg-amber-400"}`} />
    Status Pembayaran: <b className="uppercase">{statusBayar === "lunas" ? "Lunas" : "Panjar"}</b>
  </div>
);

function TabBtn({ value, activeTab, onTabChange, children }) {
  return (
    <button type="button" onClick={() => onTabChange(value)}
      className={`rounded-full border px-4 py-2 ${activeTab === value ? "border-orange-600 bg-orange-600 text-white" : "bg-white"}`}>
      {children}
    </button>
  );
}

function RowRX({ eye, rx, onChangeRx }) {
  const fields = ["SPH", "CYL", "AXIS", "PRISM", "BASE", "ADD", "MPD"];
  return (
    <tr className="border-t">
      <td className="px-3 py-2 font-semibold">{eye}</td>
      {fields.map(f => (
        <td key={f} className="px-2 py-2">
          <input type="number" step="0.25" className="h-10 w-full rounded border px-2"
            value={rx[eye][f]}
            onChange={e => onChangeRx(eye, f, e.target.value)} />
        </td>
      ))}
    </tr>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Create({ mode = "create", prefill = null }) {
  const { props } = usePage();
  const produkKacamata = props.produkKacamata || [];
  const produkLainnya  = props.produkLainnya  || [];
  const lensaStok      = props.lensaStok      || [];

  const isEdit = mode === "edit";

  const defaultForm = useMemo(() => ({
    type: "resep",
    kode_pasien: "", pasien: { id: null, nama: "", alamat: "", telepon: "" },
    tanggal_pesanan: "", tanggal_selesai: "",
    frame: "", lensa: "", lensa_id: "", produk_id: "",
    rx: {
      OD: { SPH: 0, CYL: 0, AXIS: 0, PRISM: 0, BASE: 0, ADD: 0, MPD: 0 },
      OS: { SPH: 0, CYL: 0, AXIS: 0, PRISM: 0, BASE: 0, ADD: 0, MPD: 0 },
    },
    harga: 0, panjar: 0, sisa: 0,
    metode_pembayaran_1: "Transfer", metode_pembayaran_2: "",
    jumlah_bayar_1: 0, jumlah_bayar_2: 0,
    exam_date: "",
    items: [{ nama: "", qty: 1, harga: 0 }],
    qty: 1,
    tanpa_pasien: false,
    _id: null, _kode: null,
  }), []);

  const initial = useMemo(() => {
    if (!prefill) return defaultForm;
    return {
      ...defaultForm, ...prefill,
      kode_pasien: prefill.pasien?.kode_pasien || "",
      pasien: { id: prefill.pasien?.id || null, nama: prefill.pasien?.nama_pasien || "", alamat: prefill.pasien?.alamat || "", telepon: prefill.pasien?.telepon || "" },
    };
  }, [prefill]);

  const { data, setData, post, put, processing, reset, errors } = useForm(initial);

  // Sisa otomatis
  useEffect(() => {
    const s = Number(data.harga || 0) - Number(data.panjar || 0);
    setData("sisa", s > 0 ? s : 0);
  }, [data.harga, data.panjar]);

  // Status pembayaran otomatis (display only)
  const statusBayar = Number(data.panjar) > 0 && Number(data.sisa) > 0 ? "panjar" : "lunas";

  /* ── Pasien autocomplete ────────────────────────────────────── */
  const [suggestions, setSuggestions] = useState([]);
  const [showSug,     setShowSug]     = useState(false);

  async function fetchByCode(kode) {
    try {
      const res = await fetch(route("api.patient.byCode", { kode }));
      if (!res.ok) return;
      const json = await res.json();
      if (json?.id) setData("pasien", { id: json.id, nama: json.nama_pasien || "", alamat: json.alamat || "", telepon: json.telepon || "" });
    } catch {}
  }

  useEffect(() => {
    const t = setTimeout(async () => {
      const term = data.kode_pasien?.trim();
      if (!term) { setSuggestions([]); return; }
      const res = await fetch(route("api.patient.search") + `?term=${encodeURIComponent(term)}`);
      if (res.ok) { setSuggestions(await res.json()); setShowSug(true); }
    }, 250);
    return () => clearTimeout(t);
  }, [data.kode_pasien]);

  /* ── Exam dates ─────────────────────────────────────────────── */
  const [examDates, setExamDates] = useState([]);
  useEffect(() => {
    if (!data.pasien?.id) { setExamDates([]); return; }
    fetch(route("api.patient.exams", { patient: data.pasien.id })).then(r => r.ok ? r.json() : []).then(list => setExamDates(list || [])).catch(() => {});
  }, [data.pasien?.id]);

  async function onPickExamDate(tgl) {
    setData("exam_date", tgl);
    if (!tgl || !data.pasien?.id) return;
    const res = await fetch(route("api.patient.exams", { patient: data.pasien.id }) + `?date=${encodeURIComponent(tgl)}`);
    if (!res.ok) return;
    const ex = await res.json();
    if (ex?.rx) setData("rx", ex.rx);
  }

  /* ── Tab ─────────────────────────────────────────────────────── */
  const [tab, setTab] = useState(() => data.type === "produk" ? "lain" : "resep");
  useEffect(() => setTab(data.type === "produk" ? "lain" : "resep"), [data.type]);
  function handleTabChange(value) {
    setTab(value);
    setData("type", value === "resep" ? "resep" : "produk");
  }

  /* ── Pickers ─────────────────────────────────────────────────── */
  const [showKacamataPicker, setShowKacamataPicker] = useState(false);
  const [showLainPicker,     setShowLainPicker]     = useState(false);
  const [showLensaPicker,    setShowLensaPicker]    = useState(false);

  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedLensa, setSelectedLensa] = useState(null);
  const [selectedProduk, setSelectedProduk] = useState(null);

  function onSelectFrame(p) {
    setSelectedFrame(p);
    setData("frame", p.nama_produk);
    setData("produk_id", p.id);
  }
  function onSelectLensa(l) {
    setSelectedLensa(l);
    setData("lensa", l.nama_lensa);
    setData("lensa_id", l.id_lensa);
  }
  function onSelectProduk(p) {
    setSelectedProduk(p);
    setData("produk_id", p.id);
    setData("harga", p.harga_produk);
  }

  /* ── Confirm + submit ────────────────────────────────────────── */
  const [openConfirm, setOpenConfirm] = useState(false);
  const totalHitung = Math.max(0, Number(data.harga || 0) - Number(data.panjar || 0));
  function doSubmit() {
    setOpenConfirm(false);
    if (isEdit) put(route("admin.transaksi.update", data._id), { preserveScroll: true });
    else        post(route("admin.transaksi.store"), { onSuccess: () => reset(defaultForm) });
  }

  /* ── RX handler ─────────────────────────────────────────────── */
  function handleRxChange(eye, field, value) {
    setData("rx", { ...data.rx, [eye]: { ...data.rx[eye], [field]: value } });
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-4">
        <Link href={route("admin.transaksi.index")} className="text-orange-700 hover:underline">← Kembali</Link>
      </div>

      <div className="mb-4 flex gap-3">
        <TabBtn value="resep" activeTab={tab} onTabChange={handleTabChange}>🕶 Kacamata</TabBtn>
        <TabBtn value="lain" activeTab={tab} onTabChange={handleTabChange}>📦 Produk Lainnya</TabBtn>
      </div>

      {/* ── KACAMATA TAB ─────────────────────────────────────────── */}
      {tab === "resep" && (
        <>
          <Section>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Pasien */}
              <Field label="Kode / Nama Pasien" required>
                <div className="relative">
                  <input value={data.kode_pasien}
                    onChange={e => { setData("kode_pasien", e.target.value); if (e.target.value) fetchByCode(e.target.value); }}
                    onFocus={() => setShowSug(true)}
                    placeholder="Ketik Kode / Nama Pasien"
                    className="h-10 w-full rounded border px-3" />
                  {showSug && suggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white shadow max-h-60 overflow-auto">
                      {suggestions.map(p => (
                        <button key={p.id} type="button" className="w-full px-3 py-2 text-left hover:bg-orange-50"
                          onClick={() => { setData("kode_pasien", p.kode_pasien); fetchByCode(p.kode_pasien); setShowSug(false); }}>
                          <b>{p.kode_pasien}</b> — {p.nama_pasien}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.kode_pasien && <div className="mt-1 text-sm text-red-600">{errors.kode_pasien}</div>}
              </Field>
              <Field label="Nama Pasien">
                <input value={data.pasien.nama} readOnly className="h-10 w-full rounded border bg-gray-100 px-3" />
              </Field>
              <Field label="No. HP">
                <input value={data.pasien.telepon || ""} readOnly className="h-10 w-full rounded border bg-gray-100 px-3" />
              </Field>
              <Field label="Alamat">
                <input value={data.pasien.alamat || ""} readOnly className="h-10 w-full rounded border bg-gray-100 px-3" />
              </Field>
              <Field label="Tanggal Pesanan" required>
                <input type="date" value={data.tanggal_pesanan} onChange={e => setData("tanggal_pesanan", e.target.value)} className="h-10 w-full rounded border px-3" />
              </Field>
              <Field label="Tanggal Selesai">
                <input type="date" value={data.tanggal_selesai} onChange={e => setData("tanggal_selesai", e.target.value)} className="h-10 w-full rounded border px-3" />
              </Field>
            </div>
          </Section>

          {/* Frame dari stok */}
          <Section title="Frame Kacamata">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-sm text-gray-600">Frame (ketik manual)</label>
                <input value={data.frame} onChange={e => setData("frame", e.target.value)}
                  className="h-10 w-full rounded border px-3" placeholder="Contoh: Ray-Ban RB3025" />
              </div>
              <button type="button" onClick={() => setShowKacamataPicker(true)}
                className="flex h-10 items-center gap-2 rounded-lg border border-orange-400 bg-orange-50 px-4 text-sm font-semibold text-orange-700 hover:bg-orange-100">
                🕶 Pilih dari Stok
              </button>
            </div>
            {selectedFrame && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm">
                <span className="font-semibold text-orange-800">{selectedFrame.nama_produk}</span>
                <span className="text-gray-500">Rp {fmtIDR(selectedFrame.harga_produk)}</span>
                <span className="text-gray-400">Stok: {selectedFrame.stok}</span>
                <button type="button" onClick={() => { setSelectedFrame(null); setData("produk_id", ""); setData("frame", ""); }}
                  className="ml-auto text-gray-400 hover:text-gray-700">✕</button>
              </div>
            )}
          </Section>

          {/* Lensa dari stok */}
          <Section title="Lensa">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-sm text-gray-600">Lensa (ketik manual)</label>
                <input value={data.lensa} onChange={e => setData("lensa", e.target.value)}
                  className="h-10 w-full rounded border px-3" placeholder="Contoh: CRMC Bluray 1.67" />
              </div>
              <button type="button" onClick={() => setShowLensaPicker(true)}
                className="flex h-10 items-center gap-2 rounded-lg border border-violet-400 bg-violet-50 px-4 text-sm font-semibold text-violet-700 hover:bg-violet-100">
                🔍 Pilih Lensa Stok
              </button>
            </div>
            {selectedLensa && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm">
                <span className="font-semibold text-violet-800">{selectedLensa.nama_lensa}</span>
                {selectedLensa.is_pesanan && <span className="rounded-full bg-blue-100 px-1.5 text-[10px] font-bold text-blue-700">PESAN</span>}
                <span className="text-gray-500">{selectedLensa.jenis_lensa}</span>
                <span className="text-gray-400">Stok: {selectedLensa.stok}</span>
                <button type="button" onClick={() => { setSelectedLensa(null); setData("lensa_id", ""); setData("lensa", ""); }}
                  className="ml-auto text-gray-400 hover:text-gray-700">✕</button>
              </div>
            )}
          </Section>

          {/* Auto isi RX */}
          <Section title="Auto isi dari pemeriksaan pasien">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Tanggal Pemeriksaan">
                <select value={data.exam_date} onChange={e => onPickExamDate(e.target.value)}
                  className="h-10 w-full rounded border px-3" disabled={!data.pasien?.id}>
                  <option value="">Pilih tanggal</option>
                  {examDates.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* RX tabel */}
          <Section>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-violet-50">
                  <tr>
                    <th className="px-3 py-2 text-left">RX</th>
                    {["SPH","CYL","AXIS","PRISM","BASE","ADD","MPD"].map(h => <th key={h} className="px-2 py-2 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <RowRX eye="OD" rx={data.rx} onChangeRx={handleRxChange} />
                  <RowRX eye="OS" rx={data.rx} onChangeRx={handleRxChange} />
                </tbody>
              </table>
            </div>
          </Section>

          {/* Pembayaran */}
          <Section title="Pembayaran">
            <div className="mb-3"><StatusBadge statusBayar={statusBayar} /></div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Harga Total" required>
                <MoneyInput value={data.harga} onChange={v => setData("harga", v)} />
                {errors.harga && <div className="mt-1 text-sm text-red-600">{errors.harga}</div>}
              </Field>
              <Field label="Panjar" required>
                <MoneyInput value={data.panjar} onChange={v => setData("panjar", v)} />
              </Field>
              <Field label="Sisa">
                <MoneyInput value={data.sisa} onChange={() => {}} readOnly />
              </Field>
              <Field label={data.panjar > 0 ? "Metode Bayar 1 (Panjar)" : "Metode Pembayaran"} required>
                <select value={data.metode_pembayaran_1} onChange={e => setData("metode_pembayaran_1", e.target.value)} className="h-10 w-full rounded border px-3">
                  {["Transfer","QRIS","Cash","Kartu Debit/Kredit"].map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
              {data.panjar > 0 && <Field label="Jumlah Bayar 1 (Panjar)">
                <MoneyInput value={data.jumlah_bayar_1} onChange={v => setData("jumlah_bayar_1", v)} />
              </Field>}
              {data.panjar > 0 && data.sisa > 0 && (
                <>
                  <Field label="Metode Bayar 2 (Pelunasan)">
                    <select value={data.metode_pembayaran_2} onChange={e => setData("metode_pembayaran_2", e.target.value)} className="h-10 w-full rounded border px-3">
                      <option value="">-- Pilih Saat Pelunasan --</option>
                      {["Transfer","QRIS","Cash","Kartu Debit/Kredit"].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                  <Field label="Jumlah Bayar 2 (Pelunasan)">
                    <MoneyInput value={data.jumlah_bayar_2} onChange={v => setData("jumlah_bayar_2", v)} />
                  </Field>
                </>
              )}
            </div>
          </Section>
        </>
      )}

      {/* ── PRODUK LAINNYA TAB ───────────────────────────────────── */}
      {tab === "lain" && (
        <Section>
          {/* Pasien (opsional) */}
          <div className="mb-3 flex items-center gap-3">
            <input id="tp" type="checkbox" checked={data.tanpa_pasien} onChange={e => setData("tanpa_pasien", e.target.checked)} />
            <label htmlFor="tp" className="text-sm">Transaksi tanpa pasien</label>
          </div>
          {!data.tanpa_pasien && (
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Kode Pasien">
                <input value={data.kode_pasien} onChange={e => { setData("kode_pasien", e.target.value); fetchByCode(e.target.value); }}
                  className="h-10 w-full rounded border px-3" placeholder="Ketik Kode Pasien" />
              </Field>
              <Field label="Nama Pasien">
                <input value={data.pasien.nama} readOnly className="h-10 w-full rounded border bg-gray-100 px-3" />
              </Field>
              <Field label="No. HP">
                <input value={data.pasien.telepon || ""} readOnly className="h-10 w-full rounded border bg-gray-100 px-3" />
              </Field>
            </div>
          )}

          {/* Produk dari stok */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-700">Produk dari Stok</p>
              <button type="button" onClick={() => setShowLainPicker(true)}
                className="flex items-center gap-2 rounded-lg border border-sky-400 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100">
                📦 Pilih Produk
              </button>
            </div>
            {selectedProduk ? (
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
                  {selectedProduk.gambar_url
                    ? <img src={selectedProduk.gambar_url} alt={selectedProduk.nama_produk} className="h-full w-full object-cover" />
                    : <span className="text-xl">📦</span>}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{selectedProduk.nama_produk}</div>
                  <div className="text-sm text-gray-500">Rp {fmtIDR(selectedProduk.harga_produk)} · Stok: {selectedProduk.stok}</div>
                </div>
                <label className="text-sm text-gray-600">Qty:
                  <input type="number" min="1" max={selectedProduk.stok}
                    value={data.qty} onChange={e => { setData("qty", parseInt(e.target.value) || 1); setData("harga", (parseInt(e.target.value) || 1) * selectedProduk.harga_produk); }}
                    className="ml-2 h-9 w-20 rounded border px-2 text-center" />
                </label>
                <button type="button" onClick={() => { setSelectedProduk(null); setData("produk_id", ""); setData("harga", 0); setData("qty", 1); }}
                  className="text-gray-400 hover:text-gray-700">✕</button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400">Belum ada produk dipilih — atau isi item manual di bawah.</p>
            )}
          </div>

          {/* Item manual (free-form) */}
          <div className="overflow-x-auto">
            <table className="w-full rounded border text-sm">
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
                        <input className="h-10 w-full rounded border px-2" value={it.nama}
                          onChange={e => { const items = [...data.items]; items[idx].nama = e.target.value; setData("items", items); }}
                          placeholder="Soflen / Pembersih / dll" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="1" className="h-10 w-20 rounded border px-2" value={it.qty}
                          onChange={e => { const items = [...data.items]; items[idx].qty = e.target.value === '' ? '' : parseInt(e.target.value, 10) || 1; setData("items", items); }} />
                      </td>
                      <td className="px-2 py-2">
                        <MoneyInput value={it.harga}
                          onChange={v => { const items = [...data.items]; items[idx].harga = v; setData("items", items); }} />
                      </td>
                      <td className="px-2 py-2 text-right">{subtotal.toLocaleString("id-ID")}</td>
                      <td className="px-2 py-2 text-right">
                        <button type="button" className="rounded bg-rose-100 px-2 py-1 text-rose-700"
                          onClick={() => { const items = data.items.filter((_, i) => i !== idx); setData("items", items.length ? items : [{ nama: "", qty: 1, harga: 0 }]); }}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3">
              <button type="button" className="rounded bg-gray-900 px-3 py-2 text-white"
                onClick={() => setData("items", [...data.items, { nama: "", qty: 1, harga: 0 }])}>
                + Tambah Item
              </button>
            </div>
          </div>

          {/* Pembayaran produk */}
          <div className="mt-4">
            <div className="mb-3"><StatusBadge statusBayar={statusBayar} /></div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Tanggal Transaksi" required>
                <input type="date" value={data.tanggal_pesanan} onChange={e => setData("tanggal_pesanan", e.target.value)} className="h-10 w-full rounded border px-3" />
              </Field>
              <Field label="Harga Total" required>
                <MoneyInput value={data.harga} onChange={v => setData("harga", v)} />
              </Field>
              <Field label="Panjar">
                <MoneyInput value={data.panjar} onChange={v => setData("panjar", v)} />
              </Field>
              <Field label="Sisa">
                <MoneyInput value={data.sisa} onChange={() => {}} readOnly />
              </Field>
              <Field label="Metode Pembayaran" required>
                <select value={data.metode_pembayaran_1} onChange={e => setData("metode_pembayaran_1", e.target.value)} className="h-10 w-full rounded border px-3">
                  {["Transfer","QRIS","Cash","Kartu Debit/Kredit"].map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
              {data.panjar > 0 && data.sisa > 0 && (
                <Field label="Metode Bayar 2">
                  <select value={data.metode_pembayaran_2} onChange={e => setData("metode_pembayaran_2", e.target.value)} className="h-10 w-full rounded border px-3">
                    <option value="">-- Pilih Saat Pelunasan --</option>
                    {["Transfer","QRIS","Cash","Kartu Debit/Kredit"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </Field>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Link href={route("admin.transaksi.index")} className="flex h-10 items-center rounded-lg border px-4 text-sm">Cancel</Link>
        <button onClick={() => setOpenConfirm(true)} disabled={processing}
          className="h-10 rounded-lg bg-orange-600 px-5 text-white font-semibold">
          {isEdit ? "Simpan Perubahan" : "Simpan Transaksi"}
        </button>
      </div>

      {/* Confirm modal */}
      <Modal open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <div className="mb-4 text-lg font-bold text-gray-800">Konfirmasi Transaksi</div>
        <div className="mb-4 space-y-2 text-sm">
          {data.pasien?.nama && <div className="flex justify-between"><span className="text-gray-500">Pasien</span><b>{data.pasien.nama}</b></div>}
          <div className="flex justify-between"><span className="text-gray-500">Harga</span><b>Rp {fmtIDR(data.harga)}</b></div>
          <div className="flex justify-between"><span className="text-gray-500">Panjar</span><b>Rp {fmtIDR(data.panjar)}</b></div>
          <div className="flex items-center justify-between border-t pt-2 text-base">
            <span>Sisa</span><b>Rp {fmtIDR(data.sisa)}</b>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <b className={statusBayar === "lunas" ? "text-green-700" : "text-amber-700"}>
              {statusBayar === "lunas" ? "LUNAS" : "PANJAR"}
            </b>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setOpenConfirm(false)} className="h-10 rounded-lg border px-4 text-sm">Kembali</button>
          <button onClick={doSubmit} className="h-10 rounded-lg bg-orange-600 px-5 text-white font-semibold">Simpan</button>
        </div>
      </Modal>

      {/* Pickers */}
      <ProdukPicker open={showKacamataPicker} onClose={() => setShowKacamataPicker(false)}
        list={produkKacamata} title="Pilih Frame Kacamata" onSelect={onSelectFrame} />
      <ProdukPicker open={showLainPicker} onClose={() => setShowLainPicker(false)}
        list={produkLainnya} title="Pilih Produk" onSelect={onSelectProduk} />
      <LensaPicker open={showLensaPicker} onClose={() => setShowLensaPicker(false)}
        list={lensaStok} onSelect={onSelectLensa} />
    </div>
  );
}

Create.layout = (page) => <SidebarLayout title="Transaksi Baru">{page}</SidebarLayout>;
