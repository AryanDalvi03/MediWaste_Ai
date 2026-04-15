import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, User, AlertTriangle, Clock, Plus, Trash2,
  BarChart2, Building2, Layers, ShieldCheck, Beaker, Recycle, FileWarning
} from 'lucide-react';

// ─── Types & Interfaces ──────────────────────────────────────────────────────

interface BinCompartments {
  Infectious: number;
  Sharps: number;
  General: number;
  Chemical: number;
}

interface SmartBin {
  id: string;
  roomId: string;
  compartments: BinCompartments;
  status: 'Active' | 'Full' | 'Maintenance';
  overallFill: number;
  worker: string;
  workerRole: string;
  lastCollected: string;
  collections: number;
  floor: number;
}

interface Ward {
  id: string;
  name: string;
  floor: number;
  compliance: number;
  bins: SmartBin[];
}

interface Room {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  floor: number;
  type: 'ward' | 'corridor' | 'utility';
}

// ─── SVG Floor Plan Coordinates ──────────────────────────────────────────────
const ROOMS: Room[] = [
  { id: 'F1-CORR', label: 'Main Corridor', x: 70, y: 10, w: 260, h: 40, floor: 1, type: 'corridor' },
  { id: 'ER-1', label: 'Emergency', x: 10, y: 60, w: 120, h: 100, floor: 1, type: 'ward' },
  { id: 'ICU-1', label: 'ICU Suite', x: 140, y: 60, w: 120, h: 100, floor: 1, type: 'ward' },
  { id: 'LAB-1', label: 'Laboratory', x: 270, y: 60, w: 120, h: 100, floor: 1, type: 'ward' },
  { id: 'F2-CORR', label: 'Corridor', x: 70, y: 60, w: 260, h: 40, floor: 2, type: 'corridor' },
  { id: 'SURG-2', label: 'Surgery', x: 10, y: 10, w: 140, h: 45, floor: 2, type: 'ward' },
  { id: 'CARD-2', label: 'Cardiology', x: 160, y: 10, w: 230, h: 45, floor: 2, type: 'ward' },
  { id: 'ORTHO-2', label: 'Orthopedics', x: 10, y: 110, w: 380, h: 60, floor: 2, type: 'ward' },
  { id: 'F3-CORR', label: 'Corridor', x: 70, y: 80, w: 260, h: 30, floor: 3, type: 'corridor' },
  { id: 'PED-3', label: 'Pediatrics', x: 10, y: 10, w: 180, h: 60, floor: 3, type: 'ward' },
  { id: 'MAT-3', label: 'Maternity', x: 200, y: 10, w: 190, h: 60, floor: 3, type: 'ward' },
  { id: 'ONCO-3', label: 'Oncology', x: 10, y: 120, w: 380, h: 50, floor: 3, type: 'ward' },
];

const ROOM_WARD_MAP: Record<string, { id: string; name: string; floor: number }> = {
  'ER-1': { id: 'ER', name: 'Emergency Room', floor: 1 },
  'ICU-1': { id: 'ICU', name: 'Intensive Care Unit', floor: 1 },
  'LAB-1': { id: 'LAB', name: 'Laboratory', floor: 1 },
  'SURG-2': { id: 'SURG', name: 'Surgery Ward', floor: 2 },
  'CARD-2': { id: 'CARD', name: 'Cardiology', floor: 2 },
  'ORTHO-2': { id: 'ORTHO', name: 'Orthopedics', floor: 2 },
  'PED-3': { id: 'PED', name: 'Pediatrics', floor: 3 },
  'MAT-3': { id: 'MAT', name: 'Maternity', floor: 3 },
  'ONCO-3': { id: 'ONCO', name: 'Oncology', floor: 3 },
};

const CATEGORIES: { key: keyof BinCompartments; color: string; bg: string; icon: any }[] = [
  { key: 'Infectious', color: 'text-red-400', bg: 'bg-red-500', icon: ShieldCheck },
  { key: 'Sharps', color: 'text-orange-400', bg: 'bg-orange-500', icon: FileWarning },
  { key: 'General', color: 'text-emerald-400', bg: 'bg-emerald-500', icon: Recycle },
  { key: 'Chemical', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: Beaker },
];

