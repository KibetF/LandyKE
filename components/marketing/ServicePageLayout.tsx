import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Footer from "@/components/marketing/Footer";
import { GoldDot } from "@/components/marketing/services/RateCardParts";

interface ServicePageLayoutProps {
  tag: string;
  title: string;
  titleAccent: string;
  intro: string;
  Icon: LucideIcon; // kept for the 8 data pages' sake; the template no longer renders it
  features: { title: string; desc: string }[];
  whyUs: string[];
  ctaText?: string;
}

export default function ServicePageLayout({
  tag,
  title,
  titleAccent,
  intro,
  features,
  whyUs,
  ctaText = "Get a Free Consultation",
}: ServicePageLayoutProps) {
  return (
    <>
      <div style={{ paddingTop: "72px" }}>
        {/* Hero */}
        <section
          className="marketing-section"
          style={{ paddingBottom: "3rem" }}
        >
          <Link
            href="/services"
            className="no-underline flex items-center"
            style={{
              fontSize: "0.8rem",
              color: "var(--gold)",
              gap: "0.4rem",
              marginBottom: "2rem",
            }}
          >
            <ArrowLeft size={14} />
            All Services
          </Link>

          <div
            className="contact-grid"
            style={{
              gap: "3rem",
              alignItems: "start",
            }}
          >
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
                {tag}
              </div>
              <h1
                className="font-serif"
                style={{
                  fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
                  fontWeight: 300,
                  lineHeight: 1.1,
                  marginBottom: "1.5rem",
                }}
              >
                {title}{" "}
                <span style={{ color: "var(--gold)" }}>{titleAccent}</span>
              </h1>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--muted)",
                  lineHeight: 1.8,
                  fontWeight: 300,
                  maxWidth: "560px",
                }}
              >
                {intro}
              </p>
            </div>
            {/* Index card — numbers match the features list below */}
            <div className="hidden md:block">
              <div className="paper-ledger" style={{ maxWidth: "400px", marginLeft: "auto" }}>
                <div className="hero-statement-label uppercase">{tag}</div>
                <h3 className="hero-statement-title font-serif" style={{ fontSize: "1.15rem" }}>
                  In this file
                </h3>
                {features.map((f, i) => (
                  <div key={f.title} className="ledger-row" style={{ padding: "0.4rem 0" }}>
                    <span className="ledger-row-label" style={{ whiteSpace: "normal" }}>
                      {f.title}
                    </span>
                    <span className="ledger-dots" aria-hidden="true" />
                    <span className="ledger-row-value" style={{ fontSize: "0.85rem" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          className="marketing-section"
          style={{ paddingTop: "2rem", paddingBottom: "3rem" }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            What&apos;s Included
          </h2>
          <div className="ledger-list">
            {features.map((f, i) => (
              <div key={f.title} className="ledger-list-row">
                <span className="ledger-list-num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3
                    className="font-serif"
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      marginBottom: "0.4rem",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--muted)",
                      lineHeight: 1.7,
                      fontWeight: 300,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Us */}
        <section
          className="marketing-section"
          style={{
            paddingTop: "2rem",
            paddingBottom: "3rem",
            background: "var(--white)",
          }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              marginBottom: "2rem",
            }}
          >
            Why LandyKe
          </h2>
          <div
            className="form-row"
            style={{ gap: "1rem" }}
          >
            {whyUs.map((item) => (
              <div
                key={item}
                className="flex items-start"
                style={{ gap: "0.8rem" }}
              >
                <GoldDot />
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--ink)",
                    lineHeight: 1.6,
                    fontWeight: 300,
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="marketing-section"
          style={{
            paddingTop: "3rem",
            paddingBottom: "3rem",
            textAlign: "center",
          }}
        >
          <h2
            className="font-serif"
            style={{
              fontSize: "1.8rem",
              fontWeight: 300,
              marginBottom: "1.5rem",
            }}
          >
            One call starts it.
          </h2>
          <Link
            href="/#contact"
            className="client-login-btn no-underline uppercase"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "var(--ink)",
              color: "var(--cream)",
              height: "52px",
              padding: "0 2rem",
              borderRadius: "26px",
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            {ctaText}
          </Link>
        </section>
      </div>
      <Footer />
    </>
  );
}
