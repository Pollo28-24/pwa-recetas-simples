export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando recetas" className="space-y-7">
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="h-64 animate-pulse rounded-3xl border border-line bg-panel lg:col-span-8" />
        <div className="h-64 animate-pulse rounded-3xl border border-line bg-surface lg:col-span-4" />
      </div>

      <div className="flex flex-wrap gap-2.5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-11 w-28 animate-pulse rounded-full border border-line bg-surface"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-3xl border border-line bg-surface"
          >
            <div className="aspect-[4/3] animate-pulse bg-panel" />
            <div className="space-y-2.5 p-5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-panel" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-panel" />
              <div className="h-3.5 w-32 animate-pulse rounded bg-panel pt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
