import { Sparkles } from "lucide-react";
import ServicePageLayout from "@/components/marketing/ServicePageLayout";

export default function CleaningPage() {
  return (
    <ServicePageLayout
      tag="Property Care"
      title="Professional Cleaning"
      titleAccent="Services"
      Icon={Sparkles}
      intro="Clean properties attract better tenants, reduce complaints, and protect your investment. We offer regular maintenance cleaning for common areas, intensive deep cleaning for move-in/move-out, and specialised post-construction cleanup — all through our trained and supervised teams."
      features={[
        {
          title: "Regular Common Area Cleaning",
          desc: "Scheduled cleaning of corridors, staircases, parking areas, and shared spaces on a weekly or bi-weekly cadence. Includes sweeping, mopping, dusting, and waste disposal.",
        },
        {
          title: "Move-In / Move-Out Deep Clean",
          desc: "Intensive sanitisation of vacant units before new tenants move in: carpet treatment, kitchen degreasing, bathroom descaling, window cleaning, and full surface disinfection.",
        },
        {
          title: "Post-Construction Cleanup",
          desc: "After renovation or construction work — debris removal, cement/paint splatter cleaning, dust extraction, floor polishing, and window treatment. The unit is handed over move-in ready.",
        },
        {
          title: "Water Tank Cleaning",
          desc: "Periodic cleaning and treatment of rooftop and underground water storage tanks — essential for tenant health and compliance with county public health requirements.",
        },
        {
          title: "Compound & Landscaping",
          desc: "Grass cutting, hedge trimming, flower bed maintenance, and general compound upkeep. First impressions matter — a well-kept compound improves tenant retention.",
        },
        {
          title: "Waste Management",
          desc: "Coordination of garbage collection schedules with county services, provision of waste bins, and ensuring compliance with NEMA waste disposal regulations.",
        },
      ]}
      whyUs={[
        "Trained, supervised cleaning teams — not outsourced casuals",
        "Flexible scheduling — weekly, bi-weekly, or on-demand",
        "Move-in ready standard for every unit turnover",
        "Water tank cleaning for health and compliance",
        "Compound and landscaping maintenance included",
        "NEMA-compliant waste management coordination",
      ]}
      ctaText="Request a Cleaning Quote"
    />
  );
}
