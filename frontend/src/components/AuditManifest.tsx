import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { useScanStore } from '@/lib/store';
import { PROTOCOLS } from '@/lib/protocols';

const AuditManifest = () => {
  const [filter, setFilter] = useState('');
  const history = useScanStore((s) => s.history);
  const filtered = history.filter((h) => h.type.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6 animate-slide-up flex flex-col h-full">
      <header className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">Audit Manifest</h2>
          <p className="text-muted-foreground mt-1 text-sm">Clinical compliance logs synced to enterprise ledger.</p>
        </div>
        <button className="glass-card neon-border px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest hover:neon-glow-sm transition-all text-foreground">
          <Download className="w-4 h-4 text-primary" /> Export
        </button>
      </header>

      <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="p-4 border-b border-border/30 shrink-0">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search item (e.g. Needle)..."
              className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 font-medium text-sm focus:outline-none text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 border-b border-border/30" style={{ background: 'hsla(220,15%,12%,0.9)', backdropFilter: 'blur(12px)' }}>
              <tr className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest">
                <th className="p-4">Item</th><th className="p-4">Destination</th><th className="p-4">Status</th><th className="p-4">Accuracy</th><th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">No records matching query.</td></tr>
              ) : (
                filtered.map((log, i) => {
                  const info = PROTOCOLS[log.type] || PROTOCOLS.default;
                  return (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-bold text-foreground">
                        {log.type}
                        {log.isMock && <span className="ml-2 text-[10px] glass-card text-muted-foreground px-1.5 py-0.5 rounded font-display tracking-wider">MIGRATED</span>}
                      </td>
                      <td className="p-4 text-muted-foreground">{info.bin}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-widest ${info.hazardous ? 'bg-hazard-light/50 text-hazard-foreground' : 'bg-safe-light/50 text-safe-foreground'}`} style={{ border: `1px solid ${info.hazardous ? 'hsla(0,72%,55%,0.2)' : 'hsla(160,65%,45%,0.2)'}` }}>
                          {info.hazardous ? 'Hazardous' : 'Clean'}
                        </span>
                      </td>
                      <td className="p-4 font-display font-bold text-primary neon-text-subtle tracking-wider">{log.confidence}%</td>
                      <td className="p-4 text-right text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditManifest;
