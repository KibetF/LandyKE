import { MapPin, Building2, Users } from "lucide-react";

const properties = [
  {
    name: "Riverside Apartments",
    location: "Nairobi, Kilimani",
    type: "Residential",
    units: 24,
    occupancy: 96,
    gradient: "linear-gradient(135deg, var(--ink), var(--sage))",
  },
  {
    name: "Kipchoge Towers",
    location: "Eldoret, CBD",
    type: "Mixed-Use",
    units: 18,
    occupancy: 92,
    gradient: "linear-gradient(135deg, var(--ink), var(--gold))",
  },
  {
    name: "Lakeview Residences",
    location: "Kisumu, Milimani",
    type: "Residential",
    units: 12,
    occupancy: 100,
    gradient: "linear-gradient(135deg, var(--sage), var(--ink))",
  },
  {
    name: "Pioneer Mall Units",
    location: "Eldoret, Pioneer",
    type: "Commercial",
    units: 8,
    occupancy: 88,
    gradient: "linear-gradient(135deg, var(--rust), var(--ink))",
  },
  {
    name: "Garden Court Villas",
    location: "Nairobi, Karen",
    type: "Residential",
    units: 6,
    occupancy: 100,
    gradient: "linear-gradient(135deg, var(--ink), var(--green))",
  },
  {
    name: "Nyali Heights",
    location: "Mombasa, Nyali",
    type: "Residential",
    units: 16,
    occupancy: 94,
    gradient: "linear-gradient(135deg, #8b7530, var(--ink))",
  },
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="marketing-section">
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
        Properties under our{" "}
        <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
          stewardship
        </em>
      </h2>
      <div className="portfolio-grid">
        {properties.map((p) => (
          <div
            key={p.name}
            className="portfolio-card card-hover"
            style={{
              background: "var(--white)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div
              className="portfolio-img"
              style={{
                height: "200px",
                background: p.gradient,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "1rem",
                  left: "1rem",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "0.3rem 0.8rem",
                  borderRadius: "20px",
                  background: "rgba(245,240,232,0.15)",
                  color: "var(--cream)",
                  fontWeight: 500,
                  backdropFilter: "blur(4px)",
                }}
              >
                {p.type}
              </span>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <h3
                className="font-serif"
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                }}
              >
                {p.name}
              </h3>
              <div
                className="flex items-center"
                style={{
                  gap: "0.35rem",
                  color: "var(--muted)",
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                }}
              >
                <MapPin size={14} strokeWidth={1.5} />
                {p.location}
              </div>
              <div
                style={{
                  height: "1px",
                  background: "var(--warm)",
                  marginBottom: "1rem",
                }}
              />
              <div
                className="flex justify-between"
                style={{ fontSize: "0.78rem", color: "var(--muted)" }}
              >
                <span className="flex items-center" style={{ gap: "0.35rem" }}>
                  <Building2 size={14} strokeWidth={1.5} />
                  {p.units} Units
                </span>
                <span className="flex items-center" style={{ gap: "0.35rem" }}>
                  <Users size={14} strokeWidth={1.5} />
                  {p.occupancy}% Occupied
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
