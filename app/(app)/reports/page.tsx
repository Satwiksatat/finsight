const reports = [
  {
    id: 'board-pack',
    title: 'Board-ready performance pack',
    description: 'Net sales, EBITDA, cash, and market signals with citations.',
    size: '4.1 MB · PDF',
  },
  {
    id: 'margin-dive',
    title: 'Margin variance deep dive',
    description: 'Root-cause tree for month-end delta vs budget.',
    size: '2.6 MB · PDF',
  },
  {
    id: 'cash-forecast',
    title: '13-week cash forecast',
    description: 'Week-by-week inflows/outflows with scenario ranges.',
    size: '1.8 MB · XLSX',
  },
];

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl bg-white/80 dark:bg-[#0B1416] border border-white/40 p-6 shadow">
        <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Reports</p>
        <h1 className="text-3xl font-black text-[#212F34] dark:text-white">Executive reporting center</h1>
        <p className="text-sm text-[#688790] mt-2">Queue curated PDFs or download programmatic exports.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => (
          <div key={report.id} className="rounded-3xl bg-white border border-[#E2E8F0] p-5 shadow-sm dark:bg-[#111A1B] dark:border-white/10">
            <p className="text-sm font-semibold text-[#212F34] dark:text-white">{report.title}</p>
            <p className="text-xs text-[#688790] mb-3">{report.description}</p>
            <div className="flex items-center justify-between text-xs text-[#688790]">
              <span>{report.size}</span>
              <button className="text-[10px] uppercase tracking-widest text-[#53AAA3]">Generate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
