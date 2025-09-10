// resources/js/Pages/Pasien/Show.jsx
import React, { useState } from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import Modal from "@/Components/ui/Modal";
import ConfirmDialog from "@/Components/ui/ConfirmDialog";
import Toast from "@/Components/ui/Toast";
import HealthForm from "@/Components/patients/HealthForm";
import SidebarLayout from "@/Components/SidebarLayout";

function Show() {
  const { props } = usePage();
  const patient = props.patient;
  const healths = props.healths || [];

  const emptyForm = { tanggal_periksa: "", kanan: {}, kiri: {} };
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState({ open:false, type:"success", message:"" });

  const validate = (v) => (!v.tanggal_periksa ? "Tanggal periksa wajib diisi." : "");

  // Tambah
  const doCreate = () => {
    const msg = validate(form); if (msg) { setError(msg); return; }
    router.post(route("pasien.kesehatan.store", patient.id), form, {
      preserveScroll: true,
      onSuccess: () => { setAddOpen(false); setToast({ open:true, type:"success", message:"Data mata berhasil ditambahkan!" }); router.reload({ only:["healths"] }); },
      onError:   () => setError("Periksa input."),
    });
  };

  // Edit
  const openEdit = (row) => {
    setEditRow(row);
    setForm({ tanggal_periksa: row.tanggal_periksa || "", kanan: row.kanan || {}, kiri: row.kiri || {} });
    setError("");
  };
  const doUpdate = () => {
    const msg = validate(form); if (msg) { setError(msg); return; }
    router.put(route("kesehatan.update", editRow.id), form, {
      preserveScroll: true,
      onSuccess: () => { setEditRow(null); setToast({ open:true, type:"success", message:"Data mata berhasil diupdate!" }); router.reload({ only:["healths"] }); },
      onError:   () => setError("Periksa input."),
    });
  };

  // Hapus
  const doDelete = () => {
    router.delete(route("kesehatan.destroy", toDelete.id), {
      preserveScroll: true,
      onSuccess: () => { setToDelete(null); setToast({ open:true, type:"success", message:"Data mata telah dihapus." }); router.reload({ only:["healths"] }); },
    });
  };

  return (
    <>
      <Head title="Detail Pasien" />
      <div className="p-0">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={()=>history.back()} className="text-orange-700 hover:underline">← Kembali</button>
          <Link
            href={route("transaksi.byPatient", patient.id)}
            className="rounded-xl bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            Lihat Transaksi Pasien
          </Link>
        </div>

        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-2 md:grid-cols-2">
            <div><span className="font-semibold">Kode Pasien :</span> {patient.kode_pasien || '—'}</div>
            <div><span className="font-semibold">Tanggal Buat :</span> {patient.tanggal_buat || '-'}</div>
            <div><span className="font-semibold">Nama Pasien :</span> {patient.nama_pasien}</div>
            <div><span className="font-semibold">No Hp :</span> {patient.nohp_pasien || '-'}</div>
            <div className="md:col-span-2"><span className="font-semibold">Alamat :</span> {patient.alamat_pasien || '-'}</div>
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={()=>{ setForm(emptyForm); setError(""); setAddOpen(true); }}
            className="rounded-xl bg-orange-600 px-4 py-2 text-white shadow hover:bg-orange-700"
          >
            + Tambah Data Kesehatan Mata
          </button>
        </div>

        <div className="space-y-6">
          {healths.map((row) => (
            <div key={row.id} className="rounded-2xl border bg-rose-50/50 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Tanggal Periksa: {row.tanggal_periksa || "-"}</div>
                <div className="flex gap-2">
                  <button onClick={()=>openEdit(row)} className="rounded-lg bg-yellow-300 px-3 py-1.5 text-sm hover:bg-yellow-400">✏️ Edit</button>
                  <button onClick={()=>setToDelete(row)} className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm text-white hover:bg-rose-600">🗑 Delete</button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border bg-white">
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
                      <th className="px-3 py-2 text-left">MPD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2 font-semibold">OD</td>
                      <td className="px-3 py-2">{row.kanan?.sph ?? 0}</td>
                      <td className="px-3 py-2">{row.kanan?.cyl ?? 0}</td>
                      <td className="px-3 py-2">{row.kanan?.axis ?? 0}</td>
                      <td className="px-3 py-2">{row.kanan?.prism ?? 0}</td>
                      <td className="px-3 py-2">{row.kanan?.base ?? 0}</td>
                      <td className="px-3 py-2">{row.kanan?.add ?? 0}</td>
                      <td className="px-3 py-2">{row.kanan?.mpd ?? 0}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2 font-semibold">OS</td>
                      <td className="px-3 py-2">{row.kiri?.sph ?? 0}</td>
                      <td className="px-3 py-2">{row.kiri?.cyl ?? 0}</td>
                      <td className="px-3 py-2">{row.kiri?.axis ?? 0}</td>
                      <td className="px-3 py-2">{row.kiri?.prism ?? 0}</td>
                      <td className="px-3 py-2">{row.kiri?.base ?? 0}</td>
                      <td className="px-3 py-2">{row.kiri?.add ?? 0}</td>
                      <td className="px-3 py-2">{row.kiri?.mpd ?? 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {!healths.length && (
            <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
              Belum ada riwayat kesehatan mata.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah */}
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} width="max-w-6xl">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-orange-700">Tambah Data Kesehatan Mata Pasien</h3>
          <div className="mt-4"><HealthForm value={form} onChange={setForm} error={error} /></div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={()=>setAddOpen(false)} className="rounded-lg border px-4 py-2">Batal</button>
            <button onClick={doCreate} className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">+ Tambah</button>
          </div>
        </div>
      </Modal>

      {/* Modal Edit */}
      <Modal open={!!editRow} onClose={()=>setEditRow(null)} width="max-w-6xl">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-orange-700">Edit Data Kesehatan Mata Pasien</h3>
        </div>
        <div className="px-6"><HealthForm value={form} onChange={setForm} error={error} /></div>
        <div className="p-6 flex justify-end gap-3">
          <button onClick={()=>setEditRow(null)} className="rounded-lg border px-4 py-2">Batal</button>
          <button onClick={doUpdate} className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">Simpan</button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        danger
        title="Apakah anda ingin Menghapus data?"
        description="Data akan dihapus secara permanen. Yakin?"
        confirmText="Hapus"
        onCancel={()=>setToDelete(null)}
        onConfirm={doDelete}
      />
      <Toast open={toast.open} type={toast.type} message={toast.message} onClose={()=>setToast((s)=>({...s,open:false}))}/>
    </>
  );
}
Show.layout = (page) => <SidebarLayout title="Detail Pasien">{page}</SidebarLayout>;
export default Show;
