export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white overflow-hidden"
          >
            <div className="aspect-square animate-pulse bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
