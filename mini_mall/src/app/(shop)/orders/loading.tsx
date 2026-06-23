export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-6 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
