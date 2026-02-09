import { motion } from 'framer-motion';
import { Activity, Maximize } from 'lucide-react';
import { useScanStore } from '@/lib/store';
import { PROTOCOLS } from '@/lib/protocols';

const Dashboard = () => {
  const history = useScanStore((s) => s.history);
  const hazCount = history.filter((h) => (PROTOCOLS[h.type] || PROTOCOLS.default).hazardous).length;
  const carbon = history.reduce((acc, curr) => acc + (PROTOCOLS[curr.type]?.co2 || 0), 0);

  return (
    <div className="space-y-8 animate-slide-up">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">Command Center</h2>
          <p className="text-muted-foreground mt-1 text-sm">Facility-wide clinical waste management overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-xl glass-card text-muted-foreground hover:text-primary transition-all hover:neon-glow-sm">
            <Maximize className="w-5 h-5" />
          </button>
          <div className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2.5 neon-border">
            <div className="w-2 h-2 rounded-full bg-safe neon-dot animate-pulse" />
            <span className="font-display font-bold text-[10px] tracking-widest uppercase text-foreground">Cloud Active</span>
          </div>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Total Operations" value={String(history.length)} />
        <MetricCard label="Infectious Hazard" value={String(hazCount)} variant="hazard" />
        <MetricCard label="Carbon Avoidance" value={`${carbon.toFixed(2)} kg`} variant="eco" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Live Stream */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-foreground">
            <Activity className="w-5 h-5 text-primary neon-text-subtle" /> Live Inference Stream
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {history.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground italic text-sm">Standby for incoming scan data...</p>
            ) : (
              history.slice(0, 6).map((item, i) => {
                const proto = PROTOCOLS[item.type] || PROTOCOLS.default;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl glass-card-hover"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${proto.hazardous ? 'bg-hazard neon-hazard' : 'bg-safe neon-dot'}`} />
                      <span className="font-semibold text-sm text-foreground">{item.type}</span>
                    </div>
                    <span className={`text-xs font-display font-bold tracking-wider ${item.isMock ? 'text-muted-foreground' : 'text-primary neon-text-subtle'}`}>
                      {item.confidence}% MATCH
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ESG Goal */}
        <div className="glass-card rounded-2xl p-8 relative overflow-hidden neon-border">
          <div className="absolute inset-0 gradient-neon opacity-30" />
          <div className="relative z-10">
            <h3 className="font-display font-extrabold text-lg mb-3 text-foreground neon-text-subtle">Facility ESG Goal</h3>
            <p className="text-muted-foreground text-sm">
              Hospital is at <span className="text-safe font-bold neon-text-subtle">84%</span> compliance. Automated sorting reduces human error by 62%.
            </p>
            <div className="mt-5 space-y-2">
              <div className="w-full bg-muted/30 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="gradient-teal h-full rounded-full neon-glow-sm"
                />
              </div>
              <div className="flex justify-between text-xs font-display font-bold text-muted-foreground uppercase tracking-widest">
                <span>Month: 84%</span>
                <span>Target: 95%</span>
              </div>
            </div>
            <button className="w-full border border-primary/20 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-widest hover:bg-primary/10 hover:border-primary/40 transition-all mt-4 text-foreground">
              View Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, variant }: { label: string; value: string; variant?: 'hazard' | 'eco' }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    className={`p-8 rounded-2xl transition-all duration-300 ${
      variant === 'hazard'
        ? 'glass-card neon-hazard'
        : variant === 'eco'
        ? 'glass-card neon-glow-sm'
        : 'glass-card-hover'
    }`}
  >
    <p className={`text-[10px] font-display font-bold uppercase tracking-widest mb-3 ${
      variant === 'hazard' ? 'text-hazard-foreground' : variant === 'eco' ? 'text-safe-foreground' : 'text-muted-foreground'
    }`}>
      {label}
    </p>
    <div className={`text-5xl font-extrabold tracking-tight ${
      variant === 'hazard' ? 'text-hazard-foreground' : variant === 'eco' ? 'text-safe neon-text-subtle' : 'text-foreground'
    }`}>
      {value}
    </div>
  </motion.div>
);

export default Dashboard;
