import { create } from 'zustand';
import { ScanEntry, MOCK_ENTRIES, AppUser, UserRole } from '@/lib/protocols';

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => {
  const stored = localStorage.getItem('mediwaste_user');
  const user = stored ? JSON.parse(stored) : null;
  return {
    user,
    isAuthenticated: !!user,
    login: (email, role) => {
      const u = { email, role };
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
}

export const useScanStore = create<ScanState>((set) => ({
  history: MOCK_ENTRIES,
  addEntry: (entry) => set((s) => ({ history: [entry, ...s.history] })),
}));

type Tab = 'dashboard' | 'scanner' | 'audit' | 'ranks' | 'assistant' | 'green' | 'team' | 'compliance' | 'facility';

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
