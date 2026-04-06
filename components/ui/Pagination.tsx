"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const query = params.toString();
    router.push(query ? `?${query}` : window.location.pathname);
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ gap: "1rem", marginTop: "1.5rem" }}
    >
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
          background: "var(--white)",
          border: "1px solid var(--warm)",
          padding: "0.5rem 1rem",
          fontSize: "0.8rem",
          fontFamily: "var(--font-sans), sans-serif",
          color: currentPage <= 1 ? "var(--muted)" : "var(--ink)",
          borderRadius: "4px",
          cursor: currentPage <= 1 ? "default" : "pointer",
          opacity: currentPage <= 1 ? 0.5 : 1,
        }}
      >
        Previous
      </button>
      <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
          background: "var(--white)",
          border: "1px solid var(--warm)",
          padding: "0.5rem 1rem",
          fontSize: "0.8rem",
          fontFamily: "var(--font-sans), sans-serif",
          color: currentPage >= totalPages ? "var(--muted)" : "var(--ink)",
          borderRadius: "4px",
          cursor: currentPage >= totalPages ? "default" : "pointer",
          opacity: currentPage >= totalPages ? 0.5 : 1,
        }}
      >
        Next
      </button>
    </div>
  );
}
