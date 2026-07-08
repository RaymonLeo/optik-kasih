// appV1.0 Rev 5 - Fix bug: sort_order dengan angka nol di depan (mis. "07") gagal validasi integer.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ImagePlus, Images, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function BranchGallery({ branch, photos = [], isSuperAdminView = false }) {
    const [editing, setEditing] = useState(null);
    const [editCaption, setEditCaption] = useState('');
    const [editFeatured, setEditFeatured] = useState(false);
    const [editOrder, setEditOrder] = useState(0);
    const featuredCount = photos.filter((photo) => photo.is_featured).length;
    const baseRoute = isSuperAdminView ? 'super_admin.admins.gallery.photos' : 'admin.branch.photos';
    const backRoute = isSuperAdminView ? route('super_admin.admins.show', branch.id) : route('admin.dashboard');
    const uploadUrl = isSuperAdminView
        ? route(`${baseRoute}.store`, branch.id)
        : route(`${baseRoute}.store`);

    const { data, setData, post, processing, errors, reset } = useForm({
        photo: null,
        caption: '',
        is_featured: false,
        sort_order: 0,
    });

    const upload = (event) => {
        event.preventDefault();
        post(uploadUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const beginEdit = (photo) => {
        setEditing(photo);
        setEditCaption(photo.caption || '');
        setEditFeatured(photo.is_featured);
        setEditOrder(photo.sort_order || 0);
    };

    const update = () => {
        if (!editing) return;
        const url = isSuperAdminView
            ? route(`${baseRoute}.update`, [branch.id, editing.id])
            : route(`${baseRoute}.update`, editing.id);
        router.patch(url, {
            caption: editCaption,
            is_featured: editFeatured,
            sort_order: Number(editOrder || 0),
        }, { preserveScroll: true, onSuccess: () => setEditing(null) });
    };

    const remove = (photo) => {
        if (!window.confirm('Hapus foto cabang ini?')) return;
        const url = isSuperAdminView
            ? route(`${baseRoute}.destroy`, [branch.id, photo.id])
            : route(`${baseRoute}.destroy`, photo.id);
        router.delete(url, { preserveScroll: true });
    };

    return (
        <SidebarLayout title="Galeri Cabang" subtitle="Pilih maksimal tiga foto yang tampil sebagai carousel pada beranda pelanggan.">
            <Head title={`Galeri ${branch.name}`} />

            <div className="space-y-5">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <Link href={backRoute} className="text-sm font-bold text-[#E56020] hover:underline">Kembali</Link>
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wide text-[#E56020]">Cabang</p>
                            <h2 className="mt-1 text-2xl font-extrabold text-slate-950">{branch.name}</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{branch.branch_description || 'Deskripsi cabang belum diisi oleh superadmin.'}</p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-[#E56020]">
                            <Star className="h-4 w-4" /> {featuredCount}/3 foto carousel
                        </span>
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <ImagePlus className="h-5 w-5 text-[#E56020]" />
                        <h3 className="font-extrabold text-slate-950">Tambah foto cabang</h3>
                    </div>
                    <form onSubmit={upload} className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-700">
                            File foto
                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setData('photo', event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" />
                            {errors.photo && <span className="mt-1 block text-xs text-red-600">{errors.photo}</span>}
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                            Keterangan (opsional)
                            <input value={data.caption} onChange={(event) => setData('caption', event.target.value)} className="mt-1 h-10 w-full rounded-lg border-slate-300" placeholder="Contoh: Area display frame" />
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input type="checkbox" checked={data.is_featured} onChange={(event) => setData('is_featured', event.target.checked)} disabled={!data.is_featured && featuredCount >= 3} />
                            Tampilkan di carousel utama
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                            Urutan carousel
                            <input type="number" min="0" max="99" value={data.sort_order} onChange={(event) => setData('sort_order', event.target.value === '' ? '' : parseInt(event.target.value, 10) || 0)} className="mt-1 h-10 w-full rounded-lg border-slate-300" />
                        </label>
                        <div className="md:col-span-2">
                            <button disabled={processing} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#E56020] px-4 text-sm font-bold text-white disabled:opacity-60">
                                <ImagePlus className="h-4 w-4" /> Unggah foto
                            </button>
                        </div>
                    </form>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Images className="h-5 w-5 text-[#E56020]" />
                        <h3 className="font-extrabold text-slate-950">Foto tersimpan</h3>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {photos.map((photo) => (
                            <article key={photo.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                <img src={photo.url} alt={photo.caption || `Foto ${branch.name}`} className="aspect-[4/3] w-full object-cover" />
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-semibold text-slate-700">{photo.caption || 'Tanpa keterangan'}</p>
                                        {photo.is_featured && <span className="shrink-0 rounded-full bg-orange-50 px-2 py-1 text-xs font-bold text-[#E56020]">Carousel #{photo.sort_order}</span>}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button onClick={() => beginEdit(photo)} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Atur</button>
                                        <button onClick={() => remove(photo)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 px-3 text-sm font-bold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Hapus</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                    {photos.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Belum ada foto cabang.</p>}
                </section>
            </div>

            {editing && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
                        <h2 className="text-lg font-extrabold text-slate-950">Atur foto cabang</h2>
                        <label className="mt-4 block text-sm font-semibold text-slate-700">Keterangan
                            <input value={editCaption} onChange={(event) => setEditCaption(event.target.value)} className="mt-1 h-10 w-full rounded-lg border-slate-300" />
                        </label>
                        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input type="checkbox" checked={editFeatured} onChange={(event) => setEditFeatured(event.target.checked)} disabled={!editing.is_featured && !editFeatured && featuredCount >= 3} />
                            Tampilkan di carousel utama
                        </label>
                        <label className="mt-4 block text-sm font-semibold text-slate-700">Urutan carousel
                            <input type="number" min="0" max="99" value={editOrder} onChange={(event) => setEditOrder(event.target.value)} className="mt-1 h-10 w-full rounded-lg border-slate-300" />
                        </label>
                        <div className="mt-5 flex justify-end gap-3">
                            <button onClick={() => setEditing(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700">Batal</button>
                            <button onClick={update} className="h-10 rounded-lg bg-[#E56020] px-4 text-sm font-bold text-white">Simpan pengaturan</button>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}
