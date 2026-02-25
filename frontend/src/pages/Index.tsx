import { useNav } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import AIScanner from '@/components/AIScanner';
import AuditManifest from '@/components/AuditManifest';
import WardRanks from '@/components/WardRanks';
import AIAssistant from '@/components/AIAssistant';
import ESGImpact from '@/components/ESGImpact';
import TeamAnalytics from '@/components/TeamAnalytics';
import ComplianceReports from '@/components/ComplianceReports';
import FacilitySettings from '@/components/FacilitySettings';
import MobileNav from '@/components/MobileNav';
import { useAuth } from '@/lib/store';
import { Navigate } from 'react-router-dom';

const tabs: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  scanner: AIScanner,
  audit: AuditManifest,
  ranks: WardRanks,
  assistant: AIAssistant,
  green: ESGImpact,
  team: TeamAnalytics,
  compliance: ComplianceReports,
  facility: FacilitySettings,
};

const Index = () => {
  const { isAuthenticated } = useAuth();
  const activeTab = useNav((s) => s.activeTab);
  const ActiveComponent = tabs[activeTab] || Dashboard;

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex h-screen overflow-hidden bg-background bg-grid bg-orb-teal">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-radial-glow">
        <ActiveComponent />
      </main>
      <MobileNav />
    </div>
  );
};

export default Index;
