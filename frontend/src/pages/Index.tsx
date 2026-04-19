import { useNav } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ReportsStatistics from '@/components/ReportsStatistics';
import AIScanner from '@/components/AIScanner';
import AuditManifest from '@/components/AuditManifest';
import BinOperations from '@/components/BinOperations';
import AIAssistant from '@/components/AIAssistant';
import ESGImpact from '@/components/ESGImpact';
import StaffAnalytics from '@/components/StaffAnalytics';
import ComplianceReports from '@/components/ComplianceReports';
import FacilitySettings from '@/components/FacilitySettings';
import MyWork from '@/components/MyWork';
import MobileNav from '@/components/MobileNav';
import { useAuth } from '@/lib/store';
import { Navigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const tabs: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  reports: ReportsStatistics,
  scanner: AIScanner,
  audit: AuditManifest,
  ranks: BinOperations,
  assistant: AIAssistant,
  green: ESGImpact,
  team: StaffAnalytics,
  compliance: ComplianceReports,
  facility: FacilitySettings,
  mywork: MyWork,
};

const Index = () => {
  const { isAuthenticated } = useAuth();
  const activeTab = useNav((s) => s.activeTab);
  const setTab = useNav((s) => s.setTab);
  const ActiveComponent = tabs[activeTab] || Dashboard;
  const mainRef = useRef<HTMLElement>(null);

  const [alertBins, setAlertBins] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);

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

  // Check for critical bins on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${apiBase}/api/bins`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const criticalBins = data.filter(b => b.status === 'Full' || b.overallFill >= 85);
            if (criticalBins.length > 0) {
              setAlertBins(criticalBins);
              setShowAlert(true);
            }
          }
        })
        .catch(err => console.error("Could not fetch bins for alerts", err));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex h-screen overflow-hidden bg-background bg-grid bg-orb-teal relative">
      <Sidebar />
      <main ref={mainRef} className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-radial-glow relative">
        {/* key={activeTab} forces a fresh mount + scroll reset on every tab switch */}
        <ActiveComponent key={activeTab} />
      </main>
      <MobileNav />

      {/* Alert Popup System */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-[400px] max-w-lg"
          >
            <div className="glass-card overflow-hidden rounded-2xl border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] bg-white/90 dark:bg-[#1a0f14]/90 backdrop-blur-xl">
              <div className="bg-red-500/10 dark:bg-red-500/20 px-4 py-3 border-b border-red-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 animate-pulse" />
                  <span className="font-display font-bold text-sm tracking-widest uppercase text-red-800 dark:text-red-100">Critical Alert</span>
                </div>
                <button onClick={() => setShowAlert(false)} className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-red-950 dark:text-red-50/90 leading-relaxed font-medium">
                  <strong className="text-red-600 dark:text-red-400 text-lg">{alertBins.length}</strong> bin(s) have reached critical capacity and require immediate disposal or monitoring.
                </p>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                  {alertBins.slice(0, 3).map(bin => (
                    <div key={bin.id} className="bg-red-50/50 dark:bg-black/40 rounded-lg p-2.5 text-xs flex justify-between items-center border border-red-500/10">
                      <span className="font-mono text-red-900 dark:text-red-200">ID: {bin.id}</span>
                      <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
                        {bin.overallFill}% Full
                      </span>
                    </div>
                  ))}
                  {alertBins.length > 3 && (
                    <div className="text-xs text-red-600 dark:text-red-400/70 text-center py-1 font-medium">
                      + {alertBins.length - 3} more bins
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setShowAlert(false);
                    setTab('ranks');
                  }}
                  className="w-full mt-2 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] flex items-center justify-center gap-2"
                >
                  View Operations <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
