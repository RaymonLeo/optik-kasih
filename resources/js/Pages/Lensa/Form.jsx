// resources/js/Pages/Lensa/Form.jsx
import React, { useMemo } from "react";
import { Link, useForm } from "@inertiajs/react";

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

export default function Form({ mode = "create", prefill = null, onSubmit }) {
  const isEdit = mode === "edit";

  const initial = useMemo(() => ({
    nama_lensa: prefill?.nama_lensa || "",
    jenis_lensa: prefill?.jenis_lensa || "",
    coating_lensa: prefill?.coating_lensa || "",
    indeks_lensa: prefill?.indeks_lensa ?? "",
    cyl_kanan: prefill?.cyl_kanan ?? "",
    axis_kanan: prefill?.axis_kanan ?? "",
    prism_kanan: prefill?.prism_kanan ?? "",
    base_kanan: prefill?.base_kanan ?? "",
    add_kanan: prefill?.add_kanan ?? "",
    sph_kiri: prefill?.sph_kiri ?? "",
    cyl_kiri: prefill?.cyl_kiri ?? "",
    axis_kiri: prefill?.axis_kiri ?? "",
    prism_kiri: prefill?.prism_kiri ?? "",
    base_kiri: prefill?.base_kiri ?? "",
  }), [prefill]);

  const { data, setData, processing, errors } = useForm(initial);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={route("lensa.index")} className="text-orange-600 font-semibold">← Kembali</Link>
        <h1 className="text-4xl font-extrabold text-orange-500">
          {isEdit ? "Edit Lensa" : "Tambah Lensa"}
        </h1>
      </div>

      <Section title="Informasi Umum">
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Nama Lensa">
            <input className="h-10 px-3 rounded border w-full"
              value={data.nama_lensa} onChange={(e)=>setData("nama_lensa", e.target.value)} />
            {errors.nama_lensa && <p className="text-red-600 text-sm mt-1">{errors.nama_lensa}</p>}
          </Field>
          <Field label="Jenis Lensa">
            <input className="h-10 px-3 rounded border w-full"
              value={data.jenis_lensa} onChange={(e)=>setData("jenis_lensa", e.target.value)} />
          </Field>
          <Field label="Coating">
            <input className="h-10 px-3 rounded border w-full"
              value={data.coating_lensa} onChange={(e)=>setData("coating_lensa", e.target.value)} />
          </Field>
          <Field label="Indeks Lensa">
            <input type="number" step="0.01" className="h-10 px-3 rounded border w-full"
              value={data.indeks_lensa} onChange={(e)=>setData("indeks_lensa", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Parameter Kanan">
        <div className="grid md:grid-cols-5 gap-4">
          <Field label="Cyl Kanan">
            <input type="number" step="0.25" className="h-10 px-3 rounded border w-full"
              value={data.cyl_kanan} onChange={(e)=>setData("cyl_kanan", e.target.value)} />
          </Field>
          <Field label="Axis Kanan">
            <input type="number" step="1" className="h-10 px-3 rounded border w-full"
              value={data.axis_kanan} onChange={(e)=>setData("axis_kanan", e.target.value)} />
          </Field>
          <Field label="Prism Kanan">
            <input type="number" step="0.5" className="h-10 px-3 rounded border w-full"
              value={data.prism_kanan} onChange={(e)=>setData("prism_kanan", e.target.value)} />
          </Field>
          <Field label="Base Kanan">
            <input type="number" step="1" className="h-10 px-3 rounded border w-full"
              value={data.base_kanan} onChange={(e)=>setData("base_kanan", e.target.value)} />
          </Field>
          <Field label="Add Kanan">
            <input type="number" step="0.25" className="h-10 px-3 rounded border w-full"
              value={data.add_kanan} onChange={(e)=>setData("add_kanan", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Parameter Kiri">
        <div className="grid md:grid-cols-5 gap-4">
          <Field label="SPH Kiri">
            <input type="number" step="0.25" className="h-10 px-3 rounded border w-full"
              value={data.sph_kiri} onChange={(e)=>setData("sph_kiri", e.target.value)} />
          </Field>
          <Field label="Cyl Kiri">
            <input type="number" step="0.25" className="h-10 px-3 rounded border w-full"
              value={data.cyl_kiri} onChange={(e)=>setData("cyl_kiri", e.target.value)} />
          </Field>
          <Field label="Axis Kiri">
            <input type="number" step="1" className="h-10 px-3 rounded border w-full"
              value={data.axis_kiri} onChange={(e)=>setData("axis_kiri", e.target.value)} />
          </Field>
          <Field label="Prism Kiri">
            <input type="number" step="0.5" className="h-10 px-3 rounded border w-full"
              value={data.prism_kiri} onChange={(e)=>setData("prism_kiri", e.target.value)} />
          </Field>
          <Field label="Base Kiri">
            <input type="number" step="1" className="h-10 px-3 rounded border w-full"
              value={data.base_kiri} onChange={(e)=>setData("base_kiri", e.target.value)} />
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 mt-6">
        <Link href={route("lensa.index")} className="h-10 px-4 rounded-lg border">Cancel</Link>
        <button onClick={() => onSubmit(data)} disabled={processing} className="h-10 px-4 rounded-lg bg-orange-600 text-white">
          {isEdit ? "Edit" : "Simpan"}
        </button>
      </div>
    </div>
  );
}
