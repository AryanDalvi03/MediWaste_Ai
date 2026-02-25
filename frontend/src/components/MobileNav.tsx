import { LayoutDashboard, Camera, History, Trophy, MessageSquare, Leaf } from 'lucide-react';
import { useNav, useAuth } from '@/lib/store';

const allItems = [
  { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Home' },
  { id: 'scanner' as const, icon: Camera, label: 'Scan' },
  { id: 'audit' as const, icon: History, label: 'Audit' },
  { id: 'ranks' as const, icon: Trophy, label: 'Ranks' },
  { id: 'assistant' as const, icon: MessageSquare, label: 'Chat' },
  { id: 'green' as const, icon: Leaf, label: 'ESG' },
];

const MobileNav = () => {
  const { activeTab, setTab } = useNav();
  const { user } = useAuth();
  const items = allItems.filter((item) => {
    if (item.id === 'ranks' && user?.role === 'common') return false;
    return true;
  });

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 px-2 py-2 flex justify-around z-50" style={{
      background: 'hsla(220, 20%, 8%, 0.85)',
      backdropFilter: 'blur(24px) saturate(180%)',
      borderTop: '1px solid hsla(174, 80%, 48%, 0.1)',
    }}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setTab(item.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
            activeTab === item.id 
              ? 'text-primary neon-text-subtle' 
              : 'text-muted-foreground'
          }`}
        >
          <item.icon className={`w-5 h-5 ${activeTab === item.id ? '' : 'opacity-50'}`} />
          <span className="text-[10px] font-display font-bold tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;
