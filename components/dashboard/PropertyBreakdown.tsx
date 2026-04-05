import Link from "next/link";
import { Home } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface PropertyData {
  name: string;
  location: string;
  units: number;
  income: number;
  occupancy: string;
}

export default function PropertyBreakdown({
  properties,
}: {
  properties: PropertyData[];
}) {
  const isEmpty = properties.length === 0;

  return (
    <div className="overflow-hidden rounded-lg border border-gold/8 bg-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between border-b border-warm px-6 py-4">
        <h3 className="font-serif text-[1.1rem] font-semibold">
          By Property
        </h3>
        <Link
          href="/properties"
          className="text-[0.7rem] uppercase tracking-[0.08em] text-gold no-underline"
        >
          Manage →
        </Link>
      </div>
      <div className="p-2">
        {isEmpty ? (
          <EmptyState icon={Home} title="No properties yet" />
        ) : (
          properties.map((p, i) => (
            <div
              key={p.name}
              className={`row-hover flex cursor-pointer items-center justify-between rounded-md px-4 py-3.5 transition-colors ${
                i < properties.length - 1 ? "border-b border-warm" : ""
              }`}
            >
              <div>
                <h4 className="mb-0.5 text-[0.82rem] font-medium">{p.name}</h4>
                <span className="text-[0.68rem] text-muted">
                  {p.units} units · {p.location}
                </span>
              </div>
              <div className="text-right">
                <div className="font-serif text-base font-semibold">
                  {p.income.toLocaleString()}
                </div>
                <div className="text-[0.65rem] text-green">{p.occupancy}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
