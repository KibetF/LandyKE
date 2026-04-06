"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getAvailableMonths } from "@/lib/queries";

const months = getAvailableMonths();
const currentMonth = new Date().toISOString().slice(0, 7);

export default function MonthSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("month") || currentMonth;

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === currentMonth) {
      params.delete("month");
    } else {
      params.set("month", value);
    }
    const query = params.toString();
    router.push(query ? `?${query}` : "/dashboard");
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      style={{
        background: "var(--white)",
        border: "1px solid var(--warm)",
        padding: "0.6rem 1.2rem",
        fontFamily: "var(--font-sans), sans-serif",
        fontSize: "0.8rem",
        color: "var(--ink)",
        borderRadius: "4px",
        cursor: "pointer",
        outline: "none",
      }}
    >
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
