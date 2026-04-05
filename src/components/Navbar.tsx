'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Heart, User, Menu, X, Globe, LogOut, Plus, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      scrolled ? 'glass-dark py-3 shadow-2xl' : 'bg-transparent py-5'
    )}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center" 
               style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <Car className="w-6 h-6 text-white" />
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-all" />
          </div>
          <div>
            <span className="text-xl font-bold text-white leading-none block">JAPONI</span>
            <span className="text-xs font-medium" style={{ color: '#f97316' }}>AUTO</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/', label: t('nav.home') },
            { href: '/listings', label: t('nav.listings') },
            { href: '/sell', label: t('nav.sell') },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border"
            style={{
              background: 'rgba(249,115,22,0.1)',
              borderColor: 'rgba(249,115,22,0.3)',
              color: '#f97316',
            }}
          >
            <Globe className="w-4 h-4" />
            {language === 'fr' ? 'عربي' : 'Français'}
          </button>

          {user ? (
            <>
              {/* Favorites */}
              <Link href="/favorites" className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Heart className="w-5 h-5" />
              </Link>

              {/* Post Ad button */}
              <Link href="/sell" className="btn-primary text-sm py-2.5 px-5">
                <Plus className="w-4 h-4" />
                {t('nav.sell')}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                       style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', profileOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50"
                      style={{ background: '#1a1a25', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-white font-semibold text-sm">{user.displayName}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link href="/profile" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                          <User className="w-4 h-4" /> {t('nav.profile')}
                        </Link>
                        {user.role === 'admin' && (
                          <Link href="/admin" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all">
                            <Shield className="w-4 h-4" /> {t('nav.admin')}
                          </Link>
                        )}
                        <button onClick={() => { logout(); setProfileOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all w-full">
                          <LogOut className="w-4 h-4" /> {t('nav.logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn-secondary text-sm py-2.5 px-5">
                {t('nav.login')}
              </Link>
              <Link href="/auth?mode=register" className="btn-primary text-sm py-2.5 px-5">
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2.5 rounded-xl text-white hover:bg-white/10 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: '#111118', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="p-4 flex flex-col gap-2">
              {[
                { href: '/', label: t('nav.home') },
                { href: '/listings', label: t('nav.listings') },
                { href: '/sell', label: t('nav.sell') },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium">
                  {item.label}
                </Link>
              ))}
              <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
              <button
                onClick={() => { setLanguage(language === 'fr' ? 'ar' : 'fr'); setMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium"
                style={{ color: '#f97316', background: 'rgba(249,115,22,0.08)' }}>
                <Globe className="w-4 h-4" />
                {language === 'fr' ? 'عربي' : 'Français'}
              </button>
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Link href="/auth" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-center text-sm py-2.5">
                    {t('nav.login')}
                  </Link>
                  <Link href="/auth?mode=register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center text-sm py-2.5">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
              {user && (
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all font-medium">
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
