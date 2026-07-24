import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface ServiceEntry {
  code: string;
  title: string;
  desc: string;
  href: string;
}

const managementServices: ServiceEntry[] = [
  {
    code: "TA",
    title: "Tenant Acquisition",
    desc: "We market your property, vet prospective tenants thoroughly through background and reference checks, and handle all leasing agreements in accordance with Kenyan landlord-tenant law.",
    href: "/services/tenant-acquisition",
  },
  {
    code: "RC",
    title: "Rent Collection",
    desc: "Monthly rent collection via M-Pesa, bank transfer, or other preferred methods. We track every payment, issue receipts, and chase arrears so you never have to make that call.",
    href: "/services/rent-collection",
  },
  {
    code: "FR",
    title: "Financial Reporting",
    desc: "Your client portal gives you real-time visibility — income by property, outstanding payments, year-to-date summaries, and documentation ready for KRA MRI filings.",
    href: "/services/financial-reporting",
  },
  {
    code: "MC",
    title: "Maintenance Coordination",
    desc: "From plumbing to painting, we coordinate vetted contractors, obtain quotes, supervise work, and keep costs transparent. Every expense logged against your property ledger.",
    href: "/services/maintenance",
  },
  {
    code: "LM",
    title: "Lease Management",
    desc: "Drafting, renewals, rent reviews, and terminations — handled professionally. We maintain a full tenancy history for every unit and ensure your properties stay legally compliant.",
    href: "/services/lease-management",
  },
  {
    code: "TX",
    title: "Tax Compliance Support",
    desc: "We provide monthly income summaries structured for KRA Monthly Rental Income (MRI) declarations, helping you remain fully compliant and avoid penalties from the taxman.",
    href: "/services/tax-compliance",
  },
];

const careServices: ServiceEntry[] = [
  {
    code: "RG",
    title: "Regular Cleaning",
    desc: "Scheduled cleaning for common areas, corridors, and vacant units on weekly/bi-weekly cadence.",
    href: "/services/cleaning",
  },
  {
    code: "DC",
    title: "Deep Cleaning",
    desc: "Intensive move-in/move-out sanitisation — carpet treatment, kitchen degreasing, bathroom descaling.",
    href: "/services/cleaning",
  },
  {
    code: "AC",
    title: "After-Construction Cleaning",
    desc: "Post-build cleanup — debris removal, dust extraction, window polishing, floor treatment.",
    href: "/services/cleaning",
  },
  {
    code: "GR",
    title: "General Repairs & Upkeep",
    desc: "Plumbing, electrical, painting, carpentry via vetted contractor network + preventive maintenance.",
    href: "/services/repairs",
  },
];

function DirectoryRow({ s }: { s: ServiceEntry }) {
  return (
    <Link href={s.href} className="directory-row no-underline">
      <div className="directory-row-title">
        <span className="directory-code">{s.code}</span>
        <span className="directory-name font-serif">{s.title}</span>
        <span className="directory-dots" aria-hidden="true" />
        <ArrowUpRight size={15} strokeWidth={2} className="directory-arrow" />
      </div>
      <p className="directory-desc">{s.desc}</p>
    </Link>
  );
}

export default function ServicesGrid() {
  return (
    <section id="services" className="marketing-section">
      <ScrollReveal>
        <div className="directory-panel">
          <div className="directory-header">
            <div className="directory-tag uppercase">Service Directory</div>
            <h2 className="font-serif directory-heading">
              Ten services. One point of contact.
            </h2>
            <p className="directory-subtext">
              From tenant sourcing to tax filing, every property task lives
              in one directory below — no separate vendors, no chasing
              updates.
            </p>
          </div>

          <div className="directory-group">
            <div className="directory-group-label uppercase">
              Property Management
            </div>
            {managementServices.map((s) => (
              <DirectoryRow key={s.code} s={s} />
            ))}
          </div>

          <div className="directory-group">
            <div className="directory-group-label uppercase">
              Property Care
            </div>
            {careServices.map((s) => (
              <DirectoryRow key={s.code} s={s} />
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
