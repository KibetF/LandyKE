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
    <section style={{ padding: "7rem 5rem", background: "var(--white)" }}>
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
          marginBottom: "4rem",
        }}
      >
        From onboarding to{" "}
        <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
          passive income
        </em>
      </h2>
      <div
        className="steps-container relative"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          marginTop: "1rem",
        }}
      >
        {steps.map((s) => (
          <div
            key={s.num}
            className="text-center relative z-1"
            style={{ padding: "0 2rem 3rem" }}
          >
            <div
              className="font-serif flex items-center justify-center"
              style={{
                width: "4rem",
                height: "4rem",
                borderRadius: "50%",
                background: "var(--cream)",
                border: "1px solid var(--gold)",
                color: "var(--gold)",
                fontSize: "1.4rem",
                fontWeight: 600,
                margin: "0 auto 1.5rem",
              }}
            >
              {s.num}
            </div>
            <h4
              className="font-serif"
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              {s.title}
            </h4>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
