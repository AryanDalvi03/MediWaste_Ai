import { useNav } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ReportsStatistics from '@/components/ReportsStatistics';
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
import { useRef, useEffect } from 'react';

const tabs: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  reports: ReportsStatistics,
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
  const mainRef = useRef<HTMLElement>(null);

  // Reset scroll to top whenever the active tab changes, safely bypassing transition states
  useEffect(() => {
    const resetScroll = () => {
      if (mainRef.current) mainRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
    };
    resetScroll();
    requestAnimationFrame(resetScroll);
    setTimeout(resetScroll, 50);
  }, [activeTab]);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex h-screen overflow-hidden bg-background bg-grid bg-orb-teal">
      <Sidebar />
      <main ref={mainRef} className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-radial-glow">
        {/* key={activeTab} forces a fresh mount + scroll reset on every tab switch */}
        <ActiveComponent key={activeTab} />
      </main>
      <MobileNav />
    </div>
  );
};

export default Index;
