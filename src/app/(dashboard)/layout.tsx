'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { m as motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Car, AlertTriangle, ShieldCheck, Settings, LogOut, PackageOpen, Inbox, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070A]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#C9A84C] animate-spin"></div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.email === 'zickowiko@gmail.com';
  
  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', href: '/admin/users', icon: <Users size={20} /> },
    { name: 'Sellers', href: '/admin/sellers', icon: <ShieldCheck size={20} /> },
    { name: 'Listings', href: '/admin/listings', icon: <Car size={20} /> },
    { name: 'Reports', href: '/admin/reports', icon: <AlertTriangle size={20} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const sellerLinks = [
    { name: 'Overview', href: '/seller-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Listings', href: '/seller-dashboard/listings', icon: <PackageOpen size={20} /> },
    { name: 'Inquiries', href: '/seller-dashboard/inquiries', icon: <Inbox size={20} /> },
    { name: 'Profile', href: '/seller-dashboard/profile', icon: <Settings size={20} /> },
  ];

  const links = isAdmin ? adminLinks : sellerLinks;
  
  if (!isAdmin && pathname.startsWith('/admin')) {
    router.replace('/seller-dashboard');
    return null;
  }

  // Bypass this layout's UI for admin routes so the nested admin/layout.tsx can render exclusively.
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex text-white/90 font-inter" style={{ background: '#0a0a0f' }}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0f0f15] hidden md:flex flex-col relative z-20">
        <div className="p-6 border-b border-white/5">
          <Link href="/">
            <h2 className="text-2xl font-bold tracking-widest text-[#E8C96A]" style={{ fontFamily: 'var(--font-cormorant)' }}>JAPONI <span className="opacity-70">AUTO</span></h2>
          </Link>
          <div className="mt-2 text-[10px] tracking-widest uppercase text-white/40">
            {isAdmin ? 'Admin Console' : 'Seller Portal'}
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-[#C9A84C]/10 text-[#E8C96A]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={isActive ? 'text-[#C9A84C]' : 'opacity-70'}>{link.icon}</div>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex flex-row items-center gap-3 px-4 py-3 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors w-full text-sm font-medium"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
      
      {/* Main Container */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md flex flex-row items-center justify-between px-4 md:px-8 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-white/60 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <div className="font-semibold tracking-wide text-white/80">Dashboard</div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium leading-none">{user.displayName}</div>
                <div className="text-[11px] text-[#C9A84C] uppercase tracking-widest mt-1">{user.role}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B6914] to-[#E8C96A] flex items-center justify-center shadow-lg uppercase font-bold text-[#111]">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Scrollable */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-64 border-r border-white/5 bg-[#0f0f15] fixed md:hidden inset-y-0 left-0 z-40 flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <Link href="/" onClick={() => setSidebarOpen(false)}>
                  <h2 className="text-2xl font-bold tracking-widest text-[#E8C96A]" style={{ fontFamily: 'var(--font-cormorant)' }}>JAPONI <span className="opacity-70">AUTO</span></h2>
                </Link>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-white/60 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        isActive 
                          ? 'bg-[#C9A84C]/10 text-[#E8C96A]' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className={isActive ? 'text-[#C9A84C]' : 'opacity-70'}>{link.icon}</div>
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/5">
                <button 
                  onClick={() => { logout(); setSidebarOpen(false); }}
                  className="flex flex-row items-center gap-3 px-4 py-3 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors w-full text-sm font-medium"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
