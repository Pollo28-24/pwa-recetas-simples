export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando recetas" className="space-y-6">
      <div className="h-44 animate-pulse rounded-3xl border border-line bg-panel" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-11 w-28 animate-pulse rounded-xl border border-line bg-surface"
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <div className="aspect-[4/3] animate-pulse bg-panel" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-24 animate-pulse rounded bg-panel" />
              <div className="h-5 w-full animate-pulse rounded bg-panel" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
