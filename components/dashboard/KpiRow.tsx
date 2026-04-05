import StatCard from "@/components/ui/StatCard";

interface KpiData {
  totalCollected: number;
  totalExpected: number;
  tenantsPaid: number;
  totalTenants: number;
  outstanding: number;
  outstandingCount: number;
  propertyCount: number;
  totalUnits: number;
  occupancyRate: number;
  monthLabel?: string;
}

export default function KpiRow({ data }: { data: KpiData }) {
  const monthLabel = data.monthLabel || "This Month";
  const shortMonth = monthLabel.split(" ")[0];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={`Total Collected — ${shortMonth}`}
        value={data.totalCollected.toLocaleString()}
        sub={`KES · of ${data.totalExpected.toLocaleString()} expected`}
        icon="💰"
        borderColor="gold"
      />
      <StatCard
        label="Tenants Paid"
        value={`${data.tenantsPaid} / ${data.totalTenants}`}
        sub={`${Math.max(0, data.totalTenants - data.tenantsPaid)} outstanding`}
        icon="✅"
        borderColor="green"
      />
      <StatCard
        label="Outstanding Rent"
        value={data.outstanding.toLocaleString()}
        sub={`KES · ${data.outstandingCount} tenants`}
        icon="⚠️"
        borderColor="rust"
      />
      <StatCard
        label="Properties"
        value={data.propertyCount.toString()}
        sub={`${data.totalUnits} units · ${data.occupancyRate}% occupied`}
        icon="🏠"
        borderColor="sage"
      />
    </div>
  );
}
