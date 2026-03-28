export default function CtaBand() {
  return (
    <div
      className="cta-band"
      style={{
        padding: "80px 5rem",
        background: "var(--cream)",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: "4rem",
        borderTop: "1px solid var(--warm)",
        borderBottom: "1px solid var(--warm)",
      }}
    >
      <div>
        {/* Decorative gold line */}
        <div
          style={{
            width: "40px",
            height: "2px",
            background: "var(--gold)",
            marginBottom: "1.5rem",
          }}
        />
        <h2
          className="font-serif"
          style={{
            fontSize: "clamp(2rem, 3vw, 2.8rem)",
            fontWeight: 300,
            lineHeight: 1.15,
          }}
        >
          Ready to stop worrying about your properties?
          <br />
          <em style={{ color: "var(--gold)", fontStyle: "italic" }}>
            Let&apos;s talk.
          </em>
        </h2>
      </div>
      <div className="flex shrink-0" style={{ gap: "1rem" }}>
        <a
          href="#contact"
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
        <a
          href="#contact"
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
          Book a Call
        </a>
      </div>
    </div>
  );
}
