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
    <div className="mt-6 flex items-center justify-center gap-4">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded border border-warm bg-white px-4 py-2 font-sans text-[0.8rem] text-ink cursor-pointer transition-colors hover:bg-warm/30 disabled:cursor-default disabled:text-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        Previous
      </button>
      <span className="text-[0.8rem] text-muted">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded border border-warm bg-white px-4 py-2 font-sans text-[0.8rem] text-ink cursor-pointer transition-colors hover:bg-warm/30 disabled:cursor-default disabled:text-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        Next
      </button>
    </div>
  );
}
