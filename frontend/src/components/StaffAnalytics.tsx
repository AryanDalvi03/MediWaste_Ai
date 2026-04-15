import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Save, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

interface SmartBin {
  id: string;
  roomId: string;
  floor: number;
  worker: string;
}

interface StaffMember {
  _id: string;
  name: string;
  ward: string;
  floor: number;
  accuracy: number;
  items: number;
  rank: number;
  role: string;
}

const StaffAnalytics = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editFloor, setEditFloor] = useState<number>(1);
  const [editRole, setEditRole] = useState<string>('');

  const fetchStaff = () => {
    fetch('http://localhost:8000/api/staff')
      .then((res) => res.json())
      .then((data) => {
          if (Array.isArray(data)) {
              setStaff(data.sort((a: any, b: any) => a.rank - b.rank));
          } else {
              console.warn("Expected array of staff, received", data);
          }
      })
      .catch((err) => console.error("Could not fetch staff", err));
  };

  const fetchBins = () => {
    fetch('http://localhost:8000/api/bins')
      .then((res) => res.json())
      .then((data) => {
          if (Array.isArray(data)) setBins(data);
      })
      .catch((err) => console.error("Could not fetch bins", err));
  };

  useEffect(() => {
    fetchStaff();
    fetchBins();
  }, []);

  const handleEdit = (s: StaffMember) => {
    setEditingName(s.name);
    setEditFloor(s.floor);
    setEditRole(s.role);
  };

  const saveEdit = async (name: string) => {
    try {
      await fetch(`http://localhost:8000/api/staff/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ floor: editFloor, role: editRole })
      });
      setEditingName(null);
      fetchStaff();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedStaffId(expandedStaffId === id ? null : id);
  };

  const totalStaff = staff.length;
  const avgCompliance = totalStaff > 0 ? Math.round(staff.reduce((acc, s) => acc + s.accuracy, 0) / totalStaff) : 0;
  const topPerformer = staff[0]?.name || '-';
  const needsTraining = staff.filter((s) => s.accuracy < 90).length;

  return (
    <div className="space-y-8 animate-slide-up">
      <header>
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">Staff Analytics</h2>
        <p className="text-muted-foreground mt-1 text-sm">Track compliance and assign Bin Managers to floors dynamically.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard label="Total Staff Members" value={String(totalStaff)} />
        <StatCard label="Avg Compliance Rate" value={`${avgCompliance}%`} accent />
        <StatCard label="Top Performer" value={topPerformer} sub={staff[0] ? `${staff[0].accuracy}% accuracy` : ''} />
        <StatCard label="Needs Training" value={String(needsTraining)} sub="Below 90% threshold" warning={needsTraining > 0} />
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6 border-b border-border/20 pb-4">
            <Trophy className="w-5 h-5 text-warning-foreground" />
            <h3 className="font-bold text-lg text-foreground">Facility Leaderboard & Assignments</h3>
        </div>
        
        <div className="space-y-3">
          {staff.map((s) => {
            const isEditing = editingName === s.name;
            const isExpanded = expandedStaffId === s._id;
            const staffBins = bins.filter(b => b.worker === s.name);

            return (
              <div key={s._id} className="p-4 glass-card-hover rounded-xl transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-lg shadow-lg cursor-pointer ${
                      s.rank === 1 ? 'bg-warning-light/50 text-warning-foreground' : 'glass-card text-muted-foreground'
                    }`} style={s.rank === 1 ? { border: '1px solid hsla(38,92%,50%,0.3)' } : undefined} onClick={() => toggleExpand(s._id)}>{s.rank}</div>
                    
                    <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(s._id)}>
                      <p className="font-bold text-base text-foreground">{s.name}</p>
                      {isEditing ? (
                          <div className="mt-2 flex items-center gap-2 max-w-sm" onClick={e => e.stopPropagation()}>
                              <select 
                                  value={editFloor}
                                  onChange={(e) => setEditFloor(Number(e.target.value))}
                                  className="bg-white text-slate-800 text-xs px-2 py-1 rounded w-24 outline-none font-bold"
                              >
                                  <option value={1}>Floor 1</option>
                                  <option value={2}>Floor 2</option>
                                  <option value={3}>Floor 3</option>
                              </select>
                              <input 
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value)}
                                  className="bg-white text-slate-800 text-xs px-2 py-1 rounded flex-1 outline-none font-bold placeholder-slate-500"
                                  placeholder="Role (e.g. Bin Manager)"
                              />
                          </div>
                      ) : (
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.role} · Floor {s.floor} ({s.ward})</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-end">
                      <div className="text-right">
                          <p className={`font-display font-extrabold text-xl ${s.accuracy >= 95 ? 'text-primary neon-text-subtle' : s.accuracy < 90 ? 'text-red-400' : 'text-yellow-400'}`}>{s.accuracy}%</p>
                          <p className="text-xs text-muted-foreground tracking-wide font-medium">{s.items} items sorted</p>
                      </div>
                      
                      {isEditing ? (
                          <button 
                              onClick={() => saveEdit(s.name)}
                              className="bg-primary/20 text-primary p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                              title="Save Assignment"
                          >
                              <Save className="w-4 h-4" />
                          </button>
                      ) : (
                          <button 
                              onClick={() => handleEdit(s)}
                              className="glass-card p-2 rounded-lg text-muted-foreground hover:text-primary transition-all"
                              title="Edit Assignment"
                          >
                              <Edit2 className="w-4 h-4" />
                          </button>
                      )}
                      <button onClick={() => toggleExpand(s._id)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/20 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="glass-card p-4 rounded-xl border border-primary/10">
                              <p className="text-[10px] uppercase text-primary font-display font-bold tracking-widest mb-3">Duties & Assignment</p>
                              <div className="space-y-2">
                                  <p className="text-sm text-foreground font-medium"><span className="text-muted-foreground mr-2">Role:</span> {s.role}</p>
                                  <p className="text-sm text-foreground font-medium"><span className="text-muted-foreground mr-2">Base Ward:</span> {s.ward}</p>
                                  <p className="text-sm text-foreground font-medium"><span className="text-muted-foreground mr-2">Operations Area:</span> Level {s.floor}</p>
                                  <p className="text-xs text-muted-foreground italic mt-2 border-t border-border/10 pt-2">Responsible for timely clearance and verifying compliant waste segregation at source.</p>
                              </div>
                          </div>
                          <div className="glass-card p-4 rounded-xl border border-primary/10">
                              <p className="text-[10px] uppercase text-primary font-display font-bold tracking-widest mb-3">Bin Allocations ({staffBins.length})</p>
                              {staffBins.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                      {staffBins.map(b => (
                                          <div key={b.id} className="bg-background/80 border border-border/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                              <span className="font-display font-bold text-xs text-foreground">{b.id}</span>
                                              <span className="text-[10px] text-muted-foreground uppercase">{b.roomId}</span>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="h-full flex items-center justify-center pb-4">
                                      <p className="text-xs text-muted-foreground font-medium bg-background/50 px-3 py-1.5 rounded-lg border border-border/20">No smart bins currently assigned</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, accent, warning }: { label: string; value: string; sub?: string; accent?: boolean; warning?: boolean }) => (
  <div className={`p-6 rounded-2xl transition-all duration-300 ${
    warning 
      ? 'glass-card border-red-500/30 neon-hazard' 
      : 'glass-card-hover'
  }`}>
    <div className="flex items-center justify-between mb-3">
        <p className={`text-[10px] font-display font-bold uppercase tracking-widest ${warning ? 'text-red-400' : 'text-muted-foreground'}`}>{label}</p>
        <TrendingUp className={`w-4 h-4 ${accent ? 'text-primary' : warning ? 'text-red-400' : 'text-muted-foreground/50'}`} />
    </div>
    <div className={`text-4xl font-extrabold tracking-tight ${accent ? 'text-primary neon-text-subtle' : warning ? 'text-red-400' : 'text-foreground'}`}>{value}</div>
    {sub && <p className={`text-xs mt-2 ${warning ? 'text-red-400/80 font-medium' : 'text-muted-foreground'}`}>{sub}</p>}
  </div>
);

export default StaffAnalytics;
