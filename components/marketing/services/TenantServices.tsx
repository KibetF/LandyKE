import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  CardHeader,
  PriceRow,
  sectionTagStyle,
  cardDescStyle,
  ctaLinkStyle,
  noteStyle,
} from "./RateCardParts";

export default function TenantServices() {
  return (
    <div>
      <ScrollReveal>
        <div className="section-tag flex items-center uppercase" style={sectionTagStyle}>
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
          Ask the office.{" "}
          <span style={{ color: "var(--gold)" }}>It gets handled.</span>
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
          <div className="rate-card" style={{ height: "100%" }}>
            <CardHeader code="WF" title="Internet & WiFi" />
            <p style={{ ...cardDescStyle, marginBottom: "1.25rem" }}>
              High-speed internet delivered straight to your unit. No installation
              hassle, no contracts with ISPs — we handle everything.
            </p>
            <PriceRow label="Basic" desc="WhatsApp, browsing, email, social media" value="KSh 800/mo" />
            <PriceRow label="Standard" desc="Streaming, video calls, remote work" value="KSh 1,200/mo" />
            <PriceRow label="Premium" desc="Gaming, heavy downloads, 4K streaming" value="KSh 1,800/mo" />
            <p style={noteStyle}>Prices may vary by property. All plans include 24/7 support.</p>
            <Link href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Get Connected &rarr;
            </Link>
          </div>
        </ScrollReveal>

        {/* Cleaning & Laundry */}
        <ScrollReveal delay={2}>
          <div className="rate-card" style={{ height: "100%" }}>
            <CardHeader code="CL" title="Cleaning & Laundry" />
            <p style={{ ...cardDescStyle, marginBottom: "1.25rem" }}>
              Keep your space spotless without lifting a finger. We partner with
              trusted local providers for scheduled cleaning and laundry services.
            </p>
            <PriceRow label="Room cleaning" desc="Weekly" value="KSh 500/wk" />
            <PriceRow label="Room cleaning" desc="Bi-weekly" value="KSh 800/mo" />
            <PriceRow label="Laundry" desc="Wash, dry, fold — per load" value="KSh 300/load" />
            <PriceRow label="Laundry subscription" desc="Weekly pickup" value="KSh 1,000/mo" />
            <Link href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Book Cleaning &rarr;
            </Link>
          </div>
        </ScrollReveal>

        {/* Electricity & Water */}
        <ScrollReveal delay={3}>
          <div className="rate-card" style={{ height: "100%" }}>
            <CardHeader code="UT" title="Electricity & Water" />
            <p style={{ ...cardDescStyle, marginBottom: "1.25rem" }}>
              No more scrambling for tokens at midnight or arguing about water
              bills. We manage your utilities from KPLC token purchases to fair
              water billing through submetering.
            </p>
            <PriceRow
              label="KPLC token purchase"
              desc="We buy your tokens for you — send a request, get your token."
              value="KSh 50/txn"
            />
            <PriceRow
              label="Water billing"
              desc="Fair usage-based billing on master-metered properties. Transparent, no disputes."
              value="metered"
            />
            <Link href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Learn More &rarr;
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Convenience & Delivery */}
      <ScrollReveal>
        <div className="rate-card" style={{ marginBottom: "3rem" }}>
          <CardHeader code="CV" title="Convenience & Delivery" />
          <p style={{ ...cardDescStyle, marginBottom: "1.25rem" }}>
            We make daily life in your building easier with on-demand services.
          </p>
          <div className="services-grid-3">
            <PriceRow label="Parcel receiving & holding" value="KSh 50/parcel" />
            <PriceRow label="Gas cylinder delivery" desc="Delivery fee + cylinder cost" value="KSh 100 fee" />
            <PriceRow label="Water delivery (20L)" value="KSh 80/jerrycan" />
          </div>
          <Link href="/#contact" className="no-underline" style={ctaLinkStyle}>
            Order Now &rarr;
          </Link>
        </div>
      </ScrollReveal>

      {/* Smart Living Bundle */}
      <ScrollReveal>
        <div className="paper-ledger" style={{ maxWidth: "560px" }}>
          <div className="hero-statement-label uppercase">Bundle</div>
          <h3 className="hero-statement-title font-serif" style={{ fontSize: "1.5rem" }}>
            Smart Living Bundle
          </h3>
          <div style={{ marginBottom: "1.25rem" }}>
            {["Standard WiFi", "Weekly cleaning", "Monthly laundry subscription"].map((item) => (
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
            ))}
          </div>
          <div className="ledger-row">
            <span className="ledger-row-label">Priced separately</span>
            <span className="ledger-dots" aria-hidden="true" />
            <span className="ledger-row-value" style={{ color: "var(--muted)", fontWeight: 400 }}>
              KSh 3,200/mo
            </span>
          </div>
          <div className="ledger-row payoff">
            <span className="ledger-row-label">Bundled</span>
            <span className="ledger-dots" aria-hidden="true" />
            <span className="ledger-row-value">KSh 2,500/mo</span>
          </div>
          <Link
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
              marginTop: "1.5rem",
            }}
          >
            Get the Bundle
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
