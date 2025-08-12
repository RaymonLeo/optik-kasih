import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useEffect, useState } from 'react';

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('register'), {
      onError: () => {
        setAlertMessage('Terjadi kesalahan. Periksa kembali input Anda.');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      },
      onSuccess: () => reset('password', 'password_confirmation'),
    });
  };

  useEffect(() => {
    document.title = "Daftar - Optik Kasih";
  }, []);

  return (
    <>
      <Head title="Register" />
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
            <img
              src="/images/logo-optik.png"
              alt="Optik Kasih Logo"
              className="w-60 h-auto mb-4"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 tracking-wide">Buat Akun</h1>
          </div>

          {showAlert && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-4 rounded-md shadow-sm">
              <p className="text-sm font-medium">{alertMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
              />
              <InputError message={errors.name} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="Masukkan email aktif Anda"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
              />
              <InputError message={errors.email} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
              />
              <InputError message={errors.password} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password</label>
              <input
                type="password"
                name="password_confirmation"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                placeholder="Ulangi password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
              />
              <InputError message={errors.password_confirmation} className="mt-1" />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {processing ? "Memproses..." : "Daftar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
