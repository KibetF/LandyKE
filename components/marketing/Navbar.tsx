"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

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
      className="fixed top-0 left-0 right-0 z-100"
      style={{
        height: "72px",
        background: "rgba(245, 240, 232, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(200,150,62,0.12)",
      }}
    >
      {/* Constrained inner container */}
      <div
        className="flex justify-between items-center navbar-inner"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          height: "100%",
          padding: "0 2.5rem",
        }}
      >
        <Link
          href="/"
          onClick={handleLogoClick}
          className="font-serif no-underline"
          style={{
            fontSize: "1.6rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          Landy<span style={{ color: "var(--gold)" }}>Ke</span>
        </Link>

        {/* Desktop nav */}
        <ul
          className="hidden md:flex items-center list-none"
          style={{ gap: "2rem" }}
        >
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="nav-link no-underline uppercase"
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  color: "var(--muted)",
                  transition: "color 0.2s",
                  padding: "0.4rem 0",
                  borderBottom: "1.5px solid transparent",
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li style={{ marginLeft: "0.5rem" }}>
            <Link
              href="/login"
              className="client-login-btn no-underline uppercase"
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                padding: "0.55rem 1.6rem",
                borderRadius: "26px",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                fontWeight: 500,
                transition: "all 0.25s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            top: "72px",
            left: 0,
            right: 0,
            background: "rgba(245, 240, 232, 0.98)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(200,150,62,0.12)",
            display: "flex",
            flexDirection: "column",
            padding: "0.5rem 0",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link no-underline uppercase"
              onClick={() => setOpen(false)}
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                color: "var(--muted)",
                transition: "color 0.2s",
                padding: "1rem 2.5rem",
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
              margin: "0.5rem 2.5rem 1rem",
              borderRadius: "26px",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              fontWeight: 500,
              textAlign: "center",
              transition: "all 0.25s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            Client Login
          </Link>
        </div>
      )}
    </nav>
  );
}
