import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Download, Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon,
    DollarSign, Leaf, AlertTriangle, ArrowUpRight, ArrowDownRight, FileText
} from 'lucide-react';
import {

const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────────
interface MonthlyData { month: string; current: number; previous: number; }
interface MomGrowth { month: string; growth: number; }
interface YoyGrowth { year: string; growth: number; }
interface TrendPoint { year: string; actual: number | null; projected: number | null; }
interface PeakPeriod { period: string; reason: string; }
interface SeasonalTrend { quarter: string; avg_kg: number; }
interface CompositionItem { category: string; percentage: number; kg: number; }
interface MonthlyCost { month: string; general_cost: number; hazardous_cost: number; total: number; }
interface TreatmentItem { method: string; percentage: number; }
interface Co2Monthly { month: string; emissions: number; }

interface ReportsData {
    period: string;
    generated_at: string;
    waste_generation: {
        monthly_data: MonthlyData[];
        total_current_year: number;
        total_previous_year: number;
        yearly_growth_pct: number;
        waste_per_bed_day: number;
        total_beds: number;
    };
    growth_trends: {
        mom_growth: MomGrowth[];
        yoy_growth: YoyGrowth[];
        yearly_totals: Record<string, number>;
        trend_data: TrendPoint[];
        projections: { year: string; projected: number }[];
        peak_periods: PeakPeriod[];
        seasonal_trends: SeasonalTrend[];
        avg_growth_rate: number;
    };
    composition: {
        breakdown: CompositionItem[];
        hazardous_pct: number;
        who_benchmark: number;
        deviation_from_benchmark: number;
    };
    financial: {
        total_disposal_cost: number;
        total_cost_general: number;
        total_cost_hazardous: number;
        cost_per_kg_avg: number;
        cost_per_kg_general: number;
        cost_per_kg_hazardous: number;
        cost_difference: number;
        monthly_costs: MonthlyCost[];
    };
    environmental: {
        pct_incinerated: number;
        co2_emissions_kg: number;
        sustainable_treatment_pct: number;
        treatment_distribution: TreatmentItem[];
        co2_monthly: Co2Monthly[];
    };
}

// ─── Chart Colors ───────────────────────────────────────────────────
const TEAL = 'hsl(174, 80%, 48%)';
const CYAN = 'hsl(188, 70%, 50%)';
const SAFE = 'hsl(160, 65%, 45%)';
const HAZARD = 'hsl(0, 72%, 55%)';
const WARNING = 'hsl(38, 92%, 50%)';
const PURPLE = 'hsl(270, 70%, 60%)';
const PINK = 'hsl(330, 70%, 55%)';
const MUTED = 'hsl(220, 10%, 45%)';

const COMPOSITION_COLORS = [SAFE, HAZARD, WARNING, PURPLE, CYAN, PINK, MUTED];
const TREATMENT_COLORS = [HAZARD, TEAL, SAFE, MUTED];

// ─── Custom Tooltip ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="report-tooltip">
            <p className="font-semibold text-foreground text-sm mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-xs" style={{ color: entry.color }}>
                    {entry.name}: <span className="font-mono font-bold">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
                </p>
            ))}
        </div>
    );
};

