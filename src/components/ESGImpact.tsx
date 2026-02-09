import { motion } from 'framer-motion';
import { Leaf, Recycle, TrendingDown } from 'lucide-react';

const ESGImpact = () => (
  <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
    <header className="gradient-teal p-8 rounded-2xl text-primary-foreground flex justify-between items-center relative overflow-hidden shadow-lg">
      <div className="relative z-10">
        <h2 className="text-3xl font-extrabold tracking-tight">ECO DASHBOARD</h2>
        <p className="text-primary-foreground/70 text-sm mt-1 max-w-sm">Carbon reduction impact of automated clinical waste sorting.</p>
      </div>
      <Leaf className="w-32 h-32 absolute -right-6 -bottom-6 opacity-10" />
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { icon: Recycle, label: 'Total Diverted Units', value: '142', desc: 'Clinical items redirected to certified recycling.' },
        { icon: TrendingDown, label: 'Net Carbon Credit', value: '63.9 kg', desc: 'GHG emissions prevented per item sorted.' },
      ].map((card, i) => (
        <motion.div
          key={card.label}
          whileHover={{ y: -3 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card p-8 rounded-2xl border border-border text-center shadow-sm"
        >
          <card.icon className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{card.label}</p>
          <p className="text-5xl font-extrabold text-foreground tracking-tight">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-3 italic">{card.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export default ESGImpact;
