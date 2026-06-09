// resources/js/Pages/Auth/Login.jsx
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';

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
      <div className={`${alertStyles[type]} p-4 mb-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300`}>
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
      <Head title="Login Admin" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Login Admin</h1>
        <p className="text-slate-500">Silakan masukkan kredensial Anda untuk melanjutkan.</p>
      </div>

      <AlertComponent type={alertType} message={alertMessage} show={showAlert} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            placeholder="admin@optikkasih.com"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 focus:border-[#E56020] focus:ring-4 focus:ring-[#E56020]/10 transition-all duration-300"
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-900 focus:border-[#E56020] focus:ring-4 focus:ring-[#E56020]/10 transition-all duration-300"
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="flex justify-end">
          <a href={route('password.request')} className="text-sm text-[#E56020] hover:text-orange-700 font-medium transition-colors duration-200">
            Lupa Password?
          </a>
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full bg-[#E56020] hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-orange-500/30 flex items-center justify-center"
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : (
            'Masuk Ke Sistem'
          )}
        </button>
      </form>
    </>
  );
}

Login.layout = page => <GuestLayout children={page} />;
