import SidebarLayout from '@/Components/SidebarLayout';
import { Link, useForm } from '@inertiajs/react';

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-600">{label}</span>
            {children}
            {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
        </label>
    );
}

export default function ProdukCreate({
    produk = null,
    routeBase = 'admin.produk',
    backRoute = 'admin.produk.index',
    admins = [],
    selectedAdminId = '',
}) {
    const isEdit = Boolean(produk?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        admin_id: produk?.admin_id || selectedAdminId || '',
        nama_produk: produk?.nama_produk || '',
        kategori_produk: produk?.kategori_produk || '',
        jumlah_produk: produk?.jumlah_produk || 0,
        harga_produk: produk?.harga_produk || 0,
        tanggal_masuk: produk?.tanggal_masuk || '',
        expired_produk: produk?.expired_produk || '',
        gambar_produk: null,
    });

    const submit = (event) => {
        event.preventDefault();
        const options = { forceFormData: true, preserveScroll: true };

        if (isEdit) {
            put(route(`${routeBase}.update`, produk.id), options);
            return;
        }

        post(route(`${routeBase}.store`), options);
    };

    return (
        <SidebarLayout title={isEdit ? 'Edit Produk' : 'Tambah Produk'}>
            <form onSubmit={submit} className="mx-auto max-w-4xl space-y-5 rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                    <Link href={route(backRoute)} className="font-semibold text-orange-700 hover:underline">
                        Kembali
                    </Link>
                    <button
                        disabled={processing}
                        className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
                    >
                        {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {admins.length > 0 && (
                        <Field label="Cabang/Admin" error={errors.admin_id}>
                            <select
                                value={data.admin_id}
                                onChange={(event) => setData('admin_id', event.target.value)}
                                className="h-11 w-full rounded-lg border-gray-300"
                            >
                                <option value="">Pilih cabang</option>
                                {admins.map((admin) => (
                                    <option key={admin.id} value={admin.id}>{admin.name}</option>
                                ))}
                            </select>
                        </Field>
                    )}

                    <Field label="Nama Produk" error={errors.nama_produk}>
                        <input
                            value={data.nama_produk}
                            onChange={(event) => setData('nama_produk', event.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Kategori Produk" error={errors.kategori_produk}>
                        <input
                            value={data.kategori_produk}
                            onChange={(event) => setData('kategori_produk', event.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                            placeholder="Kacamata, Soflen, Aksesoris"
                        />
                    </Field>

                    <Field label="Jumlah/Stok" error={errors.jumlah_produk}>
                        <input
                            type="number"
                            min="0"
                            value={data.jumlah_produk}
                            onChange={(event) => setData('jumlah_produk', event.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Harga" error={errors.harga_produk}>
                        <input
                            type="number"
                            min="0"
                            value={data.harga_produk}
                            onChange={(event) => setData('harga_produk', event.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Tanggal Produk Masuk" error={errors.tanggal_masuk}>
                        <input
                            type="date"
                            value={data.tanggal_masuk || ''}
                            onChange={(event) => setData('tanggal_masuk', event.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Expired Produk (jika ada)" error={errors.expired_produk}>
                        <input
                            type="date"
                            value={data.expired_produk || ''}
                            onChange={(event) => setData('expired_produk', event.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Gambar Produk" error={errors.gambar_produk}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => setData('gambar_produk', event.target.files?.[0] || null)}
                            className="block w-full text-sm"
                        />
                    </Field>
                </div>
            </form>
        </SidebarLayout>
    );
}
