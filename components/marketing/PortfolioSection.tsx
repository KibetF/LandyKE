import ScrollReveal from "@/components/ui/ScrollReveal";
import PropertyCard from "./PropertyCard";
import { portfolioProperties } from "./portfolioData";

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="marketing-section">
      <ScrollReveal>
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
          Our Portfolio
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
          Eleven properties on the books.
          <br />
          <span style={{ color: "var(--gold)" }}>Here are six of them.</span>
        </h2>
      </ScrollReveal>
      <div className="portfolio-grid">
        {portfolioProperties.map((p, i) => (
          <ScrollReveal key={p.name} delay={Math.min(i + 1, 4)}>
            <PropertyCard p={p} />
          </ScrollReveal>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <a
          href="#contact"
          className="no-underline uppercase"
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "52px",
            padding: "0 2rem",
            border: "1.5px solid var(--gold)",
            borderRadius: "26px",
            color: "var(--gold)",
            fontSize: "0.8rem",
            fontWeight: 500,
            letterSpacing: "0.1em",
            transition: "all 0.25s",
          }}
        >
          Discuss your property
        </a>
      </div>
    </section>
  );
}
