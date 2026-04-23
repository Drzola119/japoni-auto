'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface SearchResult {
  id: string;
  type: 'listing' | 'user';
  title: string;
  subtitle: string;
}

const navigationCommands = [
  { id: 'dashboard', label: 'Tableau de bord', shortcut: 'G D', href: '/admin' },
  { id: 'listings', label: 'Annonces', shortcut: 'G A', href: '/admin/listings' },
  { id: 'users', label: 'Utilisateurs', shortcut: 'G U', href: '/admin/users' },
  { id: 'sellers', label: 'Vendeurs', shortcut: 'G V', href: '/admin/sellers' },
  { id: 'analytics', label: 'Analytique', shortcut: 'G Y', href: '/admin/analytics' },
  { id: 'search-analytics', label: 'Analytiques de Recherche', shortcut: 'G R', href: '/admin/search-analytics' },
  { id: 'security', label: 'Sécurité', shortcut: 'G S', href: '/admin/security' },
  { id: 'tracking', label: 'Suivi', shortcut: 'G T', href: '/admin/tracking' },
  { id: 'queue', label: 'File d\'attente', shortcut: 'G Q', href: '/admin/queue' },
  { id: 'broadcast', label: 'Diffusion', shortcut: 'G B', href: '/admin/broadcast' },
  { id: 'settings', label: 'Paramètres', shortcut: 'G P', href: '/admin/settings' },
];

const actionCommands = [
  { id: 'approve-all', label: 'Approuver tout en attente', shortcut: 'C A', action: 'approveAll' },
  { id: 'new-broadcast', label: 'Nouvelle diffusion', shortcut: 'C N', action: 'newBroadcast' },
  { id: 'export-data', label: 'Exporter les données', shortcut: 'C E', action: 'exportData' },
  { id: 'refresh', label: 'Actualiser', shortcut: 'R', action: 'refresh' },
];

