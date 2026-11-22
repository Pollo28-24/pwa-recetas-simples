export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando recetas">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-panel" />
      <div className="mb-4 h-12 max-w-2xl animate-pulse rounded-lg bg-panel" />
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-9 w-24 animate-pulse rounded-lg bg-panel" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[4/3] animate-pulse rounded-lg bg-panel" />
            <div className="h-3 w-20 animate-pulse rounded bg-panel" />
            <div className="h-4 w-full animate-pulse rounded bg-panel" />
          </div>
        ))}
      </div>
    </div>
  );
}
