import Footer from "@/components/marketing/Footer";

const sections = [
  {
    title: "Service Description",
    content:
      "LandyKe provides property management services including rent collection, tenant management, maintenance coordination, financial reporting, and related services for property owners across Kenya. Our platform enables landlords to monitor and manage their properties remotely.",
  },
  {
    title: "User Accounts",
    content:
      "To access our portal, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized access to your account.",
  },
  {
    title: "User Responsibilities",
    content:
      "As a user of our services, you agree to provide accurate property and tenant information, comply with all applicable Kenyan laws and regulations regarding property management and tenancy, pay all applicable service fees in a timely manner, and not use the platform for any unlawful purposes.",
  },
  {
    title: "Service Fees",
    content:
      "Our management fees are agreed upon in the service contract between LandyKe and the property owner. Fees are deducted from collected rent as per the agreed percentage. A detailed breakdown of fees is available in the monthly financial reports accessible through your portal.",
  },
  {
    title: "Property Management",
    content:
      "We act as your authorized agent for the day-to-day management of your properties. This includes collecting rent, coordinating maintenance, managing tenant relations, and providing financial reports. All actions are taken in accordance with Kenyan tenancy laws and your service agreement.",
  },
  {
    title: "Limitation of Liability",
    content:
      "LandyKe shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the fees paid by you in the twelve months preceding any claim. We are not liable for tenant defaults, property damage from natural causes, or third-party actions beyond our control.",
  },
  {
    title: "Termination",
    content:
      "Either party may terminate the service agreement with 30 days written notice. Upon termination, we will provide a final financial statement, return all property documents, and facilitate a smooth transition. Outstanding fees remain payable upon termination.",
  },
  {
    title: "Dispute Resolution",
    content:
      "Any disputes arising from these terms shall first be addressed through good-faith negotiation. If unresolved, disputes shall be submitted to mediation in Eldoret, Kenya. If mediation fails, disputes shall be resolved through arbitration in accordance with the Arbitration Act of Kenya.",
  },
  {
    title: "Governing Law",
    content:
      "These terms are governed by and construed in accordance with the laws of the Republic of Kenya, including the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act, the Rent Restriction Act, and the Data Protection Act, 2019.",
  },
  {
    title: "Changes to Terms",
    content:
      "We reserve the right to modify these terms at any time. Material changes will be communicated via email at least 14 days before they take effect. Continued use of our services after changes take effect constitutes acceptance of the modified terms.",
  },
];

export default function TermsPage() {
  return (
    <>
      <div style={{ paddingTop: "72px" }}>
        <section
          className="marketing-section"
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
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
            Legal
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            Terms of Service
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--muted)",
              marginBottom: "3rem",
            }}
          >
            Last updated: March 2026
          </p>

          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--muted)",
              lineHeight: 1.8,
              fontWeight: 300,
              marginBottom: "2.5rem",
            }}
          >
            These terms govern your use of LandyKe&apos;s property management
            services and platform. By accessing or using our services, you agree
            to be bound by these terms.
          </p>

          {sections.map((section, i) => (
            <div key={i} style={{ marginBottom: "2rem" }}>
              <h2
                className="font-serif"
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  marginBottom: "0.8rem",
                  color: "var(--ink)",
                }}
              >
                {section.title}
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--muted)",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                {section.content}
              </p>
            </div>
          ))}

          <div
            style={{
              marginTop: "3rem",
              padding: "1.5rem",
              background: "var(--white)",
              borderRadius: "8px",
              border: "1px solid rgba(200,150,62,0.08)",
            }}
          >
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--ink)" }}>Questions about these terms?</strong>{" "}
              Contact us at{" "}
              <a href="mailto:hello@landyke.co.ke" style={{ color: "var(--gold)" }}>
                hello@landyke.co.ke
              </a>
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
