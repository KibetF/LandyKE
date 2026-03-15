import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer
        style={{
          background: "var(--ink)",
          padding: "4rem 5rem",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "3rem",
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
            ].map((item) => (
              <li key={item} style={{ marginBottom: "0.6rem" }}>
                <a
                  href="#"
                  className="no-underline"
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(245,240,232,0.45)",
                    transition: "color 0.2s",
                  }}
                >
                  {item}
                </a>
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
            {[
              "About Us",
              "Our Team",
              "Coverage Areas",
              "Careers",
              "Contact",
            ].map((item) => (
              <li key={item} style={{ marginBottom: "0.6rem" }}>
                <a
                  href="#"
                  className="no-underline"
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(245,240,232,0.45)",
                    transition: "color 0.2s",
                  }}
                >
                  {item}
                </a>
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
                className="no-underline"
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(245,240,232,0.45)",
                  transition: "color 0.2s",
                }}
              >
                Login
              </Link>
            </li>
            {["Reset Password", "Support"].map((item) => (
              <li key={item} style={{ marginBottom: "0.6rem" }}>
                <a
                  href="#"
                  className="no-underline"
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(245,240,232,0.45)",
                    transition: "color 0.2s",
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
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
        className="flex justify-between"
        style={{
          background: "rgba(0,0,0,0.3)",
          padding: "1.2rem 5rem",
          fontSize: "0.7rem",
          color: "rgba(245,240,232,0.25)",
          letterSpacing: "0.05em",
        }}
      >
        <span>© 2026 LandyKe Property Management. All rights reserved.</span>
        <span>Privacy Policy · Terms of Service · EAAB Registered</span>
      </div>
    </>
  );
}
