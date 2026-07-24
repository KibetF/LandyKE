const defaultStats = [
  { num: "11", label: "Properties Under Management" },
  { num: "260", label: "Units Managed" },
  { num: "96%", label: "Average Occupancy Rate" },
  { num: "4", label: "Landlord Clients" },
];

interface StatsBeltProps {
  stats?: { num: string; label: string }[];
}

export default function StatsBelt({ stats = defaultStats }: StatsBeltProps) {
  return (
    <div className="stats-strip">
      {stats.map((s) => (
        <div key={s.label} className="stats-strip-item">
          <span className="font-serif stats-strip-num">{s.num}</span>
          <span className="uppercase stats-strip-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
