import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ServicesCta() {
  return (
    <section
      style={{
        padding: "80px 5rem",
        background: "var(--cream)",
        borderTop: "1px solid var(--warm)",
        textAlign: "center",
      }}
    >
      <ScrollReveal>
        <div
          style={{
            width: "40px",
            height: "2px",
            background: "var(--gold)",
            margin: "0 auto 1.5rem",
          }}
        />
        <h2
          className="font-serif"
          style={{
            fontSize: "clamp(2rem, 3vw, 2.8rem)",
            fontWeight: 300,
            lineHeight: 1.15,
            marginBottom: "1rem",
          }}
        >
          Ready to upgrade your property experience?
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--muted)",
            lineHeight: 1.7,
            fontWeight: 300,
            maxWidth: "580px",
            margin: "0 auto 2.5rem",
          }}
        >
          Whether you&apos;re a tenant looking for convenience or a property owner
          looking for peace of mind &mdash; we&apos;ve got you covered.
        </p>
        <div
          className="flex justify-center flex-wrap"
          style={{ gap: "1rem" }}
        >
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
            I&apos;m a Tenant
          </a>
          <a
            href="/#contact"
            className="no-underline uppercase"
            style={{
              background: "transparent",
              color: "var(--ink)",
              height: "52px",
              padding: "0 2rem",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              border: "1px solid var(--ink)",
              borderRadius: "26px",
              transition: "all 0.25s",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            I&apos;m a Property Owner
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
