import React, { useMemo, useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import SidebarLayout from "@/Components/SidebarLayout";

function Field({ label, children, error }) {
  return (
    <label className="block">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      {children}
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </label>
  );
}
function Section({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-4 mb-4">
      {title && <div className="mb-3 text-gray-700 font-semibold">{title}</div>}
      {children}
    </div>
  );
}

export default function Create({ mode = "create", prefill = null }) {
  const isEdit = mode === "edit";
  const { data, setData, post, put, processing, errors } = useForm(prefill || {
    nama_lensa:"", jenis_lensa:"", coating_lensa:"", indeks_lensa:"", stok_lensa:0,
    gambar_lensa:null, gambar_url:null,
    sph_kanan:"", cyl_kanan:"", axis_kanan:"", prism_kanan:"", base_kanan:"", add_kanan:"",
    sph_kiri:"",  cyl_kiri:"",  axis_kiri:"",  prism_kiri:"",  base_kiri:"",  add_kiri:"",
  });

  const [preview, setPreview] = useState(prefill?.gambar_url || null);

  function handleFile(e) {
    const file = e.target.files?.[0] || null;
    setData('gambar_lensa', file);
    setPreview(file ? URL.createObjectURL(file) : (prefill?.gambar_url || null));
  }

  function submit(){
    if (isEdit) {
      put(route('lensa.update', prefill.id_lensa), { forceFormData: true });
    } else {
      post(route('lensa.store'), { forceFormData: true });
    }
  }

  return (
    <SidebarLayout title={isEdit ? "Edit Lensa" : "Tambah Lensa"}>
      <div className="flex items-center gap-3 mb-4">
        <Link href={route('lensa.index')} className="text-orange-600 font-semibold">← Kembali</Link>
      </div>

      <Section>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Nama Lensa" error={errors.nama_lensa}>
            <input className="h-10 px-3 rounded border w-full"
                   value={data.nama_lensa}
                   onChange={e=>setData('nama_lensa', e.target.value)} />
          </Field>
          <Field label="Jenis Lensa">
            <input className="h-10 px-3 rounded border w-full"
                   value={data.jenis_lensa}
                   onChange={e=>setData('jenis_lensa', e.target.value)} />
          </Field>
          <Field label="Coating">
            <input className="h-10 px-3 rounded border w-full"
                   value={data.coating_lensa}
                   onChange={e=>setData('coating_lensa', e.target.value)} />
          </Field>
          <Field label="Indeks">
            <input className="h-10 px-3 rounded border w-full"
                   value={data.indeks_lensa}
                   onChange={e=>setData('indeks_lensa', e.target.value)} />
          </Field>
          <Field label="Stok">
            <input type="number" className="h-10 px-3 rounded border w-full"
                   value={data.stok_lensa}
                   onChange={e=>setData('stok_lensa', e.target.value)} />
          </Field>

          <Field label="Gambar Lensa (opsional)" error={errors.gambar_lensa}>
            <input type="file" accept="image/*" onChange={handleFile} />
            {preview && (
              <div className="mt-2 w-36 h-36 rounded-lg overflow-hidden border bg-gray-50">
                <img src={preview} className="object-cover w-full h-full" />
              </div>
            )}
          </Field>
        </div>
      </Section>

      <Section title="Ukuran Kanan (OD)">
        <div className="grid xl:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-3">
          <Field label="SPH"><input className="h-10 px-3 rounded border w-full" value={data.sph_kanan} onChange={e=>setData('sph_kanan', e.target.value)} /></Field>
          <Field label="CYL"><input className="h-10 px-3 rounded border w-full" value={data.cyl_kanan} onChange={e=>setData('cyl_kanan', e.target.value)} /></Field>
          <Field label="AXIS"><input className="h-10 px-3 rounded border w-full" value={data.axis_kanan} onChange={e=>setData('axis_kanan', e.target.value)} /></Field>
          <Field label="PRISM"><input className="h-10 px-3 rounded border w-full" value={data.prism_kanan} onChange={e=>setData('prism_kanan', e.target.value)} /></Field>
          <Field label="BASE"><input className="h-10 px-3 rounded border w-full" value={data.base_kanan} onChange={e=>setData('base_kanan', e.target.value)} /></Field>
          <Field label="ADD"><input className="h-10 px-3 rounded border w-full" value={data.add_kanan} onChange={e=>setData('add_kanan', e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Ukuran Kiri (OS)">
        <div className="grid xl:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-3">
          <Field label="SPH"><input className="h-10 px-3 rounded border w-full" value={data.sph_kiri} onChange={e=>setData('sph_kiri', e.target.value)} /></Field>
          <Field label="CYL"><input className="h-10 px-3 rounded border w-full" value={data.cyl_kiri} onChange={e=>setData('cyl_kiri', e.target.value)} /></Field>
          <Field label="AXIS"><input className="h-10 px-3 rounded border w-full" value={data.axis_kiri} onChange={e=>setData('axis_kiri', e.target.value)} /></Field>
          <Field label="PRISM"><input className="h-10 px-3 rounded border w-full" value={data.prism_kiri} onChange={e=>setData('prism_kiri', e.target.value)} /></Field>
          <Field label="BASE"><input className="h-10 px-3 rounded border w-full" value={data.base_kiri} onChange={e=>setData('base_kiri', e.target.value)} /></Field>
          <Field label="ADD"><input className="h-10 px-3 rounded border w-full" value={data.add_kiri} onChange={e=>setData('add_kiri', e.target.value)} /></Field>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        <Link href={route('lensa.index')} className="h-10 px-4 rounded-lg border">Cancel</Link>
        <button onClick={submit} disabled={processing} className="h-10 px-4 rounded-lg bg-orange-600 text-white">
          {isEdit ? "Simpan" : "Kirim"}
        </button>
      </div>
    </SidebarLayout>
  );
}
