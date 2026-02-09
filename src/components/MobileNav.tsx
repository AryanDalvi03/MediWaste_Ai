import { LayoutDashboard, Camera, History, Trophy, MessageSquare, Leaf } from 'lucide-react';
import { useNav } from '@/lib/store';

const items = [
  { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Home' },
  { id: 'scanner' as const, icon: Camera, label: 'Scan' },
  { id: 'audit' as const, icon: History, label: 'Audit' },
  { id: 'ranks' as const, icon: Trophy, label: 'Ranks' },
  { id: 'assistant' as const, icon: MessageSquare, label: 'Chat' },
  { id: 'green' as const, icon: Leaf, label: 'ESG' },
];

const MobileNav = () => {
  const { activeTab, setTab } = useNav();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 flex justify-around z-50">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setTab(item.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-bold">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;
