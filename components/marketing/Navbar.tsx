import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-100 flex justify-between items-center"
      style={{
        padding: "0 4rem",
        height: "72px",
        background: "rgba(245, 240, 232, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="font-serif"
        style={{
          fontSize: "1.8rem",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
        }}
      >
        Landy<span style={{ color: "var(--gold)" }}>Ke</span>
      </div>
      <ul className="list-none flex" style={{ gap: "2.5rem" }}>
        <li>
          <a
            href="#services"
            className="nav-link no-underline uppercase"
            style={{
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "var(--muted)",
              transition: "color 0.2s",
            }}
          >
            Services
          </a>
        </li>
        <li>
          <a
            href="#portfolio"
            className="nav-link no-underline uppercase"
            style={{
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "var(--muted)",
              transition: "color 0.2s",
            }}
          >
            Portfolio
          </a>
        </li>
        <li>
          <a
            href="#about"
            className="nav-link no-underline uppercase"
            style={{
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "var(--muted)",
              transition: "color 0.2s",
            }}
          >
            About
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="nav-link no-underline uppercase"
            style={{
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "var(--muted)",
              transition: "color 0.2s",
            }}
          >
            Contact
          </a>
        </li>
        <li>
          <Link
            href="/login"
            className="client-login-btn no-underline uppercase"
            style={{
              background: "var(--ink)",
              color: "var(--cream)",
              padding: "0.6rem 1.4rem",
              borderRadius: "2px",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            Client Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}
