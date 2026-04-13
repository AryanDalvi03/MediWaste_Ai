import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, User, AlertTriangle, Clock,
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
  id: string; // e.g., F11, F12
  roomId: string;
  compartments: BinCompartments;
  // A bin needs service if ANY compartment is Full (>= 85%)
  status: 'Active' | 'Full' | 'Maintenance';
  // overallFill tracks the highest fill level across the 4 compartments
  overallFill: number;
  worker: string;
  workerRole: string;
  lastCollected: string;
  collections: number;
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
// Designed to look like a generic top-down hospital core layout
const ROOMS: Room[] = [
  // Floor 1
  { id: 'F1-CORR', label: 'Main Corridor', x: 70, y: 10, w: 260, h: 40, floor: 1, type: 'corridor' },
  { id: 'ER-1', label: 'Emergency', x: 10, y: 60, w: 120, h: 100, floor: 1, type: 'ward' },
  { id: 'ICU-1', label: 'ICU Suite', x: 140, y: 60, w: 120, h: 100, floor: 1, type: 'ward' },
  { id: 'LAB-1', label: 'Laboratory', x: 270, y: 60, w: 120, h: 100, floor: 1, type: 'ward' },
  // Floor 2
  { id: 'F2-CORR', label: 'Corridor', x: 70, y: 60, w: 260, h: 40, floor: 2, type: 'corridor' },
  { id: 'SURG-2', label: 'Surgery', x: 10, y: 10, w: 140, h: 45, floor: 2, type: 'ward' },
  { id: 'CARD-2', label: 'Cardiology', x: 160, y: 10, w: 230, h: 45, floor: 2, type: 'ward' },
  { id: 'ORTHO-2', label: 'Orthopedics', x: 10, y: 110, w: 380, h: 60, floor: 2, type: 'ward' },
  // Floor 3
  { id: 'F3-CORR', label: 'Corridor', x: 70, y: 80, w: 260, h: 30, floor: 3, type: 'corridor' },
  { id: 'PED-3', label: 'Pediatrics', x: 10, y: 10, w: 180, h: 60, floor: 3, type: 'ward' },
  { id: 'MAT-3', label: 'Maternity', x: 200, y: 10, w: 190, h: 60, floor: 3, type: 'ward' },
  { id: 'ONCO-3', label: 'Oncology', x: 10, y: 120, w: 380, h: 50, floor: 3, type: 'ward' },
];

const calcBinStatus = (comps: BinCompartments) => {
  const max = Math.max(comps.Infectious, comps.Sharps, comps.General, comps.Chemical);
  return {
    overallFill: max,
    status: max >= 85 ? 'Full' : 'Active' as 'Active' | 'Full'
  };
};

