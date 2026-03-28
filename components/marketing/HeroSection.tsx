import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden hero-grid"
      style={{
        minHeight: "min(calc(100vh - 72px), 760px)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "end",
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

      {/* Left content */}
      <div
        className="flex flex-col justify-center relative z-2"
        style={{ padding: "3rem 4rem 4rem 5rem" }}
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

        <div className="flex" style={{ gap: "1rem" }}>
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
              borderRadius: "2px",
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
              borderRadius: "2px",
              transition: "all 0.25s",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Our Services
          </a>
        </div>
      </div>

      {/* Right - floating card */}
      <div
        className="flex items-center justify-center relative"
        style={{ padding: "2rem 4rem 4rem 4rem" }}
      >
        <div
          style={{
            background: "var(--white)",
            borderRadius: "16px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.10)",
            padding: "2rem",
            width: "100%",
            maxWidth: "480px",
            position: "relative",
            animation: "floatCard 6s ease-in-out infinite",
          }}
        >
          {/* Card header */}
          <div
            className="flex justify-between items-center"
            style={{
              marginBottom: "1.5rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--warm)",
            }}
          >
            <h3
              className="font-serif"
              style={{ fontSize: "1.1rem", fontWeight: 600 }}
            >
              March 2026 — Portfolio Overview
            </h3>
            <span
              style={{
                background: "var(--green-light)",
                color: "var(--green)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.25rem 0.6rem",
                borderRadius: "20px",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--green)",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              Live
            </span>
          </div>

          {/* Stats row */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                background: "var(--cream)",
                borderRadius: "6px",
                padding: "1rem",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "0.4rem",
                }}
              >
                Collected This Month
              </label>
              <div
                className="font-serif"
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                KES 200k{" "}
                <small
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "var(--muted)",
                    fontFamily: "var(--font-sans), sans-serif",
                  }}
                >
                  /mo
                </small>
              </div>
            </div>
            <div
              style={{
                background: "var(--cream)",
                borderRadius: "6px",
                padding: "1rem",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "0.4rem",
                }}
              >
                Collection Rate
              </label>
              <div
                className="font-serif"
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                94%{" "}
                <small
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "var(--muted)",
                    fontFamily: "var(--font-sans), sans-serif",
                  }}
                >
                  on-time
                </small>
              </div>
            </div>
          </div>

          {/* Mini tenant list */}
          <div className="flex flex-col" style={{ gap: "0.5rem" }}>
            {[
              {
                name: "James Waweru",
                prop: "Plot A · Unit 4",
                status: "paid",
              },
              {
                name: "Grace Akinyi",
                prop: "Eldoret Block · Unit 2",
                status: "paid",
              },
              {
                name: "Daniel Otieno",
                prop: "Plot B · Unit 7",
                status: "pending",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="flex justify-between items-center"
                style={{
                  padding: "0.6rem 0.8rem",
                  background: "var(--cream)",
                  borderRadius: "4px",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {t.prop}
                  </div>
                </div>
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background:
                      t.status === "paid" ? "var(--green)" : "var(--gold)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
