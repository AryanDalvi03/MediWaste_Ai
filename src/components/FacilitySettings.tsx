import { useState } from 'react';
import { Input } from '@/components/ui/input';

const FacilitySettings = () => {
  const [facility, setFacility] = useState('Central Medical Facility');
  const [license, setLicense] = useState('HLN-2024-001234');
  const [contactEmail, setContactEmail] = useState('admin@centralmedical.com');

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      <header>
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Facility Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm">Manage your hospital/clinic configuration.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
          <h3 className="font-bold text-base mb-6 text-foreground">Facility Information</h3>
          <div className="space-y-4">
            <Field label="Facility Name" value={facility} onChange={setFacility} />
            <Field label="License Number" value={license} onChange={setLicense} />
            <Field label="Contact Email" value={contactEmail} onChange={setContactEmail} type="email" />
            <button className="w-full gradient-teal text-primary-foreground py-3 rounded-xl font-bold text-xs uppercase tracking-wider mt-4 hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
          <h3 className="font-bold text-base mb-6 text-foreground">System Preferences</h3>
          <div className="space-y-3">
            {['Enable AI Auto-Scanning', 'Email Weekly Reports', 'Alert on Non-Compliance', 'Enable Data Export API'].map((pref, i) => (
              <label key={pref} className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-muted/30 cursor-pointer transition-colors">
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
    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">{label}</label>
    <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl bg-muted/30 border-border" />
  </div>
);

export default FacilitySettings;