// ─── Section Wrapper ────────────────────────────────────────────────
const ReportSection = ({ id, icon: Icon, title, children }: { id: string; icon: any; title: string; children: React.ReactNode }) => (
    <motion.section
        id={id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="report-section"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="gradient-teal p-2.5 rounded-xl neon-glow-sm">
                <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="report-heading">{title}</h3>
        </div>
        {children}
    </motion.section>
);

// ─── Metric Pill ────────────────────────────────────────────────────
const MetricPill = ({ label, value, sub, variant }: { label: string; value: string; sub?: string; variant?: 'teal' | 'hazard' | 'safe' }) => {
    const color = variant === 'hazard' ? 'text-hazard-foreground' : variant === 'safe' ? 'text-safe neon-text-subtle' : 'text-primary neon-text-subtle';
    return (
        <div className="report-metric-pill">
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-extrabold tracking-tight ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
    );
};

// ─── Interpretation ─────────────────────────────────────────────────
const Interpretation = ({ children }: { children: React.ReactNode }) => (
    <div className="report-interpretation">
        <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>{children}</p>
    </div>
);

// ═════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
const ReportsStatistics = () => {
    const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [data, setData] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${apiBase}/api/reports?period=${period}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [period]);

    const handleExport = (type: 'pdf' | 'csv') => {
        if (!data) return;
        if (type === 'csv') {
            const rows = [
                ['Month', 'Current Year (kg)', 'Previous Year (kg)', 'Cost (₹)', 'CO₂ Emissions (kg)'],
                ...data.waste_generation.monthly_data.map((m, i) => [
                    m.month,
                    m.current.toString(),
                    m.previous.toString(),
                    data.financial.monthly_costs[i]?.total.toString() || '',
                    data.environmental.co2_monthly[i]?.emissions.toString() || '',
                ]),
            ];
            const csv = rows.map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MediWaste_Report_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            import('jspdf').then(({ default: jsPDF }) => {
                import('jspdf-autotable').then(({ default: autoTable }) => {
                    const doc = new jsPDF();
                    
                    doc.setFontSize(22);
                    doc.text('MediWaste AI', 14, 20);
                    doc.setFontSize(14);
                    doc.text('Reports & Statistics', 14, 30);
                    
                    doc.setFontSize(10);
                    doc.setTextColor(100);
                    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);
                    doc.text(`Period: ${period.toUpperCase()}`, 14, 46);
                    
                    doc.setTextColor(0);
                    
                    autoTable(doc, {
                        startY: 55,
                        head: [['Metric', 'Value', 'Details']],
                        body: [
                            ['Total Waste (Current Year)', `${data.waste_generation.total_current_year.toLocaleString()} kg`, `Growth: ${data.waste_generation.yearly_growth_pct}%`],
                            ['Waste per Bed/Day', `${data.waste_generation.waste_per_bed_day} kg`, `Beds: ${data.waste_generation.total_beds}`],
                            ['Hazardous Waste', `${data.composition.hazardous_pct}%`, `WHO Benchmark: ${data.composition.who_benchmark}%`],
                            ['Total Disposal Cost', `INR ${data.financial.total_disposal_cost.toLocaleString()}`, `Avg Cost/kg: INR ${data.financial.cost_per_kg_avg}`],
                            ['CO2 Emissions', `${data.environmental.co2_emissions_kg.toLocaleString()} kg`, `Sustainable Methods: ${data.environmental.sustainable_treatment_pct}%`],
                        ],
                        theme: 'striped',
                        headStyles: { fillColor: [20, 184, 166] }
                    });

                    doc.save(`MediWaste_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
                });
            });
        }
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground font-display text-sm tracking-widest uppercase">Loading Report Data...</p>
                </div>
            </div>
        );
    }

    const wg = data.waste_generation;
    const gt = data.growth_trends;
    const comp = data.composition;
    const fin = data.financial;
    const env = data.environmental;

    return (
        <div className="space-y-2 animate-slide-up max-w-5xl mx-auto">
            {/* ─── HEADER ─────────────────────────────────────── */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground neon-text-subtle">
                        Reports & Statistics
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Comprehensive analytical report for waste management decision-making.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Period Filter */}
                    <div className="glass-card rounded-xl p-1 flex gap-1">
                        {(['monthly', 'quarterly', 'yearly'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all ${period === p
                                        ? 'gradient-teal text-primary-foreground neon-glow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    {/* Export */}
                    <div className="flex gap-1">
                        <button onClick={() => handleExport('csv')} className="glass-card px-3 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all flex items-center gap-1.5 hover:neon-glow-sm">
                            <Download className="w-3.5 h-3.5" /> CSV
                        </button>
                        <button onClick={() => handleExport('pdf')} className="glass-card px-3 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all flex items-center gap-1.5 hover:neon-glow-sm">
                            <Download className="w-3.5 h-3.5" /> Report
                        </button>
                    </div>
                </div>
            </header>

            <div className="text-[10px] font-display text-muted-foreground tracking-widest uppercase flex items-center gap-2 mb-4">
                <Calendar className="w-3.5 h-3.5" />
                Generated {new Date(data.generated_at).toLocaleString()}
            </div>

            {/* ─── SECTION 1: WASTE GENERATION OVERVIEW ──────── */}
            <ReportSection id="waste-generation" icon={BarChart3} title="Waste Generation Overview">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <MetricPill label="Total Waste (Yearly)" value={`${wg.total_current_year.toLocaleString()} kg`} sub={`vs ${wg.total_previous_year.toLocaleString()} kg last year`} />
                    <MetricPill label="Waste per Bed / Day" value={`${wg.waste_per_bed_day} kg`} sub={`Across ${wg.total_beds} beds`} variant="teal" />
                    <MetricPill label="Yearly Growth" value={`${wg.yearly_growth_pct > 0 ? '+' : ''}${wg.yearly_growth_pct}%`} sub="Year-on-year change" variant={wg.yearly_growth_pct > 5 ? 'hazard' : 'safe'} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="report-chart-container">
                        <h4 className="report-chart-title">Monthly Waste Generation (kg)</h4>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={wg.monthly_data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 15%, 25%, 0.4)" />
                                <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} />
                                <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Line type="monotone" dataKey="current" name="2025" stroke={TEAL} strokeWidth={2.5} dot={{ r: 3, fill: TEAL }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="previous" name="2024" stroke={MUTED} strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 2, fill: MUTED }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="report-chart-container">
                        <h4 className="report-chart-title">Year Comparison (kg)</h4>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={wg.monthly_data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 15%, 25%, 0.4)" />
                                <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} />
                                <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="current" name="2025" fill={TEAL} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="previous" name="2024" fill="hsla(220, 15%, 30%, 0.6)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <Interpretation>
                    The facility generated <strong>{wg.total_current_year.toLocaleString()} kg</strong> of waste this year, reflecting a <strong>{wg.yearly_growth_pct}%</strong> change year-on-year.
                    Daily waste per bed averages <strong>{wg.waste_per_bed_day} kg</strong>, which is within the expected range for a {wg.total_beds}-bed hospital.
                </Interpretation>
            </ReportSection>

            {/* ─── SECTION 2: GROWTH & TREND ANALYSIS ────────── */}
            <ReportSection id="growth-trends" icon={TrendingUp} title="Growth & Trend Analysis">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <MetricPill label="Avg Growth Rate" value={`${gt.avg_growth_rate}%`} sub="Year-on-year" variant={gt.avg_growth_rate > 5 ? 'hazard' : 'safe'} />
                    {gt.seasonal_trends.map(s => (
                        <MetricPill key={s.quarter} label={`${s.quarter} Average`} value={`${s.avg_kg} kg/mo`} />
                    ))}
                </div>

                <div className="report-chart-container mb-6">
                    <h4 className="report-chart-title">Waste Trend with 5-Year Projection</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={gt.trend_data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 15%, 25%, 0.4)" />
                            <XAxis dataKey="year" tick={{ fill: MUTED, fontSize: 11 }} />
                            <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line type="monotone" dataKey="actual" name="Actual" stroke={TEAL} strokeWidth={2.5} dot={{ r: 4, fill: TEAL }} connectNulls={false} />
                            <Line type="monotone" dataKey="projected" name="Projected" stroke={CYAN} strokeWidth={2} strokeDasharray="8 4" dot={{ r: 3, fill: CYAN, strokeDasharray: '' }} connectNulls={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="report-chart-container">
                        <h4 className="report-chart-title">Month-on-Month Growth (%)</h4>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={gt.mom_growth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 15%, 25%, 0.4)" />
                                <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} />
                                <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="growth" name="Growth %" radius={[4, 4, 0, 0]}>
                                    {gt.mom_growth.map((entry, i) => (
                                        <Cell key={i} fill={entry.growth >= 0 ? TEAL : HAZARD} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                        <h4 className="report-chart-title mb-4">Peak Waste Periods</h4>
                        <div className="space-y-3">
                            {gt.peak_periods.map((p, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl glass-card-hover">
                                    <AlertTriangle className="w-4 h-4 text-warning-foreground mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm text-foreground">{p.period}</p>
                                        <p className="text-xs text-muted-foreground">{p.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/30">
                            <h5 className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">Year-on-Year Growth</h5>
                            {gt.yoy_growth.map(y => (
                                <div key={y.year} className="flex items-center justify-between py-1.5">
                                    <span className="text-sm text-foreground font-semibold">{y.year}</span>
                                    <span className={`text-sm font-bold flex items-center gap-1 ${y.growth >= 0 ? 'text-hazard-foreground' : 'text-safe'}`}>
                                        {y.growth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                        {y.growth > 0 ? '+' : ''}{y.growth}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Interpretation>
                    Waste generation shows a consistent upward trend with an average growth rate of <strong>{gt.avg_growth_rate}%</strong>.
                    Peak periods during <strong>monsoon (Jul-Aug)</strong> and <strong>winter (Dec-Jan)</strong> align with seasonal infection patterns. Projections suggest continued growth without intervention strategies.
                </Interpretation>
            </ReportSection>

            {/* ─── SECTION 3: WASTE COMPOSITION ──────────────── */}
            <ReportSection id="composition" icon={PieChartIcon} title="Waste Composition Distribution">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="report-chart-container flex flex-col items-center">
                        <h4 className="report-chart-title self-start">Composition Breakdown</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={comp.breakdown}
                                    dataKey="percentage"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={120}
                                    paddingAngle={2}
                                    label={({ category, percentage }) => `${percentage}%`}
                                    labelLine={{ stroke: MUTED, strokeWidth: 1 }}
                                >
                                    {comp.breakdown.map((_, i) => (
                                        <Cell key={i} fill={COMPOSITION_COLORS[i % COMPOSITION_COLORS.length]} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        {/* Hazardous indicator */}
                        <div className="glass-card rounded-2xl p-5 neon-border">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">Hazardous Waste</p>
                                <span className={`text-2xl font-extrabold ${comp.hazardous_pct > comp.who_benchmark ? 'text-hazard-foreground' : 'text-safe'}`}>
                                    {comp.hazardous_pct}%
                                </span>
                            </div>
                            <div className="w-full bg-muted/30 h-3 rounded-full overflow-hidden mb-2">
                                <div className="h-full rounded-full transition-all duration-1000" style={{
                                    width: `${comp.hazardous_pct}%`,
                                    background: comp.hazardous_pct > comp.who_benchmark
                                        ? `linear-gradient(90deg, ${HAZARD}, ${WARNING})`
                                        : `linear-gradient(90deg, ${SAFE}, ${TEAL})`,
                                }} />
                            </div>
                            <div className="flex justify-between text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">
                                <span>WHO Benchmark: {comp.who_benchmark}%</span>
                                <span className={comp.deviation_from_benchmark > 0 ? 'text-hazard-foreground' : 'text-safe'}>
                                    {comp.deviation_from_benchmark > 0 ? '+' : ''}{comp.deviation_from_benchmark}% deviation
                                </span>
                            </div>
                        </div>

                        {/* Category list */}
                        <div className="glass-card rounded-2xl p-5">
                            <h5 className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">Category Breakdown</h5>
                            <div className="space-y-2">
                                {comp.breakdown.map((item, i) => (
                                    <div key={item.category} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: COMPOSITION_COLORS[i] }} />
                                        <span className="text-sm text-foreground flex-1">{item.category}</span>
                                        <span className="text-sm font-mono font-bold text-muted-foreground">{item.percentage}%</span>
                                        <span className="text-xs text-muted-foreground">({item.kg.toLocaleString()} kg)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <Interpretation>
                    Hazardous waste constitutes <strong>{comp.hazardous_pct}%</strong> of total output, which is
                    <strong> {Math.abs(comp.deviation_from_benchmark)}% {comp.deviation_from_benchmark > 0 ? 'above' : 'below'}</strong> the
                    WHO benchmark of {comp.who_benchmark}%. {comp.deviation_from_benchmark > 0
                        ? 'This exceeds the recommended threshold and requires attention to waste segregation practices.'
                        : 'The facility maintains hazardous waste within acceptable limits.'}
                </Interpretation>
            </ReportSection>

            {/* ─── SECTION 4: FINANCIAL IMPACT ───────────────── */}
            <ReportSection id="financial" icon={DollarSign} title="Financial Impact">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <MetricPill label="Total Disposal Cost" value={`₹${fin.total_disposal_cost.toLocaleString()}`} sub="Annual" variant="hazard" />
                    <MetricPill label="Avg Cost per kg" value={`₹${fin.cost_per_kg_avg}`} />
                    <MetricPill label="Hazardous vs General" value={`₹${fin.cost_difference}/kg`} sub={`₹${fin.cost_per_kg_hazardous} vs ₹${fin.cost_per_kg_general}`} variant="hazard" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="report-chart-container">
                        <h4 className="report-chart-title">Monthly Disposal Cost Trend (₹)</h4>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={fin.monthly_costs}>
                                <defs>
                                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={TEAL} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 15%, 25%, 0.4)" />
                                <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} />
                                <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Area type="monotone" dataKey="total" name="Total Cost" stroke={TEAL} fill="url(#costGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="report-chart-container">
                        <h4 className="report-chart-title">Cost Breakdown: Hazardous vs General (₹)</h4>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={fin.monthly_costs}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 15%, 25%, 0.4)" />
                                <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} />
                                <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="hazardous_cost" name="Hazardous" fill={HAZARD} radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="general_cost" name="General" fill={SAFE} radius={[4, 4, 0, 0]} stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <Interpretation>
                    Annual disposal costs total <strong>₹{fin.total_disposal_cost.toLocaleString()}</strong>.
                    Hazardous waste disposal costs <strong>₹{fin.cost_difference}/kg more</strong> than general waste.
                    Optimizing waste segregation could reduce costs by targeting the hazardous waste stream (₹{fin.total_cost_hazardous.toLocaleString()} annually).
                </Interpretation>
            </ReportSection>

            {/* ─── SECTION 5: ENVIRONMENTAL IMPACT ──────────── */}
            <ReportSection id="environmental" icon={Leaf} title="Environmental Impact">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <MetricPill label="CO₂ Emissions" value={`${env.co2_emissions_kg.toLocaleString()} kg`} sub="From incineration" variant="hazard" />
                    <MetricPill label="Incinerated" value={`${env.pct_incinerated}%`} />
                    <MetricPill label="Sustainable Treatment" value={`${env.sustainable_treatment_pct}%`} sub="Autoclave + Recycling" variant="safe" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="report-chart-container flex flex-col items-center">
                        <h4 className="report-chart-title self-start">Treatment Distribution</h4>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={env.treatment_distribution}
                                    dataKey="percentage"
                                    nameKey="method"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    label={({ method, percentage }) => `${method} ${percentage}%`}
                                    labelLine={{ stroke: MUTED, strokeWidth: 1 }}
                                >
                                    {env.treatment_distribution.map((_, i) => (
                                        <Cell key={i} fill={TREATMENT_COLORS[i % TREATMENT_COLORS.length]} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="report-chart-container">
                        <h4 className="report-chart-title">CO₂ Emission Trend (kg)</h4>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={env.co2_monthly}>
                                <defs>
                                    <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={HAZARD} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={HAZARD} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsla(220, 15%, 25%, 0.4)" />
                                <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} />
                                <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="emissions" name="CO₂ (kg)" stroke={HAZARD} fill="url(#co2Gradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <Interpretation>
                    The facility currently treats <strong>{env.sustainable_treatment_pct}%</strong> of waste via sustainable methods (autoclaving and recycling).
                    Incineration accounts for <strong>{env.pct_incinerated}%</strong> of treatment, contributing approximately <strong>{env.co2_emissions_kg.toLocaleString()} kg</strong> of CO₂ annually.
                    Increasing autoclave capacity and recycling programs would significantly reduce the carbon footprint.
                </Interpretation>
            </ReportSection>

            {/* ─── Footer ─────────────────────────────────────── */}
            <div className="text-center py-8 border-t border-border/20 mt-8">
                <p className="text-[10px] font-display font-medium text-muted-foreground uppercase tracking-widest">
                    MediWaste AI • Analytical Report • {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default ReportsStatistics;
