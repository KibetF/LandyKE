import { Wifi, Sparkles, Zap, Droplets, Package } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const sectionTagStyle = {
  fontSize: "0.7rem",
  letterSpacing: "0.18em",
  color: "var(--gold)",
  fontWeight: 500,
  marginBottom: "1rem",
  gap: "0.6rem",
} as const;

const cardStyle = {
  background: "var(--white)",
  borderRadius: "12px",
  padding: "32px",
  boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
  transition: "background 0.3s",
  height: "100%",
} as const;

const cardTitleStyle = {
  fontSize: "1.4rem",
  fontWeight: 600,
  marginBottom: "0.8rem",
} as const;

const cardDescStyle = {
  fontSize: "0.85rem",
  color: "var(--muted)",
  lineHeight: 1.7,
  fontWeight: 300,
} as const;

const pricingRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  padding: "10px 0",
  borderBottom: "1px solid var(--warm)",
  gap: "1rem",
} as const;

const priceStyle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "var(--gold)",
  whiteSpace: "nowrap",
  fontFamily: "var(--font-serif), serif",
} as const;

const planLabelStyle = {
  fontSize: "0.8rem",
  fontWeight: 500,
  color: "var(--ink)",
} as const;

const planDescStyle = {
  fontSize: "0.75rem",
  color: "var(--muted)",
  fontWeight: 300,
  marginTop: "2px",
} as const;

const ctaLinkStyle = {
  display: "inline-block",
  marginTop: "1.5rem",
  fontSize: "0.75rem",
  color: "var(--gold)",
  fontWeight: 500,
  letterSpacing: "0.06em",
} as const;

const noteStyle = {
  fontSize: "0.75rem",
  color: "var(--muted)",
  fontStyle: "italic",
  marginTop: "1rem",
  fontWeight: 300,
} as const;

