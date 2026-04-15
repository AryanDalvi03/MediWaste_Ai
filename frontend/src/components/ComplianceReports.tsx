import { jsPDF } from 'jspdf';

const ComplianceReports = () => {
  const downloadReport = (title: string, sub: string) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('MediWaste AI - Compliance Documentation', 14, 20);
    doc.setFontSize(14);
    doc.text(title, 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Detail: ${sub}`, 14, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 46);
    doc.text(`Facility: Grand Hospital Network`, 14, 52);

    doc.setTextColor(0);
    doc.text('This document certifies the compliance metrics according to federal safety guidelines.', 14, 70);
    doc.text('All bins and active waste tracking indices meet or exceed the required benchmark standards.', 14, 78);
    
    doc.save(`MediWaste_${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <header>
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground neon-text-subtle">Compliance Reports</h2>
        <p className="text-muted-foreground mt-1 text-sm">Regulatory compliance documentation and audit trails.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: 'Monthly Report', sub: 'January 2026', color: 'primary' },
          { title: 'Annual Report', sub: '2025 Full Year', color: 'cyan' },
          { title: 'Certification', sub: 'ISO 14644 Certified', color: 'safe' },
        ].map((r) => (
          <div key={r.title} className="glass-card-hover p-6 rounded-2xl">
            <h3 className="font-bold text-sm text-foreground mb-1">{r.title}</h3>
            <p className="text-xs text-muted-foreground mb-4">{r.sub}</p>
            <button 
                onClick={() => downloadReport(r.title, r.sub)}
                className="w-full py-2.5 gradient-teal text-primary-foreground rounded-xl font-display font-bold text-[10px] tracking-widest uppercase neon-glow-sm hover:neon-glow transition-all"
            >
              Download PDF
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-bold text-base mb-4 text-foreground">Audit Trail</h3>
        <div className="space-y-3">
          {[
            { title: 'Facility Inspection', desc: 'All waste disposal areas inspected and certified', date: 'Jan 15, 2026', borderColor: 'hsla(174,80%,48%,0.5)' },
            { title: 'Safety Training Completed', desc: 'All staff completed quarterly safety refresher', date: 'Jan 10, 2026', borderColor: 'hsla(188,70%,50%,0.5)' },
            { title: 'Incident Report Filed', desc: 'Medical waste spillage in corridor block A', date: 'Jan 8, 2026', borderColor: 'hsla(38,92%,50%,0.5)' },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl glass-card-hover" style={{ borderLeft: `3px solid ${item.borderColor}` }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
                <span className="text-[10px] font-display font-bold text-muted-foreground shrink-0 tracking-wider">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceReports;
