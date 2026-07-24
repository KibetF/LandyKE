import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  CardHeader,
  PriceRow,
  GoldDot,
  sectionTagStyle,
  cardDescStyle,
  ctaLinkStyle,
  noteStyle,
} from "./RateCardParts";

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

const managementPackages = [
  {
    name: "Basic",
    price: "8%",
    priceSuffix: "of total rent collected",
    popular: false,
    features: [
      "Rent collection",
      "Tenant communication",
      "Basic reporting",
      "M-Pesa reconciliation",
    ],
  },
  {
    name: "Standard",
    price: "10%",
    priceSuffix: "of total rent collected",
    popular: true,
    features: [
      "Everything in Basic",
      "Monthly occupancy & income reports",
      "Maintenance coordination",
      "Tenant screening",
    ],
  },
  {
    name: "Premium",
    price: "12%",
    priceSuffix: "of total rent collected",
    popular: false,
    features: [
      "Everything in Standard",
      "Strategic pricing recommendations",
      "Quarterly property reviews",
      "Priority support",
      "Analytics dashboard via LandyKe platform",
    ],
  },
];

export default function LandlordServices() {
  return (
    <div>
      <ScrollReveal>
        <div className="section-tag flex items-center uppercase" style={sectionTagStyle}>
          Property Owner Services
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
          We run the property.{" "}
          <span style={{ color: "var(--gold)" }}>You read the statement.</span>
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
          Let us handle everything. Choose the level of involvement you want —
          we scale to fit.
        </p>
      </ScrollReveal>

      {/* Property Management Packages */}
      <ScrollReveal>
        <div style={{ marginBottom: "3rem" }}>
          <h3 className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "2rem" }}>
            Property Management Packages
          </h3>

          <div className="services-grid-3">
            {managementPackages.map((pkg, i) => (
              <ScrollReveal key={pkg.name} delay={Math.min(i + 1, 4)}>
                <div
                  className={`rate-card${pkg.popular ? " featured" : ""}`}
                  style={{ height: "100%" }}
                >
                  {pkg.popular && (
                    <div
                      className="uppercase"
                      style={{
                        fontSize: "0.62rem",
                        letterSpacing: "0.14em",
                        color: "var(--gold)",
                        fontWeight: 600,
                        marginBottom: "0.6rem",
                      }}
                    >
                      Most chosen
                    </div>
                  )}
                  <h4
                    className="font-serif"
                    style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "0.5rem" }}
                  >
                    {pkg.name}
                  </h4>
                  <div className="flex items-baseline" style={{ gap: "0.4rem", marginBottom: "1.5rem" }}>
                    <span
                      className="font-serif"
                      style={{ fontSize: "2rem", fontWeight: 600, color: "var(--gold)" }}
                    >
                      {pkg.price}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 300 }}>
                      {pkg.priceSuffix}
                    </span>
                  </div>
                  <div>
                    {pkg.features.map((f) => (
                      <div
                        key={f}
                        className="flex"
                        style={{ gap: "0.6rem", marginBottom: "0.6rem", alignItems: "flex-start" }}
                      >
                        <GoldDot />
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 300 }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link href="/#contact" className="no-underline" style={ctaLinkStyle}>
                    Choose {pkg.name} &rarr;
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <p style={noteStyle}>
            Minimum 6-month engagement. Fees calculated on gross rent collected.
          </p>
        </div>
      </ScrollReveal>

      {/* Maintenance & Repairs */}
      <ScrollReveal>
        <div className="rate-card" style={{ marginBottom: "3rem" }}>
          <CardHeader code="MR" title="Maintenance & Repairs" />
          <p style={{ ...cardDescStyle, marginBottom: "1.25rem" }}>
            Never get a midnight call about a burst pipe again. We coordinate all
            maintenance — plumbing, electrical, general repairs, and
            emergencies — through our vetted contractor network.
          </p>
          <PriceRow
            label="Pay-As-You-Go"
            desc="No retainer. You pay per job + 15% coordination fee"
            value="No monthly fee"
          />
          <PriceRow
            label="Maintenance Retainer"
            desc="Priority response, 2 routine jobs/month, emergency coverage"
            value="KSh 3,000/mo"
          />
          <PriceRow
            label="Full Coverage"
            desc="Unlimited routine maintenance, emergency response, quarterly inspections"
            value="KSh 7,000/mo"
          />
          <p style={noteStyle}>Material and parts costs billed separately at cost + 10%.</p>
          <Link href="/#contact" className="no-underline" style={ctaLinkStyle}>
            Protect Your Property &rarr;
          </Link>
        </div>
      </ScrollReveal>

      <div className="services-grid-3" style={{ marginBottom: "3rem" }}>
        {/* Renovation & Value Upgrades */}
        <ScrollReveal delay={1}>
          <div className="rate-card" style={{ height: "100%" }}>
            <CardHeader code="RV" title="Renovation & Upgrades" />
            <p style={{ ...cardDescStyle, marginBottom: "1.25rem" }}>
              Increase your rental income by investing smartly. We advise, quote,
              and manage renovation projects.
            </p>

            {[
              { step: "1", label: "Assessment", desc: "We inspect your property and identify high-ROI upgrades" },
              { step: "2", label: "Proposal", desc: "You receive a detailed quote with projected rent increase" },
              { step: "3", label: "Execution", desc: "We manage the renovation end-to-end" },
            ].map((s) => (
              <div
                key={s.step}
                className="flex"
                style={{ gap: "0.8rem", marginBottom: "0.8rem", alignItems: "baseline" }}
              >
                <span
                  className="font-serif"
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 300,
                    color: "var(--gold)",
                    flexShrink: 0,
                    width: "1rem",
                  }}
                >
                  {s.step}
                </span>
                <div>
                  <div style={planLabelStyle}>{s.label}</div>
                  <div style={planDescStyle}>{s.desc}</div>
                </div>
              </div>
            ))}

            <div
              style={{
                borderLeft: "3px solid var(--gold)",
                padding: "0.5rem 0 0.5rem 1rem",
                marginTop: "1.2rem",
              }}
            >
              <p style={{ fontSize: "0.8rem", color: "var(--ink)", lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
                &ldquo;Spend KSh 200,000 on a kitchen and bathroom refresh &rarr;
                increase rent by KSh 5,000/month. Payback in 40 months, then
                it&apos;s pure profit.&rdquo;
              </p>
            </div>

            <Link href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Request Assessment &rarr;
            </Link>
          </div>
        </ScrollReveal>

        {/* Tenant Placement */}
        <ScrollReveal delay={2}>
          <div className="rate-card" style={{ height: "100%" }}>
            <CardHeader code="TP" title="Tenant Placement" />
            <p style={{ ...cardDescStyle, marginBottom: "1.25rem" }}>
              Vacant units cost you money every day. We fill them fast with
              professional listings, quality photos, thorough screening, and quick
              turnaround.
            </p>
            <PriceRow label="Standard Listing" value="KSh 2,000" />
            <PriceRow label="Premium Listing" desc="Professional photos + priority placement" value="KSh 5,000" />
            <PriceRow label="Tenant Placement Fee" desc="Successful placement only" value="50% of 1st month" />
            <p style={noteStyle}>Placement fee only charged on successful move-in.</p>
            <Link href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Fill My Vacancy &rarr;
            </Link>
          </div>
        </ScrollReveal>

        {/* Legal & Compliance */}
        <ScrollReveal delay={3}>
          <div className="rate-card" style={{ height: "100%" }}>
            <CardHeader code="LC" title="Legal & Compliance" />
            <p style={{ ...cardDescStyle, marginBottom: "1.25rem" }}>
              Stay on the right side of Kenyan tenancy law. We handle lease
              agreements, notices, eviction procedures, and regulatory compliance.
            </p>
            <PriceRow label="Lease Agreement" desc="Drafting" value="KSh 1,500" />
            <PriceRow label="Tenant Notice" desc="Preparation & delivery" value="KSh 500" />
            <PriceRow label="Eviction Handling" desc="Full process" value="KSh 10,000" />
            <PriceRow label="Annual Compliance Review" value="KSh 5,000/yr" />
            <Link href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Get Legal Support &rarr;
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Complete Property Partner Bundle */}
      <ScrollReveal>
        <div className="paper-ledger" style={{ maxWidth: "560px" }}>
          <div className="hero-statement-label uppercase">Bundle</div>
          <h3 className="hero-statement-title font-serif" style={{ fontSize: "1.5rem" }}>
            Complete Property Partner
          </h3>
          <p style={{ ...cardDescStyle, marginBottom: "1.25rem" }}>
            The all-in-one package for landlords who want total peace of mind.
          </p>
          <div className="ledger-row">
            <span className="ledger-row-label">Premium management</span>
            <span className="ledger-dots" aria-hidden="true" />
            <span className="ledger-row-value">12% of rent</span>
          </div>
          <div className="ledger-row">
            <span className="ledger-row-label">Maintenance retainer</span>
            <span className="ledger-dots" aria-hidden="true" />
            <span className="ledger-row-value">included</span>
          </div>
          <div className="ledger-row">
            <span className="ledger-row-label">Standard listings</span>
            <span className="ledger-dots" aria-hidden="true" />
            <span className="ledger-row-value">2 free/yr</span>
          </div>
          <div className="ledger-row">
            <span className="ledger-row-label">Compliance review</span>
            <span className="ledger-dots" aria-hidden="true" />
            <span className="ledger-row-value">annual</span>
          </div>
          <div className="ledger-row payoff">
            <span className="ledger-row-label">All-in</span>
            <span className="ledger-dots" aria-hidden="true" />
            <span className="ledger-row-value" style={{ fontSize: "1.2rem" }}>
              12% + KSh 8,000/mo
            </span>
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
              fontWeight: 300,
              marginTop: "0.75rem",
            }}
          >
            Saves KSh 4,000+ per year versus à la carte.
          </p>
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
              marginTop: "1.25rem",
            }}
          >
            Become a Partner
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
