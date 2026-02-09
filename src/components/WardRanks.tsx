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
    <header className="gradient-teal p-12 rounded-3xl text-primary-foreground relative overflow-hidden shadow-xl">
      <div className="relative z-10">
        <h2 className="text-5xl font-extrabold tracking-tight">WARD CHAMPIONS</h2>
        <p className="text-primary-foreground/70 mt-2 max-w-sm text-sm">Live leaderboard of segregation accuracy per hospital department.</p>
      </div>
      <Trophy className="w-64 h-64 absolute -right-12 -bottom-12 opacity-10" />
    </header>

    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      {ranks.map((r, i) => (
        <motion.div
          key={r.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-8 flex justify-between items-center hover:bg-muted/30 transition-all group"
        >
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl group-hover:scale-110 transition-transform ${
              r.position === 1 ? 'bg-warning-light text-warning-foreground' : r.position === 2 ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {r.position}
            </div>
            <div>
              <p className="font-extrabold text-2xl text-foreground tracking-tight">{r.name}</p>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1">{r.trend} PERFORMANCE</p>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-3xl font-extrabold text-foreground tracking-tight">{r.score}%</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Accuracy</span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default WardRanks;
