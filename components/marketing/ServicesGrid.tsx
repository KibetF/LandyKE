import { Home, CreditCard, BarChart3, Wrench, FileText, Lock, Sparkles, SprayCan, HardHat } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const managementServices = [
  {
    Icon: Home,
    title: "Tenant Acquisition",
    desc: "We market your property, vet prospective tenants thoroughly through background and reference checks, and handle all leasing agreements in accordance with Kenyan landlord-tenant law.",
  },
  {
    Icon: CreditCard,
    title: "Rent Collection",
    desc: "Monthly rent collection via M-Pesa, bank transfer, or other preferred methods. We track every payment, issue receipts, and chase arrears so you never have to make that call.",
  },
  {
    Icon: BarChart3,
    title: "Financial Reporting",
    desc: "Your client portal gives you real-time visibility — income by property, outstanding payments, year-to-date summaries, and documentation ready for KRA MRI filings.",
  },
  {
    Icon: Wrench,
    title: "Maintenance Coordination",
    desc: "From plumbing to painting, we coordinate vetted contractors, obtain quotes, supervise work, and keep costs transparent. Every expense logged against your property ledger.",
  },
  {
    Icon: FileText,
    title: "Lease Management",
    desc: "Drafting, renewals, rent reviews, and terminations — handled professionally. We maintain a full tenancy history for every unit and ensure your properties stay legally compliant.",
  },
  {
    Icon: Lock,
    title: "Tax Compliance Support",
    desc: "We provide monthly income summaries structured for KRA Monthly Rental Income (MRI) declarations, helping you remain fully compliant and avoid penalties from the taxman.",
  },
];

const careServices = [
  {
    Icon: Sparkles,
    title: "Regular Cleaning",
    desc: "Scheduled cleaning for common areas, corridors, and vacant units on weekly/bi-weekly cadence.",
  },
  {
    Icon: SprayCan,
    title: "Deep Cleaning",
    desc: "Intensive move-in/move-out sanitisation — carpet treatment, kitchen degreasing, bathroom descaling.",
  },
  {
    Icon: HardHat,
    title: "After-Construction Cleaning",
    desc: "Post-build cleanup — debris removal, dust extraction, window polishing, floor treatment.",
  },
  {
    Icon: Wrench,
    title: "General Repairs & Upkeep",
    desc: "Plumbing, electrical, painting, carpentry via vetted contractor network + preventive maintenance.",
  },
];

export default function ServicesGrid() {
  return (
    <section id="services" className="marketing-section">
      {/* Group 1 — Property Management */}
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
          What We Do
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
          Full-spectrum property management,{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
            handled end-to-end
          </em>
        </h2>
      </ScrollReveal>
      <div className="services-grid-3">
        {managementServices.map((s, i) => (
          <ScrollReveal key={s.title} delay={Math.min(i + 1, 4)}>
            <div
              className="service-card card-interactive relative overflow-hidden"
              style={{
                background: "var(--white)",
                borderRadius: "12px",
                padding: "32px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                transition: "background 0.3s",
              }}
            >
              <s.Icon
                size={32}
                color="var(--gold)"
                strokeWidth={1.5}
                style={{ marginBottom: "1.5rem" }}
              />
              <h3
                className="font-serif"
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  marginBottom: "0.8rem",
                }}
              >
                {s.title}
              </h3>
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
          </ScrollReveal>
        ))}
      </div>

      {/* Group 2 — Property Care */}
      <ScrollReveal>
        <div
          className="section-tag flex items-center uppercase"
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            color: "var(--gold)",
            fontWeight: 500,
            marginBottom: "1rem",
            marginTop: "5rem",
            gap: "0.6rem",
          }}
        >
          Property Care
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
          Maintenance services,{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
            handled with care
          </em>
        </h2>
      </ScrollReveal>
      <div className="services-grid-4">
        {careServices.map((s, i) => (
          <ScrollReveal key={s.title} delay={Math.min(i + 1, 4)}>
            <div
              className="service-card relative overflow-hidden"
              style={{
                background: "var(--white)",
                borderRadius: "12px",
                padding: "32px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                transition: "background 0.3s",
                borderLeft: "3px solid var(--gold)",
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
                  marginBottom: "1.5rem",
                }}
              >
                <s.Icon
                  size={36}
                  color="var(--gold)"
                  strokeWidth={1.5}
                />
              </div>
              <h3
                className="font-serif"
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  marginBottom: "0.8rem",
                }}
              >
                {s.title}
              </h3>
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
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
