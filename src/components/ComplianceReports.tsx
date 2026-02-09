const ComplianceReports = () => (
  <div className="space-y-8 animate-slide-up">
    <header>
      <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Compliance Reports</h2>
      <p className="text-muted-foreground mt-1 text-sm">Regulatory compliance documentation and audit trails.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[
        { title: 'Monthly Report', sub: 'January 2026', color: 'primary' },
        { title: 'Annual Report', sub: '2025 Full Year', color: 'cyan' },
        { title: 'Certification', sub: 'ISO 14644 Certified', color: 'safe' },
      ].map((r) => (
        <div key={r.title} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="font-bold text-sm text-foreground mb-1">{r.title}</h3>
          <p className="text-xs text-muted-foreground mb-4">{r.sub}</p>
          <button className="w-full py-2.5 gradient-teal text-primary-foreground rounded-xl font-bold text-xs hover:opacity-90 transition-opacity">
            Download PDF
          </button>
        </div>
      ))}
    </div>

    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <h3 className="font-bold text-base mb-4 text-foreground">Audit Trail</h3>
      <div className="space-y-3">
        {[
          { title: 'Facility Inspection', desc: 'All waste disposal areas inspected and certified', date: 'Jan 15, 2026', color: 'border-primary' },
          { title: 'Safety Training Completed', desc: 'All staff completed quarterly safety refresher', date: 'Jan 10, 2026', color: 'border-cyan' },
          { title: 'Incident Report Filed', desc: 'Medical waste spillage in corridor block A', date: 'Jan 8, 2026', color: 'border-warning' },
        ].map((item) => (
          <div key={item.title} className={`p-4 border-l-4 ${item.color} bg-muted/30 rounded-r-xl`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
              <span className="text-xs font-bold text-muted-foreground shrink-0">{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ComplianceReports;
