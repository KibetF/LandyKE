import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: "72px",
      }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(200,150,62,0.06) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(200,150,62,0.06) 80px)",
        }}
      />

      {/* Constrained inner container */}
      <div
        className="hero-grid"
        style={{
          alignItems: "center",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "5rem 2rem 5rem 2rem",
        }}
      >
        {/* Left content */}
        <div
          className="flex flex-col justify-center relative z-2 hero-left"
          style={{ padding: "1rem 2rem 1rem 3rem" }}
        >
          <div
            className="inline-flex items-center uppercase"
            style={{
              gap: "0.5rem",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              color: "var(--gold)",
              fontWeight: 500,
              marginBottom: "1.8rem",
            }}
          >
            <span
              style={{
                display: "block",
                width: "24px",
                height: "1px",
                background: "var(--gold)",
              }}
            />
            Eldoret, Kenya
          </div>

          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(3.2rem, 5vw, 5rem)",
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: "1.8rem",
            }}
          >
            Your properties,
            <br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
              expertly managed.
            </em>
          </h1>

          <p
            style={{
              fontSize: "1rem",
              color: "var(--muted)",
              lineHeight: 1.7,
              maxWidth: "480px",
              marginBottom: "2.5rem",
              fontWeight: 300,
            }}
          >
            LandyKe handles every aspect of your investment property — rent
            collection, tenant management, maintenance coordination, and full
            financial reporting. You stay informed, we handle everything else.
          </p>

          <div className="flex flex-wrap hero-buttons" style={{ gap: "1rem" }}>
            <Link
              href="/login"
              className="no-underline uppercase"
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                height: "52px",
                padding: "0 2rem",
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                border: "none",
                borderRadius: "26px",
                transition: "all 0.25s",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Enter Client Portal
            </Link>
            <a
              href="#services"
              className="no-underline uppercase"
              style={{
                background: "transparent",
                color: "var(--ink)",
                height: "52px",
                padding: "0 2rem",
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                border: "1px solid rgba(15,14,11,0.25)",
                borderRadius: "26px",
                transition: "all 0.25s",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Our Services
            </a>
          </div>
        </div>

        {/* Right - statement card */}
        <div
          className="flex items-center justify-center relative"
          style={{ padding: "1rem 2rem" }}
        >
          <div className="hero-statement">
            <div className="hero-statement-label uppercase">Statement</div>
            <h3 className="font-serif hero-statement-title">
              March 2026 — Uasin Gishu Portfolio
            </h3>

            <div className="ledger-row">
              <span className="ledger-row-label">Rent collected</span>
              <span className="ledger-dots" aria-hidden="true" />
              <span className="ledger-row-value">KES 200,000</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-row-label">Collection rate</span>
              <span className="ledger-dots" aria-hidden="true" />
              <span className="ledger-row-value">94%</span>
            </div>
            <div className="ledger-row payoff">
              <span className="ledger-row-label">Net disbursed to you</span>
              <span className="ledger-dots" aria-hidden="true" />
              <span className="ledger-row-value">KES 187,500</span>
            </div>

            <div className="hero-tenant-list">
              {[
                { name: "James Waweru", prop: "Plot A, Unit 4", status: "paid" },
                { name: "Grace Akinyi", prop: "Eldoret Block, Unit 2", status: "paid" },
                { name: "Daniel Otieno", prop: "Plot B, Unit 7", status: "pending" },
              ].map((t) => (
                <div key={t.name} className="hero-tenant-row">
                  <span className="hero-tenant-name">
                    {t.name} <span className="hero-tenant-property">· {t.prop}</span>
                  </span>
                  <span className="hero-tenant-dots" aria-hidden="true" />
                  <span className={`hero-tenant-status uppercase ${t.status}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
