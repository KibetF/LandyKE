import { Shield, Eye, Handshake, TrendingUp, MapPin, Users, Building2, Award } from "lucide-react";
import Footer from "@/components/marketing/Footer";
import TeamAvatar from "@/components/marketing/TeamAvatar";

const team = [
  {
    name: "Fred Kibet",
    role: "Chief Executive Officer",
    initials: "FK",
    image: "/team/fred-kibet.jpg",
    bio: "Fred founded LandyKe with a vision to professionalise property management across Kenya. With a background in real estate and technology, he leads the company's strategic direction, ensuring every landlord — local or diaspora — receives transparent, reliable service. Under his leadership, LandyKe has grown from a single-city operation to a multi-region property management firm trusted by dozens of clients.",
    gradient: "linear-gradient(135deg, var(--ink), var(--sage))",
  },
  {
    name: "Hillary Kosgei",
    role: "Chief Operating Officer",
    initials: "HK",
    image: "/team/hillary-kosgei.jpg",
    bio: "Hillary oversees the day-to-day operations of LandyKe, from tenant management and maintenance coordination to financial reporting and compliance. His deep understanding of Kenyan landlord-tenant law and local rental markets ensures that every property under LandyKe's stewardship is managed with precision and care. He is the driving force behind the company's operational excellence and client satisfaction.",
    gradient: "linear-gradient(135deg, var(--ink), var(--gold))",
  },
  {
    name: "Edwin Muli",
    role: "Facilities Manager",
    initials: "EM",
    image: "/team/edwin-muli.jpg",
    bio: "Edwin is the boots on the ground at LandyKe — the first responder when something breaks and the steady hand that keeps every property running smoothly. As Facilities Manager, he oversees all maintenance and repair work across the portfolio, coordinating vetted contractors, supervising quality, and ensuring rapid turnaround. Whether it's a burst pipe in Action Flats or a security fix at Elbros Business Park, Edwin can be dispatched to any property at short notice.",
    gradient: "linear-gradient(135deg, var(--ink), var(--rust))",
  },
];

const values = [
  {
    Icon: Shield,
    title: "Integrity First",
    desc: "Every shilling is accounted for. Transparent reporting, no hidden fees, and full audit trails on every transaction.",
  },
  {
    Icon: Eye,
    title: "Full Visibility",
    desc: "Your client portal gives you real-time access to property performance, tenant status, and financial summaries — 24/7.",
  },
  {
    Icon: Handshake,
    title: "Local Expertise",
    desc: "Deep knowledge of Kenyan property law, KRA compliance, and regional rental markets across Nairobi, Eldoret, Kisumu, and Mombasa.",
  },
  {
    Icon: TrendingUp,
    title: "Growth-Oriented",
    desc: "We don't just maintain — we optimise. Rent reviews, vacancy reduction strategies, and preventive maintenance to protect your asset value.",
  },
];

