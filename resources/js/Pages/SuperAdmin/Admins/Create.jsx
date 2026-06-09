import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-600">{label}</span>
            {children}
            {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
        </label>
    );
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
    });

    const submit = (event) => {
        event.preventDefault();

        if (isEdit) {
            put(route('super_admin.admins.update', admin.id), { preserveScroll: true });
            return;
        }

        post(route('super_admin.admins.store'), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">{isEdit ? 'Edit Cabang/Admin' : 'Tambah Cabang/Admin'}</h2>}>
            <Head title={isEdit ? 'Edit Cabang/Admin' : 'Tambah Cabang/Admin'} />
            <div className="py-8">
                <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 rounded-2xl border bg-white p-5 shadow-sm">
                    <Link href={route('super_admin.admins.index')} className="font-semibold text-orange-700 hover:underline">
                        Kembali
                    </Link>

                    <Field label="Nama Cabang/Admin" error={errors.name}>
                        <input
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label="Email Login" error={errors.email}>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <Field label={isEdit ? 'Password Baru (opsional)' : 'Password'} error={errors.password}>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            className="h-11 w-full rounded-lg border-gray-300"
                        />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="No. Telepon Cabang" error={errors.branch_phone}>
                            <input
                                value={data.branch_phone}
                                onChange={(event) => setData('branch_phone', event.target.value)}
                                className="h-11 w-full rounded-lg border-gray-300"
                                placeholder="Contoh: 0761..."
                            />
                        </Field>

                        <Field label="Jam Operasional Cabang" error={errors.branch_operational_hours}>
                            <input
                                value={data.branch_operational_hours}
                                onChange={(event) => setData('branch_operational_hours', event.target.value)}
                                className="h-11 w-full rounded-lg border-gray-300"
                                placeholder="10.30-21.00 WIB"
                            />
                        </Field>
                    </div>

                    <Field label="Alamat Cabang" error={errors.branch_address}>
                        <textarea
                            value={data.branch_address}
                            onChange={(event) => setData('branch_address', event.target.value)}
                            className="min-h-24 w-full rounded-lg border-gray-300"
                            placeholder="Alamat lengkap cabang yang akan tampil ke pelanggan"
                        />
                    </Field>

                    <div className="flex justify-end">
                        <button disabled={processing} className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
                            {isEdit ? 'Simpan Perubahan' : 'Simpan Cabang'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
