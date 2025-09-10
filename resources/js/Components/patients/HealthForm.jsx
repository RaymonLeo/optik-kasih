// resources/js/Components/patients/HealthForm.jsx
import React, { useMemo } from 'react';

/* Util */
const fmtSigned = (n) => (n > 0 ? `+${n.toFixed(2)}` : n < 0 ? n.toFixed(2) : '0.00');

const rangeInt = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const rangeStep = (from, to, step) => {
  const out = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(Number(v.toFixed(2)));
  return out;
};

function Select({ value, onChange, options, placeholder = '—', className = '' }) {
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

export default function HealthForm({ value, onChange, error }) {
  const v = value || { tanggal_periksa: '', kanan: {}, kiri: {} };
  const setTanggal = (val) => onChange({ ...v, tanggal_periksa: val });
  const setSide = (side, field, val) => onChange({ ...v, [side]: { ...(v[side] || {}), [field]: val } });

  // === OPTIONS (memoized) ===
  // SPH/CYL: -30 .. +30 langkah 0.25 (ADA -1.25, -1.50, -1.75, lalu -2.00, dst)
  const sphCylOptions = useMemo(
    () => rangeStep(-30, 30, 0.25).map((n) => ({ value: n.toFixed(2), label: fmtSigned(n) })),
    []
  );

  // AXIS: 0..180
  const axisOptions = useMemo(
    () => rangeInt(0, 180).map((n) => ({ value: String(n), label: String(n) })),
    []
  );

  // PRISM: 0..10 langkah 0.5 (kalau mau negatif, ganti rangeStep(-10,10,0.5))
  const prismOptions = useMemo(
    () => rangeStep(0, 10, 0.5).map((n) => ({ value: n.toFixed(2), label: n.toFixed(2) })),
    []
  );

  // BASE
  const baseOptions = useMemo(
    () => ([
      { value: 'UP',   label: 'Up'   },
      { value: 'DOWN', label: 'Down' },
      { value: 'IN',   label: 'In'   },
      { value: 'OUT',  label: 'Out'  },
    ]),
    []
  );

  // ADD: 0.00 .. +4.00 (0.25 step)
  const addOptions = useMemo(
    () => rangeStep(0, 4, 0.25).map((n) => ({ value: n.toFixed(2), label: fmtSigned(n) })),
    []
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700">Tanggal Periksa:</label>
        <input
          type="date"
          value={v.tanggal_periksa || ''}
          onChange={(e) => setTanggal(e.target.value)}
          className="ml-2 rounded-lg border px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

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
            {/* OD / KANAN */}
            <tr className="border-t">
              <td className="px-3 py-2 font-semibold">OD</td>

              <td className="px-3 py-2">
                <Select value={v.kanan?.sph ?? ''}  onChange={(val) => setSide('kanan', 'sph', val)} options={sphCylOptions} placeholder="Pilih" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kanan?.cyl ?? ''}  onChange={(val) => setSide('kanan', 'cyl', val)} options={sphCylOptions} placeholder="Pilih" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kanan?.axis ?? ''} onChange={(val) => setSide('kanan', 'axis', val)} options={axisOptions} placeholder="0–180" className="w-24" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kanan?.prism ?? ''} onChange={(val) => setSide('kanan', 'prism', val)} options={prismOptions} placeholder="0.0" className="w-24" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kanan?.base ?? ''}  onChange={(val) => setSide('kanan', 'base', val)}  options={baseOptions} placeholder="—" className="w-24" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kanan?.add ?? ''}   onChange={(val) => setSide('kanan', 'add', val)}   options={addOptions} placeholder="+0.00" />
              </td>

              <td className="px-3 py-2">
                <Input value={v.kanan?.mpd ?? v.kanan?.pd ?? ''} onChange={(val) => setSide('kanan', 'mpd', val)} placeholder="mm" className="w-24" />
              </td>
            </tr>

            {/* OS / KIRI */}
            <tr className="border-t">
              <td className="px-3 py-2 font-semibold">OS</td>

              <td className="px-3 py-2">
                <Select value={v.kiri?.sph ?? ''}  onChange={(val) => setSide('kiri', 'sph', val)} options={sphCylOptions} placeholder="Pilih" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kiri?.cyl ?? ''}  onChange={(val) => setSide('kiri', 'cyl', val)} options={sphCylOptions} placeholder="Pilih" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kiri?.axis ?? ''} onChange={(val) => setSide('kiri', 'axis', val)} options={axisOptions} placeholder="0–180" className="w-24" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kiri?.prism ?? ''} onChange={(val) => setSide('kiri', 'prism', val)} options={prismOptions} placeholder="0.0" className="w-24" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kiri?.base ?? ''}  onChange={(val) => setSide('kiri', 'base', val)}  options={baseOptions} placeholder="—" className="w-24" />
              </td>

              <td className="px-3 py-2">
                <Select value={v.kiri?.add ?? ''}   onChange={(val) => setSide('kiri', 'add', val)}   options={addOptions} placeholder="+0.00" />
              </td>

              <td className="px-3 py-2">
                <Input value={v.kiri?.mpd ?? v.kiri?.pd ?? ''} onChange={(val) => setSide('kiri', 'mpd', val)} placeholder="mm" className="w-24" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
