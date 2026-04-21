'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  }, []);

  const allSet = Object.values(envVars).every(v => v && v !== 'undefined' && v.length > 5);

  return (
    <div className="min-h-screen bg-black text-white p-12 pt-32 font-mono">
      <h1 className="text-3xl font-bold mb-8 text-[#C9A84C]">Firebase Diagnostics</h1>
      
      <div className="space-y-4">
        {Object.entries(envVars).map(([key, value]) => {
          const isSet = value && value !== 'undefined' && value.length > 5;
          return (
            <div key={key} className="p-4 border border-white/10 rounded-lg flex justify-between items-center bg-white/5">
              <div>
                <span className="text-white/50">{key}</span>
                <div className="text-lg mt-1">
                  {isSet ? (
                    <span className="text-emerald-400">✓ Configuré</span>
                  ) : (
                    <span className="text-rose-500 font-bold">⚠️ MANQUANT</span>
                  )}
                </div>
              </div>
              {isSet && <span className="text-xs text-white/20">Valide</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 border-2 border-dashed border-[#C9A84C]/30 rounded-2xl bg-[#C9A84C]/5">
        <h2 className="text-xl font-bold mb-4 text-[#C9A84C]">Instructions de Réparation</h2>
        {allSet ? (
          <p className="text-emerald-400 font-bold text-lg animate-pulse">
            Toutes les clés sont présentes ! Si vous voyez encore l&apos;erreur, essayez de vider le cache de votre navigateur.
          </p>
        ) : (
          <div className="space-y-4 text-white/80">
            <p className="text-rose-400 font-bold">L&apos;application ne peut pas fonctionner car certaines clés sont manquantes sur Hostinger.</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Connectez-vous à votre panel Hostinger.</li>
              <li>Allez dans <b>Avancé</b> {'>'} <b>Variables d&apos;environnement</b>.</li>
              <li>Ajoutez les clés marquées en rouge ci-dessus avec leurs valeurs de Firebase.</li>
              <li><b>IMPORTANT:</b> Une fois les clés ajoutées, vous DEVEZ cliquer sur <b>Re-build</b> ou <b>Deploy</b> dans la section Node.js de Hostinger.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
