import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useEffect, useState } from 'react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        if (!data.password || !data.password_confirmation) {
            setAlertType('error');
            setAlertMessage('Password dan konfirmasi password harus diisi!');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
            return;
        }

        if (data.password !== data.password_confirmation) {
            setAlertType('error');
            setAlertMessage('Password dan konfirmasi password tidak cocok!');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
            return;
        }

        if (data.password.length < 8) {
            setAlertType('error');
            setAlertMessage('Password harus minimal 8 karakter!');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
            return;
        }

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                setAlertType('success');
                setAlertMessage('Password berhasil diubah! Silakan login dengan password baru Anda.');
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 8000);
            },
            onError: () => {
                setAlertType('error');
                setAlertMessage('Terjadi kesalahan. Silakan periksa kembali data yang Anda masukkan.');
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 5000);
            }
        });
    };

    useEffect(() => {
        document.title = "Reset Password - Optik Kasih";
    }, []);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setAlertType('error');
            setAlertMessage('Silakan periksa kembali data yang Anda masukkan.');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
        }
    }, [errors]);

    const AlertComponent = ({ type, message, show }) => {
        if (!show) return null;

        const alertStyles = {
            error: 'bg-red-50 border-l-4 border-red-400 text-red-700',
            info: 'bg-blue-50 border-l-4 border-blue-400 text-blue-700',
            success: 'bg-green-50 border-l-4 border-green-400 text-green-700'
        };

        const iconStyles = {
            error: '⚠️',
            info: 'ℹ️',
            success: '✅'
        };

        return (
            <div className={`${alertStyles[type]} p-4 mb-4 rounded-md shadow-sm animate-fade-in`}>
                <div className="flex items-center">
                    <span className="text-lg mr-2">{iconStyles[type]}</span>
                    <p className="text-sm font-medium">{message}</p>
                    <button
                        onClick={() => setShowAlert(false)}
                        className="ml-auto text-lg hover:opacity-70 transition-opacity"
                    >
                        ×
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Reset Password" />
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundImage: "url('/images/bg-optik.png')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'repeat',
                }}
            >
                <div className="bg-[#FFE0D0] rounded-[32px] shadow-xl w-[90%] max-w-md p-8 md:p-10">
                    <div className="flex flex-col items-center mb-8">
                        <img src="/images/logo-optik.png" alt="Optik Kasih Logo" className="w-60 h-auto mb-4" />
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 tracking-wide">New Password</h1>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-600 text-center leading-relaxed">
                            Masukkan password baru Anda. Pastikan password minimal 8 karakter untuk keamanan yang lebih baik.
                        </p>
                    </div>

                    <AlertComponent type={alertType} message={alertMessage} show={showAlert} />

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                readOnly
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Panjang minimal 8 karakter"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200 text-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                >
                                    👁
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi password baru"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200 text-gray-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                >
                                    👁
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-1" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mengubah Password...
                                </div>
                            ) : (
                                'Ubah Password'
                            )}
                        </button>

                        <div className="text-center">
                            <a
                                href={route('login')}
                                className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium transition-colors duration-200"
                            >
                                ← Kembali ke Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