const milestones = [
  { year: "2021", event: "Founded in Eldoret, Uasin Gishu County" },
  { year: "2022", event: "Expanded operations to Nairobi and Kisumu" },
  { year: "2023", event: "Launched the LandyKe client portal for real-time reporting" },
  { year: "2024", event: "Reached 30+ properties under management" },
  { year: "2025", event: "Extended coverage to Mombasa and the coastal region" },
  { year: "2026", event: "Managing 47+ properties across four major cities" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative"
        style={{
          paddingTop: "72px",
          background: "var(--cream)",
        }}
      >
        <div
          style={{
            padding: "5rem 5rem 4rem",
            maxWidth: "800px",
          }}
        >
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
            About LandyKe
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
            Built by landlords,{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
              for landlords
            </em>
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--muted)",
              lineHeight: 1.8,
              fontWeight: 300,
              maxWidth: "640px",
            }}
          >
            LandyKe was founded in 2021 in Eldoret with a simple observation:
            Kenyan landlords — especially those in the diaspora — deserve
            professional, transparent property management without the constant
            worry. Today we manage properties across four major cities, serving
            both local and diaspora landlords with structured processes,
            vetted contractor networks, and a digital-first approach.
          </p>
        </div>
      </section>

      {/* Stats belt */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2006 100%)",
          borderTop: "1px solid var(--gold)",
          borderBottom: "1px solid var(--gold)",
          padding: "2.5rem 5rem",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
        }}
      >
        {[
          { num: "2021", label: "Founded" },
          { num: "4", label: "Cities" },
          { num: "47+", label: "Properties Managed" },
          { num: "18", label: "Landlord Clients" },
        ].map((s, i, arr) => (
          <div
            key={s.label}
            className="text-center"
            style={{
              padding: "0.5rem 2rem",
              borderRight: i < arr.length - 1 ? "1px solid rgba(245,240,232,0.1)" : "none",
            }}
          >
            <span
              className="font-serif block"
              style={{ fontSize: "2.5rem", fontWeight: 300, color: "var(--gold)", lineHeight: 1 }}
            >
              {s.num}
            </span>
            <span
              className="block uppercase"
              style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "rgba(245,240,232,0.5)", marginTop: "0.4rem" }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Our Story */}
      <section style={{ padding: "5rem 5rem", background: "var(--white)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }} className="about-grid">
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
              Our Story
            </div>
            <h2
              className="font-serif"
              style={{
                fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
                fontWeight: 300,
                lineHeight: 1.1,
                marginBottom: "2rem",
              }}
            >
              From Eldoret to{" "}
              <em style={{ fontStyle: "italic", color: "var(--gold)" }}>four cities</em>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.8, fontWeight: 300 }}>
                Too many property owners were losing income to poor tenant vetting,
                inconsistent rent collection, and opaque reporting. We set out to change
                that — building a property management company rooted in transparency,
                accountability, and technology.
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.8, fontWeight: 300 }}>
                Every property under our stewardship benefits from structured processes,
                vetted contractor networks, and a digital-first approach to reporting and
                communication. Our client portal gives landlords real-time visibility into
                their investments from anywhere in the world.
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.8, fontWeight: 300 }}>
                We are registered with the Estate Agents Registration Board (EARB) and
                operate in full compliance with Kenyan landlord-tenant legislation.
              </p>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h3
              className="font-serif"
              style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "2rem" }}
            >
              Our Journey
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    padding: "1.2rem 0",
                    borderBottom: i < milestones.length - 1 ? "1px solid var(--warm)" : "none",
                  }}
                >
                  <span
                    className="font-serif shrink-0"
                    style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--gold)", width: "60px" }}
                  >
                    {m.year}
                  </span>
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7, fontWeight: 300 }}>
                    {m.event}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="marketing-section">
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
          Leadership
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
          The people behind{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>LandyKe</em>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
          }}
          className="services-grid-3"
        >
          {team.map((t) => (
            <div
              key={t.name}
              className="card-hover"
              style={{
                background: "var(--white)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1px solid rgba(201,146,26,0.15)",
              }}
            >
              {/* Avatar header */}
              <div
                style={{
                  background: t.gradient,
                  padding: "3rem 2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <TeamAvatar src={t.image} alt={t.name} initials={t.initials} />
                <div className="text-center">
                  <h3
                    className="font-serif"
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "var(--cream)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {t.name}
                  </h3>
                  <span
                    className="uppercase"
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      color: "var(--gold-light)",
                      fontWeight: 500,
                    }}
                  >
                    {t.role}
                  </span>
                </div>
              </div>
              {/* Bio */}
              <div style={{ padding: "1.5rem" }}>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                    lineHeight: 1.8,
                    fontWeight: 300,
                  }}
                >
                  {t.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "5rem 5rem", background: "var(--white)" }}>
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
          Our Values
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
          What drives{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>everything we do</em>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
          }}
          className="services-grid-4"
        >
          {values.map((v) => (
            <div
              key={v.title}
              className="card-hover"
              style={{
                background: "var(--cream)",
                borderRadius: "12px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1px solid rgba(201,146,26,0.15)",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(201,146,26,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.2rem",
                }}
              >
                <v.Icon size={24} color="var(--gold)" strokeWidth={1.5} />
              </div>
              <h4
                className="font-serif"
                style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.6rem" }}
              >
                {v.title}
              </h4>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.7, fontWeight: 300 }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="marketing-section">
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
          Coverage
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
          Where we{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>operate</em>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
          }}
          className="services-grid-4"
        >
          {[
            { city: "Nairobi", areas: "Kilimani, Karen, Westlands, Kileleshwa", properties: 18 },
            { city: "Eldoret", areas: "CBD, Pioneer, Elgon View, Langas", properties: 14 },
            { city: "Kisumu", areas: "Milimani, Tom Mboya, Kondele", properties: 9 },
            { city: "Mombasa", areas: "Nyali, Bamburi, Tudor", properties: 6 },
          ].map((c) => (
            <div
              key={c.city}
              className="card-hover"
              style={{
                background: "var(--white)",
                borderRadius: "12px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                border: "1px solid rgba(201,146,26,0.15)",
              }}
            >
              <div className="flex items-center" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
                <MapPin size={20} color="var(--gold)" strokeWidth={1.5} />
                <h4
                  className="font-serif"
                  style={{ fontSize: "1.3rem", fontWeight: 600 }}
                >
                  {c.city}
                </h4>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.7, fontWeight: 300, marginBottom: "1rem" }}>
                {c.areas}
              </p>
              <div
                style={{
                  borderTop: "1px solid var(--warm)",
                  paddingTop: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Building2 size={14} color="var(--gold)" strokeWidth={1.5} />
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 500 }}>
                  {c.properties} properties
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div
        style={{
          padding: "80px 5rem",
          background: "var(--ink)",
          textAlign: "center",
        }}
      >
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
            color: "var(--cream)",
            marginBottom: "2rem",
          }}
        >
          Ready to work with us?
          <br />
          <em style={{ color: "var(--gold)", fontStyle: "italic" }}>
            Let&apos;s talk about your property.
          </em>
        </h2>
        <div className="flex justify-center" style={{ gap: "1rem" }}>
          <a
            href="/#contact"
            className="no-underline uppercase"
            style={{
              background: "var(--gold)",
              color: "var(--ink)",
              height: "52px",
              padding: "0 2rem",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              borderRadius: "2px",
              border: "none",
              transition: "all 0.25s",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Get In Touch
          </a>
          <a
            href="/#services"
            className="no-underline uppercase"
            style={{
              background: "transparent",
              color: "var(--cream)",
              height: "52px",
              padding: "0 2rem",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              border: "1px solid rgba(245,240,232,0.25)",
              borderRadius: "2px",
              transition: "all 0.25s",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Our Services
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
}
