import Skeleton from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="mb-10">
        <Skeleton width="280px" height="2rem" className="mb-2" />
        <Skeleton width="220px" height="0.8rem" />
      </div>

      {/* KPI skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="stat" />
        ))}
      </div>

      {/* Chart + Properties skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-gold/8 bg-white">
          <div className="border-b border-warm px-6 py-4">
            <Skeleton width="200px" height="1rem" />
          </div>
          <div className="flex h-[220px] items-end gap-2 p-6">
            {[60, 80, 70, 90, 85, 75].map((h, i) => (
              <div
                key={i}
                className="flex-1 animate-pulse rounded-t bg-warm/60"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-gold/8 bg-white">
          <div className="border-b border-warm px-6 py-4">
            <Skeleton width="100px" height="1rem" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`px-6 py-3.5 ${i < 3 ? "border-b border-warm" : ""}`}
            >
              <Skeleton width="140px" height="0.8rem" className="mb-1.5" />
              <Skeleton width="100px" height="0.6rem" />
            </div>
          ))}
        </div>
      </div>

      {/* Tenants + Transactions skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        {[...Array(2)].map((_, cardIdx) => (
          <div
            key={cardIdx}
            className="overflow-hidden rounded-lg border border-gold/8 bg-white"
          >
            <div className="border-b border-warm px-6 py-4">
              <Skeleton width="160px" height="1rem" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-6 py-3.5 ${
                  i < 3 ? "border-b border-warm" : ""
                }`}
              >
                <Skeleton variant="circle" />
                <div className="flex-1">
                  <Skeleton width="120px" height="0.75rem" className="mb-1" />
                  <Skeleton width="80px" height="0.6rem" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
