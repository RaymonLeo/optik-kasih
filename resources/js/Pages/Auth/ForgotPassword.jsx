import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useEffect, useState } from 'react';

export default function ForgotPassword({ status }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const submit = (e) => {
    e.preventDefault();

    if (!data.email) {
      setAlertType('error');
      setAlertMessage('Email harus diisi terlebih dahulu!');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    post(route('password.email'), {
      onSuccess: () => {
        setAlertType('success');
        setAlertMessage('Link reset password telah dikirim ke email Anda. Silakan periksa inbox atau folder spam.');
        setShowAlert(true);
        setCooldown(60); // Start countdown
        reset(); // Optional: clear input
        setTimeout(() => setShowAlert(false), 8000);
      },
      onError: (errs) => {
        if (errs.email?.includes('Please wait before retrying')) {
          setAlertType('error');
          setAlertMessage('Anda sudah meminta link sebelumnya. Mohon tunggu sebelum mencoba lagi.');
        } else {
          setAlertType('error');
          setAlertMessage('Email yang Anda masukkan tidak valid atau tidak terdaftar.');
        }
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      }
    });
  };

  useEffect(() => {
    document.title = "Lupa Password - Optik Kasih";
  }, []);

  useEffect(() => {
    if (status) {
      setAlertType('success');
      setAlertMessage(status);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 8000);
    }
  }, [status]);

  useEffect(() => {
    if (errors.email) {
      setAlertType('error');
      setAlertMessage('Email yang Anda masukkan tidak valid atau tidak terdaftar.');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  }, [errors]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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
      <Head title="Lupa Password" />
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
            <h1 className="text-3xl font-bold text-gray-800 tracking-wide">Forgot Password</h1>
          </div>

          <p className="text-sm text-gray-600 text-center leading-relaxed mb-6">
            Lupa password? Tidak masalah. Masukkan alamat email Anda dan kami akan mengirimkan link reset password untuk membantu Anda membuat password baru.
          </p>

          <AlertComponent type={alertType} message={alertMessage} show={showAlert} />

          <form onSubmit={submit} className="space-y-6">
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

            {cooldown > 0 && (
              <p className="text-sm text-orange-700 text-center -mt-2">
                Anda bisa kirim ulang dalam <strong>{cooldown}</strong> detik
              </p>
            )}

            <button
              type="submit"
              disabled={processing || cooldown > 0}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengirim...
                </div>
              ) : (
                'Kirim Link Reset Password'
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

      <style jsx>{`
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