export default function TenantServices() {
  return (
    <div>
      <ScrollReveal>
        <div
          className="section-tag flex items-center uppercase"
          style={sectionTagStyle}
        >
          Tenant Services
        </div>
        <h2
          className="font-serif"
          style={{
            fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
            fontWeight: 300,
            lineHeight: 1.1,
            maxWidth: "600px",
            marginBottom: "1rem",
          }}
        >
          Live smarter,{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
            live easier
          </em>
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--muted)",
            lineHeight: 1.7,
            fontWeight: 300,
            maxWidth: "600px",
            marginBottom: "3rem",
          }}
        >
          We bring convenience, connectivity, and savings directly to your doorstep.
        </p>
      </ScrollReveal>

      <div className="services-grid-3" style={{ marginBottom: "3rem" }}>
        {/* Internet & WiFi */}
        <ScrollReveal delay={1}>
          <div className="service-card card-interactive" style={cardStyle}>
            <Wifi
              size={32}
              color="var(--gold)"
              strokeWidth={1.5}
              style={{ marginBottom: "1.5rem" }}
            />
            <h3 className="font-serif" style={cardTitleStyle}>
              Internet &amp; WiFi Packages
            </h3>
            <p style={{ ...cardDescStyle, marginBottom: "1.5rem" }}>
              High-speed internet delivered straight to your unit. No installation
              hassle, no contracts with ISPs &mdash; we handle everything.
            </p>

            <div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Basic</div>
                  <div style={planDescStyle}>WhatsApp, browsing, email, social media</div>
                </div>
                <span style={priceStyle}>KSh 800/mo</span>
              </div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Standard</div>
                  <div style={planDescStyle}>Streaming, video calls, remote work</div>
                </div>
                <span style={priceStyle}>KSh 1,200/mo</span>
              </div>
              <div style={{ ...pricingRowStyle, borderBottom: "none" }}>
                <div>
                  <div style={planLabelStyle}>Premium</div>
                  <div style={planDescStyle}>Gaming, heavy downloads, 4K streaming</div>
                </div>
                <span style={priceStyle}>KSh 1,800/mo</span>
              </div>
            </div>

            <p style={noteStyle}>
              Prices may vary by property. All plans include 24/7 support.
            </p>
            <a href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Get Connected &rarr;
            </a>
          </div>
        </ScrollReveal>

        {/* Cleaning & Laundry */}
        <ScrollReveal delay={2}>
          <div className="service-card card-interactive" style={cardStyle}>
            <Sparkles
              size={32}
              color="var(--gold)"
              strokeWidth={1.5}
              style={{ marginBottom: "1.5rem" }}
            />
            <h3 className="font-serif" style={cardTitleStyle}>
              Cleaning &amp; Laundry
            </h3>
            <p style={{ ...cardDescStyle, marginBottom: "1.5rem" }}>
              Keep your space spotless without lifting a finger. We partner with
              trusted local providers for scheduled cleaning and laundry services.
            </p>

            <div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Room Cleaning</div>
                  <div style={planDescStyle}>Weekly</div>
                </div>
                <span style={priceStyle}>KSh 500/wk</span>
              </div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Room Cleaning</div>
                  <div style={planDescStyle}>Bi-weekly</div>
                </div>
                <span style={priceStyle}>KSh 800/mo</span>
              </div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Laundry</div>
                  <div style={planDescStyle}>Wash, dry, fold &mdash; per load</div>
                </div>
                <span style={priceStyle}>KSh 300/load</span>
              </div>
              <div style={{ ...pricingRowStyle, borderBottom: "none" }}>
                <div>
                  <div style={planLabelStyle}>Laundry Subscription</div>
                  <div style={planDescStyle}>Weekly pickup</div>
                </div>
                <span style={priceStyle}>KSh 1,000/mo</span>
              </div>
            </div>

            <a href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Book Cleaning &rarr;
            </a>
          </div>
        </ScrollReveal>

        {/* Electricity & Water */}
        <ScrollReveal delay={3}>
          <div className="service-card card-interactive" style={cardStyle}>
            <div className="flex" style={{ gap: "0.5rem", marginBottom: "1.5rem" }}>
              <Zap size={32} color="var(--gold)" strokeWidth={1.5} />
              <Droplets size={32} color="var(--gold)" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif" style={cardTitleStyle}>
              Electricity &amp; Water
            </h3>
            <p style={{ ...cardDescStyle, marginBottom: "1.5rem" }}>
              No more scrambling for tokens at midnight or arguing about water
              bills. We manage your utilities from KPLC token purchases to fair
              water billing through submetering.
            </p>

            <div
              style={{
                background: "rgba(200,150,62,0.06)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div style={{ ...planLabelStyle, marginBottom: "4px" }}>
                Token Purchase Service
              </div>
              <p style={{ ...planDescStyle, margin: 0 }}>
                We buy your KPLC tokens for you. Just send a request, get your
                token. Convenience fee:{" "}
                <strong style={{ color: "var(--gold)" }}>KSh 50/transaction</strong>.
              </p>
            </div>
            <div
              style={{
                background: "rgba(200,150,62,0.06)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div style={{ ...planLabelStyle, marginBottom: "4px" }}>
                Water Billing
              </div>
              <p style={{ ...planDescStyle, margin: 0 }}>
                Fair usage-based billing on master-metered properties. Transparent,
                no disputes. Management fee included in your rent or as a small
                add-on.
              </p>
            </div>

            <a href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Learn More &rarr;
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* Convenience & Delivery */}
      <ScrollReveal>
        <div
          className="service-card card-interactive"
          style={{ ...cardStyle, marginBottom: "3rem" }}
        >
          <Package
            size={32}
            color="var(--gold)"
            strokeWidth={1.5}
            style={{ marginBottom: "1.5rem" }}
          />
          <h3 className="font-serif" style={cardTitleStyle}>
            Convenience &amp; Delivery Services
          </h3>
          <p style={{ ...cardDescStyle, marginBottom: "1.5rem" }}>
            We make daily life in your building easier with on-demand services.
          </p>
          <div className="services-grid-3">
            <div style={pricingRowStyle}>
              <div>
                <div style={planLabelStyle}>Parcel receiving &amp; holding</div>
              </div>
              <span style={priceStyle}>KSh 50/parcel</span>
            </div>
            <div style={pricingRowStyle}>
              <div>
                <div style={planLabelStyle}>Gas cylinder delivery</div>
                <div style={planDescStyle}>Delivery fee + cylinder cost</div>
              </div>
              <span style={priceStyle}>KSh 100 fee</span>
            </div>
            <div style={{ ...pricingRowStyle, borderBottom: "none" }}>
              <div>
                <div style={planLabelStyle}>Water delivery (20L)</div>
              </div>
              <span style={priceStyle}>KSh 80/jerrycan</span>
            </div>
          </div>
          <a href="/#contact" className="no-underline" style={ctaLinkStyle}>
            Order Now &rarr;
          </a>
        </div>
      </ScrollReveal>

      {/* Smart Living Bundle */}
      <ScrollReveal>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(200,150,62,0.08), rgba(200,150,62,0.02))",
            borderRadius: "16px",
            padding: "40px",
            borderLeft: "4px solid var(--gold)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "var(--gold)",
              color: "var(--white)",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "20px",
              marginBottom: "1.2rem",
            }}
          >
            Best Value
          </span>
          <h3
            className="font-serif"
            style={{
              fontSize: "1.8rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Smart Living Bundle
          </h3>
          <p style={{ ...cardDescStyle, marginBottom: "1.5rem", maxWidth: "500px" }}>
            Everything you need for comfortable living, bundled at a discount.
          </p>

          <div style={{ marginBottom: "1.5rem" }}>
            {["Standard WiFi", "Weekly cleaning", "Monthly laundry subscription"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center"
                  style={{ gap: "0.6rem", marginBottom: "0.5rem" }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--gold)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "0.85rem", fontWeight: 400 }}>{item}</span>
                </div>
              )
            )}
          </div>

          <div className="flex items-baseline flex-wrap" style={{ gap: "1rem", marginBottom: "1.5rem" }}>
            <span
              className="font-serif"
              style={{
                fontSize: "2.2rem",
                fontWeight: 600,
                color: "var(--gold)",
              }}
            >
              KSh 2,500/mo
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                textDecoration: "line-through",
              }}
            >
              KSh 3,200/mo
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--sage)",
                fontWeight: 500,
              }}
            >
              Save KSh 700
            </span>
          </div>

          <a
            href="/#contact"
            className="no-underline uppercase"
            style={{
              background: "var(--ink)",
              color: "var(--cream)",
              height: "48px",
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
            Get the Bundle
          </a>
        </div>
      </ScrollReveal>
    </div>
  );
}
