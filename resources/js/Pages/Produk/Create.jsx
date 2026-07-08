// appV1.0 Rev 18 - Fix: kategori tanpa riwayat brand tidak lagi jatuh balik ke semua brand kategori lain.

import { useMemo, useRef, useState } from 'react';
import SidebarLayout from '@/Components/SidebarLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { ChevronDown, Star, Trash2, X } from 'lucide-react';
import ConfirmDialog from '@/Components/ui/ConfirmDialog';

const today = () => new Date().toISOString().split('T')[0];
const toNumber = (txt) => { const raw = String(txt ?? '').replace(/[^\d]/g, ''); return raw ? parseInt(raw, 10) : 0; };
const fmtIDR   = (n)   => Number(n || 0).toLocaleString('id-ID');

function MoneyInput({ value, onChange, error }) {
    return (
        <input
            type="text"
            inputMode="numeric"
            value={value ? fmtIDR(value) : ''}
            onChange={(e) => onChange(toNumber(e.target.value))}
            placeholder="Rp 0"
            className={`h-11 w-full rounded-lg border-gray-300 ${error ? 'border-red-400' : ''}`}
        />
    );
}

const DEFAULT_CATEGORIES = ['kacamata', 'soflen', 'air soflen', 'produk lainnya'];
const DEFAULT_COLORS = ['hitam', 'putih', 'coklat', 'abu-abu', 'tortoise/motif', 'emas', 'perak', 'merah', 'biru', 'hijau', 'kuning', 'bening'];
const DEFAULT_DIAMETERS = ['13.8', '14.0', '14.2', '14.5'];
const DEFAULT_MATERIALS = ['plastik', 'besi'];
const DEFAULT_MINUSES = [
    'plano', '-0.50', '-1.00', '-1.50', '-2.00', '-2.50', '-3.00', '-3.50', '-4.00', '-4.50', '-5.00', '-5.50', '-6.00',
    '+0.50', '+1.00', '+1.50', '+2.00',
];

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
    existingBrandsByCategory = {},
    existingColors = [],
    existingDiameters = [],
    existingMaterials = [],
    existingMinuses = [],
}) {
    const isEdit = Boolean(produk?.id);

    const { data, setData, post, processing, errors } = useForm({
        ...(isEdit ? { _method: 'put' } : {}),  // method-spoof so PHP fills $_FILES on edit
        admin_id:               produk?.admin_id || selectedAdminId || '',
        nama_produk:            produk?.nama_produk || '',
        kategori_produk:        produk?.kategori_produk || '',
        brand_produk:           produk?.brand_produk || '',
        warna_produk:           produk?.warna_produk || '',
        diameter_produk:        produk?.diameter_produk || '',
        bahan_produk:           produk?.bahan_produk || '',
        minus_produk:           produk?.minus_produk || '',
        jumlah_produk:          produk?.jumlah_produk || 0,
        harga_produk:           produk?.harga_produk || 0,
        tanggal_masuk:          produk?.tanggal_masuk || today(),
        expired_produk:         produk?.expired_produk || '',
        deskripsi_produk:       produk?.deskripsi_produk || '',
        lebar_lensa:            produk?.lebar_lensa || '',
        gagang_hidung:          produk?.gagang_hidung || '',
        panjang_gagang:         produk?.panjang_gagang || '',
        gambar_produk:          null,
        gambar_produk_tambahan: [],
    });

    const isKacamata = data.kategori_produk === 'kacamata';
    const isSoflen = data.kategori_produk === 'soflen';

    const [showFrameConfirm, setShowFrameConfirm] = useState(false);

    const doSubmit = () => {
        // Always post(): _method:'put' in form data routes to update(); real POST fills $_FILES.
        const url = isEdit
            ? route(`${routeBase}.update`, produk.id)
            : route(`${routeBase}.store`);
        post(url, { forceFormData: true, preserveScroll: true });
    };

    const submit = (event) => {
        event.preventDefault();

        const hasFrameSize = data.lebar_lensa || data.gagang_hidung || data.panjang_gagang;
        if (isKacamata && !hasFrameSize) {
            setShowFrameConfirm(true);
            return;
        }

        doSubmit();
    };

    const confirmSubmitWithoutFrame = () => {
        setShowFrameConfirm(false);
        doSubmit();
    };

    const removeAdditionalImage = (image) => {
        if (!window.confirm('Hapus foto tambahan produk ini?')) return;
        router.delete(route(`${routeBase}.images.destroy`, [produk.id, image.id]), { preserveScroll: true });
    };

    const makeThumbnail = (image) => {
        router.post(route(`${routeBase}.images.thumbnail`, [produk.id, image.id]), {}, { preserveScroll: true });
    };

    const brandOptions = useMemo(() => {
        // Belum pilih kategori: tampilkan semua brand sebagai starting point.
        // Sudah pilih kategori: HANYA brand kategori itu, walau hasilnya kosong.
        const source = data.kategori_produk
            ? (existingBrandsByCategory[data.kategori_produk] || [])
            : existingBrands;
        return [...new Set(source.map((b) => (b || '').toLowerCase()).filter(Boolean))].sort();
    }, [existingBrandsByCategory, existingBrands, data.kategori_produk]);

    const categoryOptions = useMemo(() => {
        const fromDb = existingCategories.map((c) => (c || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_CATEGORIES, ...fromDb])].sort();
    }, [existingCategories]);

    const colorOptions = useMemo(() => {
        const fromDb = existingColors.map((c) => (c || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_COLORS, ...fromDb])].sort();
    }, [existingColors]);

    const diameterOptions = useMemo(() => {
        const fromDb = existingDiameters.map((d) => (d || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_DIAMETERS, ...fromDb])].sort();
    }, [existingDiameters]);

    const materialOptions = useMemo(() => {
        const fromDb = existingMaterials.map((m) => (m || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_MATERIALS, ...fromDb])].sort();
    }, [existingMaterials]);

    const minusOptions = useMemo(() => {
        const fromDb = existingMinuses.map((m) => (m || '').toLowerCase()).filter(Boolean);
        return [...new Set([...DEFAULT_MINUSES, ...fromDb])];
    }, [existingMinuses]);

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
                            placeholder="kacamata, soflen, produk lainnya..."
                            className="w-full"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Pilih dari daftar atau ketik kategori baru — tersimpan otomatis.
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
                            {data.kategori_produk
                                ? `Menampilkan brand yang pernah dipakai untuk kategori "${data.kategori_produk}" — ketik baru kalau belum ada.`
                                : 'Pilih kategori dulu supaya saran brand lebih relevan, atau ketik baru — tersimpan otomatis huruf kecil.'}
                        </p>
                    </Field>

                    {(isKacamata || isSoflen) && (
                        <Field label="Warna" error={errors.warna_produk}>
                            <FilterCombobox
                                value={data.warna_produk}
                                onChange={(v) => setData('warna_produk', v)}
                                options={colorOptions}
                                placeholder="hitam, coklat, tortoise..."
                                className="w-full"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Pilih warna dasar atau ketik warna baru (mis. &ldquo;merah maroon&rdquo;) — otomatis tersimpan sebagai pilihan baru.
                            </p>
                        </Field>
                    )}

                    {isSoflen && (
                        <Field label="Diameter (mm)" error={errors.diameter_produk}>
                            <FilterCombobox
                                value={data.diameter_produk}
                                onChange={(v) => setData('diameter_produk', v)}
                                options={diameterOptions}
                                placeholder="14.0, 14.2, 14.5..."
                                className="w-full"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Pilih ukuran diameter yang sudah ada atau ketik ukuran baru — otomatis tersimpan sebagai pilihan baru.
                            </p>
                        </Field>
                    )}

                    {isKacamata && (
                        <Field label="Bahan Frame" error={errors.bahan_produk}>
                            <FilterCombobox
                                value={data.bahan_produk}
                                onChange={(v) => setData('bahan_produk', v)}
                                options={materialOptions}
                                placeholder="plastik, besi..."
                                className="w-full"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Pilih bahan yang sudah ada atau ketik bahan baru (mis. &ldquo;titanium&rdquo;) — otomatis tersimpan sebagai pilihan baru.
                            </p>
                        </Field>
                    )}

                    {isSoflen && (
                        <Field label="Minus / Plus" error={errors.minus_produk}>
                            <FilterCombobox
                                value={data.minus_produk}
                                onChange={(v) => setData('minus_produk', v)}
                                options={minusOptions}
                                placeholder="plano, -1.00, +0.50..."
                                className="w-full"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Pilih ukuran minus/plus yang sudah ada atau ketik ukuran baru — otomatis tersimpan sebagai pilihan baru.
                            </p>
                        </Field>
                    )}

                    <Field label="Jumlah / Stok" error={errors.jumlah_produk}>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={data.jumlah_produk}
                            onChange={(e) => setData('jumlah_produk', e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Harga" error={errors.harga_produk}>
                        <MoneyInput
                            value={data.harga_produk}
                            onChange={(v) => setData('harga_produk', v)}
                            error={errors.harga_produk}
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

                    {/* Frame size — hanya muncul untuk kacamata */}
                    {data.kategori_produk === 'kacamata' && (
                        <div className="md:col-span-2">
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                                <p className="mb-1 text-sm font-semibold text-orange-800">Ukuran Frame Kacamata</p>
                                <p className="mb-3 text-xs text-orange-600">Ukuran dalam satuan milimeter (mm)</p>

                                {/* Diagram: 52 □ 20 — 138 */}
                                <div className="mb-4 flex items-center justify-center gap-1 font-mono text-sm select-none">
                                    {/* Lebar lensa (kotak kiri) */}
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-16 items-center justify-center rounded border-2 border-orange-400 bg-white font-bold text-orange-700">
                                            {data.lebar_lensa || '—'}
                                        </div>
                                        <span className="mt-0.5 text-[10px] text-orange-500">Lebar</span>
                                    </div>
                                    {/* Bridge symbol □ */}
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded border-2 border-gray-400 bg-white font-bold text-gray-600">
                                            {data.gagang_hidung || '—'}
                                        </div>
                                        <span className="mt-0.5 text-[10px] text-gray-500">Hidung</span>
                                    </div>
                                    {/* Temple dash — */}
                                    <span className="text-gray-400">—</span>
                                    {/* Panjang gagang */}
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-16 items-center justify-center rounded border-2 border-gray-500 bg-white font-bold text-gray-700">
                                            {data.panjang_gagang || '—'}
                                        </div>
                                        <span className="mt-0.5 text-[10px] text-gray-500">Gagang</span>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <Field label="🔲 Lebar Lensa (mm)" error={errors.lebar_lensa}>
                                        <div className="relative">
                                            <input
                                                type="number" min="0" max="999"
                                                value={data.lebar_lensa}
                                                onChange={(e) => setData('lebar_lensa', e.target.value ? parseInt(e.target.value) : '')}
                                                placeholder="mis. 52"
                                                className="h-11 w-full rounded-lg border-gray-300 pr-10"
                                            />
                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">mm</span>
                                        </div>
                                    </Field>
                                    <Field label="🌉 Gagang Hidung (mm)" error={errors.gagang_hidung}>
                                        <div className="relative">
                                            <input
                                                type="number" min="0" max="999"
                                                value={data.gagang_hidung}
                                                onChange={(e) => setData('gagang_hidung', e.target.value ? parseInt(e.target.value) : '')}
                                                placeholder="mis. 20"
                                                className="h-11 w-full rounded-lg border-gray-300 pr-10"
                                            />
                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">mm</span>
                                        </div>
                                    </Field>
                                    <Field label="📏 Panjang Gagang (mm)" error={errors.panjang_gagang}>
                                        <div className="relative">
                                            <input
                                                type="number" min="0" max="999"
                                                value={data.panjang_gagang}
                                                onChange={(e) => setData('panjang_gagang', e.target.value ? parseInt(e.target.value) : '')}
                                                placeholder="mis. 138"
                                                className="h-11 w-full rounded-lg border-gray-300 pr-10"
                                            />
                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">mm</span>
                                        </div>
                                    </Field>
                                </div>
                            </div>
                        </div>
                    )}

                    <Field label="Gambar Utama Produk" error={errors.gambar_produk}>
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.avif,image/*"
                            onChange={(e) => setData('gambar_produk', e.target.files?.[0] || null)}
                            className="block w-full text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Format: JPG, PNG, GIF, WebP, BMP, AVIF · Maks 20 MB (otomatis dikompres)
                        </p>
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
                            accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.avif,image/*"
                            onChange={(e) => setData('gambar_produk_tambahan', Array.from(e.target.files || []))}
                            className="block w-full text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Format: JPG, PNG, GIF, WebP, BMP, AVIF · Maks 20 MB (otomatis dikompres) per foto. Foto tampil sebagai galeri pada detail produk.
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

            <ConfirmDialog
                open={showFrameConfirm}
                onCancel={() => setShowFrameConfirm(false)}
                onConfirm={confirmSubmitWithoutFrame}
                title="Ukuran frame kacamata kosong"
                description="Ukuran frame kacamata tidak diisi. Apakah Anda yakin ingin menyimpan produk ini tanpa ukuran frame?"
                cancelText="Kembali, Isi Dulu"
                confirmText="Ya, Simpan"
            />
        </SidebarLayout>
    );
}
