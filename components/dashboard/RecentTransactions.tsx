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
  return (
    <div
      className="card-hover"
      style={{
        background: "var(--white)",
        borderRadius: "8px",
        border: "1px solid rgba(200,150,62,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex justify-between items-center"
        style={{
          padding: "1.2rem 1.5rem",
          borderBottom: "1px solid var(--warm)",
        }}
      >
        <h3
          className="font-serif"
          style={{ fontSize: "1.1rem", fontWeight: 600 }}
        >
          Recent Transactions
        </h3>
        <a
          className="uppercase cursor-pointer"
          style={{
            fontSize: "0.7rem",
            color: "var(--gold)",
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          Export →
        </a>
      </div>
      <div style={{ padding: "0.5rem" }}>
        {transactions.map((txn, i) => (
          <div
            key={i}
            className="flex justify-between items-center"
            style={{
              padding: "0.75rem 1rem",
              borderBottom:
                i < transactions.length - 1
                  ? "1px solid var(--warm)"
                  : "none",
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  marginBottom: "0.15rem",
                }}
              >
                {txn.title}
              </h4>
              <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                {txn.detail}
              </span>
            </div>
            <div
              className="font-serif"
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: txn.isDeduction ? "var(--rust)" : "var(--green)",
              }}
            >
              {txn.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
