import ScrollReveal from "@/components/ui/ScrollReveal";

const steps = [
  {
    num: "01",
    title: "Property Handover",
    desc: "We conduct a full property inspection, document condition, and take over key management. Your tenants are introduced to our team.",
  },
  {
    num: "02",
    title: "Portal Setup",
    desc: "You receive login credentials for your LandyKe client portal — full visibility into all your properties and income from day one.",
  },
  {
    num: "03",
    title: "Active Management",
    desc: "We handle everything — rent collection, maintenance requests, tenant communication — and log it all to your account in real time.",
  },
  {
    num: "04",
    title: "Monthly Disbursement",
    desc: "Net income is transferred to your account by the 5th of each month, with a full breakdown report attached. Clean, consistent, reliable.",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" style={{ background: "var(--white)" }}>
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
          The Process
        </div>
        <h2
          className="font-serif"
          style={{
            fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
            fontWeight: 300,
            lineHeight: 1.1,
            maxWidth: "600px",
            marginBottom: "3rem",
          }}
        >
          Keys in. <span style={{ color: "var(--gold)" }}>Statements out.</span>
        </h2>
      </ScrollReveal>
      <ScrollReveal>
        <div className="ledger-list" style={{ maxWidth: "760px" }}>
          {steps.map((s) => (
            <div key={s.num} className="ledger-list-row">
              <span className="ledger-list-num">{s.num}</span>
              <div>
                <h4
                  className="font-serif"
                  style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.4rem" }}
                >
                  {s.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                    lineHeight: 1.7,
                    fontWeight: 300,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
