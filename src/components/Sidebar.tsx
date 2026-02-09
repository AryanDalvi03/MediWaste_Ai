import { motion } from 'framer-motion';
import {
  LayoutDashboard, Camera, History, Trophy, MessageSquare, Leaf,
  Users, ClipboardCheck, Building2, LogOut, Zap, ChevronLeft, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useNav, useAuth } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'scanner' as const, icon: Camera, label: 'AI Scanner' },
  { id: 'audit' as const, icon: History, label: 'Audit Manifest' },
  { id: 'ranks' as const, icon: Trophy, label: 'Ward Ranks' },
  { id: 'assistant' as const, icon: MessageSquare, label: 'AI Assistant' },
  { id: 'green' as const, icon: Leaf, label: 'ESG Impact' },
];

const hospitalItems = [
  { id: 'team' as const, icon: Users, label: 'Team Analytics' },
  { id: 'compliance' as const, icon: ClipboardCheck, label: 'Compliance Reports' },
  { id: 'facility' as const, icon: Building2, label: 'Facility Settings' },
];

const Sidebar = () => {
  const { activeTab, setTab, sidebarCollapsed, toggleSidebar } = useNav();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const showHospital = user?.role === 'audit_manager' || user?.role === 'hospital_staff';

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-border bg-sidebar transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'} p-4`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="gradient-teal p-2 rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <h1 className="font-extrabold text-lg tracking-tight text-foreground whitespace-nowrap">
              MediWaste <span className="text-gradient-teal">AI</span>
            </h1>
          )}
        </div>
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0">
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => setTab(item.id)} collapsed={sidebarCollapsed} />
        ))}
        {showHospital && (
          <>
            <div className="my-3 border-t border-border" />
            {hospitalItems.map((item) => (
              <NavButton key={item.id} item={item} active={activeTab === item.id} onClick={() => setTab(item.id)} collapsed={sidebarCollapsed} />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="space-y-3 pt-4">
        <button
          onClick={() => {}}
          className={`w-full bg-destructive text-destructive-foreground rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity ${sidebarCollapsed ? 'p-3 justify-center' : 'p-3 px-4 justify-center'}`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>SOS Protocol</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full rounded-xl text-muted-foreground hover:text-destructive hover:bg-hazard-light transition-all flex items-center gap-2 text-sm font-semibold ${sidebarCollapsed ? 'p-3 justify-center' : 'p-3 px-4'}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
        <div className={`p-3 bg-muted rounded-xl flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          {!sidebarCollapsed && <span className="text-xs font-mono text-muted-foreground uppercase">Cloud Active</span>}
        </div>
      </div>
    </aside>
  );
};

interface NavButtonProps {
  item: { id: string; icon: React.ElementType; label: string };
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}

const NavButton = ({ item, active, onClick, collapsed }: NavButtonProps) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 font-semibold text-sm ${collapsed ? 'p-3 justify-center' : 'p-3 px-4'} ${
      active
        ? 'gradient-teal text-primary-foreground shadow-md'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    }`}
  >
    <item.icon className="w-5 h-5 shrink-0" />
    {!collapsed && <span>{item.label}</span>}
  </motion.button>
);

export default Sidebar;