function fillColor(pct: number): string {
  if (pct >= 85) return '#ef4444';
  if (pct >= 55) return '#f59e0b';
  return '#10b981';
}

function fillGlow(pct: number): string {
  if (pct >= 85) return '0 0 10px rgba(239,68,68,0.8)';
  if (pct >= 55) return '0 0 10px rgba(245,158,11,0.8)';
  return '0 0 10px rgba(16,185,129,0.8)';
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

const BinCard = ({ bin, onRemove }: { bin: SmartBin, onRemove: (id: string) => void }) => {
  const isDanger = bin.overallFill >= 85;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 group ${isDanger ? 'neon-hazard relative overflow-hidden' : 'hover:border-primary/30'}`}
    >
      {isDanger && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}
      
      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-sm tracking-widest text-foreground">{bin.id}</span>
          <span className="text-[10px] bg-muted/30 px-2 py-0.5 rounded-full uppercase font-bold text-muted-foreground tracking-wider">
            Smart Bin
          </span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onRemove(bin.id)} className="text-muted-foreground hover:text-red-400 transition-colors bg-background/50 p-1 rounded-md">
                <Trash2 className="w-3.5 h-3.5" />
            </button>
            {isDanger ? (
            <span className="bg-red-500/15 text-red-400 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wider animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Full
            </span>
            ) : (
            <span className="bg-emerald-500/15 text-emerald-400 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wider">
                Active
            </span>
            )}
        </div>
      </div>

      {/* 4 Compartment Bars */}
      <div className="grid grid-cols-2 gap-3 z-10">
        {CATEGORIES.map(({ key, color, bg, icon: Icon }) => {
          const val = bin.compartments[key];
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-display uppercase tracking-widest">
                <span className={`flex items-center gap-1 ${color}`}><Icon className="w-2.5 h-2.5" /> {key}</span>
                <span className={`font-bold ${val >= 85 ? 'text-red-400' : 'text-muted-foreground'}`}>{val}%</span>
              </div>
              <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${bg} opacity-90`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Worker */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/20 z-10">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{bin.worker}</p>
          <p className="text-[10px] text-muted-foreground truncate">{bin.workerRole}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{bin.lastCollected}</span>
        </div>
        <span className="text-[10px] font-display text-muted-foreground">{bin.collections} collections</span>
      </div>
    </motion.div>
  );
};

// ─── Hospital Floor SVG Map ──────────────────────────────────────────────────

interface BinTooltip {
  bin: SmartBin;
  x: number;
  y: number;
}

