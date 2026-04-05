import { MapPin } from "lucide-react";

interface PropertyCardProps {
  name: string;
  location?: string | null;
  occupiedUnits: number;
  totalUnits: number;
  monthlyIncome?: number;
}

export default function PropertyCard({
  name,
  location,
  occupiedUnits,
  totalUnits,
  monthlyIncome,
}: PropertyCardProps) {
  const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const vacantCount = totalUnits - occupiedUnits;

  return (
    <div className="rounded-lg border border-gold/8 bg-white p-6 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="mb-3">
        <h3 className="font-serif text-[1.1rem] font-medium text-ink">{name}</h3>
        {location && (
          <p className="mt-0.5 flex items-center gap-1 text-[0.75rem] text-muted">
            <MapPin size={12} />
            {location}
          </p>
        )}
      </div>

      {/* Occupancy bar */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[0.65rem] text-muted">
          <span>{occupiedUnits} / {totalUnits} units</span>
          <span>{occupancyPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-warm overflow-hidden">
          <div
            className="h-full rounded-full bg-gold transition-all duration-300"
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-end justify-between">
        {monthlyIncome !== undefined && (
          <div>
            <p className="label-upper">Monthly Income</p>
            <p className="mt-0.5 text-[0.85rem] font-semibold text-ink">
              KES {monthlyIncome.toLocaleString("en-KE")}
            </p>
          </div>
        )}
        <div className="text-right">
          {vacantCount > 0 ? (
            <span className="inline-block rounded-[20px] bg-amber-light px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[#7a5c00]">
              {vacantCount} vacant
            </span>
          ) : (
            <span className="inline-block rounded-[20px] bg-green-light px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-green">
              Full
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
