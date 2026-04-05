import { MapPin, Monitor, Receipt, Handshake } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const valueProps = [
  {
    Icon: MapPin,
    title: "Local Presence",
    desc: "We physically manage your property. We\u2019re not a remote app \u2014 we\u2019re on the ground in Eldoret.",
  },
  {
    Icon: Monitor,
    title: "Tech-Powered",
    desc: "Real-time reporting, M-Pesa reconciliation, and tenant management through the LandyKe platform.",
  },
  {
    Icon: Receipt,
    title: "Transparent Pricing",
    desc: "No hidden fees. Everything is upfront \u2014 you always know what you\u2019re paying for.",
  },
  {
    Icon: Handshake,
    title: "One Partner, Everything Handled",
    desc: "Internet, maintenance, legal, cleaning \u2014 one relationship replaces a dozen vendors.",
  },
];

export default function WhyLandyKe() {
  return (
    <section
      style={{
        background: "var(--ink)",
        padding: "5rem",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
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
            Why LandyKe
          </div>
          <h2
            className="font-serif"
            style={{
              fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "var(--cream)",
              maxWidth: "600px",
              marginBottom: "4rem",
            }}
          >
            The trusted choice for{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
              property services in Eldoret
            </em>
          </h2>
        </ScrollReveal>

        <div className="services-grid-4">
          {valueProps.map((v, i) => (
            <ScrollReveal key={v.title} delay={Math.min(i + 1, 4)}>
              <div
                style={{
                  background: "rgba(245,240,232,0.05)",
                  borderRadius: "12px",
                  padding: "32px",
                  border: "1px solid rgba(245,240,232,0.08)",
                }}
              >
                <v.Icon
                  size={32}
                  color="var(--gold)"
                  strokeWidth={1.5}
                  style={{ marginBottom: "1.5rem" }}
                />
                <h3
                  className="font-serif"
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    marginBottom: "0.8rem",
                    color: "var(--cream)",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(245,240,232,0.6)",
                    lineHeight: 1.7,
                    fontWeight: 300,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
