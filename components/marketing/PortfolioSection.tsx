import Image from "next/image";
import { MapPin, Building2, Users } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const properties = [
  {
    name: "Elbros Business Park",
    location: "Near Royalton, Eldoret City",
    type: "Mixed-Use",
    units: 18,
    occupancy: 94,
    image: "/properties/riverside-apartments.jpg",
  },
  {
    name: "Sanshin House",
    location: "Sinai, Eldoret City",
    type: "Commercial",
    units: 12,
    occupancy: 88,
    image: "/properties/kipchoge-towers.jpg",
  },
  {
    name: "Action Flats Phase 1",
    location: "Action, Eldoret City",
    type: "Mixed-Use",
    units: 16,
    occupancy: 92,
    image: "/properties/lakeview-residences.jpg",
  },
  {
    name: "Action Flats Phase 2",
    location: "Action, Eldoret City",
    type: "Residential",
    units: 14,
    occupancy: 96,
    image: "/properties/pioneer-mall.jpg",
  },
  {
    name: "Rock Center Parkview",
    location: "Rock Center, Eldoret City",
    type: "Residential",
    units: 10,
    occupancy: 100,
    image: "/properties/garden-court.jpg",
  },
  {
    name: "Eldoville Villa",
    location: "Eldoville, Eldoret City",
    type: "Residential",
    units: 8,
    occupancy: 100,
    image: "/properties/nyali-heights.jpg",
  },
];

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
          Properties under our{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
            stewardship
          </em>
        </h2>
      </ScrollReveal>
      <div className="portfolio-grid">
        {properties.map((p, i) => (
          <ScrollReveal key={p.name} delay={Math.min(i + 1, 4)}>
            <div
              className="portfolio-card card-hover"
              style={{
                background: "var(--white)",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid transparent",
              }}
            >
              <div
                className="portfolio-img"
                style={{
                  height: "220px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
                {/* Overlay gradient */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)",
                    pointerEvents: "none",
                  }}
                />
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
                    background: "rgba(201,146,26,0.9)",
                    color: "#fff",
                    fontWeight: 500,
                    zIndex: 1,
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
                    borderTop: "1px solid #eee",
                    paddingTop: "1rem",
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
                  <span
                    className="flex items-center"
                    style={{ gap: "0.35rem", fontWeight: 600, color: "var(--ink)" }}
                  >
                    <Users size={14} strokeWidth={1.5} />
                    {p.occupancy}% Occupied
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* View All Properties button */}
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <a
          href="#contact"
          className="no-underline uppercase"
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "48px",
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
          View All Properties
        </a>
      </div>
    </section>
  );
}
