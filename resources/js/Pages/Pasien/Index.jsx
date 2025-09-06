import React, { useMemo, useState } from 'react';
import { router, Head, usePage } from '@inertiajs/react';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';
import Toast from '@/Components/ui/Toast';
import PatientHoverCard from '@/Components/patients/PatientHoverCard';
import Pagination from '@/Components/ui/Pagination';
import SidebarLayout from "@/Components/SidebarLayout";

function Index() {
  const { props } = usePage();
  const rows = props.patients?.data || [];

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
  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });

  const goCreate = () => router.visit(route('pasien.create'));
  const goShow   = (id) => router.visit(route('pasien.show', id));
  const goEdit   = (id) => router.visit(route('pasien.edit', id));

  const doDelete = () => {
    router.delete(route('pasien.destroy', toDelete.id), {
      onSuccess: () => setToast({ open: true, type: 'success', message: 'Data telah dihapus.' }),
      onFinish:  () => setToDelete(null),
      preserveScroll: true,
    });
  };

  return (
    <>
      <Head title="Daftar Pasien" />
      <div className="p-0">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Jumlah Daftar Pasien</div>
            <div className="text-4xl font-extrabold tracking-tight">
              {String(props.patients?.total || 0).padStart(4,'0')}
            </div>
          </div>
          <button onClick={goCreate} className="rounded-xl bg-orange-600 px-4 py-2 text-white shadow hover:bg-orange-700">
            + Tambah Pasien
          </button>
        </div>

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
                    <span className="font-medium text-gray-800">{row.nama_pasien}</span>
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
                        onClick={(e)=>{e.stopPropagation(); setToDelete(row);}}
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
        description="Data akan dihapus secara permanen."
        onCancel={()=>setToDelete(null)}
        onConfirm={doDelete}
        confirmText="Hapus"
      />
      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={()=>setToast({ ...toast, open:false })}/>
    </>
  );
}

Index.layout = (page) => <SidebarLayout title="Pasien">{page}</SidebarLayout>;
export default Index;
