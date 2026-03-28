import Footer from "@/components/marketing/Footer";

const sections = [
  {
    title: "Data Collection",
    content:
      "We collect personal information that you voluntarily provide when using our services, including your name, email address, phone number, property details, and payment information. We also collect usage data such as browser type, IP address, and pages visited to improve our services.",
  },
  {
    title: "How We Use Your Data",
    content:
      "Your information is used to provide and improve our property management services, process payments, communicate important updates about your properties, send service notifications, and comply with legal obligations. We do not sell your personal data to third parties.",
  },
  {
    title: "Cookies & Tracking",
    content:
      "We use essential cookies to maintain your session and preferences. Analytics cookies help us understand how you use our platform so we can improve the experience. You can manage cookie preferences through your browser settings.",
  },
  {
    title: "Third-Party Services",
    content:
      "We work with trusted third-party providers for payment processing (M-Pesa, bank transfers), email communications, and cloud hosting. These providers are contractually bound to protect your data and use it only for the services they provide to us.",
  },
  {
    title: "Data Security",
    content:
      "We implement industry-standard security measures including encryption, secure server infrastructure, and regular security audits to protect your personal information. Access to personal data is restricted to authorized personnel only.",
  },
  {
    title: "Your Rights",
    content:
      "Under Kenyan data protection law (Data Protection Act, 2019), you have the right to access, correct, or delete your personal data. You may also object to processing or request data portability. To exercise these rights, contact us at hello@landyke.co.ke.",
  },
  {
    title: "Data Retention",
    content:
      "We retain your personal data for as long as your account is active or as needed to provide services. Financial records are kept for 7 years as required by Kenyan tax regulations. You may request deletion of your account and associated data at any time.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this privacy policy from time to time. We will notify you of significant changes via email or through a notice on our platform. Continued use of our services after changes constitutes acceptance of the updated policy.",
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
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
            At LandyKe, we are committed to protecting your privacy and personal
            data. This policy explains how we collect, use, and safeguard your
            information when you use our property management services.
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
              <strong style={{ color: "var(--ink)" }}>Questions?</strong> Contact our
              data protection team at{" "}
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
