export default function BusinessEntityDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-44 animate-pulse rounded-[32px] bg-slate-200/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-32 animate-pulse rounded-[24px] bg-slate-200/70"
            key={`entity-detail-metric-${index}`}
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-[24px] bg-slate-200/70" />
        <div className="h-96 animate-pulse rounded-[24px] bg-slate-200/70" />
      </div>
    </div>
  );
}
