import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

/* ─── Animated counter ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const step = Math.max(1, Math.floor(target / 60));
                    const timer = setInterval(() => {
                        start += step;
                        if (start >= target) {
                            start = target;
                            clearInterval(timer);
                        }
                        setCount(start);
                    }, 20);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
}

/* ─── Fade-in on scroll ─── */
function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [transitionDone, setTransitionDone] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setVisible(true);
                        // Remove transition after animation completes to prevent jitter
                        setTimeout(() => setTransitionDone(true), 800);
                    }, delay);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`${transitionDone ? '' : 'transition-[opacity,transform] duration-700 ease-out'} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
        >
            {children}
        </div>
    );
}

/* ─── SVG Icons for Features ─── */
const ScannerIcon = () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <rect x="6" y="6" width="36" height="36" rx="8" stroke="currentColor" strokeWidth="2" />
        <path d="M6 24h36" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="24" cy="18" r="4" fill="currentColor" opacity="0.3" />
        <path d="M16 32h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const ChartIcon = () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <rect x="8" y="28" width="6" height="12" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="18" y="20" width="6" height="20" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="28" y="12" width="6" height="28" rx="2" fill="currentColor" opacity="0.7" />
        <path d="M8 8v32h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const ShieldIcon = () => (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <path d="M24 4L8 12v12c0 10 7 18 16 20 9-2 16-10 16-20V12L24 4z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <path d="M18 24l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LeafIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 inline-block">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ─── Animated SVG Icons for "How It Works" ─── */
const UploadIcon = () => (
    <svg viewBox="0 0 56 56" fill="none" className="w-12 h-12">
        {/* Camera body */}
        <rect x="8" y="16" width="40" height="28" rx="6" stroke="#008080" strokeWidth="2.2" fill="#e6f3f3" />
        {/* Lens */}
        <circle cx="28" cy="30" r="8" stroke="#008080" strokeWidth="2" fill="none">
            <animate attributeName="r" values="8;9;8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="28" cy="30" r="4" fill="#008080" opacity="0.25">
            <animate attributeName="opacity" values="0.25;0.5;0.25" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Flash */}
        <rect x="18" y="12" width="12" height="6" rx="2" fill="#008080" opacity="0.3" />
        {/* Shutter pulse */}
        <circle cx="28" cy="30" r="12" stroke="#008080" strokeWidth="1" fill="none" opacity="0.3">
            <animate attributeName="r" values="12;16;12" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
    </svg>
);

const ClassifyIcon = () => (
    <svg viewBox="0 0 56 56" fill="none" className="w-12 h-12">
        {/* Brain/chip outline */}
        <rect x="12" y="12" width="32" height="32" rx="8" stroke="#06b6d4" strokeWidth="2.2" fill="#ecfeff" />
        {/* Circuit lines */}
        <path d="M20 20h6v6h-6z" fill="#06b6d4" opacity="0.2">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M30 20h6v6h-6z" fill="#06b6d4" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
        </path>
        <path d="M20 30h6v6h-6z" fill="#06b6d4" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
        </path>
        <path d="M30 30h6v6h-6z" fill="#06b6d4" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.5s" begin="0.9s" repeatCount="indefinite" />
        </path>
        {/* Connection lines */}
        <path d="M28 12V8M28 48v-4M12 28H8M48 28h-4" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        {/* Scanning line */}
        <line x1="14" y1="28" x2="42" y2="28" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4">
            <animate attributeName="y1" values="16;40;16" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="y2" values="16;40;16" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.5s" repeatCount="indefinite" />
        </line>
    </svg>
);

const RouteIcon = () => (
    <svg viewBox="0 0 56 56" fill="none" className="w-12 h-12">
        {/* Bin body */}
        <path d="M14 20h28l-3 26H17L14 20z" stroke="#f59e0b" strokeWidth="2.2" fill="#fffbeb" />
        {/* Bin lid */}
        <rect x="12" y="16" width="32" height="5" rx="2" fill="#f59e0b" opacity="0.3">
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2s" repeatCount="indefinite" />
        </rect>
        {/* Color stripes for sorting – animated */}
        <rect x="20" y="26" width="4" height="14" rx="1" fill="#ef4444" opacity="0.5">
            <animate attributeName="height" values="14;10;14" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="26" y="26" width="4" height="14" rx="1" fill="#eab308" opacity="0.5">
            <animate attributeName="height" values="14;12;14" dur="2s" begin="0.3s" repeatCount="indefinite" />
        </rect>
        <rect x="32" y="26" width="4" height="14" rx="1" fill="#3b82f6" opacity="0.5">
            <animate attributeName="height" values="14;8;14" dur="2s" begin="0.6s" repeatCount="indefinite" />
        </rect>
        {/* Arrow into bin */}
        <path d="M28 8v8" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M24 12l4 4 4-4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </path>
    </svg>
);

const ReportIcon = () => (
    <svg viewBox="0 0 56 56" fill="none" className="w-12 h-12">
        {/* Document */}
        <rect x="12" y="6" width="26" height="36" rx="4" stroke="#8b5cf6" strokeWidth="2.2" fill="#f5f3ff" />
        {/* Chart bars */}
        <rect x="18" y="28" width="4" height="8" rx="1" fill="#8b5cf6" opacity="0.4">
            <animate attributeName="height" values="8;12;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="y" values="28;24;28" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="24" y="24" width="4" height="12" rx="1" fill="#8b5cf6" opacity="0.6">
            <animate attributeName="height" values="12;8;12" dur="2s" begin="0.3s" repeatCount="indefinite" />
            <animate attributeName="y" values="24;28;24" dur="2s" begin="0.3s" repeatCount="indefinite" />
        </rect>
        <rect x="30" y="20" width="4" height="16" rx="1" fill="#8b5cf6" opacity="0.8">
            <animate attributeName="height" values="16;10;16" dur="2s" begin="0.6s" repeatCount="indefinite" />
            <animate attributeName="y" values="20;26;20" dur="2s" begin="0.6s" repeatCount="indefinite" />
        </rect>
        {/* Text lines */}
        <rect x="18" y="12" width="14" height="2" rx="1" fill="#8b5cf6" opacity="0.2" />
        <rect x="18" y="17" width="10" height="2" rx="1" fill="#8b5cf6" opacity="0.15" />
        {/* Trend arrow */}
        <path d="M40 38l-4-6h3V22h2v10h3l-4 6z" fill="#8b5cf6" opacity="0.3">
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="2s" repeatCount="indefinite" />
        </path>
    </svg>
);

/* ─── Main HomePage ─── */
const HomePage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#F0F4F8] text-gray-800" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            {/* Floating animation keyframes */}
            <style>{`
                html, body {
                    overflow-x: hidden;
                    width: 100%;
                    position: relative;
                    margin: 0;
                    padding: 0;
                }
                @keyframes floatY {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes floatYSlow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float { animation: floatY 4s ease-in-out infinite; }
                .animate-float-slow { animation: floatYSlow 5s ease-in-out infinite; }
                .animate-float-delayed { animation: floatY 4.5s ease-in-out 0.5s infinite; }
            `}</style>

            {/* ═══════════ NAVBAR ═══════════ */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#F0F4F8]/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#008080] to-[#20b2aa] flex items-center justify-center shadow-md shadow-[#008080]/20 group-hover:shadow-lg group-hover:shadow-[#008080]/30 transition-shadow">
                            <span className="text-white font-extrabold text-sm">M</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-gray-800">Medi</span>
                            <span className="text-[#008080]">Waste</span>
                            <span className="text-gray-400 font-medium ml-0.5">AI</span>
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Why Us', 'How It Works', 'About'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-sm font-medium text-gray-500 hover:text-[#008080] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#008080] hover:after:w-full after:transition-all"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/auth" className="text-sm font-semibold text-gray-600 hover:text-[#008080] transition-colors px-4 py-2">
                            Login
                        </Link>
                        <Link to="/auth" className="text-sm font-semibold text-white bg-gradient-to-r from-[#008080] to-[#20b2aa] hover:from-[#006666] hover:to-[#008080] px-5 py-2.5 rounded-full shadow-md shadow-[#008080]/25 hover:shadow-lg hover:shadow-[#008080]/35 transition-all hover:-translate-y-0.5">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {mobileMenuOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            }
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#F0F4F8]/95 backdrop-blur-lg border-t border-blue-100/50 px-6 py-4 space-y-3 animate-fade-in">
                        {['Features', 'Why Us', 'How It Works', 'About'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="block text-sm font-medium text-gray-600 hover:text-[#008080]" onClick={() => setMobileMenuOpen(false)}>
                                {item}
                            </a>
                        ))}
                        <Link to="/auth" className="block text-sm font-semibold text-[#008080]">Login</Link>
                        <Link to="/auth" className="block text-center text-sm font-semibold text-white bg-gradient-to-r from-[#008080] to-[#20b2aa] px-5 py-2.5 rounded-full">Get Started</Link>
                    </div>
                )}
            </nav>

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#008080]/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#008080]/10 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Left — Text */}
                    <FadeInSection>
                        <div className="max-w-xl">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#008080]/10 text-[#005f5f] text-xs font-semibold tracking-wide uppercase mb-6 border border-[#008080]/15">
                                <LeafIcon /> Eco-Intelligent Platform
                            </span>
                            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.12] tracking-tight text-gray-900 mb-6">
                                Intelligent Waste Management{' '}
                                <span className="text-[#008080]">
                                    Powered by AI
                                </span>
                            </h1>
                            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                                MediWaste AI is an innovative technology platform that empowers healthcare facilities with AI-driven waste classification, real-time analytics, and automated compliance — reducing costs and environmental impact.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/auth"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-[#008080] to-[#20b2aa] hover:from-[#006666] hover:to-[#008080] px-7 py-3.5 rounded-full shadow-lg shadow-[#008080]/25 hover:shadow-xl hover:shadow-[#008080]/35 transition-all hover:-translate-y-0.5"
                                >
                                    Get Started Free
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 hover:border-[#008080]/40 hover:text-[#008080] px-7 py-3.5 rounded-full transition-all"
                                >
                                    Learn More
                                </a>
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Right — Hero illustration */}
                    <FadeInSection delay={200} className="flex justify-center lg:justify-end">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#008080]/15 to-[#008080]/10 rounded-3xl blur-2xl scale-110" />
                            <img
                                src="/images/hero-illustration.png"
                                alt="AI-powered medical waste management illustration"
                                className="relative w-full max-w-lg rounded-2xl shadow-xl shadow-blue-900/5 animate-float-slow object-cover border border-white/50 bg-white/30 backdrop-blur-sm"
                            />
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ STATS BAR ═══════════ */}
            <section className="relative py-16 bg-gradient-to-r from-[#F0F4F8] to-blue-100/40 border-y border-blue-100/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 50, suffix: '+', label: 'Hospitals Served' },
                            { value: 12, suffix: '', label: 'Waste Categories' },
                            { value: 99, suffix: '%', label: 'Classification Accuracy' },
                            { value: 35, suffix: '%', label: 'Cost Reduction' },
                        ].map((stat) => (
                            <FadeInSection key={stat.label}>
                                <div className="space-y-1">
                                    <div className="text-3xl sm:text-4xl font-extrabold text-[#008080]">
                                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section id="features" className="py-24 relative overflow-hidden">
                <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#008080]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <FadeInSection className="text-center mb-16">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#008080] mb-3 block">Our Solutions</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                            How We Can Help You
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                            Comprehensive AI-powered tools for every stage of medical waste management.
                        </p>
                    </FadeInSection>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                Icon: ScannerIcon,
                                title: 'AI Waste Scanner',
                                desc: 'Upload images of waste items and get real-time AI classification with precise bin recommendations — Red Sharps, Yellow Biohazard, Blue Recycling, and more.',
                                color: 'teal',
                            },
                            {
                                Icon: ChartIcon,
                                title: 'Smart Analytics',
                                desc: 'Interactive dashboards showing waste generation trends, composition analytics, financial impact, and environmental metrics including CO₂ emissions.',
                                color: 'cyan',
                            },
                            {
                                Icon: ShieldIcon,
                                title: 'Compliance & ESG',
                                desc: 'Automated audit manifests, compliance reports with real-time tracking, and ESG impact scoring to meet regulatory requirements effortlessly.',
                                color: 'cyan',
                            },
                        ].map((feature, i) => (
                            <FadeInSection key={feature.title} delay={i * 150}>
                                <div className="group relative bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-blue-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1 h-full">
                                    <div className={`w-14 h-14 rounded-xl bg-${feature.color}-50 text-${feature.color}-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`} style={{ backgroundColor: feature.color === 'teal' ? '#e6f3f3' : feature.color === 'cyan' ? '#ecfeff' : '#ecfeff', color: feature.color === 'teal' ? '#008080' : feature.color === 'cyan' ? '#06b6d4' : '#06b6d4' }}>
                                        <feature.Icon />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
                                    <Link to="/auth" className="inline-flex items-center gap-1 text-sm font-semibold text-[#008080] mt-5 hover:gap-2 transition-all">
                                        Learn More
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ WHY MEDIWASTE AI ═══════════ */}
            <section id="why-us" className="py-24 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#008080]/08 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-sky-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* Section Header */}
                    <FadeInSection className="text-center mb-20">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold tracking-wide uppercase mb-5 border border-red-100">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            The Problem
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
                            Why Hospitals Need{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008080] to-[#20b2aa]">MediWaste AI</span>
                        </h2>
                        <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
                            Indian hospitals generate <span className="font-semibold text-gray-700">over 600 tonnes of biomedical waste daily</span>. Manual sorting leads to misclassification, heavy fines, and serious health risks. Here's what's at stake:
                        </p>
                    </FadeInSection>

                    {/* ─── Problem Cards ─── */}
                    <div className="grid md:grid-cols-3 gap-6 mb-24">
                        {[
                            {
                                icon: (
                                    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
                                        <circle cx="24" cy="24" r="20" stroke="#ef4444" strokeWidth="2" fill="#fef2f2" />
                                        <path d="M24 14v12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                                        <circle cx="24" cy="32" r="1.5" fill="#ef4444" />
                                    </svg>
                                ),
                                stat: '₹5–25 Lakh',
                                title: 'Compliance Fines',
                                desc: 'Hospitals face steep penalties under BMWM Rules 2016 for incorrect waste segregation and missing documentation.',
                                color: 'red',
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
                                        <circle cx="24" cy="24" r="20" stroke="#f59e0b" strokeWidth="2" fill="#fffbeb" />
                                        <path d="M16 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M24 20v-6M18 22l-4-4M30 22l4-4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                ),
                                stat: '40–60%',
                                title: 'Misclassification Rate',
                                desc: 'Staff rely on memory and guesswork. Nearly half of all waste ends up in the wrong bin — increasing hazard and cost.',
                                color: 'amber',
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
                                        <circle cx="24" cy="24" r="20" stroke="#8b5cf6" strokeWidth="2" fill="#f5f3ff" />
                                        <path d="M18 16h12v4H18zM16 24h16v4H16zM14 32h20v4H14z" fill="#8b5cf6" opacity="0.3" />
                                        <path d="M32 16l2 2-2 2" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                ),
                                stat: '15+ hrs/week',
                                title: 'Manual Paperwork',
                                desc: 'Form-4, audit logs, and compliance reports are hand-filed — burning hours that staff could spend on patient care.',
                                color: 'violet',
                            },
                        ].map((card, i) => (
                            <FadeInSection key={card.title} delay={i * 120}>
                                <div className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-gray-100 hover:border-red-100 shadow-sm hover:shadow-xl hover:shadow-red-50/50 transition-all duration-300 hover:-translate-y-1 h-full">
                                    {/* Accent line top */}
                                    <div
                                        className="absolute top-0 left-8 right-8 h-[3px] rounded-full opacity-60"
                                        style={{
                                            background: card.color === 'red' ? '#ef4444' : card.color === 'amber' ? '#f59e0b' : '#8b5cf6',
                                        }}
                                    />
                                    <div className="mb-5">{card.icon}</div>
                                    <div
                                        className="text-2xl font-extrabold mb-2"
                                        style={{
                                            color: card.color === 'red' ? '#dc2626' : card.color === 'amber' ? '#d97706' : '#7c3aed',
                                        }}
                                    >
                                        {card.stat}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>

                    {/* ─── The Solution (Hero-level with image) ─── */}
                    <FadeInSection className="mb-24">
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-1">
                            <div className="rounded-[22px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 sm:p-12 lg:p-16">
                                <div className="grid lg:grid-cols-2 gap-12 items-center">
                                    {/* Left text */}
                                    <div>
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008080]/100/10 text-[#20b2aa] text-xs font-semibold tracking-wide uppercase mb-6 border border-[#008080]/20">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            How We Solve It
                                        </span>
                                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
                                            Point. Scan.{' '}
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#40c9c9] to-[#008080]">
                                                Sorted.
                                            </span>
                                        </h3>
                                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                            Just snap a photo of any waste item. Our AI identifies it in seconds, tells you the correct bin, logs it for compliance, and tracks your sustainability impact — all automatically.
                                        </p>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Scan any waste item', detail: 'Camera or upload — works on any device' },
                                                { label: 'Get instant AI classification', detail: '12 different waste categories' },
                                                { label: 'Auto-generate compliance docs', detail: 'Form-4, audit manifests, BMWM reports' },
                                            ].map((item, i) => (
                                                <div key={item.label} className="flex items-start gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#008080] to-[#20b2aa] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#008080]/20">
                                                        <span className="text-white font-bold text-xs">{i + 1}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold text-sm">{item.label}</p>
                                                        <p className="text-gray-500 text-sm">{item.detail}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Right image */}
                                    <div className="relative flex justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#008080]/20 to-[#008080]/10 rounded-2xl blur-2xl scale-105" />
                                        <img
                                            src="/images/scan-solution-hero.png"
                                            alt="AI scanning medical waste for classification"
                                            className="relative w-full max-w-sm rounded-2xl shadow-2xl shadow-[#008080]/10 animate-float-slow border border-white/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>

                    {/* ─── Why Better Than Alternatives ─── */}
                    <FadeInSection className="text-center mb-14">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#008080] mb-3 block">Why Us</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                            Not Just Digitization —{' '}
                            <span className="text-[#008080]">Intelligence</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                            Other systems digitize forms. MediWaste AI thinks for you. Here's what sets us apart.
                        </p>
                    </FadeInSection>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {[
                            {
                                icon: (
                                    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
                                        <rect x="4" y="4" width="32" height="32" rx="8" stroke="#008080" strokeWidth="2" fill="#e6f3f3" />
                                        <path d="M14 20l4 4 8-8" stroke="#008080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                                title: 'AI-First Classification',
                                desc: 'No manual labels. Snap a photo and AI does the rest — 94%+ accuracy across 12 BMWM categories.',
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
                                        <rect x="4" y="4" width="32" height="32" rx="8" stroke="#06b6d4" strokeWidth="2" fill="#ecfeff" />
                                        <path d="M12 28l4-8 4 4 4-10 4 6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                                title: 'Real-Time Analytics',
                                desc: 'Live dashboards show waste trends, cost savings, and environmental impact — not just static spreadsheets.',
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
                                        <rect x="4" y="4" width="32" height="32" rx="8" stroke="#8b5cf6" strokeWidth="2" fill="#f5f3ff" />
                                        <path d="M14 14h12v4H14zM14 22h8v4h-8z" fill="#8b5cf6" opacity="0.3" />
                                        <path d="M28 20l-2 6h-4l2-6h4z" fill="#8b5cf6" opacity="0.5" />
                                    </svg>
                                ),
                                title: 'Auto Compliance Reports',
                                desc: 'Form-4, monthly manifests, and audit logs generated automatically — zero manual paperwork.',
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
                                        <rect x="4" y="4" width="32" height="32" rx="8" stroke="#06b6d4" strokeWidth="2" fill="#ecfeff" />
                                        <circle cx="20" cy="20" r="8" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
                                        <path d="M20 14v6l4 2" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                ),
                                title: 'Works in Under 5 Seconds',
                                desc: 'From camera snap to classified result with bin routing — faster than any manual log or lookup chart.',
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
                                        <rect x="4" y="4" width="32" height="32" rx="8" stroke="#f59e0b" strokeWidth="2" fill="#fffbeb" />
                                        <path d="M20 10l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" strokeWidth="1" />
                                    </svg>
                                ),
                                title: 'BMWM 2016 Compliant',
                                desc: 'Built specifically for Indian biomedical waste regulations — every classification maps to official BMWM categories.',
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
                                        <rect x="4" y="4" width="32" height="32" rx="8" stroke="#ec4899" strokeWidth="2" fill="#fdf2f8" />
                                        <path d="M20 12C14.5 12 10 16.5 10 22s4.5 10 10 10 10-4.5 10-10" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M30 12v6h-6" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ),
                                title: 'Cost Reduction',
                                desc: 'Proper segregation means less waste treated as hazardous — cutting disposal costs dramatically for hospitals.',
                            },
                        ].map((card, i) => (
                            <FadeInSection key={card.title} delay={i * 80}>
                                <div className="group bg-white/60 backdrop-blur-md rounded-2xl p-7 border border-blue-100 hover:border-blue-200 shadow-sm hover:shadow-lg hover:shadow-sky-50/50 transition-all duration-300 hover:-translate-y-1 h-full">
                                    <div className="mb-4 group-hover:scale-110 transition-transform">{card.icon}</div>
                                    <h3 className="text-base font-bold text-gray-900 mb-2">{card.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>



                    {/* ─── Mini CTA ─── */}
                    <FadeInSection className="mt-16 text-center">
                        <div className="inline-flex flex-col sm:flex-row items-center gap-4">
                            <Link
                                to="/auth"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-[#008080] to-[#20b2aa] hover:from-[#006666] hover:to-[#008080] px-8 py-4 rounded-full shadow-lg shadow-[#008080]/25 hover:shadow-xl hover:shadow-[#008080]/35 transition-all hover:-translate-y-0.5"
                            >
                                Book a Demo
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link
                                to="/auth"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 hover:border-[#008080]/40 hover:text-[#008080] px-8 py-4 rounded-full transition-all"
                            >
                                Try Free →
                            </Link>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">No credit card required · Setup in under 5 minutes</p>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ ILLUSTRATION ROW ═══════════ */}
            <section className="py-20 bg-gradient-to-b from-[#F0F4F8] to-sky-50/60">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <FadeInSection className="order-2 lg:order-1">
                        <img
                            src="/images/features-illustration.png"
                            alt="AI classification and hybrid engine illustration"
                            className="relative w-full max-w-md mx-auto rounded-2xl shadow-xl shadow-blue-900/5 animate-float object-cover border border-white/50 bg-white/30 backdrop-blur-sm"
                        />
                    </FadeInSection>
                    <FadeInSection delay={150} className="order-1 lg:order-2 max-w-xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#008080] mb-3 block">AI Classification</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                            Precision Sorting with
                            <br />
                            <span className="text-[#008080]">Hybrid AI Engine</span>
                        </h2>
                        <p className="text-gray-500 leading-relaxed mb-6 text-lg">
                            Our hybrid model analyses waste images in real-time, identifying hazardous and non-hazardous materials ensuring the right waste goes into the right bin, every time.
                        </p>
                        <ul className="space-y-3">
                            {['EfficientNet deep-learning backbone', 'Random Forest feature classifier', 'Hazard status auto-detection', 'Real-time bin routing'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-[#008080] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section id="how-it-works" className="py-24 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#e6f3f3]/50 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <FadeInSection className="text-center mb-16">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#008080] mb-3 block">Process</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">From upload to actionable report in seconds.</p>
                    </FadeInSection>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Upload', desc: 'Capture or upload an image of the waste item via mobile or desktop.', Icon: UploadIcon },
                            { step: '02', title: 'Classify', desc: 'Our AI engine identifies the waste type and hazard status instantly.', Icon: ClassifyIcon },
                            { step: '03', title: 'Route', desc: 'Get precise bin recommendations with color-coded disposal guidance.', Icon: RouteIcon },
                            { step: '04', title: 'Report', desc: 'Analytics tracked automatically for compliance and sustainability.', Icon: ReportIcon },
                        ].map((item, i) => (
                            <FadeInSection key={item.step} delay={i * 100}>
                                <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-blue-100 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all text-center group">
                                    <div className="mb-4 flex justify-center"><item.Icon /></div>
                                    <div className="text-xs font-bold text-[#008080] tracking-[0.15em] uppercase mb-2">Step {item.step}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>

                                    {/* Connector arrow (not on last) */}
                                    {i < 3 && (
                                        <div className="hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 text-[#40c9c9]">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ VISION / BLOG SECTION ═══════════ */}
            <section className="py-24 relative bg-white overflow-hidden border-y border-gray-100">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-50/60 to-transparent rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-sky-50/60 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <FadeInSection className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#008080]/10 text-[#008080] text-xs font-bold tracking-[0.15em] uppercase mb-5 border border-[#008080]/15">Our Vision</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                            The Innovation Behind Our System
                        </h2>
                    </FadeInSection>

                    <FadeInSection delay={100}>
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl shadow-blue-900/5">
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                                <p>
                                    Hospitals, clinics, and laboratories produce a large amount of biomedical waste every day. This waste includes items like used syringes, contaminated materials, expired medicines, and chemical waste. If this waste is not managed properly, it can be dangerous for doctors, nurses, patients, and the environment. In many hospitals, waste is still separated manually by workers. This process takes time and can lead to mistakes. Workers also have to handle harmful materials directly, which increases the risk of injuries and infections.
                                </p>
                                <p>
                                    To solve this problem, our Smart Medical Waste Management System uses advanced artificial intelligence to help separate waste automatically. A camera securely captures an image of the waste item, and our smart system instantly analyzes it to identify the correct waste category. By providing immediate visual guidance, the system ensures the item is placed into the proper disposal bin, eliminating guesswork and human error.
                                </p>
                                <p>
                                    This platform significantly reduces the need for healthcare workers to handle dangerous materials directly, making waste separation faster and much more accurate. It also automatically maintains digital records, helping hospitals track their waste generation and disposal processes effortlessly. As we look to the future, our technology is designed to seamlessly connect with smart facility networks and real-time dashboards, making the entire management process even more efficient and transparent.
                                </p>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ SUSTAINABILITY ROW ═══════════ */}
            <section className="py-20 bg-gradient-to-b from-sky-50/60 to-[#F0F4F8]">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <FadeInSection className="max-w-xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#008080] mb-3 block">Sustainability</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                            Reducing Environmental
                            <br />
                            <span className="text-[#008080]">Impact Together</span>
                        </h2>
                        <p className="text-gray-500 leading-relaxed mb-6 text-lg">
                            Track CO₂ emissions, landfill diversion rates, and treatment distribution with real-time ESG dashboards. Make data-driven decisions that protect both people and the planet.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { metric: '40%', label: 'Landfill diversion' },
                                { metric: '28%', label: 'CO₂ reduction' },
                                { metric: '95%', label: 'Compliance rate' },
                                { metric: '3×', label: 'Faster audits' },
                            ].map((item) => (
                                <div key={item.label} className="bg-sky-50/60 rounded-xl p-4 border border-blue-100">
                                    <div className="text-2xl font-extrabold text-[#008080]">{item.metric}</div>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </FadeInSection>
                    <FadeInSection delay={150} className="flex justify-center">
                        <img
                            src="/images/sustainability-illustration.png"
                            alt="Sustainability and environmental impact illustration"
                            className="relative w-full max-w-md rounded-2xl shadow-xl shadow-blue-900/5 animate-float-delayed object-cover border border-white/50 bg-white/30 backdrop-blur-sm"
                        />
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ FAQ SECTION ═══════════ */}
            <section id="faq" className="py-24 bg-[#F0F4F8] relative">
                <div className="max-w-4xl mx-auto px-6">
                    <FadeInSection className="text-center mb-16">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#008080] mb-3 block">Answers</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                    </FadeInSection>

                    <FadeInSection>
                        <Accordion type="single" collapsible className="w-full bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-blue-100 shadow-sm">
                            <AccordionItem value="item-1" className="border-b border-gray-100 py-2">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#008080] text-lg hover:no-underline">What is MediWaste AI?</AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-base leading-relaxed mt-2 p-0">
                                    MediWaste AI is an enterprise-grade AI system designed for advanced healthcare waste management. It helps hospitals effortlessly classify waste via images, track analytics, and maintain stringent compliance with BMWM regulations.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border-b border-gray-100 py-2">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#008080] text-lg hover:no-underline">How accurate is the AI classification?</AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-base leading-relaxed mt-2 p-0">
                                    Our hybrid EfficientNet and Random Forest model achieves over 94% accuracy across 12 distinct biomedical waste categories, significantly reducing the chances of misclassification and associated fines.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="border-b border-gray-100 py-2">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#008080] text-lg hover:no-underline">How do I get an account?</AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-base leading-relaxed mt-2 p-0">
                                    Contact your hospital administrator or facility manager to receive an invitation to access the platform. We support role-based access for admins, hospital staff, and general users.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4" className="border-b border-gray-100 py-2">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#008080] text-lg hover:no-underline">Does it integrate with existing hospital systems?</AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-base leading-relaxed mt-2 p-0">
                                    Yes! MediWaste AI is designed to be highly interoperable, providing robust compliance report generation (e.g., Form-4) that can integrate securely with your existing healthcare IT infrastructure.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5" className="border-b border-gray-100 py-2">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#008080] text-lg hover:no-underline">What happens if the AI cannot identify an item?</AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-base leading-relaxed mt-2 p-0">
                                    In rare cases where an item is heavily obscured or unrecognizable, the system flags it for a quick secondary manual review by an assigned supervisor, ensuring nothing is misclassified.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-6" className="border-b border-gray-100 py-2">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#008080] text-lg hover:no-underline">Can staff use the app on their personal phones?</AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-base leading-relaxed mt-2 p-0">
                                    Yes! The platform is device-agnostic. Hospitals can set it up on dedicated wards tablets, or staff can securely access the scanner via their smartphone web browsers without needing to install native apps.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-7" className="border-b border-gray-100 py-2">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#008080] text-lg hover:no-underline">How long does implementation take?</AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-base leading-relaxed mt-2 p-0">
                                    Most hospitals are fully operational within 48 to 72 hours. Since there's no complex hardware to install, deployment primarily involves straightforward software provisioning and staff onboarding.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-8" className="border-b border-gray-100 py-2">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#008080] text-lg hover:no-underline">Do you provide staff training?</AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-base leading-relaxed mt-2 p-0">
                                    Absolutely. We provide comprehensive virtual onboarding sessions, readily accessible digital guides, and 24/7 technical support to ensure your entire team is comfortable using the real-time scanning tools.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-9" className="border-b-0 py-2">
                                <AccordionTrigger className="text-left font-bold text-gray-800 hover:text-[#008080] text-lg hover:no-underline">How does MediWaste AI compare to traditional methods?</AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-base leading-relaxed mt-4 p-0">
                                    <div className="grid md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </span>
                                                Without MediWaste AI
                                            </h4>
                                            <ul className="space-y-2 text-sm text-gray-500">
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> Manual sorting with laminated charts</li>
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> Paper-based Form  filed monthly</li>
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> Surprise audits cause panic</li>
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> Staff guesses hazard status</li>
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> Zero visibility into waste trends</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-[#008080] uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-[#008080]/10 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-[#008080]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </span>
                                                With MediWaste AI
                                            </h4>
                                            <ul className="space-y-2 text-sm text-gray-700 font-medium">
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-[#008080] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> AI classifies waste from a single photo</li>
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-[#008080] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Auto-generated compliance reports 24/7</li>
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-[#008080] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Audit-ready dashboards at all times</li>
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-[#008080] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Real-time hazard detection</li>
                                                <li className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-[#008080] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Full analytics: trends, costs, ESG impact</li>
                                            </ul>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#008080] to-[#20b2aa]" />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <FadeInSection>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5">
                            Ready to Transform Your Waste Management?
                        </h2>
                        <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
                            Join leading healthcare facilities already using MediWaste AI to classify, track, and optimize medical waste with the power of artificial intelligence.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/auth"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#005f5f] bg-white hover:bg-gray-50 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                            >
                                Get Started Free
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-white border-2 border-white/30 hover:border-white/60 px-8 py-4 rounded-full transition-all"
                            >
                                View Features
                            </a>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="bg-white text-gray-500 pt-16 pb-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="col-span-1 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#008080] to-[#20b2aa] flex items-center justify-center">
                                    <span className="text-white font-extrabold text-xs">M</span>
                                </div>
                                <span className="text-lg font-bold text-gray-800 tracking-tight">
                                    MediWaste<span className="text-[#008080] font-medium ml-0.5">AI</span>
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                AI-powered medical waste classification and management for smarter, safer, and greener healthcare.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-gray-800 font-semibold text-sm mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                {['AI Scanner', 'Analytics Dashboard', 'Compliance Reports', 'ESG Tracking'].map((l) => (
                                    <li key={l}><Link to="/auth" className="hover:text-[#008080] transition-colors">{l}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-gray-800 font-semibold text-sm mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                {['About Us', 'Careers', 'Blog', 'Contact'].map((l) => (
                                    <li key={l}><a href="#" className="hover:text-[#008080] transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-gray-800 font-semibold text-sm mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                                    <li key={l}><a href="#" className="hover:text-[#008080] transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs">© {new Date().getFullYear()} MediWaste AI. All rights reserved.</p>
                        <div className="flex gap-4">
                            {['GitHub', 'LinkedIn', 'Twitter'].map((social) => (
                                <a key={social} href="#" className="text-xs hover:text-[#008080] transition-colors">{social}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
