// appV1.0 Rev 6 - Tambah toggle status pasien (aktif/nonaktif) di form edit.

import React, { useEffect, useMemo, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import Toast from '@/Components/ui/Toast';
import SidebarLayout from "@/Components/SidebarLayout";

function calcAge(tgl) {
    if (!tgl) return null;
    const today = new Date();
    const dob = new Date(tgl);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age < 0 ? null : age;
}

function Edit() {
  const { props } = usePage();
  const initial = props.patient || {
    id:null, kode_pasien:'', nama_pasien:'', tanggal_buat:'', alamat_pasien:'', nohp_pasien:'', tanggal_lahir:'', change_reason:'', status:'aktif'
  };

  const [f, setF] = useState(initial);
  useEffect(()=>setF(initial), [initial]);

  const age = useMemo(() => calcAge(f.tanggal_lahir), [f.tanggal_lahir]);

  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState({ open:false, type:'success', message:'' });
  const isAdmin = props.auth?.user?.role === 'admin';

  const onChange = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const onChangePhone = (e) => setF(s => ({ ...s, nohp_pasien: e.target.value.replace(/\D/g, '') }));

  const submit = () => {
    router.put(route('pasien.update', f.id), f, {
      onSuccess: () => { setConfirm(false); setToast({ open:true, type:'success', message:'Data berhasil diubah!' }); },
      onError: () => setToast({ open:true, type:'error', message:'Periksa input.' }),
      preserveScroll: true,
    });
  };

  return (
    <>
      <Head title="Edit Pasien" />
      <div className="p-0">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label className="text-sm font-medium text-gray-700">Kode Pasien</label>
              <input
                value={f.kode_pasien || ''}
                onChange={onChange('kode_pasien')}
                placeholder="contoh: A0001"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Alasan Perubahan {isAdmin && <span className="text-red-600">*</span>}
              </label>
              <textarea
                value={f.change_reason || ''}
                onChange={onChange('change_reason')}
                required={isAdmin}
                placeholder="Jelaskan alasan perubahan data pasien untuk audit cabang"
                className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
              <p className="mt-1 text-xs text-gray-500">Alasan, ID pasien, nama pasien, dan cabang akan dicatat pada audit log.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Nama Pasien</label>
              <input
                value={f.nama_pasien || ''}
                onChange={onChange('nama_pasien')}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tanggal Buat</label>
              <input
                type="date"
                value={f.tanggal_buat || ''}
                onChange={onChange('tanggal_buat')}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Alamat</label>
              <textarea
                value={f.alamat_pasien || ''}
                onChange={onChange('alamat_pasien')}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Nomor Telepon <span className="text-xs text-gray-500">(hanya angka 8–15 digit)</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={8}
                maxLength={15}
                value={f.nohp_pasien || ''}
                onChange={onChangePhone}
                placeholder="081234567890"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Tanggal Lahir
                {age !== null && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">{age} tahun</span>
                )}
              </label>
              <input
                type="date"
                value={f.tanggal_lahir || ''}
                onChange={onChange('tanggal_lahir')}
                max={new Date().toISOString().split('T')[0]}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Status pasien — hanya di form edit */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <label className="block text-sm font-semibold text-gray-700">Status Pasien</label>
            <p className="mt-0.5 text-xs text-gray-500">
              Data pasien tidak dihapus. Nonaktifkan jika pasien sudah tidak aktif berobat.
            </p>
            <div className="mt-3 flex gap-3">
              {[
                { value: 'aktif',     label: 'Aktif',     desc: 'Pasien masih aktif berobat' },
                { value: 'nonaktif',  label: 'Nonaktif',  desc: 'Pasien tidak aktif' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setF(s => ({ ...s, status: opt.value }))}
                  className={`flex flex-col items-start rounded-xl border px-4 py-2.5 text-left transition ${
                    f.status === opt.value
                      ? opt.value === 'aktif'
                        ? 'border-green-400 bg-green-50 ring-2 ring-green-300'
                        : 'border-gray-400 bg-gray-200 ring-2 ring-gray-400'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-sm font-semibold ${
                    f.status === opt.value
                      ? opt.value === 'aktif' ? 'text-green-800' : 'text-gray-700'
                      : 'text-gray-600'
                  }`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-gray-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={()=>history.back()} className="rounded-lg border px-4 py-2">Batal</button>
            <button onClick={()=>setConfirm(true)} className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onCancel={()=>setConfirm(false)}
        onConfirm={submit}
        title="Terima Perubahan?"
        description="Perubahan akan disimpan permanen."
        confirmText="Terima"
      />
      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={()=>setToast({...toast, open:false})}/>
    </>
  );
}

Edit.layout = (page) => <SidebarLayout title="Edit Pasien">{page}</SidebarLayout>;
export default Edit;