export default function CommandPalette() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentCommands');
    if (stored) {
      setRecentCommands(JSON.parse(stored));
    }
  }, []);

  const saveRecentCommand = useCallback((cmdId: string) => {
    const updated = [cmdId, ...recentCommands.filter(c => c !== cmdId)].slice(0, 5);
    setRecentCommands(updated);
    localStorage.setItem('recentCommands', JSON.stringify(updated));
  }, [recentCommands]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const searchFirestore = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    if (!db) return;

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      const listingsQuery = query(
        collection(db, 'listings'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        limit(5)
      );
      const listingsSnap = await getDocs(listingsQuery);
      listingsSnap.forEach(doc => {
        const data = doc.data();
        searchResults.push({
          id: doc.id,
          type: 'listing',
          title: data.title || 'Annonce sans titre',
          subtitle: `${data.year || 'N/A'} - ${data.price || 0}€`,
        });
      });

      const usersQuery = query(
        collection(db, 'users'),
        where('email', '>=', searchTerm),
        where('email', '<=', searchTerm + '\uf8ff'),
        limit(5)
      );
      const usersSnap = await getDocs(usersQuery);
      usersSnap.forEach(doc => {
        const data = doc.data();
        searchResults.push({
          id: doc.id,
          type: 'user',
          title: data.email || data.name || 'Utilisateur',
          subtitle: data.role || 'user',
        });
      });
    } catch (error) {
      console.error('Search error:', error);
    }

    setResults(searchResults);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchFirestore(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchFirestore]);

  const handleNavigation = useCallback((href: string, cmdId: string) => {
    saveRecentCommand(cmdId);
    router.push(href);
    setOpen(false);
    setSearch('');
  }, [router, saveRecentCommand]);

  const handleAction = useCallback((action: string) => {
    saveRecentCommand(action);
    
    switch (action) {
      case 'approveAll':
        router.push('/admin/queue?action=approveAll');
        break;
      case 'newBroadcast':
        router.push('/admin/broadcast?new=true');
        break;
      case 'exportData':
        window.open('/admin/export', '_blank');
        break;
      case 'refresh':
        window.location.reload();
        break;
      default:
        break;
    }
    
    setOpen(false);
    setSearch('');
  }, [router, saveRecentCommand]);

  const handleResultClick = useCallback((result: SearchResult) => {
    saveRecentCommand(result.id);
    if (result.type === 'listing') {
      router.push(`/admin/listings/${result.id}`);
    } else {
      router.push(`/admin/users/${result.id}`);
    }
    setOpen(false);
    setSearch('');
  }, [router, saveRecentCommand]);

  const filteredNavCommands = useMemo(() => {
    if (!search) return navigationCommands;
    return navigationCommands.filter(cmd => 
      cmd.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredActionCommands = useMemo(() => {
    if (!search) return actionCommands;
    return actionCommands.filter(cmd => 
      cmd.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredResults = useMemo(() => {
    if (!search) return results;
    return results.filter(result =>
      result.title.toLowerCase().includes(search.toLowerCase()) ||
      result.subtitle.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, results]);

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-[#C9A84C] rounded-full shadow-lg flex items-center justify-center hover:bg-[#D4B85D] transition-colors"
        aria-label="Command Palette"
      >
        <svg className="w-6 h-6 text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command Menu"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#1A1A1A] rounded-xl shadow-2xl border border-[#C9A84C]/20 overflow-hidden z-50"
      >
        <div className="flex items-center border-b border-[#C9A84C]/20 px-4">
          <svg className="w-5 h-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Rechercher ou taper une commande..."
            className="w-full bg-transparent px-4 py-4 text-[#F5F0E8] placeholder-[#888] outline-none"
          />
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-[#2A2A2A] text-[#888] rounded">ESC</kbd>
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-[#888]">
            {loading ? 'Recherche en cours...' : 'Aucun résultat trouvé'}
          </Command.Empty>

          {filteredNavCommands.length > 0 && (
            <Command.Group heading="Navigation" className="mb-2">
              <div className="px-2 py-1 text-xs text-[#C9A84C] uppercase tracking-wider">
                Navigation
              </div>
              {filteredNavCommands.map((cmd) => (
                <Command.Item
                  key={cmd.id}
                  value={cmd.label}
                  onSelect={() => handleNavigation(cmd.href, cmd.id)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-[#2A2A2A] data-[selected=true]:bg-[#2A2A2A] transition-colors"
                >
                  <span className="text-[#F5F0E8]">{cmd.label}</span>
                  <kbd className="px-2 py-0.5 text-xs bg-[#2A2A2A] text-[#888] rounded">{cmd.shortcut}</kbd>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {filteredActionCommands.length > 0 && (
            <Command.Group heading="Actions" className="mb-2">
              <div className="px-2 py-1 text-xs text-[#C9A84C] uppercase tracking-wider">
                Actions rapides
              </div>
              {filteredActionCommands.map((cmd) => (
                <Command.Item
                  key={cmd.id}
                  value={cmd.label}
                  onSelect={() => handleAction(cmd.action)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-[#2A2A2A] data-[selected=true]:bg-[#2A2A2A] transition-colors"
                >
                  <span className="text-[#F5F0E8]">{cmd.label}</span>
                  <kbd className="px-2 py-0.5 text-xs bg-[#2A2A2A] text-[#888] rounded">{cmd.shortcut}</kbd>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {filteredResults.length > 0 && (
            <Command.Group heading="Résultats" className="mb-2">
              <div className="px-2 py-1 text-xs text-[#C9A84C] uppercase tracking-wider">
                Résultats de recherche
              </div>
              {filteredResults.map((result) => (
                <Command.Item
                  key={result.id}
                  value={`${result.title} ${result.subtitle}`}
                  onSelect={() => handleResultClick(result)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-[#2A2A2A] data-[selected=true]:bg-[#2A2A2A] transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-[#F5F0E8]">{result.title}</span>
                    <span className="text-xs text-[#888]">{result.subtitle}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    result.type === 'listing' 
                      ? 'bg-[#C9A84C]/20 text-[#C9A84C]' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {result.type === 'listing' ? 'Annonce' : 'Utilisateur'}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="flex items-center justify-between px-4 py-3 border-t border-[#C9A84C]/20 text-xs text-[#888]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#2A2A2A] rounded">↵</kbd>
              <span>Sélectionner</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#2A2A2A] rounded">↑↓</kbd>
              <span>Naviguer</span>
            </span>
          </div>
          <span>Japoni Auto Command</span>
        </div>
      </Command.Dialog>

      {open && (
        <div 
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}