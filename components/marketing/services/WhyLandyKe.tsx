import ScrollReveal from "@/components/ui/ScrollReveal";

const valueProps = [
  {
    key: "On the ground",
    title: "Local Presence",
    desc: "We physically manage your property. We’re not a remote app — we’re on the ground in Eldoret.",
  },
  {
    key: "Platform",
    title: "Tech-Powered",
    desc: "Real-time reporting, M-Pesa reconciliation, and tenant management through the LandyKe platform.",
  },
  {
    key: "Pricing",
    title: "Transparent Pricing",
    desc: "No hidden fees. Everything is upfront — you always know what you’re paying for.",
  },
  {
    key: "One partner",
    title: "Everything Handled",
    desc: "Internet, maintenance, legal, cleaning — one relationship replaces a dozen vendors.",
  },
];

export default function WhyLandyKe() {
  return (
    <section
      style={{
        background: "var(--ink)",
        padding: "5rem",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
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
            Why LandyKe
          </div>
          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "var(--cream)",
              maxWidth: "600px",
              marginBottom: "3rem",
            }}
          >
            We manage in person.{" "}
            <span style={{ color: "var(--gold)" }}>We report in numbers.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <div className="ledger-list keyed on-ink">
            {valueProps.map((v) => (
              <div key={v.key} className="ledger-list-row">
                <span className="ledger-list-key">{v.key}</span>
                <div>
                  <h3
                    className="font-serif"
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      marginBottom: "0.4rem",
                      color: "var(--cream)",
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(245,240,232,0.6)",
                      lineHeight: 1.7,
                      fontWeight: 300,
                    }}
                  >
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
