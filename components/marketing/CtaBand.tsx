export default function CtaBand() {
  return (
    <div
      style={{
        padding: "6rem 5rem",
        background: "var(--cream)",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: "4rem",
        borderTop: "1px solid var(--warm)",
        borderBottom: "1px solid var(--warm)",
      }}
    >
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
      <div className="flex shrink-0" style={{ gap: "1rem" }}>
        <a
          href="#contact"
          className="inline-block no-underline uppercase"
          style={{
            background: "var(--ink)",
            color: "var(--cream)",
            padding: "1rem 2rem",
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.8rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            border: "none",
            borderRadius: "2px",
            transition: "all 0.25s",
          }}
        >
          Get Started
        </a>
        <a
          href="#contact"
          className="inline-block no-underline uppercase"
          style={{
            background: "transparent",
            color: "var(--ink)",
            padding: "1rem 2rem",
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "0.8rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            border: "1px solid rgba(15,14,11,0.25)",
            borderRadius: "2px",
            transition: "all 0.25s",
          }}
        >
          Book a Call
        </a>
      </div>
    </div>
  );
}
