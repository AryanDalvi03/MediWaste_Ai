import { create } from 'zustand';
import { ScanEntry, MOCK_ENTRIES, AppUser, UserRole } from '@/lib/protocols';

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => {
  const stored = localStorage.getItem('mediwaste_user');
  const user = stored ? JSON.parse(stored) : null;
  return {
    user,
    isAuthenticated: !!user,
    login: (email, role, name) => {
      const u: AppUser = { email, role, name };
      localStorage.setItem('mediwaste_user', JSON.stringify(u));
      set({ user: u, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('mediwaste_user');
      set({ user: null, isAuthenticated: false });
    },
  };
});

interface ScanState {
  history: ScanEntry[];
  addEntry: (entry: ScanEntry) => void;
  setHistory: (entries: ScanEntry[]) => void;
  refreshFromServer: () => Promise<void>;
}

export const useScanStore = create<ScanState>((set) => ({
  history: MOCK_ENTRIES,
  addEntry: (entry) => set((s) => ({ history: [entry, ...s.history] })),
  setHistory: (entries) => set({ history: entries }),
  refreshFromServer: async () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${baseUrl}/api/scans/recent?limit=50`);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      set({
        history: data.map((d) => ({
          type: String(d.waste_type ?? ""),
          confidence: Number(d.confidence ?? 0),
          timestamp: Number(d.timestamp ?? Date.now()),
        })),
      });
    } catch {
      // Keep existing history (mock/local) if server unreachable.
    }
  },
}));

type Tab = 'dashboard' | 'reports' | 'scanner' | 'audit' | 'ranks' | 'assistant' | 'green' | 'team' | 'compliance' | 'facility' | 'mywork';

interface NavState {
  activeTab: Tab;
  sidebarCollapsed: boolean;
  setTab: (tab: Tab) => void;
  toggleSidebar: () => void;
}

export const useNav = create<NavState>((set) => ({
  activeTab: 'dashboard',
  sidebarCollapsed: false,
  setTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>((set) => {
  const stored = localStorage.getItem('mediwaste_theme') as 'dark' | 'light' | null;
  const theme = stored || 'dark';
  document.documentElement.classList.toggle('light', theme === 'light');
  return {
    theme,
    toggleTheme: () => set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mediwaste_theme', next);
      document.documentElement.classList.toggle('light', next === 'light');
      return { theme: next };
    }),
  };
});
