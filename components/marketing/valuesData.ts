// Shared by the homepage AboutSection and the /about values section.
export interface CompanyValue {
  key: string;
  title: string;
  desc: string;
}

export const companyValues: CompanyValue[] = [
  {
    key: "Integrity",
    title: "Integrity First",
    desc: "Every shilling is accounted for. Transparent reporting, no hidden fees, and full audit trails on every transaction.",
  },
  {
    key: "Visibility",
    title: "Full Visibility",
    desc: "Your client portal gives you real-time access to property performance, tenant status, and financial summaries — 24/7.",
  },
  {
    key: "Local",
    title: "Local Expertise",
    desc: "Deep knowledge of Kenyan property law, KRA compliance, and the Eldoret rental market — from CBD commercial units to residential estates.",
  },
  {
    key: "Growth",
    title: "Growth-Oriented",
    desc: "We don't just maintain — we optimise. Rent reviews, vacancy reduction strategies, and preventive maintenance to protect your asset value.",
  },
];
