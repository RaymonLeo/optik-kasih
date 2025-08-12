import React from 'react';

const DashboardContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Content</h2>
        <p className="text-gray-600">
          Konten dashboard akan ditambahkan nanti sesuai kebutuhan.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Sidebar sekarang sudah berfungsi dengan baik. Coba klik tombol hamburger (☰) di kiri atas untuk membuka/tutup sidebar di layar mobile atau tablet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
