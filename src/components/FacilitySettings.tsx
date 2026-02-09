import { useState } from 'react';
import { Input } from '@/components/ui/input';

const FacilitySettings = () => {
  const [facility, setFacility] = useState('Central Medical Facility');
  const [license, setLicense] = useState('HLN-2024-001234');
  const [contactEmail, setContactEmail] = useState('admin@centralmedical.com');

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      <header>
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">Facility Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm">Manage your hospital/clinic configuration.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="font-bold text-base mb-6 text-foreground">Facility Information</h3>
          <div className="space-y-4">
            <Field label="Facility Name" value={facility} onChange={setFacility} />
            <Field label="License Number" value={license} onChange={setLicense} />
            <Field label="Contact Email" value={contactEmail} onChange={setContactEmail} type="email" />
            <button className="w-full gradient-teal text-primary-foreground py-3 rounded-xl font-display font-bold text-[10px] uppercase tracking-widest mt-4 neon-glow-sm hover:neon-glow transition-all">
              Save Changes
            </button>
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <h3 className="font-bold text-base mb-6 text-foreground">System Preferences</h3>
          <div className="space-y-3">
            {['Enable AI Auto-Scanning', 'Email Weekly Reports', 'Alert on Non-Compliance', 'Enable Data Export API'].map((pref, i) => (
              <label key={pref} className="flex items-center gap-3 p-4 glass-card-hover rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked={i < 3} className="w-4 h-4 rounded accent-primary" />
                <span className="font-semibold text-sm text-foreground">{pref}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div>
    <label className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground block mb-2">{label}</label>
    <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl glass-input text-foreground" />
  </div>
);

export default FacilitySettings;
