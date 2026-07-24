import ValuesList from "./ValuesList";

export default function AboutSection() {
  return (
    <section id="about" className="marketing-section">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          alignItems: "start",
        }}
        className="about-grid"
      >
        {/* Left — Story */}
        <div>
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
            About Us
          </div>
          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              marginBottom: "2rem",
            }}
          >
            Built by landlords.{" "}
            <span style={{ color: "var(--gold)" }}>Run for landlords.</span>
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--muted)",
                lineHeight: 1.8,
                fontWeight: 300,
              }}
            >
              LandyKe was founded in 2021 in Eldoret with a simple observation:
              Kenyan landlords — especially those in the diaspora — deserve
              professional, transparent property management without the constant
              worry. Too many property owners were losing income to poor tenant
              vetting, inconsistent rent collection, and opaque reporting.
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--muted)",
                lineHeight: 1.8,
                fontWeight: 300,
              }}
            >
              Today we manage a growing portfolio of properties across Eldoret,
              serving both local and diaspora landlords. Every property under our stewardship
              benefits from structured processes, vetted contractor networks, and
              a digital-first approach to reporting and communication.
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--muted)",
                lineHeight: 1.8,
                fontWeight: 300,
              }}
            >
              We are registered with the Estate Agents Registration Board (EARB)
              and operate in full compliance with Kenyan landlord-tenant
              legislation.
            </p>
          </div>

          {/* Quick stats */}
          <div
            className="about-quick-stats"
            style={{
              marginTop: "2.5rem",
            }}
          >
            {[
              { num: "2021", label: "Founded" },
              { num: "11", label: "Properties" },
              { num: "260+", label: "Units Managed" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  borderTop: "2px solid var(--gold)",
                  paddingTop: "1rem",
                }}
              >
                <span
                  className="font-serif block"
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 300,
                    color: "var(--gold)",
                    lineHeight: 1,
                  }}
                >
                  {s.num}
                </span>
                <span
                  className="block uppercase"
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: "var(--muted)",
                    marginTop: "0.4rem",
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Values */}
        <ValuesList />
      </div>
    </section>
  );
}
