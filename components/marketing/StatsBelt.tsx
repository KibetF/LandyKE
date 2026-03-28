"use client";

import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { num: "6", label: "Properties Under Management" },
  { num: "78", label: "Units Managed" },
  { num: "96%", label: "Average Occupancy Rate" },
  { num: "4", label: "Landlord Clients" },
];

function parseNumeric(val: string): { target: number; suffix: string } {
  const match = val.match(/^(\d+)(.*)$/);
  if (match) {
    return { target: parseInt(match[1], 10), suffix: match[2] };
  }
  return { target: 0, suffix: val };
}

function AnimatedStat({ num, label, isLast }: { num: string; label: string; isLast: boolean }) {
  const { target, suffix } = parseNumeric(num);
  const { count, ref } = useCountUp(target);

  return (
    <div
      className="text-center"
      style={{
        padding: "1rem 2rem",
        borderRight: isLast ? "none" : "1px solid rgba(245,240,232,0.1)",
      }}
    >
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className="font-serif block"
        style={{
          fontSize: "3rem",
          fontWeight: 300,
          color: "var(--gold)",
          lineHeight: 1,
        }}
      >
        {count}{suffix}
      </span>
      <span
        className="block uppercase"
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          color: "rgba(245,240,232,0.5)",
          marginTop: "0.5rem",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function StatsBelt() {
  return (
    <div
      className="stats-belt-grid"
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2006 100%)",
        borderTop: "1px solid var(--gold)",
        borderBottom: "1px solid var(--gold)",
        padding: "3rem 5rem",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 0,
      }}
    >
      {stats.map((s, i) => (
        <AnimatedStat
          key={s.label}
          num={s.num}
          label={s.label}
          isLast={i === stats.length - 1}
        />
      ))}
    </div>
  );
}
