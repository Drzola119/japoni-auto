'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from "framer-motion";
import { Heart, User, Menu, X, Globe, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import AnimatedLogo from './AnimatedLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  return (
    <>
      {/* Top Banner */}
      <div 
        className="w-full flex items-center justify-center fixed top-0 z-[101] transition-transform duration-500 ease-out"
        style={{ 
          height: '32px', 
          background: 'linear-gradient(90deg, #0A0A0F, #1a1508, #0A0A0F)',
          borderBottom: '1px solid rgba(201, 168, 76, 0.12)',
          transform: scrolled ? 'translateY(-100%)' : 'translateY(0)'
        }}
      >
        <div 
          className="text-[#C9A84C] uppercase tracking-[0.2em] relative"
          style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.7rem' }}
        >
          <span className="opacity-0 lg:opacity-100 transition-opacity">──── </span>
          ⭐ Algérie&apos;s #1 Car Marketplace
          <span className="opacity-0 lg:opacity-100 transition-opacity"> ────</span>
        </div>
      </div>

      {/* Main Navbar */}
      <header 
        className="fixed left-0 right-0 z-[100] transition-all duration-500 ease-out"
        style={{
          top: scrolled ? '0px' : '32px',
          height: '68px',
          background: scrolled ? 'rgba(7,7,12,0.95)' : 'rgba(7,7,12,0.7)',
          backdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(201,168,76,0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="group">
            <AnimatedLogo variant="navbar" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: '/', label: t('nav.home'), show: true },
              { href: '/cars', label: t('nav.listings'), show: true },
              { 
                href: user?.role === 'seller' ? '/seller-dashboard/listings/new' : '/seller-dashboard', 
                label: user?.role === 'seller' ? 'Vendre' : (user?.role === 'admin' ? 'Dashboard' : 'Devenir Vendeur'),
                show: true 
              },
              { href: '#', label: 'Contact', show: true }
            ].filter(item => item.show).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative group py-2"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9480' }}
              >
                <span className="group-hover:text-[#F5F0E8] transition-colors duration-200">
                  {item.label}
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-2 group hover:text-[#C9A84C] transition-colors duration-200"
              style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9480' }}
            >
              <Globe className="w-4 h-4 group-hover:text-[#C9A84C]" />
              {language === 'fr' ? 'عربي' : 'FR'}
            </button>

            <div className="w-[1px] h-4 bg-[rgba(255,255,255,0.06)] mx-2" />

            {user ? (
              <>
                <Link href="/favorites" className="relative group p-2 text-[#9A9480] hover:text-[#C9A84C] transition-colors">
                  <Heart className="w-4 h-4" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-[rgba(255,255,255,0.03)] transition-all border border-[rgba(255,255,255,0.04)]"
                  >
                    <div className="w-7 h-7 rounded-sm flex items-center justify-center font-bold text-[#07070C] text-xs bg-[#C9A84C]">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={cn('w-3 h-3 text-[#9A9480] transition-transform', profileOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-52 rounded-sm overflow-hidden z-[110]"
                        style={{ background: '#111118', border: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                      >
                        <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
                          <p className="text-[#F5F0E8] font-medium text-sm truncate">{user.displayName}</p>
                          <p className="text-[#4A4840] text-xs mt-1 truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link href="/account" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[#9A9480] hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.04)] transition-all">
                            <User className="w-4 h-4" /> Mon Compte
                          </Link>
                          {user.role === 'seller' && (
                            <Link href="/seller-dashboard" onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[#C9A84C] hover:bg-[rgba(201,168,76,0.08)] transition-all mt-1">
                              <Shield className="w-4 h-4" /> Espace Vendeur
                            </Link>
                          )}
                          {user.role === 'admin' && (
                            <Link href="/admin" onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[#C9A84C] hover:bg-[rgba(201,168,76,0.08)] transition-all mt-1">
                              <Shield className="w-4 h-4" /> {t('nav.admin')}
                            </Link>
                          )}
                          <button onClick={() => { logout(); setProfileOpen(false); }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[#9A9480] hover:text-[#F5F0E8] hover:bg-[rgba(255,255,255,0.03)] transition-all w-full text-left mt-1">
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
                <Link 
                  href="/login" 
                  className="btn-ghost transition-all duration-200"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: '#C9A84C',
                    padding: '0.4rem 1.25rem',
                    borderRadius: '2px',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.78rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#C9A84C';
                    e.currentTarget.style.color = '#07070C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#C9A84C';
                  }}
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  href="/register" 
                  className="btn-primary transition-all duration-200"
                  style={{
                    background: '#C9A84C',
                    color: '#07070C',
                    border: 'none',
                    padding: '0.4rem 1.5rem',
                    borderRadius: '2px',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E8C96B';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#C9A84C';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-sm text-[#C9A84C] hover:bg-[rgba(201,168,76,0.1)] transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Full Screen Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] flex flex-col justify-center items-center"
            style={{ background: '#07070C', backdropFilter: 'blur(24px)' }}
          >
            <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
              {[
                { href: '/', label: t('nav.home') },
                { href: '/cars', label: t('nav.listings') },
                { href: '/seller-dashboard', label: 'Vendre' },
                { href: '#', label: 'Contact' }
              ].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Link 
                    href={item.href} 
                    onClick={() => setMenuOpen(false)}
                    className="text-[#F5F0E8] hover:text-[#C9A84C] transition-colors"
                    style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', letterSpacing: '0.1em' }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              
              <div className="w-full h-[1px] bg-[rgba(201,168,76,0.15)] my-4" />

              <button
                onClick={() => { setLanguage(language === 'fr' ? 'ar' : 'fr'); setMenuOpen(false); }}
                className="flex items-center gap-2 text-[#C9A84C]"
                style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                <Globe className="w-5 h-5" />
                {language === 'fr' ? 'عربي' : 'FRANÇAIS'}
              </button>

              {!user ? (
                <div className="flex flex-col w-full gap-4 mt-8">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary w-full py-4 text-center">
                    {t('nav.login')}
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full py-4 text-center">
                    {t('nav.register')}
                  </Link>
                </div>
              ) : (
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center justify-center gap-3 w-full py-4 mt-8 text-[#9A9480] hover:text-[#F5F0E8] border border-[rgba(255,255,255,0.06)] rounded-sm">
                  <LogOut className="w-5 h-5" /> {t('nav.logout')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
