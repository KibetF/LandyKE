"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

const linkStyle = {
  fontSize: "0.8rem",
  fontWeight: 500,
  letterSpacing: "0.08em",
  color: "var(--muted)",
  transition: "color 0.2s",
} as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function handleLogoClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-100 flex justify-between items-center px-6 md:px-16"
      style={{
        height: "72px",
        background: "rgba(245, 240, 232, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Link
        href="/"
        onClick={handleLogoClick}
        className="font-serif no-underline"
        style={{
          fontSize: "1.8rem",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
        }}
      >
        Landy<span style={{ color: "var(--gold)" }}>Ke</span>
      </Link>

      {/* Desktop nav */}
      <ul className="hidden md:flex list-none" style={{ gap: "2.5rem" }}>
        {navLinks.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="nav-link no-underline uppercase"
              style={linkStyle}
            >
              {link.label}
            </Link>
          </li>
        ))}
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

      {/* Hamburger button */}
      <button
        className="md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--ink)",
        }}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            top: "72px",
            left: 0,
            right: 0,
            background: "var(--cream)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link no-underline uppercase"
              onClick={() => setOpen(false)}
              style={{
                ...linkStyle,
                padding: "1rem 2rem",
                display: "block",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="client-login-btn no-underline uppercase"
            onClick={() => setOpen(false)}
            style={{
              background: "var(--ink)",
              color: "var(--cream)",
              padding: "0.8rem 2rem",
              margin: "0.5rem 2rem 1rem",
              borderRadius: "2px",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              fontWeight: 500,
              textAlign: "center",
              transition: "all 0.2s",
            }}
          >
            Client Login
          </Link>
        </div>
      )}
    </nav>
  );
}
