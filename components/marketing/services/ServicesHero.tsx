import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ServicesHero() {
  return (
    <section
      className="relative"
      style={{
        background: "var(--cream)",
      }}
    >
      <div
        style={{
          padding: "5rem 5rem 4rem",
          maxWidth: "800px",
        }}
      >
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
            Our Services
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(2.8rem, 4.5vw, 4.2rem)",
              fontWeight: 300,
              lineHeight: 1.08,
              marginBottom: "1.8rem",
            }}
          >
            More Than Property Management
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--muted)",
              lineHeight: 1.8,
              fontWeight: 300,
              maxWidth: "640px",
              marginBottom: "2.5rem",
            }}
          >
            We&apos;re the infrastructure layer inside your building. From internet
            to maintenance, we handle everything so you don&apos;t have to.
          </p>
          <a
            href="/#contact"
            className="no-underline uppercase"
            style={{
              background: "var(--ink)",
              color: "var(--cream)",
              height: "52px",
              padding: "0 2rem",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              border: "none",
              borderRadius: "26px",
              transition: "all 0.25s",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Get Started
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
