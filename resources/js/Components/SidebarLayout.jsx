// appV1.0 Rev 3 - Sidebar operasional untuk manajemen toko Optik Kasih.

import React, { useMemo, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronRight,
  Glasses,
  History,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

const primary = "#E56020";

export default function SidebarLayout({ children, title = "Dashboard", subtitle = "" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { url, props } = usePage();
  const user = props.auth?.user;
  const isSuperAdmin = user?.role === "super_admin";

  const isActive = (href) => url === href || url.startsWith(`${href}/`);

  const menuGroups = useMemo(() => {
    if (isSuperAdmin) {
      return [
        {
          label: "Pusat Kontrol",
          items: [
            { name: "Dashboard", icon: BarChart3, href: "/super_admin/dashboard", active: isActive("/super_admin/dashboard") },
            { name: "Cabang Toko", icon: Building2, href: "/super_admin/admins", active: isActive("/super_admin/admins") },
            { name: "Data Pasien", icon: Users, href: "/pasien", active: isActive("/pasien") },
          ],
        },
        {
          label: "Inventori & Penjualan",
          items: [
            { name: "Produk Global", icon: Package, href: "/super_admin/produk", active: isActive("/super_admin/produk") },
            { name: "Lensa Global", icon: Glasses, href: "/super_admin/lensa", active: isActive("/super_admin/lensa") },
            { name: "Transaksi Global", icon: ReceiptText, href: "/super_admin/transaksi", active: isActive("/super_admin/transaksi") },
          ],
        },
        {
          label: "Audit",
          items: [
            { name: "History Perubahan", icon: History, href: "/super_admin/history", active: isActive("/super_admin/history") },
          ],
        },
      ];
    }

    return [
      {
        label: "Operasional Cabang",
        items: [
          { name: "Dashboard", icon: BarChart3, href: "/admin/dashboard", active: isActive("/admin/dashboard") },
          { name: "Pasien", icon: Users, href: "/pasien", active: isActive("/pasien") },
          { name: "Transaksi", icon: ReceiptText, href: "/admin/transaksi", active: isActive("/admin/transaksi") },
          { name: "Lensa", icon: Glasses, href: "/admin/lensa", active: isActive("/admin/lensa") },
          { name: "Produk", icon: Package, href: "/admin/produk", active: isActive("/admin/produk") },
        ],
      },
    ];
  }, [url, isSuperAdmin]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    router.post("/logout");
  };

  const initials = (user?.name || "OK")
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6F8] text-slate-900">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-40 bg-slate-950/55 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-slate-800 bg-[#111318] text-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <Link href={isSuperAdmin ? "/super_admin/dashboard" : "/admin/dashboard"} className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white">
                  <img src="/images/logo-optik.png" alt="Optik Kasih" className="h-9 w-9 object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-extrabold leading-tight">Optik Kasih</span>
                  <span className="block truncate text-xs font-medium text-slate-400">
                    {isSuperAdmin ? "Super Admin Center" : "Cabang Store Panel"}
                  </span>
                </span>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: primary }}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user?.name || "Admin"}</p>
                  <p className="truncate text-xs text-slate-400">{isSuperAdmin ? "Akses penuh toko" : "Admin cabang"}</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {menuGroups.map((group) => (
              <div key={group.label} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                          item.active
                            ? "bg-[#E56020] text-white shadow-lg shadow-orange-950/25"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                        onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        {item.active && <ChevronRight className="h-4 w-4 shrink-0" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-3">
            <Link href="/profile" className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white">
              <Settings className="h-5 w-5" />
              Pengaturan Akun
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="mt-1 flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-red-300 hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="h-5 w-5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden">
              <Menu size={22} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-extrabold text-slate-950 sm:text-xl">{title}</h1>
                {isSuperAdmin && (
                  <span className="hidden rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#E56020] sm:inline-flex">
                    Super Admin
                  </span>
                )}
              </div>
              {subtitle && <p className="truncate text-xs font-medium text-slate-500">{subtitle}</p>}
            </div>
          </div>

          <div className="hidden min-w-[260px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500">Pantau cabang, stok, pasien, dan transaksi</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex">
              <Activity className="h-4 w-4" />
              Online
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">
              {isSuperAdmin ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">
          <div className="ok-page-transition mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-950">Keluar dari sistem?</h2>
            <p className="mt-2 text-sm text-slate-600">Sesi kerja Anda akan ditutup dan kembali ke halaman login.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Batal
              </button>
              <button onClick={handleLogout} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
