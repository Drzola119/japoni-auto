import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Cairo } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "react-hot-toast";
import MotionProvider from "@/components/MotionProvider";

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: "Japoni Auto - Achat & Vente de Voitures en Algérie",
  description: "La plus grande plateforme de vente et d'achat de voitures en Algérie. Trouvez votre voiture idéale parmi des milliers d'annonces vérifiées.",
  keywords: ["voiture algérie", "vente voiture", "achat voiture", "japoni auto", "occasion algérie"],
  openGraph: {
    title: "Japoni Auto",
    description: "Achetez et vendez vos voitures en Algérie",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={`${inter.variable} ${cormorant.variable} ${cairo.variable}`}>
      <head>
        {/* Preload first animation frame as high priority */}
        <link rel="preload" as="image" href="/frames/ezgif-frame-001.jpg" fetchPriority="high" />
      </head>
      <body className="overflow-x-hidden antialiased">
        <AuthProvider>
          <LanguageProvider>
            <MotionProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#1a1a25',
                    color: '#f8fafc',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                  },
                  success: {
                    iconTheme: { primary: '#f97316', secondary: '#fff' },
                  },
                }}
              />
            </MotionProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
