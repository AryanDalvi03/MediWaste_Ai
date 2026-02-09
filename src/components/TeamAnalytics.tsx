const TeamAnalytics = () => {
  const staff = [
    { name: 'Dr. Sarah Johnson', ward: 'Radiology Ward', accuracy: 98.5, items: 342, rank: 1 },
    { name: 'Dr. Ahmed Hassan', ward: 'Surgery Ward', accuracy: 97.2, items: 428, rank: 2 },
    { name: 'Nurse Patricia Lee', ward: 'ICU Ward', accuracy: 96.8, items: 567, rank: 3 },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      <header>
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">Team Analytics</h2>
        <p className="text-muted-foreground mt-1 text-sm">Track compliance performance across all facility staff.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard label="Total Staff" value="24" />
        <StatCard label="Compliance Rate" value="94%" accent />
        <StatCard label="Top Performer" value="Dr. Sarah Johnson" sub="98.5% accuracy" />
        <StatCard label="Needs Training" value="3" sub="Below 85% threshold" warning />
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-bold text-base mb-4 text-foreground">Staff Leaderboard</h3>
        <div className="space-y-3">
          {staff.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-4 glass-card-hover rounded-xl">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                  s.rank === 1 ? 'bg-warning-light/50 text-warning-foreground' : 'glass-card text-muted-foreground'
                }`} style={s.rank === 1 ? { border: '1px solid hsla(38,92%,50%,0.3)' } : undefined}>{s.rank}</div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.ward}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-primary neon-text-subtle">{s.accuracy}%</p>
                <p className="text-xs text-muted-foreground">{s.items} items</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, accent, warning }: { label: string; value: string; sub?: string; accent?: boolean; warning?: boolean }) => (
  <div className={`p-6 rounded-2xl transition-all duration-300 ${
    warning 
      ? 'glass-card neon-hazard' 
      : 'glass-card-hover'
  }`}>
    <p className={`text-[10px] font-display font-bold uppercase tracking-widest mb-2 ${warning ? 'text-warning-foreground' : 'text-muted-foreground'}`}>{label}</p>
    <div className={`text-3xl font-extrabold tracking-tight ${accent ? 'text-primary neon-text-subtle' : warning ? 'text-warning-foreground' : 'text-foreground'}`}>{value}</div>
    {sub && <p className={`text-xs mt-1 ${warning ? 'text-warning-foreground' : 'text-muted-foreground'}`}>{sub}</p>}
  </div>
);

export default TeamAnalytics;
