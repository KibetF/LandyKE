import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ServicesHero() {
  return (
    <section className="relative" style={{ background: "var(--cream)" }}>
      <div
        className="hero-grid"
        style={{
          alignItems: "center",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "4rem 2rem 2rem",
        }}
      >
        {/* Left — copy */}
        <div style={{ padding: "1rem 2rem 1rem 3rem" }} className="hero-left">
          <ScrollReveal>
            <div
              className="section-tag flex items-center uppercase"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                color: "var(--gold)",
                fontWeight: 500,
                marginBottom: "1rem",
                gap: "0.6rem",
              }}
            >
              Our Services
            </div>
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(2.6rem, 4vw, 3.8rem)",
                fontWeight: 300,
                lineHeight: 1.08,
                marginBottom: "1.8rem",
              }}
            >
              Everything the building needs.
              <br />
              <span style={{ color: "var(--gold)" }}>Priced in plain sight.</span>
            </h1>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--muted)",
                lineHeight: 1.8,
                fontWeight: 300,
                maxWidth: "520px",
                marginBottom: "2.5rem",
              }}
            >
              We run the property you live in or own — collecting rent, fixing
              taps, delivering WiFi, keeping the books. Every service on this
              page has a price next to it, and one office in Eldoret behind it.
            </p>
            <Link
              href="/#contact"
              className="no-underline uppercase"
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                height: "52px",
                padding: "0 2rem",
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                border: "none",
                borderRadius: "26px",
                transition: "all 0.25s",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Get Started
            </Link>
          </ScrollReveal>
        </div>

        {/* Right — rate card */}
        <div className="flex items-center justify-center relative" style={{ padding: "1rem 2rem" }}>
          {/* Figures mirror TenantServices/LandlordServices pricing — keep in sync. */}
          <div className="paper-ledger tilt" style={{ width: "100%", maxWidth: "440px" }}>
            <div className="hero-statement-label uppercase">Rate Card — Eldoret</div>
            <h3 className="hero-statement-title font-serif">What things cost</h3>
            <div className="ledger-row">
              <span className="ledger-row-label">Management fee</span>
              <span className="ledger-dots" aria-hidden="true" />
              <span className="ledger-row-value">from 8%</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-row-label">WiFi</span>
              <span className="ledger-dots" aria-hidden="true" />
              <span className="ledger-row-value">from KSh 800/mo</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-row-label">Room cleaning</span>
              <span className="ledger-dots" aria-hidden="true" />
              <span className="ledger-row-value">KSh 500/wk</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-row-label">Maintenance retainer</span>
              <span className="ledger-dots" aria-hidden="true" />
              <span className="ledger-row-value">KSh 3,000/mo</span>
            </div>
            <div className="ledger-row payoff">
              <span className="ledger-row-label">Numbers to call</span>
              <span className="ledger-dots" aria-hidden="true" />
              <span className="ledger-row-value">1</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
