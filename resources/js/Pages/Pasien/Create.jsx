// appV1.0 Rev 3 - Semua field wajib diisi (kecuali tanggal lahir), tampilkan error per field dari server.

import React, { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import Toast from '@/Components/ui/Toast';
import SidebarLayout from "@/Components/SidebarLayout";

const today = () => new Date().toISOString().split('T')[0];

function calcAge(tanggalLahir) {
    if (!tanggalLahir) return null;
    const birth = new Date(tanggalLahir);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : null;
}

function FieldError({ name, errors }) {
    if (!errors[name]) return null;
    return <p className="mt-1 text-xs text-red-600">{errors[name]}</p>;
}

function Create() {
    const { props } = usePage();
    const serverErrors = props.errors || {};

    const [f, setF] = useState({
        kode_pasien: '', nama_pasien: '', tanggal_buat: today(),
        alamat_pasien: '', nohp_pasien: '', tanggal_lahir: ''
    });
    const [confirm, setConfirm] = useState(false);
    const [toast, setToast] = useState({ open: false, type: 'success', message: '' });

    const onChange = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
    const onChangePhone = (e) => setF(s => ({ ...s, nohp_pasien: e.target.value.replace(/\D/g, '') }));

    const age = useMemo(() => calcAge(f.tanggal_lahir), [f.tanggal_lahir]);

    const inputClass = (field) =>
        `mt-1 w-full rounded-lg border px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 ${serverErrors[field] ? 'border-red-400' : ''}`;

    const submit = () => {
        router.post(route('pasien.store'), f, {
            onSuccess: () => {
                setConfirm(false);
                setToast({ open: true, type: 'success', message: 'Data berhasil ditambah!' });
                setF({ kode_pasien: '', nama_pasien: '', tanggal_buat: today(), alamat_pasien: '', nohp_pasien: '', tanggal_lahir: '' });
            },
            onError: () => {
                setConfirm(false);
                setToast({ open: true, type: 'error', message: 'Periksa input, ada field yang belum diisi.' });
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Tambah Pasien" />
            <div className="p-0">
                <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <button onClick={() => history.back()} className="rounded-lg border px-3 py-1.5 text-sm text-orange-700 hover:bg-orange-50">← Kembali</button>
                        <h1 className="text-2xl font-bold text-slate-800">Tambah Pasien Baru</h1>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Kode Pasien <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={f.kode_pasien}
                                onChange={onChange('kode_pasien')}
                                placeholder="contoh: R250"
                                className={inputClass('kode_pasien')}
                            />
                            <FieldError name="kode_pasien" errors={serverErrors} />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Nama Pasien <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={f.nama_pasien}
                                onChange={onChange('nama_pasien')}
                                className={inputClass('nama_pasien')}
                            />
                            <FieldError name="nama_pasien" errors={serverErrors} />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Tanggal Daftar <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={f.tanggal_buat}
                                onChange={onChange('tanggal_buat')}
                                className={inputClass('tanggal_buat')}
                            />
                            <FieldError name="tanggal_buat" errors={serverErrors} />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Tanggal Lahir
                                {age !== null && (
                                    <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                                        {age} tahun
                                    </span>
                                )}
                            </label>
                            <input
                                type="date"
                                value={f.tanggal_lahir}
                                onChange={onChange('tanggal_lahir')}
                                max={today()}
                                className={inputClass('tanggal_lahir')}
                            />
                            <FieldError name="tanggal_lahir" errors={serverErrors} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">
                                Alamat <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={f.alamat_pasien}
                                onChange={onChange('alamat_pasien')}
                                rows={3}
                                className={inputClass('alamat_pasien')}
                            />
                            <FieldError name="alamat_pasien" errors={serverErrors} />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Nomor Telepon <span className="text-red-500">*</span>{' '}
                                <span className="text-xs text-gray-500">(hanya angka 8–15 digit)</span>
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
                                className={inputClass('nohp_pasien')}
                            />
                            <FieldError name="nohp_pasien" errors={serverErrors} />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => history.back()} className="rounded-lg border px-4 py-2">Batal</button>
                        <button onClick={() => setConfirm(true)} className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">Tambah Pasien</button>
                    </div>
                </div>
            </div>

            <ConfirmDialog open={confirm} onCancel={() => setConfirm(false)} onConfirm={submit}
                title="Simpan data pasien?" description="Pastikan data sudah benar." confirmText="Simpan" />
            <Toast open={toast.open} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, open: false })} />
        </>
    );
}

Create.layout = (page) => <SidebarLayout title="Tambah Pasien">{page}</SidebarLayout>;
export default Create;
