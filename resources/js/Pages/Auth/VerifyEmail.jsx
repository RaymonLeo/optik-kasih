// resources/js/Pages/Auth/VerifyEmail.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function VerifyEmail({ status }) {
  const { post, processing } = useForm({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('info');
  const [alertMessage, setAlertMessage] = useState('');

  // Munculkan notifikasi ketika berhasil kirim ulang link
  useEffect(() => {
    if (status === 'verification-link-sent') {
      setAlertType('success');
      setAlertMessage('Link verifikasi baru sudah dikirim ke email Anda.');
      setShowAlert(true);
      const t = setTimeout(() => setShowAlert(false), 6000);
      return () => clearTimeout(t);
    } else if (status) {
      setAlertType('info');
      setAlertMessage(status);
      setShowAlert(true);
      const t = setTimeout(() => setShowAlert(false), 6000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const resend = (e) => {
    e.preventDefault();
    post(route('verification.send'), {
      onSuccess: () => {
        setAlertType('success');
        setAlertMessage('Link verifikasi baru sudah dikirim. Silakan cek inbox/spam.');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 6000);
      },
    });
  };

  const Alert = ({ type, message, show, onClose }) => {
    if (!show) return null;
    const classes = {
      success: 'bg-green-50 border-l-4 border-green-500 text-green-700',
      info: 'bg-blue-50 border-l-4 border-blue-500 text-blue-700',
      error: 'bg-red-50 border-l-4 border-red-500 text-red-700',
    };
    const icons = { success: '✅', info: 'ℹ️', error: '⚠️' };
    return (
      <div className={`${classes[type]} p-4 rounded-md shadow-sm mb-5 animate-fade-in`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{icons[type]}</span>
          <p className="text-sm font-medium">{message}</p>
          <button onClick={onClose} className="ml-auto text-xl leading-none hover:opacity-70">
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head title="Verifikasi Email" />

      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('/images/bg-optik.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="bg-[#FFE0D0] rounded-[32px] shadow-xl w-[90%] max-w-xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src="/images/logo-optik.png" alt="Optik Kasih" className="w-56 h-auto mb-2" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
            Verifikasi Email
          </h1>

          <p className="text-sm text-center text-gray-600 mb-6">
            Kami telah mengirimkan link verifikasi ke email Anda.
            <br className="hidden sm:block" />
            Jika belum menerima, silakan kirim ulang menggunakan tombol di bawah ini.
          </p>

          <Alert
            type={alertType}
            message={alertMessage}
            show={showAlert}
            onClose={() => setShowAlert(false)}
          />

          {/* Tombol aksi */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resend}
              disabled={processing}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Mengirim...
                </div>
              ) : (
                'Kirim Ulang Email Verifikasi'
              )}
            </button>

            <Link
              href={route('logout')}
              method="post"
              as="button"
              className="flex-1 bg-white text-gray-800 border border-gray-300 hover:border-gray-400 font-semibold py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
            >
              Keluar
            </Link>
          </div>

          {/* Link balik ke login (opsional) */}
          <div className="text-center mt-6">
            <Link
              href={route('login')}
              className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium"
            >
              Kembali ke Login
            </Link>
          </div>
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
