import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, ScanLine, ShieldCheck } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background bg-grid bg-orb-teal relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 mb-7">
            <div className="gradient-teal p-3 rounded-2xl neon-glow">
              <ShieldCheck className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-display font-extrabold text-2xl tracking-wider text-foreground">
              MEDI<span className="text-gradient-teal">WASTE</span>
            </h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground neon-text-subtle">
            Enterprise Healthcare Waste Management
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Scan, classify, and improve compliance with AI-powered segregation guidance and reporting.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/dashboard"
              className="gradient-teal text-primary-foreground px-6 py-3 rounded-xl font-display font-bold text-xs tracking-widest neon-glow-sm hover:opacity-90 transition-all uppercase inline-flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Open Dashboard
            </Link>

            <Link
              to="/scanner"
              className="glass-card-hover px-6 py-3 rounded-xl font-semibold text-sm text-foreground inline-flex items-center justify-center gap-2"
            >
              <ScanLine className="w-4 h-4 text-primary" />
              Launch Scanner
            </Link>

            <Link
              to="/auth"
              className="glass-card-hover px-6 py-3 rounded-xl font-semibold text-sm text-foreground inline-flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-primary" />
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;

