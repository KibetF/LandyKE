import Link from "next/link";

const companyLinks: { label: string; href: string }[] = [
  { label: "About Us", href: "/about" },
  { label: "Our Team", href: "/about" },
  { label: "Coverage Areas", href: "/#portfolio" },
  { label: "Careers", href: "/#contact" },
  { label: "Contact", href: "/#contact" },
];

const footerLinkStyle = {
  fontSize: "0.8rem",
  color: "rgba(245,240,232,0.45)",
  transition: "color 0.2s",
} as const;

export default function Footer() {
  return (
    <>
      <footer
        className="marketing-footer"
        style={{
          background: "var(--ink)",
          borderTop: "4px solid var(--gold)",
        }}
      >
        <div>
          <span
            className="font-serif block"
            style={{
              fontSize: "1.8rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--cream)",
              marginBottom: "1rem",
            }}
          >
            Landy<span style={{ color: "var(--gold)" }}>Ke</span>
          </span>
          <p
            style={{
              fontSize: "0.8rem",
              color: "rgba(245,240,232,0.4)",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            Professional property management across Kenya. Trusted by landlords
            locally and in the diaspora since 2021.
          </p>
        </div>
        <div>
          <h5
            className="uppercase"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              color: "var(--gold)",
              marginBottom: "1.2rem",
            }}
          >
            Services
          </h5>
          <ul className="list-none">
            {[
              "Rent Collection",
              "Tenant Management",
              "Financial Reports",
              "Maintenance",
              "Lease Management",
              "Cleaning Services",
            ].map((item) => (
              <li key={item} style={{ marginBottom: "0.6rem" }}>
                <Link
                  href="/services"
                  className="footer-link no-underline"
                  style={footerLinkStyle}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5
            className="uppercase"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              color: "var(--gold)",
              marginBottom: "1.2rem",
            }}
          >
            Company
          </h5>
          <ul className="list-none">
            {companyLinks.map((item) => (
              <li key={item.label} style={{ marginBottom: "0.6rem" }}>
                <Link
                  href={item.href}
                  className="footer-link no-underline"
                  style={footerLinkStyle}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5
            className="uppercase"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              color: "var(--gold)",
              marginBottom: "1.2rem",
            }}
          >
            Client Portal
          </h5>
          <ul className="list-none">
            <li style={{ marginBottom: "0.6rem" }}>
              <Link
                href="/login"
                className="footer-link no-underline"
                style={footerLinkStyle}
              >
                Login
              </Link>
            </li>
            <li style={{ marginBottom: "0.6rem" }}>
              <Link
                href="/login"
                className="footer-link no-underline"
                style={footerLinkStyle}
              >
                Reset Password
              </Link>
            </li>
            <li style={{ marginBottom: "0.6rem" }}>
              <Link
                href="mailto:hello@landyke.co.ke"
                className="footer-link no-underline"
                style={footerLinkStyle}
              >
                Support
              </Link>
            </li>
          </ul>
          <div style={{ marginTop: "1.5rem" }}>
            <p
              style={{
                fontSize: "0.7rem",
                color: "rgba(245,240,232,0.3)",
              }}
            >
              📍 Eldoret, Uasin Gishu
              <br />
              📞 +254 700 000 000
            </p>
          </div>
        </div>
      </footer>
      <div
        className="footer-bottom flex justify-between"
        style={{
          background: "rgba(0,0,0,0.3)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "1.2rem 2.5rem",
          fontSize: "0.7rem",
          color: "rgba(245,240,232,0.25)",
          letterSpacing: "0.05em",
        }}
      >
        <span>&copy; 2026 LandyKe Property Management. All rights reserved.</span>
        <span>
          <Link href="/privacy" className="no-underline" style={{ color: "rgba(245,240,232,0.25)", transition: "color 0.2s" }}>
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="no-underline" style={{ color: "rgba(245,240,232,0.25)", transition: "color 0.2s" }}>
            Terms of Service
          </Link>
          {" · EARB Registered"}
        </span>
      </div>
    </>
  );
}
