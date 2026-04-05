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
      aria-label="Select month"
      className="rounded border border-warm bg-white px-5 py-2.5 font-sans text-[0.8rem] text-ink outline-none cursor-pointer transition-colors focus:border-gold/30 focus-visible:ring-2 focus-visible:ring-gold/20"
    >
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
