import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';

// Mengubah input Google Maps (iframe HTML atau URL) menjadi embed URL
function toEmbedUrl(input) {
    if (!input) return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    const iframeSrcMatch = trimmed.match(/src="([^"]+)"/);
    if (iframeSrcMatch) return iframeSrcMatch[1];

    if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) return trimmed;

    const coordMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed&z=16`;
    }

    try {
        const url = new URL(trimmed);
        const q = url.searchParams.get('q');
        if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&z=16`;
    } catch (_) { /* bukan URL valid */ }

    return null;
}

export default function BranchDisplayForm({ branch, className = '' }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        branch_phone: branch?.branch_phone || '',
        branch_operational_hours: branch?.branch_operational_hours || '',
        branch_address: branch?.branch_address || '',
        branch_description: branch?.branch_description || '',
        branch_map_link: branch?.branch_map_link || '',
    });

    const embedUrl = useMemo(() => toEmbedUrl(data.branch_map_link), [data.branch_map_link]);

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.branch.update'), { preserveScroll: true });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-bold text-slate-950">Tampilan Cabang</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Informasi ini tampil ke pelanggan di katalog dan halaman cabang publik. Nama, email, dan
                    password login hanya dapat diubah oleh superadmin.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">Nomor WhatsApp Cabang</label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={15}
                            value={data.branch_phone}
                            onChange={(e) => setData('branch_phone', e.target.value.replace(/\D/g, ''))}
                            className="h-11 w-full rounded-lg border-gray-300"
                            placeholder="Contoh: 081234567890"
                        />
                        <InputError message={errors.branch_phone} className="mt-2" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">Jam Operasional Cabang</label>
                        <input
                            value={data.branch_operational_hours}
                            onChange={(e) => setData('branch_operational_hours', e.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                            placeholder="10.30-21.00 WIB"
                        />
                        <InputError message={errors.branch_operational_hours} className="mt-2" />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">Alamat Cabang</label>
                    <textarea
                        value={data.branch_address}
                        onChange={(e) => setData('branch_address', e.target.value)}
                        className="min-h-24 w-full rounded-lg border-gray-300"
                        placeholder="Alamat lengkap cabang yang akan tampil ke pelanggan"
                    />
                    <InputError message={errors.branch_address} className="mt-2" />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">Deskripsi Cabang untuk Pelanggan</label>
                    <textarea
                        value={data.branch_description}
                        onChange={(e) => setData('branch_description', e.target.value)}
                        className="min-h-28 w-full rounded-lg border-gray-300"
                        placeholder="Jelaskan layanan, karakteristik, atau informasi penting cabang ini."
                    />
                    <InputError message={errors.branch_description} className="mt-2" />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-600">Link / Embed Google Maps Lokasi Cabang</label>
                    <textarea
                        value={data.branch_map_link}
                        onChange={(e) => setData('branch_map_link', e.target.value)}
                        className="min-h-16 w-full rounded-lg border-gray-300 text-xs"
                        rows={3}
                        placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe> — atau link biasa Google Maps'
                    />
                    <InputError message={errors.branch_map_link} className="mt-2" />
                </div>

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

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-slate-600">Tersimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
