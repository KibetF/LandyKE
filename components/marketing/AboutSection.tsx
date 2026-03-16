import { Shield, Eye, Handshake, TrendingUp } from "lucide-react";

const values = [
  {
    Icon: Shield,
    title: "Integrity First",
    desc: "Every shilling is accounted for. Transparent reporting, no hidden fees, and full audit trails on every transaction.",
  },
  {
    Icon: Eye,
    title: "Full Visibility",
    desc: "Your client portal gives you real-time access to property performance, tenant status, and financial summaries — 24/7.",
  },
  {
    Icon: Handshake,
    title: "Local Expertise",
    desc: "Deep knowledge of Kenyan property law, KRA compliance, and regional rental markets across Nairobi, Eldoret, Kisumu, and Mombasa.",
  },
  {
    Icon: TrendingUp,
    title: "Growth-Oriented",
    desc: "We don't just maintain — we optimise. Rent reviews, vacancy reduction strategies, and preventive maintenance to protect your asset value.",
  },
];

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
            Built by landlords,{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
              for landlords
            </em>
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
              Today we manage properties across four major cities, serving both
              local and diaspora landlords. Every property under our stewardship
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
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
              marginTop: "2.5rem",
            }}
          >
            {[
              { num: "2021", label: "Founded" },
              { num: "4", label: "Cities" },
              { num: "47+", label: "Properties" },
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
          className="values-grid"
        >
          {values.map((v) => (
            <div
              key={v.title}
              className="card-hover"
              style={{
                background: "var(--white)",
                borderRadius: "12px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1px solid rgba(201,146,26,0.15)",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(201,146,26,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.2rem",
                }}
              >
                <v.Icon
                  size={24}
                  color="var(--gold)"
                  strokeWidth={1.5}
                />
              </div>
              <h4
                className="font-serif"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginBottom: "0.6rem",
                }}
              >
                {v.title}
              </h4>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
