// appV1.0 Rev 8 - Kategori & brand: combobox dinamis + semua lowercase; thumbnail toggle per foto galeri.

import { useMemo, useRef, useState } from 'react';
import SidebarLayout from '@/Components/SidebarLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { ChevronDown, Star, Trash2, X } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

function Field({ label, error, children }) {
    return (
        <div>
            <span className="mb-1 block text-sm font-semibold text-gray-600">{label}</span>
            {children}
            {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
        </div>
    );
}

/* ── Combobox dinamis: ketik untuk filter, klik panah untuk buka semua opsi. ── */
function FilterCombobox({ value, onChange, options = [], placeholder = 'Ketik atau pilih...', className = '' }) {
    const [open, setOpen]   = useState(false);
    const [typed, setTyped] = useState(value || '');
    const ref = useRef(null);

    const filtered = useMemo(
        () => options.filter((o) => o.toLowerCase().includes(typed.toLowerCase())),
        [options, typed],
    );

    const handleSelect = (opt) => {
        onChange(opt);
        setTyped(opt);
        setOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setTyped('');
        setOpen(false);
    };

    const handleChange = (e) => {
        const v = e.target.value.toLowerCase(); // otomatis lowercase saat ketik
        setTyped(v);
        onChange(v);
        setOpen(true);
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            <div className="flex h-11 items-center rounded-lg border border-gray-300 bg-white px-3 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-200">
                <input
                    className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                    placeholder={placeholder}
                    value={typed}
                    onChange={handleChange}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    autoComplete="off"
                />
                {typed ? (
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
                        className="text-gray-400 hover:text-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
                        className="text-gray-400"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                )}
            </div>
            {open && (
                <div className="absolute left-0 top-full z-30 mt-1 max-h-48 min-w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {filtered.length > 0 ? (
                        filtered.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-orange-50 hover:text-orange-700 ${
                                    value === opt ? 'bg-orange-50 font-semibold text-orange-700' : 'text-slate-700'
                                }`}
                            >
                                {opt}
                            </button>
                        ))
                    ) : typed ? (
                        <div className="px-4 py-2 text-sm italic text-slate-400">
                            Nilai baru: &ldquo;{typed}&rdquo; — akan tersimpan saat submit
                        </div>
                    ) : (
                        <div className="px-4 py-2 text-sm text-slate-400">Belum ada data tersimpan.</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ProdukCreate({
    produk = null,
    routeBase = 'admin.produk',
    backRoute = 'admin.produk.index',
    admins = [],
    selectedAdminId = '',
    existingCategories = [],
    existingBrands = [],
}) {
    const isEdit = Boolean(produk?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        admin_id:               produk?.admin_id || selectedAdminId || '',
        nama_produk:            produk?.nama_produk || '',
        kategori_produk:        produk?.kategori_produk || '',
        brand_produk:           produk?.brand_produk || '',
        jumlah_produk:          produk?.jumlah_produk || 0,
        harga_produk:           produk?.harga_produk || 0,
        tanggal_masuk:          produk?.tanggal_masuk || today(),
        expired_produk:         produk?.expired_produk || '',
        deskripsi_produk:       produk?.deskripsi_produk || '',
        gambar_produk:          null,
        gambar_produk_tambahan: [],
    });

    const submit = (event) => {
        event.preventDefault();
        const options = { forceFormData: true, preserveScroll: true };
        if (isEdit) {
            put(route(`${routeBase}.update`, produk.id), options);
        } else {
            post(route(`${routeBase}.store`), options);
        }
    };

    const removeAdditionalImage = (image) => {
        if (!window.confirm('Hapus foto tambahan produk ini?')) return;
        router.delete(route(`${routeBase}.images.destroy`, [produk.id, image.id]), { preserveScroll: true });
    };

    const makeThumbnail = (image) => {
        router.post(route(`${routeBase}.images.thumbnail`, [produk.id, image.id]), {}, { preserveScroll: true });
    };

    // Opsi sudah lowercase dari backend; normalkan sekali lagi untuk keamanan
    const categoryOptions = existingCategories.map((c) => (c || '').toLowerCase()).filter(Boolean);
    const brandOptions    = existingBrands.map((b) => (b || '').toLowerCase()).filter(Boolean);

    return (
        <SidebarLayout title={isEdit ? 'Edit Produk' : 'Tambah Produk'}>
            <form onSubmit={submit} className="mx-auto max-w-4xl space-y-5 rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                    <Link href={route(backRoute)} className="font-semibold text-orange-700 hover:underline">
                        ← Kembali
                    </Link>
                    <button
                        disabled={processing}
                        className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
                    >
                        {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Cabang — hanya muncul untuk superadmin */}
                    {admins.length > 0 && (
                        <Field label="Cabang / Admin" error={errors.admin_id}>
                            <select
                                value={data.admin_id}
                                onChange={(e) => setData('admin_id', e.target.value)}
                                required
                                className="h-11 w-full rounded-lg border-gray-300"
                            >
                                <option value="">— Pilih cabang terlebih dahulu —</option>
                                {admins.map((admin) => (
                                    <option key={admin.id} value={admin.id}>{admin.name}</option>
                                ))}
                            </select>
                        </Field>
                    )}

                    <Field label="Nama Produk" error={errors.nama_produk}>
                        <input
                            value={data.nama_produk}
                            onChange={(e) => setData('nama_produk', e.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Kategori Produk" error={errors.kategori_produk}>
                        <FilterCombobox
                            value={data.kategori_produk}
                            onChange={(v) => setData('kategori_produk', v)}
                            options={categoryOptions}
                            placeholder="kacamata, soflen, aksesoris..."
                            className="w-full"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Pilih dari riwayat atau ketik baru — tersimpan otomatis huruf kecil.
                        </p>
                    </Field>

                    <Field label="Brand / Merek" error={errors.brand_produk}>
                        <FilterCombobox
                            value={data.brand_produk}
                            onChange={(v) => setData('brand_produk', v)}
                            options={brandOptions}
                            placeholder="rayban, essilor, zeiss..."
                            className="w-full"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Pilih dari riwayat atau ketik baru — tersimpan otomatis huruf kecil.
                        </p>
                    </Field>

                    <Field label="Jumlah / Stok" error={errors.jumlah_produk}>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={data.jumlah_produk}
                            onChange={(e) => setData('jumlah_produk', e.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Harga" error={errors.harga_produk}>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={data.harga_produk}
                            onChange={(e) => setData('harga_produk', e.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Tanggal Produk Masuk" error={errors.tanggal_masuk}>
                        <input
                            type="date"
                            value={data.tanggal_masuk}
                            onChange={(e) => setData('tanggal_masuk', e.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Expired Produk (jika ada)" error={errors.expired_produk}>
                        <input
                            type="date"
                            value={data.expired_produk || ''}
                            onChange={(e) => setData('expired_produk', e.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <div className="md:col-span-2">
                        <Field label="Deskripsi Produk" error={errors.deskripsi_produk}>
                            <textarea
                                value={data.deskripsi_produk}
                                onChange={(e) => setData('deskripsi_produk', e.target.value)}
                                className="min-h-28 w-full rounded-lg border-gray-300"
                                placeholder="Jelaskan bahan, model, ukuran, atau informasi penting produk."
                            />
                        </Field>
                    </div>

                    <Field label="Gambar Utama Produk" error={errors.gambar_produk}>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => setData('gambar_produk', e.target.files?.[0] || null)}
                            className="block w-full text-sm"
                        />
                        {isEdit && produk.gambar_produk && (
                            <img
                                src={`/storage/${produk.gambar_produk}`}
                                alt="Gambar utama saat ini"
                                className="mt-2 h-20 w-20 rounded-lg border object-cover"
                            />
                        )}
                    </Field>

                    <Field label="Foto Tambahan Produk (maks. 7)" error={errors.gambar_produk_tambahan}>
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => setData('gambar_produk_tambahan', Array.from(e.target.files || []))}
                            className="block w-full text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Foto ini tampil sebagai galeri pada detail produk. Tentukan thumbnail di bawah.
                        </p>
                    </Field>
                </div>

                {/* ── Galeri foto tersimpan + pilih thumbnail (hanya saat edit) ── */}
                {isEdit && produk.images?.length > 0 && (
                    <section className="border-t border-slate-200 pt-5">
                        <h2 className="text-sm font-bold text-slate-800">Foto Tambahan Tersimpan</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Tekan <strong>Jadikan Thumbnail</strong> pada foto yang ingin ditampilkan sebagai gambar utama di katalog.
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                            {produk.images.map((image) => (
                                <article
                                    key={image.id}
                                    className={`overflow-hidden rounded-lg border bg-slate-50 transition ${
                                        image.is_thumbnail
                                            ? 'border-orange-400 ring-2 ring-orange-300'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={`/storage/${image.path}`}
                                            alt={`Foto ${produk.nama_produk}`}
                                            className="aspect-square w-full object-cover"
                                        />
                                        {image.is_thumbnail && (
                                            <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow">
                                                <Star className="h-3 w-3" fill="white" strokeWidth={0} /> Thumbnail
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 p-2">
                                        {!image.is_thumbnail && (
                                            <button
                                                type="button"
                                                onClick={() => makeThumbnail(image)}
                                                className="flex w-full items-center justify-center gap-1 rounded-md border border-orange-300 px-2 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50"
                                            >
                                                <Star className="h-3 w-3" /> Jadikan Thumbnail
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeAdditionalImage(image)}
                                            className="flex w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" /> Hapus foto
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </form>
        </SidebarLayout>
    );
}
