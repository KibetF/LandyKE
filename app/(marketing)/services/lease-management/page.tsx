import { FileText } from "lucide-react";
import ServicePageLayout from "@/components/marketing/ServicePageLayout";

export default function LeaseManagementPage() {
  return (
    <ServicePageLayout
      tag="Property Management"
      title="Lease Management &"
      titleAccent="Legal Compliance"
      Icon={FileText}
      intro="From drafting to renewal to termination, we handle every aspect of your lease agreements professionally and in full compliance with Kenyan law. We maintain a complete tenancy history for every unit, ensure proper stamp duty is paid, and manage the legal process if disputes arise."
      features={[
        {
          title: "Lease Drafting & Execution",
          desc: "Tenancy agreements drafted in line with Kenyan landlord-tenant law, covering rent terms, deposit conditions, maintenance responsibilities, notice periods, and permitted use. Every clause is designed to protect your interests.",
        },
        {
          title: "Stamp Duty Compliance",
          desc: "Under the Stamp Duty Act (Cap 480), lease agreements must be stamped — 1% of annual rent for leases of one year or less. We handle the filing through the eCitizen/Lands Ministry platform within the required 30-day window.",
        },
        {
          title: "Rent Reviews & Renewals",
          desc: "We manage lease renewal negotiations, including rent reviews based on current market conditions. All rent adjustments follow proper notice procedures as required by the lease terms and applicable tenancy law.",
        },
        {
          title: "Tenancy History Records",
          desc: "Every unit has a complete documented history — previous tenants, lease dates, rent amounts, deposit deductions, and move-in/move-out inspection reports. Full audit trail for every property.",
        },
        {
          title: "Lawful Eviction Process",
          desc: "When necessary, we follow the legal eviction process: written notice as per lease terms, court application if the tenant doesn't vacate, and execution through a court-appointed broker. No self-help evictions — everything by the book.",
        },
        {
          title: "County & NEMA Compliance",
          desc: "We ensure your properties maintain valid Uasin Gishu County single business permits, fire safety certificates, and NEMA compliance where required. These renewals are tracked and managed proactively.",
        },
      ]}
      whyUs={[
        "Lease agreements compliant with Kenyan landlord-tenant law",
        "Stamp duty filed within the statutory 30-day window",
        "Rent reviews based on current local market data",
        "Complete tenancy history maintained for every unit",
        "Lawful eviction process — court-backed, no self-help",
        "County permits, fire safety, and NEMA compliance tracked",
      ]}
    />
  );
}
