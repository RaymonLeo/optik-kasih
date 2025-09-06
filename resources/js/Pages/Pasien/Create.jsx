import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import Toast from '@/Components/ui/Toast';
import SidebarLayout from "@/Components/SidebarLayout";

function Create() {
  const [f, setF] = useState({
    kode_pasien:'', nama_pasien:'', tanggal_buat:'', alamat_pasien:'', nohp_pasien:'', tanggal_lahir:''
  });
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState({ open:false, type:'success', message:'' });

  const onChange = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const onChangePhone = (e) => setF(s => ({ ...s, nohp_pasien: e.target.value.replace(/\D/g, '') }));

  const submit = () => {
    router.post(route('pasien.store'), f, {
      onSuccess: () => {
        setConfirm(false);
        setToast({ open:true, type:'success', message:'Data berhasil ditambah!' });
        setF({ kode_pasien:'', nama_pasien:'', tanggal_buat:'', alamat_pasien:'', nohp_pasien:'', tanggal_lahir:'' });
      },
      onError: () => setToast({ open:true, type:'error', message:'Periksa input.' }),
      preserveScroll: true,
    });
  };

  return (
    <>
      <Head title="Tambah Pasien" />
      <div className="p-0">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Kode Pasien</label>
              <input
                value={f.kode_pasien}
                onChange={onChange('kode_pasien')}
                placeholder="contoh: A0001"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Nama Pasien</label>
              <input
                value={f.nama_pasien}
                onChange={onChange('nama_pasien')}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tanggal Buat</label>
              <input
                type="date"
                value={f.tanggal_buat}
                onChange={onChange('tanggal_buat')}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Alamat</label>
              <textarea
                value={f.alamat_pasien}
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
                value={f.nohp_pasien}
                onChange={onChangePhone}
                placeholder="081234567890"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <input
                type="date"
                value={f.tanggal_lahir}
                onChange={onChange('tanggal_lahir')}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={()=>history.back()} className="rounded-lg border px-4 py-2">Batal</button>
            <button onClick={()=>setConfirm(true)} className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">Tambah</button>
          </div>
        </div>
      </div>

      <ConfirmDialog open={confirm} onCancel={()=>setConfirm(false)} onConfirm={submit}
                     title="Simpan data pasien?" description="Pastikan data sudah benar." confirmText="Simpan" />
      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={()=>setToast({...toast, open:false})}/>
    </>
  );
}
Create.layout = (page) => <SidebarLayout title="Tambah Pasien">{page}</SidebarLayout>;
export default Create;
