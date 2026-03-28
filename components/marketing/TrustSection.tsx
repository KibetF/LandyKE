const clients = [
  {
    initial: "M",
    name: "Margaret W.",
    detail: "Uasin Gishu County",
    badge: "4 properties · 18 units",
  },
  {
    initial: "J",
    name: "John K.",
    detail: "Eldoret, Elgon View",
    badge: "2 properties · 8 units",
  },
  {
    initial: "A",
    name: "Amina S.",
    detail: "Eldoret · Dubai",
    badge: "1 property · 18 units",
  },
  {
    initial: "P",
    name: "Peter O.",
    detail: "Eldoret, Pioneer",
    badge: "1 property · 14 units",
  },
];

const testimonials = [
  {
    quote:
      "\"I'm based in the UK and was constantly stressed about my properties in Eldoret. Since handing management to LandyKe, I log into my portal, see exactly what has been paid, and receive my disbursement without fail. I wish I had done this years ago.\"",
    cite: "— Catherine N., Diaspora Client, Uasin Gishu",
  },
  {
    quote:
      '"The monthly report is professional enough to hand straight to my accountant. They know exactly what to declare without asking me any questions. The service pays for itself."',
    cite: "— Robert M., Portfolio Landlord, Eldoret",
  },
  {
    quote:
      '"I tried managing my tenants myself for two years. Chasing rent was exhausting. LandyKe has 96% collection rates every month — better than I ever managed on my own."',
    cite: "— Eunice A., Residential Landlord, Eldoret",
  },
];

export default function TrustSection() {
  return (
    <section
      className="trust-section-bg relative overflow-hidden"
      style={{ background: "var(--ink)", padding: "7rem 5rem" }}
    >
      <div
        className="trust-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "start",
        }}
      >
        {/* Left */}
        <div>
          <div
            className="flex items-center uppercase"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              color: "var(--gold-light)",
              fontWeight: 500,
              marginBottom: "1rem",
              gap: "0.6rem",
            }}
          >
            <span
              style={{
                display: "block",
                width: "20px",
                height: "1px",
                background: "var(--gold-light)",
              }}
            />
            Our Clients
          </div>
          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              maxWidth: "600px",
              marginBottom: "2rem",
              color: "var(--cream)",
            }}
          >
            Trusted by landlords across{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Kenya</em>
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(245,240,232,0.55)",
              lineHeight: 1.8,
              fontWeight: 300,
              marginBottom: "2.5rem",
            }}
          >
            From single rental units to multi-property portfolios across
            Eldoret, our clients range from first-time landlords to seasoned
            investors who want professional management without the headache.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {clients.map((c) => (
              <div
                key={c.name}
                style={{
                  background: "rgba(245,240,232,0.05)",
                  border: "1px solid rgba(245,240,232,0.1)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  transition: "all 0.3s",
                }}
              >
                <div
                  className="font-serif flex items-center justify-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "var(--gold)",
                    color: "var(--ink)",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  {c.initial}
                </div>
                <h4
                  style={{
                    color: "var(--cream)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    marginBottom: "0.3rem",
                  }}
                >
                  {c.name}
                </h4>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(245,240,232,0.4)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {c.detail}
                </div>
                <div
                  className="uppercase"
                  style={{
                    marginTop: "0.8rem",
                    fontSize: "0.65rem",
                    color: "var(--gold-light)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {c.badge}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - testimonials */}
        <div className="flex flex-col" style={{ gap: "1.5rem" }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: "rgba(245,240,232,0.04)",
                borderLeft: "3px solid var(--gold)",
                padding: "24px",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <p
                className="font-serif"
                style={{
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  color: "var(--cream)",
                  lineHeight: 1.6,
                  marginBottom: "1rem",
                  fontWeight: 300,
                }}
              >
                {t.quote}
              </p>
              <cite
                className="uppercase not-italic"
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  color: "var(--gold-light)",
                }}
              >
                {t.cite}
              </cite>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
