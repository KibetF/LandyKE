import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
      }}
    >
      <div
        className="text-center"
        style={{
          background: "var(--white)",
          borderRadius: "8px",
          boxShadow: "0 40px 80px rgba(15,14,11,0.08)",
          padding: "3rem",
          width: "100%",
          maxWidth: "420px",
          border: "1px solid rgba(200,150,62,0.1)",
        }}
      >
        <div
          className="font-serif"
          style={{
            fontSize: "1.8rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
          }}
        >
          Landy<span style={{ color: "var(--gold)" }}>Ke</span>
        </div>

        <h1
          className="font-serif"
          style={{
            fontSize: "1.4rem",
            fontWeight: 300,
            marginBottom: "1rem",
          }}
        >
          Account Not Set Up
        </h1>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--muted)",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Your account hasn&apos;t been set up yet. Please contact LandyKe
          administration to get access to the landlord portal.
        </p>

        <Link
          href="/"
          className="no-underline uppercase"
          style={{
            display: "inline-block",
            background: "var(--ink)",
            color: "var(--cream)",
            padding: "0.8rem 2rem",
            fontSize: "0.8rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            borderRadius: "2px",
            transition: "all 0.25s",
          }}
        >
          Back to Website
        </Link>
      </div>
    </div>
  );
}
