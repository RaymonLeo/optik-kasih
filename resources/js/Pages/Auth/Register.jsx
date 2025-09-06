// resources/js/Pages/Auth/Register.jsx
import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

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
      onError: (errs) => {
        // Tampilkan pesan error paling penting/terspesifik
        const msg =
          errs?.email ??
          errs?.name ??
          errs?.password ??
          errs?.password_confirmation ??
          'Terjadi kesalahan. Periksa kembali input Anda.';

        setAlertMessage(msg);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      },
      onSuccess: () => {
        // Bersihkan field password, biarkan lainnya
        reset('password', 'password_confirmation');
        setShowAlert(false);
      },
      preserveScroll: true,
    });
  };

  useEffect(() => {
    document.title = 'Daftar - Optik Kasih';
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
        <div className="bg-white/90 backdrop-blur rounded-[28px] shadow-xl w-[92%] max-w-md p-8 md:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/logo-optik.png"
              alt="Optik Kasih"
              className="w-56 h-auto mb-3"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Buat Akun</h1>
            <p className="text-sm text-gray-600 mt-1">
              Sudah punya akun?{' '}
              <Link href={route('login')} className="text-orange-600 hover:underline">
                Login di sini
              </Link>
            </p>
          </div>

          {/* Global Alert (mis. email sudah terdaftar) */}
          {showAlert && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 rounded-md shadow-sm mb-4">
              <p className="text-sm font-medium">{alertMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
                autoComplete="name"
              />
              <InputError message={errors.name} className="mt-1" />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="Masukkan email aktif Anda"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
                autoComplete="email"
              />
              <InputError message={errors.email} className="mt-1" />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
                autoComplete="new-password"
              />
              <InputError message={errors.password} className="mt-1" />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Konfirmasi Password
              </label>
              <input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                placeholder="Ulangi password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700"
                autoComplete="new-password"
              />
              <InputError message={errors.password_confirmation} className="mt-1" />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {processing ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
