'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';

export default function Footer() {
  return (
    <footer 
      style={{ 
        background: '#07070C', 
        borderTop: '1px solid rgba(201,168,76,0.08)',
        paddingTop: '4rem',
        paddingBottom: '2rem'
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="group mb-8 block">
              <AnimatedLogo variant="footer" />
            </Link>
            
            <p 
              className="mb-8"
              style={{ 
                fontFamily: '"Inter", sans-serif', 
                fontWeight: 300, 
                fontSize: '0.875rem', 
                color: '#4A4840', 
                maxWidth: '28ch', 
                lineHeight: 1.9 
              }}
            >
              Algeria's #1 platform for buying and selling premium cars. Excellence in every transaction.
            </p>
            
            <div className="flex items-center gap-3">
              {['FB', 'IG', 'X', 'YT'].map((label) => (
                <a 
                  key={label} 
                  href="#" 
                  className="w-11 h-11 flex items-center justify-center transition-all duration-300 group"
                  style={{ 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px',
                    color: '#4A4840',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.7rem',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
                    e.currentTarget.style.color = '#C9A84C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#4A4840';
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 
              style={{ 
                fontFamily: '"Inter", sans-serif', 
                fontWeight: 600, 
                fontSize: '0.7rem', 
                letterSpacing: '0.25em', 
                textTransform: 'uppercase', 
                color: '#C9A84C', 
                marginBottom: '1.5rem' 
              }}
            >
              Navigation
            </h3>
            <ul className="space-y-4">
              {[
                { href: '/', label: 'Home' },
                { href: '/cars', label: 'Cars' },
                { href: '/seller-dashboard/listings/new', label: 'Sell Your Car' },
                { href: '/login', label: 'My Account' },
              ].map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="transition-colors duration-200"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.875rem', color: '#4A4840' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F5F0E8'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#4A4840'}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 
              style={{ 
                fontFamily: '"Inter", sans-serif', 
                fontWeight: 600, 
                fontSize: '0.7rem', 
                letterSpacing: '0.25em', 
                textTransform: 'uppercase', 
                color: '#C9A84C', 
                marginBottom: '1.5rem' 
              }}
            >
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone size={14} color="#C9A84C" />
                <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.875rem', color: '#4A4840' }}>+213 555 12 34 56</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} color="#C9A84C" />
                <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.875rem', color: '#4A4840' }}>contact@japoni-auto.dz</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={14} color="#C9A84C" />
                <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.875rem', color: '#4A4840' }}>Algiers, Algeria</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ 
            borderTop: '1px solid rgba(255,255,255,0.04)',
            paddingTop: '1.5rem'
          }}
        >
          <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.75rem', color: '#4A4840' }}>
            © {new Date().getFullYear()} Japoni Auto. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link 
              href="/privacy" 
              className="transition-colors duration-200"
              style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.75rem', color: '#4A4840' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#9A9480'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4A4840'}
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="transition-colors duration-200"
              style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '0.75rem', color: '#4A4840' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#9A9480'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4A4840'}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}