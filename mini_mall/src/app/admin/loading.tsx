export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
