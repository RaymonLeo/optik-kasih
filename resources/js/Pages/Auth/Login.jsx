// resources/js/Pages/Auth/Login.jsx
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useEffect, useState } from 'react';

export default function Login() {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      setAlertType('error');
      setAlertMessage('Email dan password harus diisi terlebih dahulu!');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    post(route('login'), {
      onFinish: () => reset('password'),
      onError: () => {
        setAlertType('error');
        setAlertMessage('Email atau password yang Anda masukkan salah. Silakan coba lagi.');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      }
    });
  };

  useEffect(() => {
    document.title = "Login - Optik Kasih";
  }, []);

  useEffect(() => {
    if (errors.email || errors.password) {
      setAlertType('error');
      setAlertMessage('Pastikan email dan password telah diisi dengan benar.');
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
    const iconStyles = { error: '⚠️', info: 'ℹ️', success: '✅' };

    return (
      <div className={`${alertStyles[type]} p-4 mb-4 rounded-md shadow-sm animate-fade-in`}>
        <div className="flex items-center">
          <span className="text-lg mr-2">{iconStyles[type]}</span>
          <p className="text-sm font-medium">{message}</p>
          <button onClick={() => setShowAlert(false)} className="ml-auto text-lg hover:opacity-70 transition-opacity">×</button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head title="Login" />
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundImage: "url('/images/bg-optik.png')", backgroundSize: 'cover', backgroundRepeat: 'repeat' }}
      >
        <div className="bg-[#FFE0D0] rounded-[32px] shadow-xl w-[90%] max-w-md p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <img src="/images/logo-optik.png" alt="Optik Kasih Logo" className="w-60 h-auto mb-4" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 tracking-wide">Login</h1>
          </div>

          <AlertComponent type={alertType} message={alertMessage} show={showAlert} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="Masukkan email Anda"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200 text-gray-700"
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
                placeholder="Masukkan password Anda"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200 text-gray-700"
              />
              <InputError message={errors.password} className="mt-1" />
            </div>

            <div className="flex justify-end">
              <a href={route('password.request')} className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium transition-colors duration-200">
                Lupa Password?
              </a>
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
                  Memproses...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* GANTI: gunakan <style> biasa, bukan <style jsx> */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </>
  );
}
