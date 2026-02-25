import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const ranks = [
  { name: 'Emergency Room', score: 99.1, trend: '+2.4%', position: 1 },
  { name: 'Intensive Care', score: 98.4, trend: '+1.1%', position: 2 },
  { name: 'Surgery Ward', score: 97.8, trend: '+0.8%', position: 3 },
  { name: 'Pediatrics', score: 96.2, trend: '+1.5%', position: 4 },
];

const WardRanks = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-slide-up pb-12">
    <header className="glass-card neon-glow p-12 rounded-3xl relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="relative z-10">
        <h2 className="text-5xl font-extrabold tracking-tight text-foreground neon-text">WARD CHAMPIONS</h2>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">Live leaderboard of segregation accuracy per hospital department.</p>
      </div>
      <Trophy className="w-64 h-64 absolute -right-12 -bottom-12 text-primary opacity-[0.06]" />
    </header>

    <div className="glass-card rounded-2xl divide-y divide-border/20">
      {ranks.map((r, i) => (
        <motion.div
          key={r.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-8 flex justify-between items-center hover:bg-muted/10 transition-all group"
        >
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl group-hover:scale-110 transition-transform ${
              r.position === 1 ? 'bg-warning-light/50 text-warning-foreground neon-glow-sm' : 'glass-card text-muted-foreground'
            }`} style={r.position === 1 ? { border: '1px solid hsla(38,92%,50%,0.3)', boxShadow: '0 0 12px hsla(38,92%,50%,0.2)' } : undefined}>
              {r.position}
            </div>
            <div>
              <p className="font-extrabold text-2xl text-foreground tracking-tight">{r.name}</p>
              <p className="text-[10px] font-display font-bold text-primary uppercase tracking-widest mt-1 neon-text-subtle">{r.trend} PERFORMANCE</p>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-3xl font-extrabold text-foreground tracking-tight">{r.score}%</span>
            <span className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest">Accuracy</span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default WardRanks;
