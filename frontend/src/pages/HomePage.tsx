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

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setVisible(true), delay);
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
            className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
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
        <rect x="8" y="16" width="40" height="28" rx="6" stroke="#14b8a6" strokeWidth="2.2" fill="#f0fdfa" />
        {/* Lens */}
        <circle cx="28" cy="30" r="8" stroke="#14b8a6" strokeWidth="2" fill="none">
            <animate attributeName="r" values="8;9;8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="28" cy="30" r="4" fill="#14b8a6" opacity="0.25">
            <animate attributeName="opacity" values="0.25;0.5;0.25" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Flash */}
        <rect x="18" y="12" width="12" height="6" rx="2" fill="#14b8a6" opacity="0.3" />
        {/* Shutter pulse */}
        <circle cx="28" cy="30" r="12" stroke="#14b8a6" strokeWidth="1" fill="none" opacity="0.3">
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
        <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            {/* Floating animation keyframes */}
            <style>{`
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
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-400/20 group-hover:shadow-lg group-hover:shadow-teal-400/30 transition-shadow">
                            <span className="text-white font-extrabold text-sm">M</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-gray-800">Medi</span>
                            <span className="text-teal-500">Waste</span>
                            <span className="text-gray-400 font-medium ml-0.5">AI</span>
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'How It Works', 'About'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-teal-500 hover:after:w-full after:transition-all"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/auth" className="text-sm font-semibold text-gray-600 hover:text-teal-600 transition-colors px-4 py-2">
                            Login
                        </Link>
                        <Link to="/auth" className="text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 px-5 py-2.5 rounded-full shadow-md shadow-teal-400/25 hover:shadow-lg hover:shadow-teal-400/35 transition-all hover:-translate-y-0.5">
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
                    <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100 px-6 py-4 space-y-3 animate-fade-in">
                        {['Features', 'How It Works', 'About'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="block text-sm font-medium text-gray-600 hover:text-teal-600" onClick={() => setMobileMenuOpen(false)}>
                                {item}
                            </a>
                        ))}
                        <Link to="/auth" className="block text-sm font-semibold text-teal-600">Login</Link>
                        <Link to="/auth" className="block text-center text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 rounded-full">Get Started</Link>
                    </div>
                )}
            </nav>

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-100/60 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Left — Text */}
                    <FadeInSection>
                        <div className="max-w-xl">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold tracking-wide uppercase mb-6 border border-teal-100">
                                <LeafIcon /> Eco-Intelligent Platform
                            </span>
                            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.12] tracking-tight text-gray-900 mb-6">
                                Intelligent Waste Management{' '}
                                <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                                    Powered by AI
                                </span>
                            </h1>
                            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                                MediWaste AI is an innovative technology platform that empowers healthcare facilities with AI-driven waste classification, real-time analytics, and automated compliance — reducing costs and environmental impact.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/auth"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 px-7 py-3.5 rounded-full shadow-lg shadow-teal-400/25 hover:shadow-xl hover:shadow-teal-400/35 transition-all hover:-translate-y-0.5"
                                >
                                    Get Started Free
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600 px-7 py-3.5 rounded-full transition-all"
                                >
                                    Learn More
                                </a>
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Right — Hero illustration */}
                    <FadeInSection delay={200} className="flex justify-center lg:justify-end">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-200/30 to-cyan-200/20 rounded-3xl blur-2xl scale-110" />
                            <img
                                src="/images/hero-illustration.png"
                                alt="MediWaste AI waste classification illustration"
                                className="relative w-full max-w-lg rounded-2xl animate-float-slow"
                            />
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ STATS BAR ═══════════ */}
            <section className="relative py-16 bg-gradient-to-r from-gray-50 to-teal-50/40 border-y border-gray-100">
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
                                    <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
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
            <section id="features" className="py-24 relative">
                <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-gradient-to-br from-teal-50/60 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <FadeInSection className="text-center mb-16">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-teal-600 mb-3 block">Our Solutions</span>
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
                                color: 'emerald',
                            },
                        ].map((feature, i) => (
                            <FadeInSection key={feature.title} delay={i * 150}>
                                <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-teal-200 shadow-sm hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 hover:-translate-y-1 h-full">
                                    <div className={`w-14 h-14 rounded-xl bg-${feature.color}-50 text-${feature.color}-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`} style={{ backgroundColor: feature.color === 'teal' ? '#f0fdfa' : feature.color === 'cyan' ? '#ecfeff' : '#ecfdf5', color: feature.color === 'teal' ? '#14b8a6' : feature.color === 'cyan' ? '#06b6d4' : '#10b981' }}>
                                        <feature.Icon />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
                                    <Link to="/auth" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 mt-5 hover:gap-2 transition-all">
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

            {/* ═══════════ ILLUSTRATION ROW ═══════════ */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <FadeInSection className="order-2 lg:order-1">
                        <img src="/images/features-illustration.png" alt="AI-powered waste classification system" className="w-full max-w-md mx-auto rounded-2xl animate-float" />
                    </FadeInSection>
                    <FadeInSection delay={150} className="order-1 lg:order-2 max-w-xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-teal-600 mb-3 block">AI Classification</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                            Precision Sorting with
                            <br />
                            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Hybrid AI Engine</span>
                        </h2>
                        <p className="text-gray-500 leading-relaxed mb-6 text-lg">
                            Our EfficientNet + Random Forest hybrid model analyses waste images in real-time, identifying hazardous and non-hazardous materials with 99% accuracy — ensuring the right waste goes into the right bin, every time.
                        </p>
                        <ul className="space-y-3">
                            {['EfficientNet deep-learning backbone', 'Random Forest feature classifier', 'Hazard status auto-detection', 'Real-time bin routing'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-cyan-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <FadeInSection className="text-center mb-16">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-teal-600 mb-3 block">Process</span>
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
                                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-teal-200 shadow-sm hover:shadow-lg transition-all text-center group">
                                    <div className="mb-4 flex justify-center"><item.Icon /></div>
                                    <div className="text-xs font-bold text-teal-500 tracking-[0.15em] uppercase mb-2">Step {item.step}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>

                                    {/* Connector arrow (not on last) */}
                                    {i < 3 && (
                                        <div className="hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 text-teal-300">
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

            {/* ═══════════ SUSTAINABILITY ROW ═══════════ */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <FadeInSection className="max-w-xl">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 mb-3 block">Sustainability</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                            Reducing Environmental
                            <br />
                            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Impact Together</span>
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
                                <div key={item.label} className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
                                    <div className="text-2xl font-extrabold text-emerald-600">{item.metric}</div>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </FadeInSection>
                    <FadeInSection delay={150} className="flex justify-center">
                        <img src="/images/sustainability-illustration.png" alt="Sustainability and waste management analytics illustration" className="w-full max-w-md rounded-2xl animate-float-delayed" />
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ TESTIMONIALS ═══════════ */}
            <section id="about" className="py-24 bg-gradient-to-b from-white to-gray-50 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <FadeInSection className="text-center mb-16">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-teal-600 mb-3 block">Trusted By</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                            What Our Partners Say
                        </h2>
                    </FadeInSection>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: 'MediWaste AI has transformed how we handle medical waste. The AI classification is remarkably accurate, and the real-time analytics have helped us cut disposal costs by 35%.',
                                author: 'Dr. Sarah Mitchell',
                                role: 'Chief Medical Officer, City General Hospital',
                            },
                            {
                                quote: 'The compliance reporting alone has saved our team dozens of hours per month. The system is intuitive, efficient, and the support team is outstanding.',
                                author: 'James Rodriguez',
                                role: 'Facilities Director, Regional Health Network',
                            },
                            {
                                quote: 'Implementing MediWaste AI was seamless. Within weeks, our waste segregation accuracy went from 72% to over 98%. The ESG tracking is a game-changer for our sustainability goals.',
                                author: 'Dr. Priya Sharma',
                                role: 'Environmental Health Lead, Metro Clinics',
                            },
                        ].map((t, i) => (
                            <FadeInSection key={i} delay={i * 150}>
                                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm h-full flex flex-col">
                                    {/* Quote mark */}
                                    <svg className="w-10 h-10 text-teal-200 mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                                    </svg>
                                    <p className="text-gray-600 leading-relaxed text-sm flex-grow">{t.quote}</p>
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <p className="font-bold text-gray-900 text-sm">{t.author}</p>
                                        <p className="text-xs text-teal-600 font-medium">{t.role}</p>
                                    </div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600" />
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
                        <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
                            Join leading healthcare facilities already using MediWaste AI to classify, track, and optimize medical waste with the power of artificial intelligence.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/auth"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 bg-white hover:bg-gray-50 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
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

            {/* ═══════════ FAQ SECTION ═══════════ */}
            <section id="faq" className="py-24 bg-white relative border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <FadeInSection className="text-center mb-16">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-teal-600 mb-3 block">FAQ</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Everything you need to know about medical waste and how our AI helps.
                        </p>
                    </FadeInSection>

                    <FadeInSection delay={150}>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-teal-600">
                                    What is considered medical waste?
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2 pb-4">
                                    Medical waste includes any waste containing infectious materials or potentially infectious substances. This covers waste generated by healthcare facilities, clinics, hospitals, and laboratories, such as sharps, bodily fluids, and contaminated protective equipment.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-teal-600">
                                    How does MediWaste AI classify waste?
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2 pb-4">
                                    Our hybrid AI Engine uses a deep-learning EfficientNet backbone combined with a Random Forest classifier. You simply upload an image of the item, and our system analyzes its visual features to instantly identify the waste category and hazard status with over 99% accuracy.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-teal-600">
                                    What goes into the Red Sharps bin?
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2 pb-4">
                                    The Red Sharps bin is strictly for items that can puncture or lacerate skin. This includes used needles, syringes, scalpel blades, broken glass, and ampules. These items pose a direct physical hazard and must be isolated immediately.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-teal-600">
                                    How does proper waste sorting impact the environment?
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2 pb-4">
                                    Accurate segregation reduces the amount of non-hazardous waste mistakenly sent for high-energy treatment (like incineration). This significantly lowers CO₂ emissions, increases landfill diversion rates, and minimizes the overall environmental footprint of healthcare operations.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-teal-600">
                                    Can the system track our compliance and ESG goals?
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2 pb-4">
                                    Yes, MediWaste AI provides automated compliance reporting and real-time ESG (Environmental, Social, and Governance) tracking. Our interactive dashboards monitor your waste generation trends, carbon footprint reductions, and regulatory adherence.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="col-span-1 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                                    <span className="text-white font-extrabold text-xs">M</span>
                                </div>
                                <span className="text-lg font-bold text-white tracking-tight">
                                    MediWaste<span className="text-teal-400 font-medium ml-0.5">AI</span>
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                AI-powered medical waste classification and management for smarter, safer, and greener healthcare.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                {['AI Scanner', 'Analytics Dashboard', 'Compliance Reports', 'ESG Tracking'].map((l) => (
                                    <li key={l}><Link to="/auth" className="hover:text-teal-400 transition-colors">{l}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                {['About Us', 'Careers', 'Blog', 'Contact'].map((l) => (
                                    <li key={l}><a href="#" className="hover:text-teal-400 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                                    <li key={l}><a href="#" className="hover:text-teal-400 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs">© {new Date().getFullYear()} MediWaste AI. All rights reserved.</p>
                        <div className="flex gap-4">
                            {['GitHub', 'LinkedIn', 'Twitter'].map((social) => (
                                <a key={social} href="#" className="text-xs hover:text-teal-400 transition-colors">{social}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
