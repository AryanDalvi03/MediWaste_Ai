import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Save, Edit2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

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

const FLOOR_WARDS: Record<number, string[]> = {
  1: ['Emergency Room', 'Intensive Care Unit (ICU)', 'Pediatrics OPD', 'General OPD', 'Triage Center', 'MISC'],
  2: ['Surgery Ward', 'Cardiology', 'Orthopedics', 'Operation Theater', 'Post-Op Recovery', 'MISC'],
  3: ['Maternity', 'NICU', 'Oncology', 'Radiology Ward', 'Laboratory', 'MISC']
};

const STAFF_ROLES = ['Waste Supervisor', 'Disposal Coordinator', 'Segregation Officer', 'Ward Waste Officer', 'Bin Manager', 'Disposal Tech'];

const StaffAnalytics = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNewName, setEditNewName] = useState<string>('');
  const [editFloor, setEditFloor] = useState<number>(1);
  const [editRole, setEditRole] = useState<string>('');
  const [editWard, setEditWard] = useState<string>('');

  const [isAdding, setIsAdding] = useState(false);
  const [addName, setAddName] = useState('');
  const [addFloor, setAddFloor] = useState(1);
  const [addWard, setAddWard] = useState(FLOOR_WARDS[1][0]);
  const [addRole, setAddRole] = useState(STAFF_ROLES[0]);

  const fetchStaff = () => {
    fetch(`${apiBase}/api/staff`)
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
    fetch(`${apiBase}/api/bins`)
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
    setEditNewName(s.name);
    setEditFloor(s.floor);
    setEditRole(s.role);
    setEditWard(s.ward);
  };

  const saveEdit = async (name: string) => {
    try {
      await fetch(`${apiBase}/api/staff/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editNewName, floor: editFloor, role: editRole, ward: editWard })
      });
      setEditingName(null);
      fetchStaff();
      fetchBins(); // Fetch bins as well to reflect redistribution
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddStaff = async () => {
    if (!addName || !addWard || !addRole) return;
    try {
      await fetch(`${apiBase}/api/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addName, ward: addWard, floor: addFloor, role: addRole })
      });
      setIsAdding(false);
      setAddName('');
      setAddWard(FLOOR_WARDS[addFloor][0] || 'MISC');
      setAddRole(STAFF_ROLES[0]);
      fetchStaff();
      fetchBins();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStaff = async (name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await fetch(`${apiBase}/api/staff/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });
      fetchStaff();
      fetchBins();
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
            <h3 className="font-bold text-lg text-foreground flex-1">Facility Leaderboard & Assignments</h3>
            <button onClick={() => setIsAdding(!isAdding)} className="glass-card text-primary px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-primary/50 transition-all">+ Add Staff</button>
        </div>
        
        {isAdding && (
          <div className="mb-4 p-4 glass-card rounded-xl border border-primary/30 animate-fade-in flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1">Name</label>
              <input value={addName} onChange={e=>setAddName(e.target.value)} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. John Doe" />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1">Base Ward</label>
              <select value={addWard} onChange={e=>setAddWard(e.target.value)} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary text-foreground cursor-pointer">
                {(FLOOR_WARDS[addFloor] || []).map(w => <option key={w} value={w} className="bg-background text-foreground">{w}</option>)}
              </select>
            </div>
            <div className="w-full md:w-32 space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1">Floor</label>
              <select 
                value={addFloor} 
                onChange={e => {
                  const newFloor = Number(e.target.value);
                  setAddFloor(newFloor);
                  if (FLOOR_WARDS[newFloor] && !FLOOR_WARDS[newFloor].includes(addWard)) {
                    setAddWard(FLOOR_WARDS[newFloor][0]);
                  }
                }} 
                className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary text-foreground"
              >
                <option value={1} className="bg-background text-foreground">Floor 1</option>
                <option value={2} className="bg-background text-foreground">Floor 2</option>
                <option value={3} className="bg-background text-foreground">Floor 3</option>
              </select>
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1">Role</label>
              <select value={addRole} onChange={e=>setAddRole(e.target.value)} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary text-foreground cursor-pointer">
                {STAFF_ROLES.map(r => <option key={r} value={r} className="bg-background text-foreground">{r}</option>)}
              </select>
            </div>
            <button onClick={handleAddStaff} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest w-full md:w-auto h-[38px] transition-all shadow-lg">Save</button>
          </div>
        )}
        
        <div className="space-y-3">
          {staff.map((s, idx) => {
            const isEditing = editingName === s.name;
            const isExpanded = expandedStaffId === s._id;
            const staffBins = bins.filter(b => b.worker === s.name);

            return (
              <div key={s._id} className="p-4 glass-card-hover rounded-xl transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-lg shadow-lg cursor-pointer ${
                      idx === 0 ? 'bg-warning-light/50 text-warning-foreground' : 'glass-card text-muted-foreground'
                    }`} style={idx === 0 ? { border: '1px solid hsla(38,92%,50%,0.3)' } : undefined} onClick={() => toggleExpand(s._id)}>{idx + 1}</div>
                    
                    <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(s._id)}>
                      {isEditing ? (
                          <input 
                              value={editNewName}
                              onChange={(e) => setEditNewName(e.target.value)}
                              onClick={e => e.stopPropagation()}
                              className="bg-white text-slate-800 text-base font-bold px-2 py-0.5 rounded outline-none border-2 border-primary/30 focus:border-primary mb-1 w-full max-w-[200px]"
                              placeholder="Staff Name"
                          />
                      ) : (
                          <p className="font-bold text-base text-foreground">{s.name}</p>
                      )}
                      {isEditing ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 max-w-sm" onClick={e => e.stopPropagation()}>
                              <select 
                                  value={editFloor}
                                  onChange={(e) => {
                                      const newFloor = Number(e.target.value);
                                      setEditFloor(newFloor);
                                      if (FLOOR_WARDS[newFloor] && !FLOOR_WARDS[newFloor].includes(editWard)) {
                                          setEditWard(FLOOR_WARDS[newFloor][0]);
                                      }
                                  }}
                                  className="bg-white text-slate-800 text-xs px-2 py-1 rounded w-24 outline-none font-bold cursor-pointer"
                              >
                                  <option value={1}>Floor 1</option>
                                  <option value={2}>Floor 2</option>
                                  <option value={3}>Floor 3</option>
                              </select>
                              <select 
                                  value={editWard}
                                  onChange={(e) => setEditWard(e.target.value)}
                                  className="bg-white text-slate-800 text-xs px-2 py-1 rounded w-32 outline-none font-bold cursor-pointer"
                              >
                                  {(FLOOR_WARDS[editFloor] || []).map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                              <select 
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value)}
                                  className="bg-white text-slate-800 text-xs px-2 py-1 rounded flex-1 outline-none font-bold cursor-pointer"
                              >
                                  {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
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
                          <div className="flex gap-1 border-r border-border/20 pr-3">
                              <button 
                                  onClick={() => handleEdit(s)}
                                  className="glass-card p-2 rounded-lg text-muted-foreground hover:text-primary transition-all"
                                  title="Edit Assignment"
                              >
                                  <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                  onClick={() => handleDeleteStaff(s.name)}
                                  className="glass-card p-2 rounded-lg text-muted-foreground hover:text-red-400 transition-all"
                                  title="Delete Staff"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      )}
                      <button onClick={() => toggleExpand(s._id)} className="text-muted-foreground hover:text-primary transition-colors p-1 pl-2">
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
