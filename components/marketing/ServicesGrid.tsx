const services = [
  {
    icon: "🏠",
    title: "Tenant Acquisition",
    desc: "We market your property, vet prospective tenants thoroughly through background and reference checks, and handle all leasing agreements in accordance with Kenyan landlord-tenant law.",
  },
  {
    icon: "💳",
    title: "Rent Collection",
    desc: "Monthly rent collection via M-Pesa, bank transfer, or other preferred methods. We track every payment, issue receipts, and chase arrears so you never have to make that call.",
  },
  {
    icon: "📊",
    title: "Financial Reporting",
    desc: "Your client portal gives you real-time visibility — income by property, outstanding payments, year-to-date summaries, and documentation ready for KRA MRI filings.",
  },
  {
    icon: "🔧",
    title: "Maintenance Coordination",
    desc: "From plumbing to painting, we coordinate vetted contractors, obtain quotes, supervise work, and keep costs transparent. Every expense logged against your property ledger.",
  },
  {
    icon: "📋",
    title: "Lease Management",
    desc: "Drafting, renewals, rent reviews, and terminations — handled professionally. We maintain a full tenancy history for every unit and ensure your properties stay legally compliant.",
  },
  {
    icon: "🔒",
    title: "Tax Compliance Support",
    desc: "We provide monthly income summaries structured for KRA Monthly Rental Income (MRI) declarations, helping you remain fully compliant and avoid penalties from the taxman.",
  },
];

export default function ServicesGrid() {
  return (
    <section id="services" style={{ padding: "7rem 5rem" }}>
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2px",
          background: "var(--warm)",
        }}
      >
        {services.map((s) => (
          <div
            key={s.title}
            className="service-card relative overflow-hidden"
            style={{
              background: "var(--cream)",
              padding: "3rem 2.5rem",
              transition: "background 0.3s",
            }}
          >
            <span
              style={{
                fontSize: "2rem",
                marginBottom: "1.5rem",
                display: "block",
              }}
            >
              {s.icon}
            </span>
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
        ))}
      </div>
    </section>
  );
}
