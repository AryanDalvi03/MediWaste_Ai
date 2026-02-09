import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { PROTOCOLS } from '@/lib/protocols';
import { useScanStore, useNav } from '@/lib/store';

const AIScanner = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: string; confidence: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const addEntry = useScanStore((s) => s.addEntry);
  const setTab = useNav((s) => s.setTab);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
      setResult(null);
      setLoading(true);
      setTimeout(() => {
        const keys = Object.keys(PROTOCOLS).filter((k) => k !== 'default');
        const type = keys[Math.floor(Math.random() * keys.length)];
        const confidence = (94 + Math.random() * 5).toFixed(2);
        setResult({ type, confidence });
        setLoading(false);
        addEntry({ type, confidence: parseFloat(confidence), timestamp: Date.now() });
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const info = result ? PROTOCOLS[result.type] || PROTOCOLS.default : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up text-center pb-12">
      <div className="space-y-3">
        <span className="inline-block px-4 py-1.5 rounded-full glass-card neon-border text-primary text-xs font-display font-bold uppercase tracking-widest">
          Neural Vision Pipeline
        </span>
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">Waste Inspector</h2>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="rounded-3xl glass-card-hover p-4 cursor-pointer transition-all group animate-border-glow"
      >
        <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleFile} />
        {!preview ? (
          <div className="py-20 rounded-2xl gradient-neon">
            <div className="w-20 h-20 glass-card neon-glow rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary group-hover:neon-glow transition-all animate-float">
              <Camera className="w-10 h-10 opacity-70" />
            </div>
            <p className="text-xl font-bold text-foreground">Capture Artifact</p>
            <p className="text-muted-foreground text-xs mt-1 font-display uppercase tracking-widest">Real-time classification standby</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden">
            <img src={preview} alt="Scan preview" className="max-h-72 mx-auto rounded-2xl" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card neon-border rounded-2xl p-10 space-y-4"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary neon-text-subtle mx-auto" />
            <p className="font-display font-bold text-xs uppercase tracking-widest text-primary neon-text-subtle">Extracting CNN Features...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && info && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden glass-card text-left"
          >
            <div className={`p-8 ${info.hazardous ? 'bg-hazard/80 neon-hazard' : 'bg-safe/80 neon-glow-sm'}`}>
              <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{result.type}</h3>
              <p className="text-sm font-display font-bold opacity-80 uppercase tracking-widest mt-1 text-foreground/80">Inference: {result.confidence}% Confidence</p>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 glass-card rounded-xl">
                  <p className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest">Bin Location</p>
                  <p className="font-bold text-foreground mt-1">{info.bin}</p>
                </div>
                <div className={`p-4 rounded-xl ${info.hazardous ? 'bg-hazard-light/50 neon-hazard' : 'bg-safe-light/50 neon-glow-sm'}`} style={{ border: `1px solid ${info.hazardous ? 'hsla(0,72%,55%,0.3)' : 'hsla(160,65%,45%,0.3)'}` }}>
                  <p className={`text-[10px] font-display font-bold uppercase tracking-widest ${info.hazardous ? 'text-hazard-foreground' : 'text-safe-foreground'}`}>Classification</p>
                  <p className={`font-bold mt-1 ${info.hazardous ? 'text-hazard-foreground' : 'text-safe-foreground'}`}>
                    {info.hazardous ? 'HAZARDOUS' : 'CLEAN'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-4 italic">"{info.instruction}"</p>
              <button
                onClick={() => setTab('dashboard')}
                className="w-full gradient-teal text-primary-foreground py-4 rounded-xl font-display font-bold text-xs tracking-widest uppercase neon-glow-sm hover:neon-glow transition-all"
              >
                COMPLETE & LOG TO CLOUD
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIScanner;