const WARDS: Ward[] = [
  // FLOOR 1
  {
    id: 'ER', name: 'Emergency Room', floor: 1, compliance: 97.4,
    bins: [
      { id: 'F11', roomId: 'ER-1', compartments: { Infectious: 72, Sharps: 91, General: 40, Chemical: 10 }, worker: 'Sarah Johnson', workerRole: 'Waste Supervisor', lastCollected: '2h ago', collections: 8, ...calcBinStatus({ Infectious: 72, Sharps: 91, General: 40, Chemical: 10 }) },
      { id: 'F12', roomId: 'ER-1', compartments: { Infectious: 40, Sharps: 20, General: 72, Chemical: 5 }, worker: 'Raj Patel', workerRole: 'Disposal Tech', lastCollected: '4h ago', collections: 5, ...calcBinStatus({ Infectious: 40, Sharps: 20, General: 72, Chemical: 5 }) },
    ],
  },
  {
    id: 'ICU', name: 'Intensive Care Unit', floor: 1, compliance: 98.9,
    bins: [
      { id: 'F13', roomId: 'ICU-1', compartments: { Infectious: 55, Sharps: 30, General: 10, Chemical: 88 }, worker: 'Patricia Lee', workerRole: 'Segregation Officer', lastCollected: '3h ago', collections: 6, ...calcBinStatus({ Infectious: 55, Sharps: 30, General: 10, Chemical: 88 }) },
    ],
  },
  {
    id: 'LAB', name: 'Laboratory', floor: 1, compliance: 95.1,
    bins: [
      { id: 'F14', roomId: 'LAB-1', compartments: { Infectious: 10, Sharps: 45, General: 22, Chemical: 80 }, worker: 'Amara Diallo', workerRole: 'Lab Waste Tech', lastCollected: '5h ago', collections: 4, ...calcBinStatus({ Infectious: 10, Sharps: 45, General: 22, Chemical: 80 }) },
    ],
  },
  // FLOOR 2
  {
    id: 'SURG', name: 'Surgery Ward', floor: 2, compliance: 99.2,
    bins: [
      { id: 'F21', roomId: 'SURG-2', compartments: { Infectious: 67, Sharps: 89, General: 12, Chemical: 4 }, worker: 'Ahmed Hassan', workerRole: 'Disposal Coordinator', lastCollected: '2h ago', collections: 9, ...calcBinStatus({ Infectious: 67, Sharps: 89, General: 12, Chemical: 4 }) },
      { id: 'F22', roomId: 'SURG-2', compartments: { Infectious: 80, Sharps: 40, General: 30, Chemical: 22 }, worker: 'Nora Kim', workerRole: 'Sharps Specialist', lastCollected: '6h ago', collections: 11, ...calcBinStatus({ Infectious: 80, Sharps: 40, General: 30, Chemical: 22 }) },
    ],
  },
  {
    id: 'CARD', name: 'Cardiology', floor: 2, compliance: 96.7,
    bins: [
      { id: 'F23', roomId: 'CARD-2', compartments: { Infectious: 14, Sharps: 20, General: 60, Chemical: 0 }, worker: 'Liu Wei', workerRole: 'Ward Waste Officer', lastCollected: '3h ago', collections: 5, ...calcBinStatus({ Infectious: 14, Sharps: 20, General: 60, Chemical: 0 }) },
    ],
  },
  {
    id: 'ORTHO', name: 'Orthopedics', floor: 2, compliance: 94.3,
    bins: [
      { id: 'F24', roomId: 'ORTHO-2', compartments: { Infectious: 28, Sharps: 95, General: 78, Chemical: 12 }, worker: 'Daniel Osei', workerRole: 'Waste Handler', lastCollected: '2h ago', collections: 6, ...calcBinStatus({ Infectious: 28, Sharps: 95, General: 78, Chemical: 12 }) },
    ],
  },
  // FLOOR 3
  {
    id: 'PED', name: 'Pediatrics', floor: 3, compliance: 98.0,
    bins: [
      { id: 'F31', roomId: 'PED-3', compartments: { Infectious: 55, Sharps: 30, General: 42, Chemical: 5 }, worker: 'Fatima Al-Rashid', workerRole: 'Waste Supervisor', lastCollected: '1h ago', collections: 4, ...calcBinStatus({ Infectious: 55, Sharps: 30, General: 42, Chemical: 5 }) },
    ],
  },
  {
    id: 'MAT', name: 'Maternity', floor: 3, compliance: 97.6,
    bins: [
      { id: 'F32', roomId: 'MAT-3', compartments: { Infectious: 30, Sharps: 45, General: 68, Chemical: 25 }, worker: 'Grace Mensah', workerRole: 'Ward Waste Tech', lastCollected: '40m ago', collections: 3, ...calcBinStatus({ Infectious: 30, Sharps: 45, General: 68, Chemical: 25 }) },
    ],
  },
  {
    id: 'ONCO', name: 'Oncology', floor: 3, compliance: 99.5,
    bins: [
      { id: 'F33', roomId: 'ONCO-3', compartments: { Infectious: 40, Sharps: 85, General: 20, Chemical: 50 }, worker: 'Yuki Tanaka', workerRole: 'Hazmat Specialist', lastCollected: '2h ago', collections: 4, ...calcBinStatus({ Infectious: 40, Sharps: 85, General: 20, Chemical: 50 }) },
    ],
  },
];

// ─── Category Constants ──────────────────────────────────────────────────────
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

