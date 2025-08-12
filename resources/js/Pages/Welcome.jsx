import React from 'react';
import { Link } from '@inertiajs/react';

const Welcome = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: 'url(/images/bg-optik.png)',
      }}
    >
      <div className="bg-white bg-opacity-90 backdrop-blur-lg p-10 rounded-xl shadow-xl max-w-lg text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">
          Selamat Datang di Website
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Manajemen Optik Kasih
        </h2>
        <p className="text-sm text-gray-600 mb-8">
          Silakan login jika Anda sudah memiliki akun, atau daftar terlebih dahulu untuk mengakses sistem.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/login"
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-md"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 bg-white hover:bg-gray-100 text-orange-600 border border-orange-600 font-semibold rounded-lg shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
