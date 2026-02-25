import { motion } from 'framer-motion';
import { Leaf, Recycle, TrendingDown } from 'lucide-react';

const ESGImpact = () => (
  <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
    <header className="glass-card neon-glow p-8 rounded-2xl flex justify-between items-center relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="relative z-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground neon-text">ECO DASHBOARD</h2>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">Carbon reduction impact of automated clinical waste sorting.</p>
      </div>
      <Leaf className="w-32 h-32 absolute -right-6 -bottom-6 text-primary opacity-[0.06]" />
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { icon: Recycle, label: 'Total Diverted Units', value: '142', desc: 'Clinical items redirected to certified recycling.' },
        { icon: TrendingDown, label: 'Net Carbon Credit', value: '63.9 kg', desc: 'GHG emissions prevented per item sorted.' },
      ].map((card, i) => (
        <motion.div
          key={card.label}
          whileHover={{ y: -4, scale: 1.01 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card-hover p-8 rounded-2xl text-center"
        >
          <card.icon className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
          <p className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest mb-2">{card.label}</p>
          <p className="text-5xl font-extrabold text-foreground tracking-tight neon-text-subtle">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-3 italic">{card.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export default ESGImpact;
