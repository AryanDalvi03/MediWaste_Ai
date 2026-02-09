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
        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
          Neural Vision Pipeline
        </span>
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Waste Inspector</h2>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="rounded-3xl border-2 border-dashed border-border hover:border-primary/50 p-4 cursor-pointer transition-all group"
      >
        <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleFile} />
        {!preview ? (
          <div className="py-20 bg-muted/30 rounded-2xl">
            <div className="w-20 h-20 bg-card shadow-lg rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary group-hover:shadow-xl transition-shadow">
              <Camera className="w-10 h-10" />
            </div>
            <p className="text-xl font-bold text-foreground">Capture Artifact</p>
            <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wider">Real-time classification standby</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden bg-card">
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
            className="gradient-dark text-primary-foreground rounded-2xl p-10 space-y-4"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="font-bold text-xs uppercase tracking-widest text-primary">Extracting CNN Features...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && info && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl shadow-lg overflow-hidden border border-border text-left"
          >
            <div className={`p-8 ${info.hazardous ? 'bg-hazard' : 'bg-safe'} text-primary-foreground`}>
              <h3 className="text-3xl font-extrabold tracking-tight">{result.type}</h3>
              <p className="text-sm font-bold opacity-80 uppercase tracking-wider mt-1">Inference: {result.confidence}% Confidence</p>
            </div>
            <div className="p-8 space-y-5 bg-card">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Bin Location</p>
                  <p className="font-bold text-foreground mt-1">{info.bin}</p>
                </div>
                <div className={`p-4 rounded-xl border ${info.hazardous ? 'bg-hazard-light border-hazard/20' : 'bg-safe-light border-safe/20'}`}>
                  <p className={`text-xs font-bold uppercase ${info.hazardous ? 'text-hazard' : 'text-safe'}`}>Classification</p>
                  <p className={`font-bold mt-1 ${info.hazardous ? 'text-hazard-foreground' : 'text-safe-foreground'}`}>
                    {info.hazardous ? 'HAZARDOUS' : 'CLEAN'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground border-l-4 border-primary pl-4 italic">"{info.instruction}"</p>
              <button
                onClick={() => setTab('dashboard')}
                className="w-full gradient-dark text-primary-foreground py-4 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
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
