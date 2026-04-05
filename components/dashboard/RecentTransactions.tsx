import Link from "next/link";
import { Receipt } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface Transaction {
  title: string;
  detail: string;
  amount: string;
  isDeduction?: boolean;
}

export default function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const isEmpty = transactions.length === 0;

  return (
    <div className="overflow-hidden rounded-lg border border-gold/8 bg-white transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between border-b border-warm px-6 py-4">
        <h3 className="font-serif text-[1.1rem] font-semibold">
          Recent Transactions
        </h3>
        <Link
          href="/payments"
          className="text-[0.7rem] uppercase tracking-[0.08em] text-gold no-underline"
        >
          Export →
        </Link>
      </div>
      <div className="p-2">
        {isEmpty ? (
          <EmptyState icon={Receipt} title="No transactions yet" />
        ) : (
          transactions.map((txn, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 ${
                i < transactions.length - 1 ? "border-b border-warm" : ""
              }`}
            >
              <div>
                <h4 className="mb-0.5 text-[0.8rem] font-medium">{txn.title}</h4>
                <span className="text-[0.68rem] text-muted">{txn.detail}</span>
              </div>
              <div
                className={`font-serif text-base font-semibold ${
                  txn.isDeduction ? "text-rust" : "text-green"
                }`}
              >
                {txn.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
