'use client';

import Link from 'next/link';
import { Car, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {

  return (
    <footer style={{ background: '#0a0a0f', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">JAPONI</span>
                <span className="text-xl font-bold" style={{ color: '#f97316' }}> AUTO</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              La plateforme N°1 pour acheter et vendre des voitures en Algérie. Des milliers d&apos;annonces vérifiées dans toutes les wilayas.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {['FB', 'IG', 'X', 'YT'].map((label, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 text-xs font-bold text-slate-400"
                   style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/listings', label: 'Annonces' },
                { href: '/sell', label: 'Vendre' },
                { href: '/auth', label: 'Se connecter' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 hover:text-orange-400 text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                +213 555 12 34 56
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                contact@japoni-auto.dz
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                Alger, Algérie
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
             style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-slate-500 text-sm">© 2025 Japoni Auto. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
