import { useState, useEffect } from 'react';
import { Trash2, CheckCircle, AlertTriangle, ClipboardList, RefreshCw, StickyNote } from 'lucide-react';
import { useAuth } from '@/lib/store';

const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

interface SmartBin {
  _id: string;
  id: string;
  floor: number;
  roomId: string;
  compartments: Record<string, number>;
  worker: string;
  workerRole: string;
  lastCollected: string;
  collections: number;
  status: string;
  overallFill: number;
}

interface WorkLog {
  _id: string;
  bin_id: string;
  staff_name: string;
  action: string;
  note: string;
  timestamp: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  bin_collected:  { label: 'Bin Collected',   color: 'text-primary',           icon: CheckCircle },
  waste_disposed: { label: 'Waste Disposed',  color: 'text-safe',              icon: Trash2 },
  noted:          { label: 'Note Added',      color: 'text-warning-foreground', icon: StickyNote },
};

const MyWork = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const staffName = user?.name || user?.email?.split('@')[0]?.replace('.', ' ') || 'Staff';
  const staffEmail = user?.email || '';

  const fetchData = async () => {
    try {
      const [binsRes, logsRes] = await Promise.all([
        fetch(`${apiBase}/api/bins`),
        fetch(`${apiBase}/api/work_log?limit=30`),
      ]);
      const binsData = await binsRes.json();
      const logsData = await logsRes.json();
      if (Array.isArray(binsData)) setBins(binsData);
      if (Array.isArray(logsData)) setLogs(logsData);
    } catch (e) {
      console.error('Failed to fetch MyWork data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const doAction = async (binId: string, action: string) => {
    setActionLoading(binId + action);
    try {
      await fetch(`${apiBase}/api/bins/${binId}/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_email: staffEmail,
          staff_name: staffName,
          action,
          note: noteMap[binId] || '',
        }),
      });
      setNoteMap(m => ({ ...m, [binId]: '' }));
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (s: string) =>
    s === 'Full' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
    s === 'Collected' ? 'text-primary bg-primary/10 border-primary/30' :
    s === 'Disposed' ? 'text-safe bg-safe/10 border-safe/30' :
    'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';

  const fillColor = (v: number) =>
    v >= 90 ? 'bg-red-500' : v >= 70 ? 'bg-yellow-400' : 'bg-primary';

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-display text-sm tracking-widest uppercase">Loading your work...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">My Work</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Logged in as <span className="text-primary font-semibold">{staffName}</span> · Manage your assigned bins and log tasks in real-time.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="glass-card p-2.5 rounded-xl text-muted-foreground hover:text-primary transition-all"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Summary strip — based only on MY bins */}
      {(() => {
        const myBins = bins.filter(b => b.worker.toLowerCase() === staffName.toLowerCase());
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Bins Assigned', value: myBins.length },
              { label: 'Needs Collection', value: myBins.filter(b => b.status === 'Full' || b.overallFill >= 80).length },
              { label: 'Collected Today', value: logs.filter(l => l.action === 'bin_collected' && new Date(l.timestamp).toDateString() === new Date().toDateString()).length },
              { label: 'Disposed Today', value: logs.filter(l => l.action === 'waste_disposed' && new Date(l.timestamp).toDateString() === new Date().toDateString()).length },
            ].map(card => (
              <div key={card.label} className="glass-card-hover p-5 rounded-2xl">
                <p className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mb-2">{card.label}</p>
                <p className="text-4xl font-extrabold tracking-tight text-foreground">{card.value}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Bins */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-5 border-b border-border/20 pb-4">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg text-foreground">Assigned Bins</h3>
        </div>

        {bins.filter(b => b.worker.toLowerCase() === staffName.toLowerCase()).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No bins assigned to you yet.</p>
        ) : (
          <div className="space-y-4">
            {bins.filter(b => b.worker.toLowerCase() === staffName.toLowerCase()).map(bin => (
              <div key={bin._id} className="glass-card rounded-xl p-5 space-y-4">
                {/* Bin header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="gradient-teal w-10 h-10 rounded-xl flex items-center justify-center font-display font-extrabold text-sm text-primary-foreground neon-glow-sm shrink-0">
                      {bin.id}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{bin.id} — Room {bin.roomId}</p>
                      <p className="text-xs text-muted-foreground">Floor {bin.floor} · Last: {bin.lastCollected}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor(bin.status)}`}>
                    {bin.status}
                  </span>
                </div>

                {/* Fill bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Overall Fill</span>
                    <span className="font-bold text-foreground">{bin.overallFill}%</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${fillColor(bin.overallFill)}`}
                      style={{ width: `${bin.overallFill}%` }}
                    />
                  </div>
                </div>

                {/* Compartments */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(bin.compartments).map(([name, val]) => (
                    <div key={name} className="bg-background/50 rounded-lg p-2.5 text-center border border-border/20">
                      <p className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider mb-1">{name}</p>
                      <p className={`text-lg font-extrabold ${Number(val) >= 80 ? 'text-red-400' : 'text-foreground'}`}>{val}%</p>
                    </div>
                  ))}
                </div>

                {/* Note input + actions */}
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center pt-1">
                  <input
                    value={noteMap[bin.id] || ''}
                    onChange={e => setNoteMap(m => ({ ...m, [bin.id]: e.target.value }))}
                    placeholder="Add a note (optional)..."
                    className="bg-white text-slate-800 text-xs px-3 py-2 rounded-lg flex-1 outline-none placeholder-slate-400 w-full sm:w-auto font-medium"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => doAction(bin.id, 'bin_collected')}
                      disabled={actionLoading === bin.id + 'bin_collected'}
                      className="bg-primary/20 text-primary px-3 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Collected
                    </button>
                    <button
                      onClick={() => doAction(bin.id, 'waste_disposed')}
                      disabled={actionLoading === bin.id + 'waste_disposed'}
                      className="bg-safe/20 text-safe px-3 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-widest hover:bg-safe hover:text-primary-foreground transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Disposed
                    </button>
                    <button
                      onClick={() => doAction(bin.id, 'noted')}
                      disabled={!noteMap[bin.id] || actionLoading === bin.id + 'noted'}
                      className="glass-card text-muted-foreground px-3 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-widest hover:text-warning-foreground transition-all flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <StickyNote className="w-3.5 h-3.5" /> Note
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity log */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-5 border-b border-border/20 pb-4">
          <AlertTriangle className="w-5 h-5 text-warning-foreground" />
          <h3 className="font-bold text-lg text-foreground">Recent Activity Log</h3>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No activity logged yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => {
              const meta = ACTION_LABELS[log.action] || { label: log.action, color: 'text-muted-foreground', icon: StickyNote };
              const Icon = meta.icon;
              return (
                <div key={log._id} className="flex items-start gap-3 p-3 rounded-xl glass-card-hover">
                  <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${meta.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      <span className={meta.color}>{meta.label}</span>
                      {' '}— Bin <span className="font-mono">{log.bin_id}</span>
                    </p>
                    {log.note && <p className="text-xs text-muted-foreground mt-0.5 italic">"{log.note}"</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-display tracking-wide">{log.staff_name} · {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWork;
