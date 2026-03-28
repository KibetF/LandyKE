import { Home } from "lucide-react";
import ServicePageLayout from "@/components/marketing/ServicePageLayout";

export default function TenantAcquisitionPage() {
  return (
    <ServicePageLayout
      tag="Property Management"
      title="Tenant Acquisition &"
      titleAccent="Screening"
      Icon={Home}
      intro="Finding the right tenant is the single most important decision for your property's success. We handle the entire process — from marketing your vacancy to vetting applicants to executing legally compliant lease agreements — so you get reliable tenants who pay on time and care for your property."
      features={[
        {
          title: "Vacancy Marketing",
          desc: "We list your property across multiple platforms — BuyRentKenya, Property24, Jiji.co.ke, and social media — with professional photography and detailed descriptions to attract quality tenants quickly.",
        },
        {
          title: "Background & Reference Checks",
          desc: "Every applicant undergoes verification: employment confirmation, previous landlord references, and ID validation. We assess ability to pay and tenancy history before recommending any candidate.",
        },
        {
          title: "Lease Agreement Drafting",
          desc: "We prepare tenancy agreements compliant with Kenyan landlord-tenant law, covering rent terms, maintenance responsibilities, notice periods, and deposit conditions. All leases are stamped per the Stamp Duty Act (Cap 480).",
        },
        {
          title: "Move-In Inspections",
          desc: "A thorough property condition report with photographs is prepared at move-in, documenting every room, fixture, and appliance. This protects you during deposit resolution at move-out.",
        },
        {
          title: "Rent Pricing Advisory",
          desc: "We analyse comparable rents in your area — whether Langas, Kapsoya, Pioneer, or Huruma — to recommend pricing that maximises occupancy while reflecting current market rates.",
        },
        {
          title: "Vacancy Turnaround",
          desc: "Empty units cost money. We aim to fill vacancies within 14 days by maintaining a waiting list of pre-screened tenants and responding to enquiries within hours.",
        },
      ]}
      whyUs={[
        "Average vacancy turnaround of 14 days across our portfolio",
        "Every tenant undergoes background and employment verification",
        "Lease agreements drafted in compliance with Kenyan tenancy law",
        "Move-in condition reports with photographic evidence",
        "Competitive rent pricing based on real local market data",
        "Pre-screened tenant waiting lists for faster placements",
      ]}
    />
  );
}
