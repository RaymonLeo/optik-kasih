// appV1.0 Rev 5 - Tampilkan ringkasan error validasi di atas form; try-catch log di controller.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useForm, usePage } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";

/* ── Range helpers ──────────────────────────────────────────────────────── */
const rangeInt  = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const rangeStep = (from, to, step) => {
    const out = [];
    for (let v = from; v <= to + 1e-9; v += step) out.push(Number(v.toFixed(2)));
    return out;
};
const fmtSigned = (n) => (n > 0 ? `+${n.toFixed(2)}` : n < 0 ? n.toFixed(2) : '0.00');
const today     = () => new Date().toISOString().split('T')[0];

const NUMERIC_RE = /^[+-]?\d*\.?\d*$/;

/* ── ComboboxSelect (SPH / CYL) — Portal dropdown, live numeric search ─── */
function ComboboxSelect({ value, onChange, options, placeholder = '—' }) {
    const [query, setQuery] = useState('');
    const [open,  setOpen]  = useState(false);
    const [pos,   setPos]   = useState({ top: 0, left: 0, width: 160 });
    const inputRef    = useRef(null);
    const dropdownRef = useRef(null);

    const activeLabel = useMemo(() => {
        if (value === '' || value == null) return '';
        const opt = options.find((o) => String(o.value) === String(value));
        return opt ? opt.label : String(value);
    }, [value, options]);

    const filtered = useMemo(() => {
        const q = query.trim();
        if (!q) return options;
        const absQ = q.replace(/^[+-]/, '');
        if (!absQ) return options;
        if (q.startsWith('-') || q.startsWith('+')) {
            const sign = q[0];
            return options.filter((o) => {
                const absLabel = o.label.replace(/^[+-]/, '');
                return o.label.startsWith(sign) && absLabel.startsWith(absQ);
            });
        }
        return options.filter((o) => o.label.replace(/^[+-]/, '').startsWith(absQ));
    }, [query, options]);

    const calcPos = () => {
        if (!inputRef.current) return;
        const r = inputRef.current.getBoundingClientRect();
        setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: Math.max(r.width, 160) });
    };

    useEffect(() => {
        const handler = (e) => {
            const inInput = inputRef.current    && inputRef.current.contains(e.target);
            const inDrop  = dropdownRef.current && dropdownRef.current.contains(e.target);
            if (!inInput && !inDrop) { setOpen(false); setQuery(''); }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (opt) => { onChange(opt.value); setQuery(''); setOpen(false); };

    const dropdown = open && filtered.length > 0 && createPortal(
        <div ref={dropdownRef}
            style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
            className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl">
            {filtered.map((opt) => (
                <button key={opt.value} type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-orange-50 ${
                        String(opt.value) === String(value) ? 'bg-orange-100 font-bold text-orange-700' : 'text-slate-800'
                    }`}>
                    {opt.label}
                </button>
            ))}
        </div>,
        document.body,
    );

    return (
        <div className="relative w-full">
            <input ref={inputRef} type="text" inputMode="decimal"
                value={open ? query : activeLabel}
                placeholder={placeholder}
                onChange={(e) => {
                    const raw = e.target.value;
                    if (raw !== '' && !NUMERIC_RE.test(raw)) return;
                    setQuery(raw); setOpen(true);
                }}
                onFocus={() => { calcPos(); setOpen(true); setQuery(''); }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
                    const allowed = /^[0-9.\-+]$/.test(e.key) || ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'].includes(e.key);
                    if (!allowed) e.preventDefault();
                }}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition"
                autoComplete="off" />
            {dropdown}
        </div>
    );
}

/* ── SimpleSelect (AXIS / ADD / PRISM / BASE) ───────────────────────────── */
function SimpleSelect({ value, onChange, options, placeholder = '—' }) {
    return (
        <select value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition bg-white">
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}

/* ── Field wrapper ──────────────────────────────────────────────────────── */
function Field({ label, children, error, hint }) {
    return (
        <label className="block">
            <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
            {children}
            {hint  && <div className="mt-1 text-xs text-gray-400">{hint}</div>}
            {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
        </label>
    );
}

function Section({ title, children }) {
    return (
        <div className="mb-4 rounded-xl border bg-white p-5">
            {title && <div className="mb-4 border-b pb-2 font-semibold text-gray-700">{title}</div>}
            {children}
        </div>
    );
}

const inputCls = "h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition";

function fmtPower(val) {
    const n = parseFloat(val);
    if (isNaN(n)) return null;
    return (n >= 0 ? '+' : '') + n.toFixed(2);
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function Create({ mode = "create", prefill = null }) {
    const { props } = usePage();
    const isEdit = mode === "edit";

    const admins          = props.admins          || [];
    const existingNama    = props.existingNama    || [];
    const existingJenis   = props.existingJenis   || [];
    const existingCoating = props.existingCoating || [];
    const routeBase       = props.routeBase       || 'admin.lensa';
    const backRoute       = props.backRoute       || 'admin.lensa.index';

    /* ── Options (memoized) ─────────────────────────────────────────────── */
    const sphCylOptions = useMemo(
        () => rangeStep(-30, 30, 0.25).map((n) => ({ value: n.toFixed(2), label: fmtSigned(n) })),
        [],
    );
    const axisOptions = useMemo(
        () => rangeInt(0, 180).map((n) => ({ value: String(n), label: String(n) })),
        [],
    );
    const addOptions = useMemo(
        () => rangeStep(0, 4, 0.25).map((n) => ({ value: n.toFixed(2), label: fmtSigned(n) })),
        [],
    );
    const prismOptions = useMemo(
        () => rangeStep(0, 10, 0.5).map((n) => ({ value: n.toFixed(2), label: n.toFixed(2) })),
        [],
    );
    const baseOptions = useMemo(() => [
        { value: 'IN',   label: 'In'   },
        { value: 'OUT',  label: 'Out'  },
        { value: 'UP',   label: 'Up'   },
        { value: 'DOWN', label: 'Down' },
    ], []);

    /* ── Form state ─────────────────────────────────────────────────────── */
    const { data, setData, post, put, processing, errors } = useForm(prefill ? {
        admin_id:       prefill.admin_id      ?? '',
        nama_lensa:     prefill.nama_lensa    || '',
        jenis_lensa:    prefill.jenis_lensa   || '',
        coating_lensa:  prefill.coating_lensa || '',
        indeks_lensa:   prefill.indeks_lensa  ?? '',
        stok_lensa:     prefill.stok_lensa    ?? 0,
        tanggal_masuk:  prefill.tanggal_masuk || today(),
        deskripsi:      prefill.deskripsi     || '',
        gambar_lensa:   null,
        sph_lensa:   prefill.sph_lensa   ?? '',
        cyl_lensa:   prefill.cyl_lensa   ?? '',
        axis_lensa:  prefill.axis_lensa  ?? '',
        add_lensa:   prefill.add_lensa   ?? '',
        prism_lensa: prefill.prism_lensa ?? '',
        base_lensa:  prefill.base_lensa  ?? '',
    } : {
        admin_id: '', nama_lensa: '', jenis_lensa: '', coating_lensa: '',
        indeks_lensa: '', stok_lensa: 0, tanggal_masuk: today(), deskripsi: '',
        gambar_lensa: null,
        sph_lensa: '', cyl_lensa: '', axis_lensa: '', add_lensa: '',
        prism_lensa: '', base_lensa: '',
    });

    const [preview,      setPreview]      = useState(prefill?.gambar_url || null);
    const [showAdvanced, setShowAdvanced] = useState(
        !!(prefill?.prism_lensa || prefill?.base_lensa)
    );

    const isProgressive = useMemo(() => {
        const j = (data.jenis_lensa || '').toLowerCase();
        return j.includes('progres') || j.includes('bifocal') || j.includes('bifokal') || j.includes('multifokal');
    }, [data.jenis_lensa]);

    const nearPower = useMemo(() => {
        if (!data.sph_lensa || !data.add_lensa) return null;
        const near = parseFloat(data.sph_lensa) + parseFloat(data.add_lensa);
        return isNaN(near) ? null : fmtPower(near);
    }, [data.sph_lensa, data.add_lensa]);

    function handleFile(e) {
        const file = e.target.files?.[0] || null;
        setData('gambar_lensa', file);
        setPreview(file ? URL.createObjectURL(file) : (prefill?.gambar_url || null));
    }

    function submit() {
        const opts = { forceFormData: true, preserveScroll: true };
        if (isEdit) put(route(`${routeBase}.update`, prefill.id_lensa), opts);
        else        post(route(`${routeBase}.store`), opts);
    }

    /* ── Render ─────────────────────────────────────────────────────────── */
    return (
        <SidebarLayout title={isEdit ? "Edit Lensa" : "Tambah Lensa"}>
            <div className="mx-auto max-w-4xl">
                <div className="mb-5 flex items-center gap-3">
                    <Link href={route(backRoute)} className="rounded-lg border px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50">
                        ← Kembali
                    </Link>
                    <h1 className="text-2xl font-extrabold text-orange-500">
                        {isEdit ? "Edit Lensa" : "Tambah Lensa"}
                    </h1>
                </div>

                {/* Ringkasan error validasi */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm font-semibold text-red-800">Terdapat kesalahan — periksa field berikut:</p>
                        <ul className="mt-1 list-inside list-disc text-sm text-red-700">
                            {Object.entries(errors).map(([k, v]) => (
                                <li key={k}><b>{k.replace(/_/g, ' ')}</b>: {v}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Cabang — hanya superadmin */}
                {admins.length > 0 && (
                    <Section title="Cabang Toko">
                        <Field label="Pilih Cabang" error={errors.admin_id}>
                            <select value={data.admin_id} onChange={(e) => setData('admin_id', e.target.value)} className={inputCls} required>
                                <option value="">— Pilih cabang terlebih dahulu —</option>
                                {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </Field>
                    </Section>
                )}

                {/* Informasi Umum */}
                <Section title="Informasi Umum">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                        {/* Nama Lensa — dropdown dari data yang sudah pernah diinput */}
                        <Field label="Nama Lensa" error={errors.nama_lensa}>
                            <input list="nama-list" className={inputCls} value={data.nama_lensa}
                                onChange={(e) => setData('nama_lensa', e.target.value)}
                                placeholder="Misal: Essilor Crizal A4"
                                autoComplete="off" />
                            <datalist id="nama-list">
                                {existingNama.map((n) => <option key={n} value={n} />)}
                            </datalist>
                        </Field>

                        {/* Jenis Lensa */}
                        <Field label="Jenis Lensa" error={errors.jenis_lensa}>
                            <input list="jenis-list" className={inputCls} value={data.jenis_lensa}
                                onChange={(e) => setData('jenis_lensa', e.target.value)}
                                placeholder="Single Vision, Progressive…"
                                autoComplete="off" />
                            <datalist id="jenis-list">
                                {existingJenis.map((j) => <option key={j} value={j} />)}
                            </datalist>
                        </Field>

                        {/* Coating */}
                        <Field label="Coating" error={errors.coating_lensa}>
                            <input list="coating-list" className={inputCls} value={data.coating_lensa}
                                onChange={(e) => setData('coating_lensa', e.target.value)}
                                placeholder="Anti-Reflektif, Blue Ray…"
                                autoComplete="off" />
                            <datalist id="coating-list">
                                {existingCoating.map((c) => <option key={c} value={c} />)}
                            </datalist>
                        </Field>

                        <Field label="Indeks Lensa" error={errors.indeks_lensa} hint="Pilih atau ketik indeks bahan lensa">
                            <input list="indeks-list" className={inputCls} value={data.indeks_lensa}
                                onChange={(e) => setData('indeks_lensa', e.target.value)}
                                placeholder="1.60" autoComplete="off" />
                            <datalist id="indeks-list">
                                <option value="1.50">1.50 — CR-39 (standar, ringan)</option>
                                <option value="1.53">1.53 — Trivex (tipis, ringan)</option>
                                <option value="1.56">1.56 — Mid-index</option>
                                <option value="1.59">1.59 — Polikarbonat (tahan benturan)</option>
                                <option value="1.60">1.60 — Mid-high index</option>
                                <option value="1.67">1.67 — High index (tipis)</option>
                                <option value="1.70">1.70 — High index</option>
                                <option value="1.74">1.74 — Ultra-high index (sangat tipis)</option>
                                <option value="1.76">1.76 — Ultra-high index</option>
                            </datalist>
                        </Field>

                        <Field label="Stok" error={errors.stok_lensa}>
                            <input type="number" min="0" step="1" inputMode="numeric" className={inputCls}
                                value={data.stok_lensa}
                                onChange={(e) => setData('stok_lensa', e.target.value)} />
                        </Field>

                        <Field label="Tanggal Masuk" error={errors.tanggal_masuk}>
                            <input type="date" className={inputCls} value={data.tanggal_masuk}
                                onChange={(e) => setData('tanggal_masuk', e.target.value)} />
                        </Field>

                        <div className="lg:col-span-2">
                            <Field label="Deskripsi (opsional)" error={errors.deskripsi}>
                                <textarea className="min-h-20 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Keunggulan, spesifikasi tambahan produk lensa." />
                            </Field>
                        </div>

                        <Field label="Gambar Lensa (opsional)" error={errors.gambar_lensa}>
                            <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
                            {preview && (
                                <div className="mt-2 h-28 w-28 overflow-hidden rounded-lg border bg-gray-50">
                                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}
                        </Field>
                    </div>
                </Section>

                {/* Ukuran / Spesifikasi Lensa */}
                <Section title="Ukuran / Spesifikasi Lensa">

                    {/* Callout progressive/bifocal */}
                    {isProgressive ? (
                        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                            <div className="mb-1 font-semibold text-blue-800 text-sm">
                                Lensa {data.jenis_lensa} — 2 Zona Kekuatan
                            </div>
                            <div className="space-y-0.5 text-xs text-blue-700">
                                <div>• <b>Zone Atas (Jauh)</b> = SPH &rarr; <b className="text-blue-900">{fmtPower(data.sph_lensa) ?? '—'}</b></div>
                                <div>• <b>Zone Bawah (Dekat)</b> = SPH + ADD &rarr; <b className="text-blue-900">{nearPower ?? '—'}</b></div>
                            </div>
                        </div>
                    ) : (
                        <p className="mb-4 text-xs text-gray-400">
                            Ukuran lensa stok — tanpa kanan/kiri. Ketik angka di SPH/CYL untuk pencarian cepat.
                        </p>
                    )}

                    {/* Hint cara pakai ComboboxSelect */}
                    <p className="mb-3 text-xs text-slate-500">
                        Kolom <strong>SPH</strong> dan <strong>CYL</strong>: ketik angka (mis. <em>-1.75</em>) untuk pencarian langsung.
                    </p>

                    {/* SPH · CYL · AXIS · ADD dalam tabel seperti HealthForm */}
                    <div className="overflow-x-auto rounded-xl border bg-gray-50">
                        <table className="min-w-full text-sm">
                            <thead className="bg-orange-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-2.5 text-left font-semibold">SPH</th>
                                    <th className="px-4 py-2.5 text-left font-semibold">CYL</th>
                                    <th className="px-4 py-2.5 text-left font-semibold">AXIS</th>
                                    <th className="px-4 py-2.5 text-left font-semibold">
                                        {isProgressive ? 'ADD ★' : 'ADD'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t bg-white">
                                    <td className="px-4 py-3 min-w-[160px]">
                                        <ComboboxSelect value={data.sph_lensa} onChange={(v) => setData('sph_lensa', v)}
                                            options={sphCylOptions} placeholder="0.00" />
                                        {errors.sph_lensa && <p className="mt-1 text-xs text-red-600">{errors.sph_lensa}</p>}
                                    </td>
                                    <td className="px-4 py-3 min-w-[160px]">
                                        <ComboboxSelect value={data.cyl_lensa} onChange={(v) => setData('cyl_lensa', v)}
                                            options={sphCylOptions} placeholder="0.00" />
                                        {errors.cyl_lensa && <p className="mt-1 text-xs text-red-600">{errors.cyl_lensa}</p>}
                                    </td>
                                    <td className="px-4 py-3 min-w-[140px]">
                                        <SimpleSelect value={data.axis_lensa} onChange={(v) => setData('axis_lensa', v)}
                                            options={axisOptions} placeholder="0–180" />
                                        {errors.axis_lensa && <p className="mt-1 text-xs text-red-600">{errors.axis_lensa}</p>}
                                    </td>
                                    <td className="px-4 py-3 min-w-[140px]">
                                        <SimpleSelect
                                            value={data.add_lensa} onChange={(v) => setData('add_lensa', v)}
                                            options={addOptions} placeholder="+0.00" />
                                        {errors.add_lensa && <p className="mt-1 text-xs text-red-600">{errors.add_lensa}</p>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Hint ADD jika progressive */}
                    {isProgressive && (
                        <p className="mt-2 text-xs text-blue-600">
                            ★ ADD wajib diisi untuk lensa progressive/bifocal.
                        </p>
                    )}

                    {/* PRISM & BASE — expandable */}
                    <div className="mt-4">
                        <button type="button" onClick={() => setShowAdvanced((v) => !v)}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition">
                            <span className="text-base leading-none">{showAdvanced ? '▾' : '▸'}</span>
                            PRISM &amp; BASE (sangat jarang — opsional)
                        </button>

                        {showAdvanced && (
                            <div className="mt-3 overflow-x-auto rounded-xl border bg-gray-50">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-semibold">PRISM</th>
                                            <th className="px-4 py-2 text-left font-semibold">BASE (Arah)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t bg-white">
                                            <td className="px-4 py-3 min-w-[160px]">
                                                <SimpleSelect value={data.prism_lensa} onChange={(v) => setData('prism_lensa', v)}
                                                    options={prismOptions} placeholder="0.0 Δ" />
                                                {errors.prism_lensa && <p className="mt-1 text-xs text-red-600">{errors.prism_lensa}</p>}
                                            </td>
                                            <td className="px-4 py-3 min-w-[160px]">
                                                <SimpleSelect value={data.base_lensa} onChange={(v) => setData('base_lensa', v)}
                                                    options={baseOptions} placeholder="— arah —" />
                                                {errors.base_lensa && <p className="mt-1 text-xs text-red-600">{errors.base_lensa}</p>}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Section>

                <div className="flex items-center justify-end gap-3">
                    <Link href={route(backRoute)} className="flex h-10 items-center rounded-lg border px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Batal
                    </Link>
                    <button type="button" onClick={submit} disabled={processing}
                        className="h-10 rounded-lg bg-orange-600 px-6 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60 transition">
                        {processing ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Lensa"}
                    </button>
                </div>
            </div>
        </SidebarLayout>
    );
}
