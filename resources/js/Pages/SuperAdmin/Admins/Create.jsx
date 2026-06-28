// appV1.0 Rev 7 - Tambah field link Google Maps dengan preview embed langsung.

import SidebarLayout from '@/Components/SidebarLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

function Field({ label, helper, error, children }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-600">{label}</span>
            {children}
            {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
            {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
        </label>
    );
}

// Mengubah input Google Maps (iframe HTML atau URL) menjadi embed URL
function toEmbedUrl(input) {
    if (!input) return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Jika user paste seluruh HTML iframe (<iframe src="...">) — ekstrak src-nya
    const iframeSrcMatch = trimmed.match(/src="([^"]+)"/);
    if (iframeSrcMatch) return iframeSrcMatch[1];

    // Sudah berupa embed URL langsung
    if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) return trimmed;

    // Ekstrak koordinat @lat,lng dari URL Google Maps share
    const coordMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed&z=16`;
    }

    // Ekstrak query ?q= dari URL
    try {
        const url = new URL(trimmed);
        const q = url.searchParams.get('q');
        if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&z=16`;
    } catch (_) { /* bukan URL valid */ }

    return null;
}

export default function AdminCreate({ admin = null }) {
    const isEdit = Boolean(admin?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        name: admin?.name || '',
        email: admin?.email || '',
        password: '',
        branch_phone: admin?.branch_phone || '',
        branch_operational_hours: admin?.branch_operational_hours || '10.30-21.00 WIB',
        branch_address: admin?.branch_address || '',
        branch_description: admin?.branch_description || '',
        branch_map_link: admin?.branch_map_link || '',
    });

    const embedUrl = useMemo(() => toEmbedUrl(data.branch_map_link), [data.branch_map_link]);

    const submit = (event) => {
        event.preventDefault();
        if (isEdit) {
            put(route('super_admin.admins.update', admin.id), { preserveScroll: true });
            return;
        }
        post(route('super_admin.admins.store'), { preserveScroll: true });
    };

    return (
        <SidebarLayout
            title={isEdit ? 'Edit Cabang/Admin' : 'Tambah Cabang/Admin'}
            subtitle="Atur identitas cabang, email login admin, jam operasional, dan alamat publik toko."
        >
            <Head title={isEdit ? 'Edit Cabang/Admin' : 'Tambah Cabang/Admin'} />
            <div>
                <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <Link href={route('super_admin.admins.index')} className="font-semibold text-[#E56020] hover:underline">
                        Kembali
                    </Link>

                    <Field label="Nama Cabang/Admin" error={errors.name}>
                        <input
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            className="h-11 w-full rounded-lg border-slate-300"
                        />
                    </Field>

                    <Field label="Email Login" error={errors.email}>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            className="h-11 w-full rounded-lg border-slate-300"
                        />
                    </Field>

                    <Field label={isEdit ? 'Password Baru (opsional)' : 'Password'} error={errors.password}>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            className="h-11 w-full rounded-lg border-slate-300"
                        />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field
                            label="Nomor WhatsApp Cabang"
                            helper="Hanya angka. Nomor ini dipakai tombol WhatsApp pada katalog pelanggan."
                            error={errors.branch_phone}
                        >
                            <input
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={15}
                                value={data.branch_phone}
                                onChange={(event) => setData('branch_phone', event.target.value.replace(/\D/g, ''))}
                                className="h-11 w-full rounded-lg border-slate-300"
                                placeholder="Contoh: 081234567890"
                            />
                        </Field>

                        <Field label="Jam Operasional Cabang" error={errors.branch_operational_hours}>
                            <input
                                value={data.branch_operational_hours}
                                onChange={(event) => setData('branch_operational_hours', event.target.value)}
                                className="h-11 w-full rounded-lg border-slate-300"
                                placeholder="10.30-21.00 WIB"
                            />
                        </Field>
                    </div>

                    <Field label="Alamat Cabang" error={errors.branch_address}>
                        <textarea
                            value={data.branch_address}
                            onChange={(event) => setData('branch_address', event.target.value)}
                            className="min-h-24 w-full rounded-lg border-slate-300"
                            placeholder="Alamat lengkap cabang yang akan tampil ke pelanggan"
                        />
                    </Field>

                    <Field label="Deskripsi Cabang untuk Pelanggan" error={errors.branch_description}>
                        <textarea
                            value={data.branch_description}
                            onChange={(event) => setData('branch_description', event.target.value)}
                            className="min-h-28 w-full rounded-lg border-slate-300"
                            placeholder="Jelaskan layanan, karakteristik, atau informasi penting cabang ini."
                        />
                    </Field>

                    {/* Link Google Maps */}
                    <Field
                        label="Link / Embed Google Maps Lokasi Cabang"
                        helper='Di Google Maps → Share → "Sematkan peta" → Salin HTML. Atau tempel link biasa. Peta langsung tampil di bawah.'
                        error={errors.branch_map_link}
                    >
                        <textarea
                            value={data.branch_map_link}
                            onChange={(event) => setData('branch_map_link', event.target.value)}
                            className="min-h-16 w-full rounded-lg border-slate-300 text-xs"
                            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>  — atau link biasa Google Maps'
                            rows={3}
                        />
                    </Field>

                    {/* Preview peta langsung */}
                    {embedUrl ? (
                        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                            <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
                                Preview Peta (tampilan di halaman pelanggan)
                            </div>
                            <iframe
                                src={embedUrl}
                                width="100%"
                                height="280"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="block"
                                title="Preview Peta"
                            />
                        </div>
                    ) : data.branch_map_link ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Format link belum dikenali. Coba link yang mengandung koordinat (@lat,lng) atau salin dari tombol "Share" Google Maps.
                        </div>
                    ) : null}

                    <div className="flex justify-end">
                        <button disabled={processing} className="rounded-lg bg-[#E56020] px-5 py-2.5 font-semibold text-white disabled:opacity-60">
                            {isEdit ? 'Simpan Perubahan' : 'Simpan Cabang'}
                        </button>
                    </div>
                </form>
            </div>
        </SidebarLayout>
    );
}
