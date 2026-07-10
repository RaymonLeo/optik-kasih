import SidebarLayout from '@/Components/SidebarLayout';
import { Head } from '@inertiajs/react';
import BranchDisplayForm from './Partials/BranchDisplayForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, isSuperAdmin, branch }) {
    return (
        <SidebarLayout
            title="Pengaturan Akun"
            subtitle={
                isSuperAdmin
                    ? 'Kelola nama, email, dan password akun superadmin.'
                    : 'Kelola informasi cabang yang tampil ke pelanggan.'
            }
        >
            <Head title="Pengaturan Akun" />

            <div className="mx-auto max-w-3xl space-y-5">
                {isSuperAdmin ? (
                    <>
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </>
                ) : (
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                        <BranchDisplayForm branch={branch} />
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
