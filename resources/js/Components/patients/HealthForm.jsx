// appV1.0 Rev 4 - Dropdown SPH/CYL pakai Portal agar tidak terpotong container overflow.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const today = () => new Date().toISOString().split('T')[0];

/* ── Range helpers ─────────────────────────────────────────────────────── */
const rangeInt = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const rangeStep = (from, to, step) => {
    const out = [];
    for (let v = from; v <= to + 1e-9; v += step) out.push(Number(v.toFixed(2)));
    return out;
};
const fmtSigned = (n) => (n > 0 ? `+${n.toFixed(2)}` : n < 0 ? n.toFixed(2) : '0.00');

/* ── ComboboxSelect ─────────────────────────────────────────────────────
 *  Kolom SPH/CYL dengan live-search berdasarkan angka mutlak (tanpa tanda).
 *  - Hanya menerima input numerik: angka, titik, minus, plus.
 *  - Ketik "1" → tampilkan -1.00 dan +1.00 sekaligus.
 *  - Dropdown dirender via Portal ke document.body agar tidak terpotong
 *    oleh container overflow-x-auto / overflow-hidden apapun.
 * ───────────────────────────────────────────────────────────────────── */

const NUMERIC_RE = /^[+-]?\d*\.?\d*$/;

function ComboboxSelect({ value, onChange, options, placeholder = '—', className = '' }) {
    const [query, setQuery] = useState('');
    const [open, setOpen]   = useState(false);
    const [pos, setPos]     = useState({ top: 0, left: 0, width: 144 });

    const inputRef    = useRef(null);
    const dropdownRef = useRef(null);

    // Label dari nilai aktif
    const activeLabel = useMemo(() => {
        if (!value && value !== 0) return '';
        const opt = options.find((o) => String(o.value) === String(value));
        return opt ? opt.label : String(value);
    }, [value, options]);

    // Filter berdasarkan nilai absolut (abaikan tanda +/-)
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

    // Hitung posisi dropdown dari posisi input di viewport
    const calcPos = () => {
        if (!inputRef.current) return;
        const r = inputRef.current.getBoundingClientRect();
        setPos({
            top:   r.bottom + window.scrollY + 4,
            left:  r.left   + window.scrollX,
            width: Math.max(r.width, 144),
        });
    };

    // Tutup saat klik di luar input DAN di luar dropdown portal
    useEffect(() => {
        const handler = (e) => {
            const inInput = inputRef.current    && inputRef.current.contains(e.target);
            const inDrop  = dropdownRef.current && dropdownRef.current.contains(e.target);
            if (!inInput && !inDrop) { setOpen(false); setQuery(''); }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (opt) => {
        onChange(opt.value);
        setQuery('');
        setOpen(false);
    };

    const handleChange = (e) => {
        const raw = e.target.value;
        if (raw !== '' && !NUMERIC_RE.test(raw)) return;
        setQuery(raw);
        setOpen(true);
    };

    const displayValue = open ? query : activeLabel;

    const dropdown = open && filtered.length > 0 && createPortal(
        <div
            ref={dropdownRef}
            style={{ position: 'absolute', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
            className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl"
        >
            {filtered.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-orange-50 ${
                        String(opt.value) === String(value)
                            ? 'bg-orange-100 font-bold text-orange-700'
                            : 'text-slate-800'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>,
        document.body,
    );

    return (
        <div className={`relative ${className}`}>
            <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={displayValue}
                placeholder={placeholder}
                onChange={handleChange}
                onFocus={() => { calcPos(); setOpen(true); setQuery(''); }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
                    const allowed = /^[0-9.\-+]$/.test(e.key) || [
                        'Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter',
                    ].includes(e.key);
                    if (!allowed) e.preventDefault();
                }}
                className="w-28 rounded-lg border px-2 py-1 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                autoComplete="off"
            />
            {dropdown}
        </div>
    );
}

/* ── Select biasa (AXIS, PRISM, BASE, ADD) ─────────────────────────── */
function SimpleSelect({ value, onChange, options, placeholder = '—', className = '' }) {
    return (
        <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            className={`w-28 rounded-lg border px-2 py-1 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 ${className}`}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}

function Input({ value, onChange, placeholder = '', className = '' }) {
    return (
        <input
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-28 rounded-lg border px-2 py-1 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200 ${className}`}
        />
    );
}

/* ── HealthForm ─────────────────────────────────────────────────────── */
export default function HealthForm({ value, onChange, error }) {
    const v = value || { tanggal_periksa: today(), kanan: {}, kiri: {} };
    const setTanggal = (val) => onChange({ ...v, tanggal_periksa: val });
    const setSide = (side, field, val) => onChange({ ...v, [side]: { ...(v[side] || {}), [field]: val } });

    /* Options (memoized) */
    const sphCylOptions = useMemo(
        () => rangeStep(-30, 30, 0.25).map((n) => ({ value: n.toFixed(2), label: fmtSigned(n) })),
        [],
    );
    const axisOptions = useMemo(
        () => rangeInt(0, 180).map((n) => ({ value: String(n), label: String(n) })),
        [],
    );
    const prismOptions = useMemo(
        () => rangeStep(0, 10, 0.5).map((n) => ({ value: n.toFixed(2), label: n.toFixed(2) })),
        [],
    );
    const baseOptions = useMemo(
        () => [
            { value: 'UP', label: 'Up' },
            { value: 'DOWN', label: 'Down' },
            { value: 'IN', label: 'In' },
            { value: 'OUT', label: 'Out' },
        ],
        [],
    );
    const addOptions = useMemo(
        () => rangeStep(0, 4, 0.25).map((n) => ({ value: n.toFixed(2), label: fmtSigned(n) })),
        [],
    );

    return (
        <div className="space-y-4">
            {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Tanggal Periksa:</label>
                <input
                    type="date"
                    value={v.tanggal_periksa || today()}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="rounded-lg border px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
            </div>

            <p className="text-xs text-slate-500">
                Untuk kolom <strong>SPH</strong> dan <strong>CYL</strong>: ketik angka (misal <em>-1.75</em>) untuk pencarian langsung.
            </p>

            <div className="overflow-x-auto rounded-xl border bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-violet-50 text-gray-700">
                        <tr>
                            <th className="px-3 py-2 text-left">RX</th>
                            <th className="px-3 py-2 text-left">SPH</th>
                            <th className="px-3 py-2 text-left">CYL</th>
                            <th className="px-3 py-2 text-left">AXIS</th>
                            <th className="px-3 py-2 text-left">PRISM</th>
                            <th className="px-3 py-2 text-left">BASE</th>
                            <th className="px-3 py-2 text-left">ADD</th>
                            <th className="px-3 py-2 text-left">MPD / PD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* OD */}
                        <tr className="border-t">
                            <td className="px-3 py-2 font-semibold">OD</td>
                            <td className="px-3 py-2"><ComboboxSelect value={v.kanan?.sph ?? ''} onChange={(val) => setSide('kanan', 'sph', val)} options={sphCylOptions} placeholder="0.00" /></td>
                            <td className="px-3 py-2"><ComboboxSelect value={v.kanan?.cyl ?? ''} onChange={(val) => setSide('kanan', 'cyl', val)} options={sphCylOptions} placeholder="0.00" /></td>
                            <td className="px-3 py-2"><SimpleSelect value={v.kanan?.axis ?? ''} onChange={(val) => setSide('kanan', 'axis', val)} options={axisOptions} placeholder="0–180" className="w-24" /></td>
                            <td className="px-3 py-2"><SimpleSelect value={v.kanan?.prism ?? ''} onChange={(val) => setSide('kanan', 'prism', val)} options={prismOptions} placeholder="0.0" className="w-24" /></td>
                            <td className="px-3 py-2"><SimpleSelect value={v.kanan?.base ?? ''} onChange={(val) => setSide('kanan', 'base', val)} options={baseOptions} placeholder="—" className="w-24" /></td>
                            <td className="px-3 py-2"><SimpleSelect value={v.kanan?.add ?? ''} onChange={(val) => setSide('kanan', 'add', val)} options={addOptions} placeholder="+0.00" /></td>
                            <td className="px-3 py-2"><Input value={v.kanan?.mpd ?? v.kanan?.pd ?? ''} onChange={(val) => setSide('kanan', 'mpd', val)} placeholder="mm" className="w-24" /></td>
                        </tr>
                        {/* OS */}
                        <tr className="border-t">
                            <td className="px-3 py-2 font-semibold">OS</td>
                            <td className="px-3 py-2"><ComboboxSelect value={v.kiri?.sph ?? ''} onChange={(val) => setSide('kiri', 'sph', val)} options={sphCylOptions} placeholder="0.00" /></td>
                            <td className="px-3 py-2"><ComboboxSelect value={v.kiri?.cyl ?? ''} onChange={(val) => setSide('kiri', 'cyl', val)} options={sphCylOptions} placeholder="0.00" /></td>
                            <td className="px-3 py-2"><SimpleSelect value={v.kiri?.axis ?? ''} onChange={(val) => setSide('kiri', 'axis', val)} options={axisOptions} placeholder="0–180" className="w-24" /></td>
                            <td className="px-3 py-2"><SimpleSelect value={v.kiri?.prism ?? ''} onChange={(val) => setSide('kiri', 'prism', val)} options={prismOptions} placeholder="0.0" className="w-24" /></td>
                            <td className="px-3 py-2"><SimpleSelect value={v.kiri?.base ?? ''} onChange={(val) => setSide('kiri', 'base', val)} options={baseOptions} placeholder="—" className="w-24" /></td>
                            <td className="px-3 py-2"><SimpleSelect value={v.kiri?.add ?? ''} onChange={(val) => setSide('kiri', 'add', val)} options={addOptions} placeholder="+0.00" /></td>
                            <td className="px-3 py-2"><Input value={v.kiri?.mpd ?? v.kiri?.pd ?? ''} onChange={(val) => setSide('kiri', 'mpd', val)} placeholder="mm" className="w-24" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
