import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Menu, X, Home, Users, Receipt, Package, Settings, LogOut
} from 'lucide-react';

const SidebarLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />, href: '/dashboard' },
    { name: 'Pasien', icon: <Users size={20} />, href: '/pasien' },
    { name: 'Bon Transaksi', icon: <Receipt size={20} />, href: '/bon-transaksi' },
    { name: 'Produk', icon: <Package size={20} />, href: '/produk' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
    if (window.innerWidth < 1024) closeSidebar();
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    router.post('/logout');
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* LOGO */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img src="/images/logo-optik.png" alt="Optik Kasih Logo" className="h-10 w-10 object-contain" />
              <div className="text-xl font-bold">
                <span className="text-yellow-500">OPTIK</span>
                <span className="text-orange-500 ml-1">KASIH</span>
              </div>
            </div>
            <button onClick={closeSidebar} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          {/* MENU */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={() => handleMenuClick(item.name)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all
                  ${activeMenu === item.name
                    ? 'bg-orange-100 text-orange-700 border-r-4 border-orange-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}
                `}
              >
                <span className={`mr-3 ${activeMenu === item.name ? 'text-orange-600' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>

          {/* BOTTOM */}
          <div className="p-4 border-t border-gray-200 space-y-1">
            <button className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings size={20} className="mr-3" />
              <span className="font-medium">Pengaturan</span>
            </button>
            <button
              onClick={confirmLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={20} className="mr-3" />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0 w-full lg:w-auto">
        <header className="bg-white shadow-sm border-b px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100">
                <Menu size={24} className="text-gray-700" />
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{activeMenu}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">Admin</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Konfirmasi Logout</h2>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin keluar dari akun dan kembali ke halaman login?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarLayout;