const FloorMap = ({ floorNum, wards }: { floorNum: number; wards: Ward[] }) => {
  const [tooltip, setTooltip] = useState<BinTooltip | null>(null);
  const rooms = ROOMS.filter((r) => r.floor === floorNum);
  const allBins = wards.flatMap((w) => w.bins);

  const binsByRoom: Record<string, SmartBin[]> = {};
  allBins.forEach((bin) => {
    if (!binsByRoom[bin.roomId]) binsByRoom[bin.roomId] = [];
    binsByRoom[bin.roomId].push(bin);
  });

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <MapPin className="w-4 h-4 text-primary neon-text-subtle" />
        <h3 className="font-display font-bold text-xs uppercase tracking-widest text-foreground">
          Floor {floorNum} Blueprint Map
        </h3>
        <div className="ml-auto flex items-center gap-4 text-[10px] text-muted-foreground font-display bg-background/50 backdrop-blur-md px-3 py-1 rounded-full border border-border/30">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#34d399]" /> Optimal</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block shadow-[0_0_6px_#fbbf24]" /> Warning</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block shadow-[0_0_6px_#f87171]" /> Critical</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto bg-[#0a0f18] rounded-xl border border-border/10">
        <svg viewBox="0 0 400 185" className="w-full" style={{ minWidth: 320 }} onMouseLeave={() => setTooltip(null)}>
          <defs>
            <pattern id={`blueprint-grid-${floorNum}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsla(188,70%,50%,0.07)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="185" fill={`url(#blueprint-grid-${floorNum})`} />

          {rooms.map((room) => {
            const isCorridor = room.type === 'corridor';
            const roomBins = binsByRoom[room.id] || [];
            
            return (
              <g key={room.id}>
                <rect x={room.x} y={room.y} width={room.w} height={room.h} fill={isCorridor ? 'hsla(0,0%,15%,0.3)' : 'hsla(220,30%,12%,0.7)'} stroke={isCorridor ? 'hsla(188,70%,50%,0.1)' : 'hsla(188,70%,50%,0.3)'} strokeWidth="1.5" />
                {!isCorridor && (
                  <text x={room.x + 5} y={room.y + 12} fill="hsla(188,70%,50%,0.6)" fontSize="6" fontFamily="Orbitron, sans-serif" fontWeight="700" letterSpacing="0.05em">
                    {room.label.toUpperCase()}
                  </text>
                )}
                {roomBins.map((bin, bi) => {
                  const spacing = room.w / (roomBins.length + 1);
                  const cx = room.x + spacing * (bi + 1);
                  const cy = room.y + room.h / 2 + 5;
                  const col = fillColor(bin.overallFill);
                  const glow = fillGlow(bin.overallFill);
                  return (
                    <g key={bin.id} onMouseEnter={() => setTooltip({ bin, x: cx, y: cy })} style={{ cursor: 'pointer' }}>
                      {bin.overallFill >= 85 && <circle cx={cx} cy={cy} r="10" fill="none" stroke={col} strokeWidth="0.5" className="animate-ping" opacity="0.5" />}
                      <rect x={cx - 6} y={cy - 6} width="12" height="12" rx="2" fill="hsla(220,15%,20%,1)" stroke={col} strokeWidth="1" style={{ filter: `drop-shadow(${glow})` }} />
                      <circle cx={cx} cy={cy} r="2.5" fill={col} />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {tooltip && (() => {
            const tx = Math.min(Math.max(tooltip.x, 60), 340);
            const ty = Math.max(tooltip.y - 75, 5);
            return (
              <g className="animate-fade-in pointer-events-none">
                <rect x={tx - 55} y={ty} width="110" height="66" rx="6" fill="hsla(220,25%,8%,0.95)" stroke="hsla(174,80%,48%,0.4)" strokeWidth="1" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' }} />
                <text x={tx} y={ty + 14} textAnchor="middle" fill="hsla(174,80%,48%,1)" fontSize="8" fontFamily="Orbitron" fontWeight="700">BIN {tooltip.bin.id}</text>
                <text x={tx - 45} y={ty + 28} fill="hsla(0,72%,65%,1)" fontSize="6" fontFamily="sans-serif">INFECTIOUS: {tooltip.bin.compartments.Infectious}%</text>
                <text x={tx + 5} y={ty + 28} fill="hsla(38,92%,60%,1)" fontSize="6" fontFamily="sans-serif">SHARPS: {tooltip.bin.compartments.Sharps}%</text>
                <text x={tx - 45} y={ty + 38} fill="hsla(160,65%,55%,1)" fontSize="6" fontFamily="sans-serif">GENERAL: {tooltip.bin.compartments.General}%</text>
                <text x={tx + 5} y={ty + 38} fill="hsla(60,90%,60%,1)" fontSize="6" fontFamily="sans-serif">CHEMICAL: {tooltip.bin.compartments.Chemical}%</text>
                <path d={`M ${tx - 45} ${ty + 44} L ${tx + 45} ${ty + 44}`} stroke="hsla(220,20%,30%,1)" strokeWidth="0.5" />
                <text x={tx} y={ty + 54} textAnchor="middle" fill="hsla(180,20%,80%,1)" fontSize="6.5" fontFamily="sans-serif">{tooltip.bin.worker} ({tooltip.bin.workerRole})</text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

// ─── Ward Stats Card ──────────────────────────────────────────────────────────

const WardCard = ({ ward, selected, onClick }: { ward: Ward; selected: boolean; onClick: () => void }) => {
  const fullBins = ward.bins.filter((b) => b.status === 'Full').length;
  let totalPct = 0;
  let compCount = 0;
  ward.bins.forEach(b => {
    totalPct += b.compartments.Infectious + b.compartments.Sharps + b.compartments.General + b.compartments.Chemical;
    compCount += 4;
  });
  const avgFill = Math.round(totalPct / (compCount || 1));

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border ${
        selected
          ? 'bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
          : 'glass-card border-border/10 hover:border-primary/20'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-sm text-foreground">{ward.name}</p>
          <p className="text-[10px] font-display text-muted-foreground uppercase tracking-widest mt-0.5">
            {ward.bins.length} Smart Bins
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-full ${
            ward.compliance >= 98 ? 'bg-emerald-500/15 text-emerald-400'
            : ward.compliance >= 95 ? 'bg-yellow-500/15 text-yellow-400'
            : 'bg-red-500/15 text-red-400'
          }`}>
            {ward.compliance}% Compliant
          </span>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Aggregated Average Fill</span>
        <span className={`font-bold ${avgFill >= 80 ? 'text-red-400' : avgFill >= 55 ? 'text-yellow-400' : 'text-emerald-400'}`}>{avgFill}%</span>
      </div>
      <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden mb-3">
        <motion.div initial={{ width: 0 }} animate={{ width: `${avgFill}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: fillColor(avgFill) }} />
      </div>

      {fullBins > 0 && (
        <span className="text-[10px] font-display text-red-400 flex items-center gap-1 font-bold tracking-wider uppercase">
          <AlertTriangle className="w-3 h-3" /> {fullBins} bin{fullBins > 1 ? 's' : ''} require attention
        </span>
      )}
    </motion.button>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const BinOperations = () => {
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [allBinsData, setAllBinsData] = useState<SmartBin[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployRoom, setDeployRoom] = useState<string>('');
  
  const fetchBins = () => {
    fetch('http://localhost:8000/api/bins')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllBinsData(data);
        else console.warn("Expected array of bins, received", data);
      })
      .catch(err => console.error("Could not fetch bins", err));
  };

  useEffect(() => {
    fetchBins();
  }, []);

  const addBin = async () => {
    if (!deployRoom) return;
    try {
        await fetch('http://localhost:8000/api/bins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ floor: activeFloor, roomId: deployRoom })
        });
        setIsDeploying(false);
        setDeployRoom('');
        fetchBins();
    } catch(e) { console.error(e) }
  };

  const removeBin = async (binId: string) => {
    try {
        await fetch(`http://localhost:8000/api/bins/${binId}`, { method: 'DELETE' });
        fetchBins();
    } catch(e) { console.error(e) }
  };

  // Build Wards Dynamically based on current Bins
  const dynamicWards: Ward[] = [];
  if (Array.isArray(allBinsData)) {
    allBinsData.forEach(bin => {
       const wardInfo = ROOM_WARD_MAP[bin.roomId] || { id: 'MISC', name: 'Misc Ward', floor: bin.floor };
       let w = dynamicWards.find(x => x.id === wardInfo.id);
       if (!w) {
           w = { ...wardInfo, compliance: 98.0, bins: [] };
           dynamicWards.push(w);
       }
       w.bins.push(bin);
    });
  }

  const floorWards = dynamicWards.filter((w) => w.floor === activeFloor);
  const effectiveWardId = selectedWardId && floorWards.find((w) => w.id === selectedWardId) ? selectedWardId : floorWards[0]?.id ?? null;
  const selectedWard = dynamicWards.find((w) => w.id === effectiveWardId) ?? null;

  const allFloorBins = floorWards.flatMap((w) => w.bins);
  const fullCount = allFloorBins.filter((b) => b.status === 'Full').length;
  const collectionsToday = allFloorBins.reduce((a, b) => a + b.collections, 0);

  return (
    <div className="space-y-8 animate-slide-up pb-12 pr-2">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">
            Advanced Bin Operations
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor real-time compartment analytics across 4-category smart bins. Data synced dynamically.
          </p>
        </div>
        <div className="flex items-center gap-3">
            {isDeploying ? (
                <div className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 text-primary border border-primary/40 animate-fade-in shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                    <select 
                       value={deployRoom} 
                       onChange={(e) => setDeployRoom(e.target.value)} 
                       className="bg-transparent outline-none text-xs font-bold font-display uppercase tracking-widest cursor-pointer"
                    >
                       <option value="" className="text-slate-900 bg-white">Select Room...</option>
                       {ROOMS.filter(r => r.floor === activeFloor && r.type === 'ward').map(r => (
                           <option key={r.id} value={r.id} className="text-slate-900 bg-white">{r.label}</option>
                       ))}
                    </select>
                    <button onClick={addBin} disabled={!deployRoom} className="hover:text-safe transition-colors disabled:opacity-50" title="Confirm Deploy">
                        <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setIsDeploying(false); setDeployRoom(''); }} className="hover:text-hazard transition-colors ml-1" title="Cancel">
                        <span className="text-xs font-bold">✕</span>
                    </button>
                </div>
            ) : (
                <button onClick={() => setIsDeploying(true)} className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/20 transition-all text-primary border border-transparent">
                    <Plus className="w-4 h-4" />
                    <span className="font-display font-bold text-[10px] tracking-widest uppercase">Deploy Bin</span>
                </button>
            )}
            <div className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2.5 neon-border">
                <div className="w-2 h-2 rounded-full bg-safe neon-dot animate-pulse" />
                <span className="font-display font-bold text-[10px] tracking-widest uppercase text-foreground">Live Telemetry</span>
            </div>
        </div>
      </header>

      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-display text-muted-foreground uppercase tracking-widest mr-2">Floor Maps</span>
        <div className="flex gap-2 p-1 glass-card rounded-xl">
          {[1, 2, 3].map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFloor(f); setSelectedWardId(null); }}
              className={`relative px-5 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-widest transition-all duration-300 ${
                activeFloor === f ? 'text-primary-foreground' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {activeFloor === f && (
                <motion.div layoutId="floorPill" className="absolute inset-0 gradient-teal rounded-lg neon-glow-sm" transition={{ type: 'spring', duration: 0.4 }} />
              )}
              <span className="relative z-10">Floor {f}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Smart Bins Deployed', value: String(allFloorBins.length), icon: <Layers className="w-4 h-4 text-primary" /> },
          { label: 'Urgent Processing Required', value: String(fullCount), icon: <FileWarning className={`w-4 h-4 ${fullCount > 0 ? 'text-red-400' : 'text-primary'}`} />, urgent: fullCount > 0 },
          { label: 'Total Collections Today', value: String(collectionsToday), icon: <BarChart2 className="w-4 h-4 text-primary" /> },
        ].map(({ label, value, icon, urgent }, idx) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`glass-card rounded-2xl p-5 flex items-center gap-4 ${urgent ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}>
            <div className={`p-3 rounded-xl shrink-0 ${urgent ? 'bg-red-500/10' : 'glass-card'}`}>{icon}</div>
            <div>
              <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className={`text-2xl font-extrabold ${urgent ? 'text-red-400 animate-pulse' : 'text-foreground'}`}>{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeFloor} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-foreground">Wards — Floor {activeFloor}</span>
            </div>
            {floorWards.map((ward) => (
              <WardCard key={ward.id} ward={ward} selected={ward.id === effectiveWardId} onClick={() => setSelectedWardId(ward.id)} />
            ))}
          </div>

          <div className="space-y-6">
            <FloorMap floorNum={activeFloor} wards={floorWards} />

            {selectedWard && (
              <div className="space-y-4">
                <div className="flex flex-col border-b border-border/10 pb-4">
                  <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                    {selectedWard.name} Telemetry
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Displaying 4-compartment status for active smart bins on this ward.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedWard.bins.map((bin) => (
                    <BinCard key={bin.id} bin={bin} onRemove={removeBin} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BinOperations;
