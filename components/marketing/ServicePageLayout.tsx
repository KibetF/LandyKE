import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Footer from "@/components/marketing/Footer";

interface ServicePageLayoutProps {
  tag: string;
  title: string;
  titleAccent: string;
  intro: string;
  Icon: LucideIcon;
  features: { title: string; desc: string }[];
  whyUs: string[];
  ctaText?: string;
}

export default function ServicePageLayout({
  tag,
  title,
  titleAccent,
  intro,
  Icon,
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
                <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
                  {titleAccent}
                </em>
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
            <div
              className="flex items-center justify-center hidden md:flex"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "24px",
                background: "rgba(201,146,26,0.08)",
              }}
            >
              <Icon size={56} color="var(--gold)" strokeWidth={1} />
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
              marginBottom: "2rem",
            }}
          >
            What&apos;s Included
          </h2>
          <div className="services-grid-3">
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "var(--white)",
                  borderRadius: "12px",
                  padding: "28px",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                }}
              >
                <h3
                  className="font-serif"
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    marginBottom: "0.6rem",
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
                <CheckCircle
                  size={18}
                  style={{
                    color: "var(--green)",
                    flexShrink: 0,
                    marginTop: "0.15rem",
                  }}
                />
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
            Ready to get started?
          </h2>
          <Link
            href="/#contact"
            className="client-login-btn no-underline uppercase"
            style={{
              display: "inline-block",
              background: "var(--ink)",
              color: "var(--cream)",
              padding: "0.8rem 2rem",
              borderRadius: "4px",
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
