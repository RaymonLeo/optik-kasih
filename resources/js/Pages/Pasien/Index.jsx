// appV1.0 Rev 6 - Tampilkan badge status (aktif/nonaktif) pada daftar pasien.

import React, { useMemo, useRef, useState } from 'react';
import { router, Head, usePage } from '@inertiajs/react';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import Toast from '@/Components/ui/Toast';
import PatientHoverCard from '@/Components/patients/PatientHoverCard';
import Pagination from '@/Components/ui/Pagination';
import SidebarLayout from "@/Components/SidebarLayout";

function Index() {
  const { props } = usePage();
  const rows = props.patients?.data || [];
  const isAdmin = props.auth?.user?.role === 'admin';
  const importErrors = props.importErrors || [];

  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter(r =>
      (r.kode_pasien || '').toLowerCase().includes(s) ||
      (r.nama_pasien || '').toLowerCase().includes(s) ||
      (r.nohp_pasien || '').toLowerCase().includes(s) ||
      (r.alamat_pasien || '').toLowerCase().includes(s)
    );
  }, [q, rows]);

  const [hoverIndex, setHoverIndex] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });

  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const submitImport = (e) => {
    e.preventDefault();
    if (!importFile) return;
    const form = new FormData();
    form.append('file', importFile);
    setImporting(true);
    router.post(route('pasien.import'), form, {
      forceFormData: true,
      onSuccess: () => { setShowImport(false); setImportFile(null); },
      onError: () => setToast({ open: true, type: 'error', message: 'Gagal mengimpor file.' }),
      onFinish: () => setImporting(false),
    });
  };

  const goCreate = () => router.visit(route('pasien.create'));
  const goShow   = (id) => router.visit(route('pasien.show', id));
  const goEdit   = (id) => router.visit(route('pasien.edit', id));

  const doDelete = () => {
    if (isAdmin && !deleteReason.trim()) {
      setToast({ open: true, type: 'error', message: 'Alasan penghapusan wajib diisi.' });
      return;
    }

    router.delete(route('pasien.destroy', toDelete.id), {
      data: isAdmin ? { delete_reason: deleteReason.trim() } : {},
      onSuccess: () => setToast({ open: true, type: 'success', message: isAdmin ? 'Permintaan penghapusan telah dikirim.' : 'Data telah dihapus.' }),
      onFinish:  () => { setToDelete(null); setDeleteReason(''); },
      preserveScroll: true,
    });
  };

  return (
    <>
      <Head title="Daftar Pasien" />
      <div className="p-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-gray-500">Jumlah Daftar Pasien</div>
            <div className="text-4xl font-extrabold tracking-tight">
              {String(props.patients?.total || 0).padStart(4,'0')}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href={route('pasien.template')} className="rounded-xl border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50">
              ⬇ Download Template CSV
            </a>
            <button onClick={() => setShowImport(v => !v)} className="rounded-xl border border-orange-400 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100">
              📥 Import CSV
            </button>
            <button onClick={goCreate} className="rounded-xl bg-orange-600 px-4 py-2 text-white shadow hover:bg-orange-700">
              + Tambah Pasien
            </button>
          </div>
        </div>

        {showImport && (
          <form onSubmit={submitImport} className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="mb-2 text-sm font-semibold text-orange-800">Import Data Pasien via CSV</p>
            <p className="mb-3 text-xs text-orange-700">
              Gunakan template CSV yang sudah diunduh. Kolom: kode_pasien, nama_pasien, tanggal_lahir (YYYY-MM-DD), alamat_pasien, nohp_pasien.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-700" />
              <button type="submit" disabled={!importFile || importing}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">
                {importing ? 'Mengimpor…' : 'Upload & Import'}
              </button>
              <button type="button" onClick={() => { setShowImport(false); setImportFile(null); }}
                className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Batal
              </button>
            </div>
            {importErrors.length > 0 && (
              <ul className="mt-3 max-h-32 overflow-y-auto rounded-lg border border-red-200 bg-white p-2 text-xs text-red-700">
                {importErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            )}
          </form>
        )}

        <div className="mb-3">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Cari kode, nama, telepon, alamat…"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div className="rounded-2xl border overflow-visible"> {/* ⬅️ overflow-visible agar hover tidak ketutup */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm font-semibold text-gray-600">
                <th className="px-4 py-3">Kode Pasien</th>{/* ⬅️ ganti dari ID */}
                <th className="px-4 py-3">Nama Pasien</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Tanggal Lahir</th>
                <th className="px-4 py-3">Nomor Telepon</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className="relative hover:bg-orange-50/50 cursor-pointer"
                  onMouseEnter={()=>setHoverIndex(idx)}
                  onMouseLeave={()=>setHoverIndex(null)}
                  onClick={() => goShow(row.id)} // ⬅️ klik baris ke detail
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {row.kode_pasien || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{row.nama_pasien}</span>
                      {row.status === 'nonaktif' && (
                        <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">
                          nonaktif
                        </span>
                      )}
                    </div>
                    {hoverIndex === idx && (
                      <div className="relative">
                        <PatientHoverCard patient={row}/>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.alamat_pasien || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{row.tanggal_lahir || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{row.nohp_pasien || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e)=>{e.stopPropagation(); goEdit(row.id);}}
                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={(e)=>{e.stopPropagation(); setDeleteReason(''); setToDelete(row);}}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                      >
                        🗑 Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination dari server */}
        <Pagination links={props.patients?.links || []} />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        danger
        title="Apakah anda ingin menghapus data?"
        description={isAdmin ? 'Permintaan akan dikirim ke superadmin untuk disetujui.' : 'Data akan dihapus secara permanen.'}
        onCancel={()=>{ setToDelete(null); setDeleteReason(''); }}
        onConfirm={doDelete}
        confirmText={isAdmin ? 'Kirim Permintaan' : 'Hapus'}
      >
        {isAdmin && (
          <label className="block text-sm font-medium text-gray-700">
            Alasan penghapusan
            <textarea
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
              className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              placeholder="Jelaskan alasan data pasien perlu dihapus"
            />
          </label>
        )}
      </ConfirmDialog>
      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={()=>setToast({ ...toast, open:false })}/>
    </>
  );
}

Index.layout = (page) => <SidebarLayout title="Pasien">{page}</SidebarLayout>;
export default Index;
