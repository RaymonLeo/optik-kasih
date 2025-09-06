import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useEffect, useState } from 'react';

export default function ResetPassword({ token, email }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    token: token || '',
    email: email || '',
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
        setAlertMessage('Password berhasil diubah! Silakan login dengan password baru.');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 8000);
      },
      onError: () => {
        setAlertType('error');
        setAlertMessage('Token reset tidak valid atau sudah kedaluwarsa. Buat link baru dari halaman “Lupa Password”.');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 6000);
      },
      preserveScroll: true,
    });
  };

  useEffect(() => {
    document.title = 'Reset Password - Optik Kasih';
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
      success: 'bg-green-50 border-l-4 border-green-400 text-green-700',
    };
    const icon = { error: '⚠️', info: 'ℹ️', success: '✅' }[type] ?? 'ℹ️';

    return (
      <div className={`${alertStyles[type]} p-4 mb-4 rounded-md shadow-sm`}>
        <div className="flex items-center">
          <span className="text-lg mr-2">{icon}</span>
          <p className="text-sm font-medium">{message}</p>
          <button onClick={() => setShowAlert(false)} className="ml-auto text-lg">×</button>
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

          <p className="text-sm text-gray-600 text-center mb-6">
            Masukkan password baru Anda. Minimal 8 karakter.
          </p>

          <AlertComponent type={alertType} message={alertMessage} show={showAlert} />

          <form onSubmit={submit} className="space-y-6">
            {/* Wajib kirim token */}
            <input type="hidden" name="token" value={data.token} />

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
              <InputError message={errors.token} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Panjang minimal 8 karakter"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  👁
                </button>
              </div>
              <InputError message={errors.password_confirmation} className="mt-1" />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-md"
            >
              {processing ? 'Mengubah Password…' : 'Ubah Password'}
            </button>

            <div className="text-center">
              <a href={route('login')} className="text-sm text-orange-600 hover:text-orange-700 hover:underline">
                ← Kembali ke Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