const BinCard = ({ bin }: { bin: SmartBin }) => {
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
          {/* Blueprint Grid */}
          <defs>
            <pattern id={`blueprint-grid-${floorNum}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsla(188,70%,50%,0.07)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="185" fill={`url(#blueprint-grid-${floorNum})`} />

          {/* Rooms and Corridors */}
          {rooms.map((room) => {
            const isCorridor = room.type === 'corridor';
            const roomBins = binsByRoom[room.id] || [];
            
            return (
              <g key={room.id}>
                {/* Floor Area */}
                <rect
                  x={room.x} y={room.y} width={room.w} height={room.h}
                  fill={isCorridor ? 'hsla(0,0%,15%,0.3)' : 'hsla(220,30%,12%,0.7)'}
                  stroke={isCorridor ? 'hsla(188,70%,50%,0.1)' : 'hsla(188,70%,50%,0.3)'}
                  strokeWidth="1.5"
                />
                {!isCorridor && (
                  <text
                    x={room.x + 5} y={room.y + 12}
                    fill="hsla(188,70%,50%,0.6)"
                    fontSize="6" fontFamily="Orbitron, sans-serif" fontWeight="700" letterSpacing="0.05em"
                  >
                    {room.label.toUpperCase()}
                  </text>
                )}

                {/* Draw Smart Bins Inside Rooms */}
                {roomBins.map((bin, bi) => {
                  const spacing = room.w / (roomBins.length + 1);
                  const cx = room.x + spacing * (bi + 1);
                  const cy = room.y + room.h / 2 + 5;
                  
                  const col = fillColor(bin.overallFill);
                  const glow = fillGlow(bin.overallFill);

                  return (
                    <g key={bin.id} onMouseEnter={() => setTooltip({ bin, x: cx, y: cy })} style={{ cursor: 'pointer' }}>
                      {/* Pulse ring for critical */}
                      {bin.overallFill >= 85 && (
                        <circle cx={cx} cy={cy} r="10" fill="none" stroke={col} strokeWidth="0.5" className="animate-ping" opacity="0.5" />
                      )}
                      {/* Base Icon for Smart Bin */}
                      <rect x={cx - 6} y={cy - 6} width="12" height="12" rx="2" fill="hsla(220,15%,20%,1)" stroke={col} strokeWidth="1" style={{ filter: `drop-shadow(${glow})` }} />
                      <circle cx={cx} cy={cy} r="2.5" fill={col} />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* SVG Tooltip */}
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
  // Calculate average fill across ALL compartments in ALL bins in this ward
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

const WardRanks = () => {
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);

  const floorWards = WARDS.filter((w) => w.floor === activeFloor);
  const effectiveWardId = selectedWardId && floorWards.find((w) => w.id === selectedWardId) ? selectedWardId : floorWards[0]?.id ?? null;
  const selectedWard = WARDS.find((w) => w.id === effectiveWardId) ?? null;

  const allFloorBins = floorWards.flatMap((w) => w.bins);
  const fullCount = allFloorBins.filter((b) => b.status === 'Full').length;
  const collectionsToday = allFloorBins.reduce((a, b) => a + b.collections, 0);

  return (
    <div className="space-y-8 animate-slide-up pb-12 pr-2">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">
            Advanced Bin Operations
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor real-time compartment analytics across 4-category smart bins.
          </p>
        </div>
        <div className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2.5 neon-border self-start sm:self-auto">
          <div className="w-2 h-2 rounded-full bg-safe neon-dot animate-pulse" />
          <span className="font-display font-bold text-[10px] tracking-widest uppercase text-foreground">Live Telemetry</span>
        </div>
      </header>

      {/* Floor Selector */}
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

      {/* Stats */}
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
          {/* Left panel */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-foreground">Wards — Floor {activeFloor}</span>
            </div>
            {floorWards.map((ward) => (
              <WardCard key={ward.id} ward={ward} selected={ward.id === effectiveWardId} onClick={() => setSelectedWardId(ward.id)} />
            ))}
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            {/* SVG MAP */}
            <FloorMap floorNum={activeFloor} wards={floorWards} />

            {/* Smart Bins */}
            {selectedWard && (
              <div className="space-y-4">
                <div className="flex flex-col border-b border-border/10 pb-4">
                  <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                    {selectedWard.name} Telemetry
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Displaying 4-compartment status for active smart bins.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedWard.bins.map((bin, i) => (
                    <BinCard key={bin.id} bin={bin} />
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

export default WardRanks;
