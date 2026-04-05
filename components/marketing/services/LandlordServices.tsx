import {
  Building2,
  Wrench,
  Paintbrush,
  Search,
  Scale,
  CheckCircle,
} from "lucide-react";
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
        <div
          className="section-tag flex items-center uppercase"
          style={sectionTagStyle}
        >
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
          Maximize income,{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
            minimize headaches
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
          Let us handle everything. Choose the level of involvement you want &mdash;
          we scale to fit.
        </p>
      </ScrollReveal>

      {/* Property Management Packages */}
      <ScrollReveal>
        <div style={{ marginBottom: "3rem" }}>
          <div className="flex items-center" style={{ gap: "0.8rem", marginBottom: "2rem" }}>
            <Building2 size={28} color="var(--gold)" strokeWidth={1.5} />
            <h3 className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 600 }}>
              Property Management Packages
            </h3>
          </div>

          <div className="services-grid-3">
            {managementPackages.map((pkg, i) => (
              <ScrollReveal key={pkg.name} delay={Math.min(i + 1, 4)}>
                <div
                  className="service-card card-interactive"
                  style={{
                    ...cardStyle,
                    borderTop: pkg.popular ? "3px solid var(--gold)" : "3px solid transparent",
                    position: "relative",
                  }}
                >
                  {pkg.popular && (
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
                        marginBottom: "1rem",
                      }}
                    >
                      Most Popular
                    </span>
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
                        <CheckCircle
                          size={16}
                          color="var(--sage)"
                          strokeWidth={2}
                          style={{ marginTop: "2px", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 300 }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <a href="/#contact" className="no-underline" style={ctaLinkStyle}>
                    Choose {pkg.name} &rarr;
                  </a>
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
        <div className="service-card card-interactive" style={{ ...cardStyle, marginBottom: "3rem" }}>
          <Wrench
            size={32}
            color="var(--gold)"
            strokeWidth={1.5}
            style={{ marginBottom: "1.5rem" }}
          />
          <h3 className="font-serif" style={cardTitleStyle}>
            Maintenance &amp; Repairs
          </h3>
          <p style={{ ...cardDescStyle, marginBottom: "1.5rem" }}>
            Never get a midnight call about a burst pipe again. We coordinate all
            maintenance &mdash; plumbing, electrical, general repairs, and
            emergencies &mdash; through our vetted contractor network.
          </p>

          <div>
            <div style={pricingRowStyle}>
              <div>
                <div style={planLabelStyle}>Pay-As-You-Go</div>
                <div style={planDescStyle}>No retainer. You pay per job + 15% coordination fee</div>
              </div>
              <span style={priceStyle}>No monthly fee</span>
            </div>
            <div style={pricingRowStyle}>
              <div>
                <div style={planLabelStyle}>Maintenance Retainer</div>
                <div style={planDescStyle}>Priority response, 2 routine jobs/month, emergency coverage</div>
              </div>
              <span style={priceStyle}>KSh 3,000/mo</span>
            </div>
            <div style={{ ...pricingRowStyle, borderBottom: "none" }}>
              <div>
                <div style={planLabelStyle}>Full Coverage</div>
                <div style={planDescStyle}>Unlimited routine maintenance, emergency response, quarterly inspections</div>
              </div>
              <span style={priceStyle}>KSh 7,000/mo</span>
            </div>
          </div>

          <p style={noteStyle}>
            Material and parts costs billed separately at cost + 10%.
          </p>
          <a href="/#contact" className="no-underline" style={ctaLinkStyle}>
            Protect Your Property &rarr;
          </a>
        </div>
      </ScrollReveal>

      <div className="services-grid-3" style={{ marginBottom: "3rem" }}>
        {/* Renovation & Value Upgrades */}
        <ScrollReveal delay={1}>
          <div className="service-card card-interactive" style={cardStyle}>
            <Paintbrush
              size={32}
              color="var(--gold)"
              strokeWidth={1.5}
              style={{ marginBottom: "1.5rem" }}
            />
            <h3 className="font-serif" style={cardTitleStyle}>
              Renovation &amp; Value Upgrades
            </h3>
            <p style={{ ...cardDescStyle, marginBottom: "1.5rem" }}>
              Increase your rental income by investing smartly. We advise, quote,
              and manage renovation projects.
            </p>

            {/* 3-step process */}
            {[
              { step: "1", label: "Assessment", desc: "We inspect your property and identify high-ROI upgrades" },
              { step: "2", label: "Proposal", desc: "You receive a detailed quote with projected rent increase" },
              { step: "3", label: "Execution", desc: "We manage the renovation end-to-end" },
            ].map((s) => (
              <div
                key={s.step}
                className="flex"
                style={{ gap: "0.8rem", marginBottom: "0.8rem", alignItems: "flex-start" }}
              >
                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "rgba(200,150,62,0.12)",
                    color: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    flexShrink: 0,
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

            {/* ROI callout */}
            <div
              style={{
                background: "rgba(200,150,62,0.06)",
                borderLeft: "3px solid var(--gold)",
                borderRadius: "0 8px 8px 0",
                padding: "14px 16px",
                marginTop: "1.2rem",
              }}
            >
              <p style={{ fontSize: "0.8rem", color: "var(--ink)", lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
                &ldquo;Spend KSh 200,000 on a kitchen and bathroom refresh &rarr;
                increase rent by KSh 5,000/month. Payback in 40 months, then
                it&apos;s pure profit.&rdquo;
              </p>
            </div>

            <a href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Request Assessment &rarr;
            </a>
          </div>
        </ScrollReveal>

        {/* Tenant Placement */}
        <ScrollReveal delay={2}>
          <div className="service-card card-interactive" style={cardStyle}>
            <Search
              size={32}
              color="var(--gold)"
              strokeWidth={1.5}
              style={{ marginBottom: "1.5rem" }}
            />
            <h3 className="font-serif" style={cardTitleStyle}>
              Tenant Placement &amp; Listing
            </h3>
            <p style={{ ...cardDescStyle, marginBottom: "1.5rem" }}>
              Vacant units cost you money every day. We fill them fast with
              professional listings, quality photos, thorough screening, and quick
              turnaround.
            </p>

            <div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Standard Listing</div>
                </div>
                <span style={priceStyle}>KSh 2,000</span>
              </div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Premium Listing</div>
                  <div style={planDescStyle}>Professional photos + priority placement</div>
                </div>
                <span style={priceStyle}>KSh 5,000</span>
              </div>
              <div style={{ ...pricingRowStyle, borderBottom: "none" }}>
                <div>
                  <div style={planLabelStyle}>Tenant Placement Fee</div>
                  <div style={planDescStyle}>Successful placement only</div>
                </div>
                <span style={priceStyle}>50% of 1st month</span>
              </div>
            </div>

            <p style={noteStyle}>
              Placement fee only charged on successful move-in.
            </p>
            <a href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Fill My Vacancy &rarr;
            </a>
          </div>
        </ScrollReveal>

        {/* Legal & Compliance */}
        <ScrollReveal delay={3}>
          <div className="service-card card-interactive" style={cardStyle}>
            <Scale
              size={32}
              color="var(--gold)"
              strokeWidth={1.5}
              style={{ marginBottom: "1.5rem" }}
            />
            <h3 className="font-serif" style={cardTitleStyle}>
              Legal &amp; Compliance
            </h3>
            <p style={{ ...cardDescStyle, marginBottom: "1.5rem" }}>
              Stay on the right side of Kenyan tenancy law. We handle lease
              agreements, notices, eviction procedures, and regulatory compliance.
            </p>

            <div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Lease Agreement</div>
                  <div style={planDescStyle}>Drafting</div>
                </div>
                <span style={priceStyle}>KSh 1,500</span>
              </div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Tenant Notice</div>
                  <div style={planDescStyle}>Preparation &amp; delivery</div>
                </div>
                <span style={priceStyle}>KSh 500</span>
              </div>
              <div style={pricingRowStyle}>
                <div>
                  <div style={planLabelStyle}>Eviction Handling</div>
                  <div style={planDescStyle}>Full process</div>
                </div>
                <span style={priceStyle}>KSh 10,000</span>
              </div>
              <div style={{ ...pricingRowStyle, borderBottom: "none" }}>
                <div>
                  <div style={planLabelStyle}>Annual Compliance Review</div>
                </div>
                <span style={priceStyle}>KSh 5,000/yr</span>
              </div>
            </div>

            <a href="/#contact" className="no-underline" style={ctaLinkStyle}>
              Get Legal Support &rarr;
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* Complete Property Partner Bundle */}
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
            Complete Property Partner
          </h3>
          <p style={{ ...cardDescStyle, marginBottom: "1.5rem", maxWidth: "500px" }}>
            The all-in-one package for landlords who want total peace of mind.
          </p>

          <div style={{ marginBottom: "1.5rem" }}>
            {[
              "Premium Management Package (12%)",
              "Maintenance Retainer included",
              "2 free standard listings per year",
              "Annual compliance review included",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center"
                style={{ gap: "0.6rem", marginBottom: "0.5rem" }}
              >
                <CheckCircle
                  size={16}
                  color="var(--sage)"
                  strokeWidth={2}
                  style={{ flexShrink: 0 }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 400 }}>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex items-baseline flex-wrap" style={{ gap: "1rem", marginBottom: "0.5rem" }}>
            <span
              className="font-serif"
              style={{
                fontSize: "2.2rem",
                fontWeight: 600,
                color: "var(--gold)",
              }}
            >
              12% of rent + KSh 8,000/mo
            </span>
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--sage)",
              fontWeight: 500,
              marginBottom: "1.5rem",
            }}
          >
            Save KSh 4,000+/year vs &agrave; la carte
          </p>

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
            Become a Partner
          </a>
        </div>
      </ScrollReveal>
    </div>
  );
}
