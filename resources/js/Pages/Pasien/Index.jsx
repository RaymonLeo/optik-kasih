// appV1.0 Rev 10 - Filter abjad A-Z + sort ascending/descending.

import React, { useRef, useState, useCallback } from 'react';
import { router, Head, usePage } from '@inertiajs/react';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import Toast from '@/Components/ui/Toast';
import PatientHoverCard from '@/Components/patients/PatientHoverCard';
import Pagination from '@/Components/ui/Pagination';
import SidebarLayout from "@/Components/SidebarLayout";

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function Index() {
  const { props } = usePage();
  const rows         = props.patients?.data || [];
  const total        = props.patients?.total || 0;
  const isAdmin      = props.auth?.user?.role === 'admin';
  const importErrors = props.importErrors || [];
  const filters      = props.filters || {};

  // Filter state — controlled from server filters
  const [q, setQ]           = useState(filters.q || '');
  const [letter, setLetter] = useState(filters.letter || '');
  const [sort, setSort]     = useState(filters.sort || 'asc');
  const debounceRef         = useRef(null);

  const navigate = useCallback((params) => {
    router.get(route('pasien.index'), params, { preserveState: true, replace: true });
  }, []);

  const handleSearch = (val) => {
    setQ(val);
    // Reset letter filter when searching
    if (val) setLetter('');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate({ q: val, letter: '', sort });
    }, 350);
  };

  const handleLetter = (l) => {
    const next = letter === l ? '' : l;
    setLetter(next);
    setQ('');
    navigate({ q: '', letter: next, sort });
  };

  const handleSort = () => {
    const next = sort === 'asc' ? 'desc' : 'asc';
    setSort(next);
    navigate({ q, letter, sort: next });
  };

  const resetAll = () => {
    setQ(''); setLetter(''); setSort('asc');
    navigate({ q: '', letter: '', sort: 'asc' });
  };

  const [hoverIndex, setHoverIndex]     = useState(null);
  const [toDelete, setToDelete]         = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [toast, setToast]               = useState({ open: false, type: 'success', message: '' });

  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting]   = useState(false);
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
      onError:   () => setToast({ open: true, type: 'error', message: 'Gagal mengimpor file.' }),
      onFinish:  () => setImporting(false),
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
      data:       isAdmin ? { delete_reason: deleteReason.trim() } : {},
      onSuccess:  () => setToast({ open: true, type: 'success', message: isAdmin ? 'Permintaan penghapusan telah dikirim.' : 'Data telah dihapus.' }),
      onFinish:   () => { setToDelete(null); setDeleteReason(''); },
      preserveScroll: true,
    });
  };

  const hasFilter = q || letter;

  return (
    <>
      <Head title="Daftar Pasien" />
      <div className="p-0">

        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-gray-500">Jumlah Daftar Pasien</div>
            <div className="text-4xl font-extrabold tracking-tight">
              {String(total).padStart(4, '0')}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href={route('pasien.template')}
              className="rounded-xl border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50">
              ⬇ Download Template Excel
            </a>
            <button onClick={() => setShowImport(v => !v)}
              className="rounded-xl border border-orange-400 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100">
              📥 Import Excel / CSV
            </button>
            <button onClick={goCreate}
              className="rounded-xl bg-orange-600 px-4 py-2 text-white shadow hover:bg-orange-700">
              + Tambah Pasien
            </button>
          </div>
        </div>

        {/* Import panel */}
        {showImport && (
          <form onSubmit={submitImport} className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="mb-2 text-sm font-semibold text-orange-800">Import Data Pasien (.xlsx atau .csv)</p>

            <div className="mb-3 overflow-x-auto rounded-lg border border-orange-200 bg-white">
              <table className="min-w-full text-xs">
                <thead className="bg-yellow-100">
                  <tr>
                    {['No', 'Nama Pasien', 'Kode Pasien', 'Tanggal Daftar', 'Alamat', 'No. HP'].map((h) => (
                      <th key={h} className="border border-yellow-300 px-3 py-1.5 text-left font-semibold text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-gray-500">
                    <td className="border border-gray-200 px-3 py-1">1</td>
                    <td className="border border-gray-200 px-3 py-1">Aroen</td>
                    <td className="border border-gray-200 px-3 py-1 italic text-gray-400">(boleh kosong)</td>
                    <td className="border border-gray-200 px-3 py-1">14-04-2007</td>
                    <td className="border border-gray-200 px-3 py-1">Jl. Arengka</td>
                    <td className="border border-gray-200 px-3 py-1 italic text-gray-400">(boleh kosong)</td>
                  </tr>
                  <tr className="bg-gray-50 text-gray-500">
                    <td className="border border-gray-200 px-3 py-1">2</td>
                    <td className="border border-gray-200 px-3 py-1">Budi</td>
                    <td className="border border-gray-200 px-3 py-1">250</td>
                    <td className="border border-gray-200 px-3 py-1">01-01-2008</td>
                    <td className="border border-gray-200 px-3 py-1">Jl. Sudirman No. 5</td>
                    <td className="border border-gray-200 px-3 py-1">0812000001</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-3 text-xs text-orange-600">
              Excel multi-sheet (A–Z) dibaca otomatis. Baris tanpa Nama dilewati. Kode Pasien boleh kosong atau diisi angka saja — huruf depan nama ditambahkan otomatis (mis. "250" → "B250").
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-700"
              />
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

        {/* Search + Sort row */}
        <div className="mb-3 flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari nama, kode, telepon, alamat…"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          {/* Sort toggle */}
          <button
            onClick={handleSort}
            title={sort === 'asc' ? 'Urutan: A → Z (klik untuk Z → A)' : 'Urutan: Z → A (klik untuk A → Z)'}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition
              ${sort === 'desc'
                ? 'border-orange-400 bg-orange-100 text-orange-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            {sort === 'asc' ? (
              <><span>A</span><svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3l4 6H4l4-6z"/></svg><span>Z</span></>
            ) : (
              <><span>Z</span><svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 13l4-6H4l4 6z"/></svg><span>A</span></>
            )}
          </button>
          {hasFilter && (
            <button
              onClick={resetAll}
              className="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              ✕ Reset
            </button>
          )}
        </div>

        {/* A–Z letter filter */}
        <div className="mb-3 flex flex-wrap gap-1">
          {LETTERS.map((l) => (
            <button
              key={l}
              onClick={() => handleLetter(l)}
              className={`h-8 w-8 rounded-lg text-sm font-bold transition
                ${letter === l
                  ? 'bg-orange-600 text-white shadow'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-orange-400 hover:text-orange-600'
                }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Active filter info */}
        {(q || letter) && (
          <p className="mb-2 text-xs text-gray-500">
            {letter
              ? <>Menampilkan <b>{total}</b> pasien berawalan <b>"{letter}"</b></>
              : <>Menampilkan <b>{total}</b> hasil untuk <b>"{q}"</b></>
            }
            {' — '}urutan <b>{sort === 'asc' ? 'A → Z' : 'Z → A'}</b>
          </p>
        )}

        {/* Tabel */}
        <div className="overflow-visible rounded-2xl border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm font-semibold text-gray-600">
                <th className="px-4 py-3">Kode Pasien</th>
                <th className="px-4 py-3">Nama Pasien</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Tgl Daftar</th>
                <th className="px-4 py-3">Nomor Telepon</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="relative cursor-pointer hover:bg-orange-50/50"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => goShow(row.id)}
                >
                  <td className="px-4 py-3 font-mono text-sm text-gray-700">
                    {row.kode_pasien || <span className="text-gray-300">—</span>}
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
                        <PatientHoverCard patient={row} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.alamat_pasien || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{row.tanggal_buat || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-700">{row.nohp_pasien || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => goEdit(row.id)}
                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                        ✏️ Edit
                      </button>
                      <button onClick={() => { setDeleteReason(''); setToDelete(row); }}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100">
                        🗑 Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination links={props.patients?.links || []} />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        danger
        title="Apakah anda ingin menghapus data?"
        description={isAdmin ? 'Permintaan akan dikirim ke superadmin untuk disetujui.' : 'Data akan dihapus secara permanen.'}
        onCancel={() => { setToDelete(null); setDeleteReason(''); }}
        onConfirm={doDelete}
        confirmText={isAdmin ? 'Kirim Permintaan' : 'Hapus'}
      >
        {isAdmin && (
          <label className="block text-sm font-medium text-gray-700">
            Alasan penghapusan
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              placeholder="Jelaskan alasan data pasien perlu dihapus"
            />
          </label>
        )}
      </ConfirmDialog>
      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}

Index.layout = (page) => <SidebarLayout title="Pasien">{page}</SidebarLayout>;
export default Index;
