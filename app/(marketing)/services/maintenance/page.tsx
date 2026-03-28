import { Wrench } from "lucide-react";
import ServicePageLayout from "@/components/marketing/ServicePageLayout";

export default function MaintenancePage() {
  return (
    <ServicePageLayout
      tag="Property Management"
      title="Maintenance"
      titleAccent="Coordination"
      Icon={Wrench}
      intro="From a leaking faucet to a full roof replacement, we coordinate every aspect of property maintenance through our network of vetted fundis, plumbers, electricians, and contractors. Every job is quoted, supervised, and documented — with costs logged transparently against your property ledger."
      features={[
        {
          title: "Vetted Contractor Network",
          desc: "We maintain a network of reliable, pre-qualified contractors across Eldoret — plumbers, electricians, painters, carpenters, and general fundis. Every contractor is vetted for quality, reliability, and fair pricing.",
        },
        {
          title: "Preventive Maintenance",
          desc: "Scheduled quarterly inspections cover plumbing, electrical systems, roofing, gutters, water tanks, and septic systems. Catching issues early saves you from costly emergency repairs.",
        },
        {
          title: "Emergency Response",
          desc: "Burst pipes, electrical faults, or security issues are handled within hours. Tenants report issues through our system, and we dispatch the right contractor immediately.",
        },
        {
          title: "Transparent Quoting",
          desc: "For non-emergency work, we obtain 2-3 competitive quotes before proceeding. You approve the cost before any work begins. No surprises on your statement.",
        },
        {
          title: "Work Supervision",
          desc: "Our team supervises all major repair and renovation work on-site — verifying quality, ensuring timelines are met, and confirming completion before releasing contractor payment.",
        },
        {
          title: "Utilities Management",
          desc: "We coordinate with KPLC for electricity, ELDOWAS for water supply, and manage borehole and septic maintenance. Utility issues are resolved without bothering you.",
        },
      ]}
      whyUs={[
        "Vetted contractor network across Eldoret and Uasin Gishu",
        "Quarterly preventive inspections to catch issues early",
        "Emergency response — critical issues addressed within hours",
        "Competitive quoting with owner approval before work begins",
        "Every expense logged and visible in your portal",
        "KPLC, ELDOWAS, and utility coordination handled for you",
      ]}
    />
  );
}
