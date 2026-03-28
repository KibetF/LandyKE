import { Wrench } from "lucide-react";
import ServicePageLayout from "@/components/marketing/ServicePageLayout";

export default function RepairsPage() {
  return (
    <ServicePageLayout
      tag="Property Care"
      title="General Repairs &"
      titleAccent="Upkeep"
      Icon={Wrench}
      intro="From routine fixes to scheduled preventive maintenance, we keep your property in excellent condition through our network of vetted contractors across Eldoret. Every repair is quoted, approved, supervised, and documented — with costs tracked transparently in your portal."
      features={[
        {
          title: "Plumbing",
          desc: "Leaking taps, blocked drains, burst pipes, toilet repairs, water heater installation, and septic system maintenance. Our plumbers are available for emergencies and scheduled work.",
        },
        {
          title: "Electrical",
          desc: "Socket and switch replacement, wiring repairs, circuit breaker issues, security lighting installation, and KPLC meter coordination. All work done by licensed electricians.",
        },
        {
          title: "Painting & Finishes",
          desc: "Interior and exterior painting, wall crack repair, ceiling restoration, and tiling work. We schedule repainting between tenancies to maintain property appeal.",
        },
        {
          title: "Carpentry & Joinery",
          desc: "Door and window repairs, lock replacements, cabinet fixes, wardrobe installation, and custom woodwork. Quality craftsmanship from experienced fundis.",
        },
        {
          title: "Roofing & Waterproofing",
          desc: "Leak detection, iron sheet replacement, gutter cleaning, and waterproofing for flat roofs. Preventive roof inspections save you from costly water damage.",
        },
        {
          title: "Security Installations",
          desc: "Gate and fence repairs, padlock and deadbolt upgrades, CCTV installation coordination, and security lighting. Keeping your tenants safe and your property secure.",
        },
      ]}
      whyUs={[
        "Vetted, reliable contractors across all trades in Eldoret",
        "Competitive quoting — 2-3 quotes for major work",
        "Owner approval required before any non-emergency spend",
        "On-site supervision for all major repair projects",
        "Preventive maintenance to catch problems before they escalate",
        "Every cost documented and visible in your portal",
      ]}
      ctaText="Request a Repair Quote"
    />
  );
}
