import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Shield, Building2, Leaf, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/store';
import { UserRole } from '@/lib/protocols';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  floor: number;
}

const FLOOR_COLORS = [
  'from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40',
  'from-blue-500/5 to-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
  'from-violet-500/5 to-violet-500/10 border-violet-500/20 hover:border-violet-500/40',
];

const AuthPage = () => {
  const [step, setStep] = useState<'login' | 'role' | 'staff-select'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !selectedRole) return;

    login(
      email || (selectedStaff ? `${selectedStaff.name.toLowerCase().replace(' ', '.')}@hospital.com` : email),
      selectedRole,
      selectedStaff?.name
    );
    navigate('/dashboard');
  };

  const handleGoogleSignIn = () => {
    if (!selectedRole) return;
    setEmail('user@gmail.com');
    login('user@gmail.com', selectedRole, selectedStaff?.name);
    navigate('/dashboard');
  };

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'hospital_staff') {
      setStaffLoading(true);
      setStep('staff-select');
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'https://mediwaste-ai-backend.onrender.com';
        const res = await fetch(`${apiBase}/api/staff`);
        const data = await res.json();
        if (Array.isArray(data)) setStaffList(data);
      } catch (e) {
        console.error('Could not load staff list', e);
        setStaffList([
          { _id: '1', name: 'Jay Gupta', role: 'Ward Sanitation Lead', floor: 1 },
          { _id: '2', name: 'Kishore Sharma', role: 'Ward Sanitation Lead', floor: 2 },
          { _id: '3', name: 'Asha Pathak', role: 'Ward Sanitation Lead', floor: 3 },
        ]);
      } finally {
        setStaffLoading(false);
      }
    } else {
      setStep('login');
    }
  };

  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setStep('login');
  };

  // ─── Staff Selection Screen ───────────────────────────────────────────────
  if (step === 'staff-select') {
    return (
      <div className="min-h-screen bg-background bg-grid bg-orb-teal flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <AnimatePresence mode="wait">
          <motion.div
            key="staff-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg relative z-10"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="gradient-teal p-3 rounded-2xl neon-glow">
                  <ShieldCheck className="w-7 h-7 text-primary-foreground" />
                </div>
                <h1 className="font-display font-extrabold text-xl tracking-wider text-foreground">
                  MEDI<span className="text-gradient-teal">WASTE</span>
                </h1>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-2 neon-text-subtle">
                Select Staff Member
              </h2>
              <p className="text-muted-foreground text-sm">
                Choose your profile to access your assigned workload
              </p>
            </div>

            {staffLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {staffList.map((staff, idx) => (
                  <motion.button
                    key={staff._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStaffSelect(staff)}
                    className={`w-full p-5 rounded-2xl text-left group relative overflow-hidden border bg-gradient-to-r ${FLOOR_COLORS[idx % 3]} transition-all duration-300`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="gradient-teal w-12 h-12 rounded-xl flex items-center justify-center font-display font-extrabold text-lg text-primary-foreground neon-glow-sm shrink-0">
                        {staff.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                          {staff.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {staff.role} &middot; Floor {staff.floor}
                        </p>
                      </div>
                      {/* Floor badge */}
                      <span className="text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-full glass-card text-primary border border-primary/30 shrink-0">
                        Floor {staff.floor}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Back button */}
            <button
              onClick={() => {
                setSelectedRole(null);
                setStep('role');
              }}
              className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mx-auto"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Role Selection
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Role Selection Screen ────────────────────────────────────────────────
  if (step === 'role') {
    return (
      <div className="min-h-screen bg-background bg-grid bg-orb-teal flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="gradient-teal p-3 rounded-2xl neon-glow">
                <ShieldCheck className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="font-display font-extrabold text-xl tracking-wider text-foreground">
                MEDI<span className="text-gradient-teal">WASTE</span>
              </h1>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-2 neon-text-subtle">Select Your Role</h2>
            <p className="text-muted-foreground">Choose how you'll use the platform</p>
          </div>

          <div className="space-y-4">
            {([
              { role: 'audit_manager' as UserRole, title: 'Audit Manager', desc: 'Full access to compliance reports, team analytics, and facility settings', Icon: Shield },
              { role: 'hospital_staff' as UserRole, title: 'Hospital Staff', desc: 'Access to scanner, audit logs, ward rankings, and AI assistant', Icon: Building2 },
              { role: 'common' as UserRole, title: 'Common', desc: 'Basic access to waste scanner and environmental impact data', Icon: Leaf },
            ]).map((item) => (
              <motion.button
                key={item.role}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleRoleSelect(item.role)}
                className="w-full p-6 rounded-2xl text-left group relative overflow-hidden"
                style={{
                  background: 'hsla(174, 80%, 48%, 0.05)',
                  backdropFilter: 'blur(32px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                  border: '1px solid hsla(174, 80%, 48%, 0.18)',
                  boxShadow: 'inset 0 1px 0 hsla(180, 20%, 92%, 0.08)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsla(174, 80%, 48%, 0.1)';
                  e.currentTarget.style.borderColor = 'hsla(174, 80%, 48%, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 25px hsla(174, 80%, 48%, 0.15), inset 0 1px 0 hsla(180, 20%, 92%, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'hsla(174, 80%, 48%, 0.05)';
                  e.currentTarget.style.borderColor = 'hsla(174, 80%, 48%, 0.18)';
                  e.currentTarget.style.boxShadow = 'inset 0 1px 0 hsla(180, 20%, 92%, 0.08)';
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, hsla(174, 80%, 48%, 0.08), hsla(188, 70%, 50%, 0.04), transparent)' }} />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2.5 rounded-xl neon-glow-sm group-hover:neon-glow transition-all" style={{
                    background: 'hsla(174, 80%, 48%, 0.08)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid hsla(174, 80%, 48%, 0.2)',
                  }}>
                    <item.Icon className="w-6 h-6 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mx-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Login Screen ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background bg-grid bg-orb-teal flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={() => {
            if (selectedRole === 'hospital_staff') {
              setStep('staff-select');
            } else {
              setStep('role');
            }
          }}
          className="group mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:-translate-x-1 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Back to {selectedRole === 'hospital_staff' ? 'Staff Selection' : 'Role Selection'}
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="gradient-teal p-3 rounded-2xl neon-glow">
              <ShieldCheck className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display font-extrabold text-2xl tracking-wider text-foreground">
              MEDI<span className="text-gradient-teal">WASTE</span>
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-muted-foreground text-sm">Enterprise Healthcare Waste Management</p>
        </div>

        <div className="glass-card rounded-3xl p-8 animate-border-glow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                <Input
                  type="email"
                  placeholder="you@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl glass-input text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
                <span className={`text-[10px] font-display font-bold tracking-widest uppercase ${password.length >= 8 ? 'text-primary' : 'text-red-500/70'}`}>
                  {password.length}/8
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 rounded-xl glass-input text-foreground placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl gradient-teal text-primary-foreground font-display font-bold text-xs tracking-widest neon-glow-sm hover:opacity-90 transition-all uppercase">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-transparent px-3 text-muted-foreground font-medium glass-card rounded-full py-1">or</span></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-xl glass-card-hover flex items-center justify-center gap-3 font-semibold text-sm text-foreground"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-semibold hover:underline neon-text-subtle">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
