const sources = [
  { id: 'postgres', name: 'Postgres Warehouse', status: 'Connected', lastSync: '3m ago' },
  { id: 'qdrant', name: 'Qdrant Vector Store', status: 'Connected', lastSync: '8m ago' },
  { id: 'redis', name: 'Redis Memory', status: 'Connected', lastSync: '1m ago' },
  { id: 'tavily', name: 'Tavily Market Intel', status: 'API OK', lastSync: '12m ago' },
];

export default function DataSourcesPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="rounded-3xl bg-white/80 dark:bg-[#0B1416] border border-white/40 p-6 shadow">
        <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Settings · Integrations</p>
        <h1 className="text-2xl font-black text-[#212F34] dark:text-white">Data fabric connections</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {sources.map((source) => (
          <div key={source.id} className="rounded-3xl bg-white border border-[#E2E8F0] p-5 shadow-sm dark:bg-[#111A1B] dark:border-white/10">
            <p className="text-sm font-semibold text-[#212F34] dark:text-white">{source.name}</p>
            <p className="text-xs text-[#688790]">{source.status} · Last sync {source.lastSync}</p>
            <button className="mt-3 text-[10px] uppercase tracking-widest text-[#53AAA3]">Manage</button>
          </div>
        ))}
      </div>
    </div>
  );
}
