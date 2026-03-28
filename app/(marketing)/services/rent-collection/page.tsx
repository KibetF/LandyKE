import { CreditCard } from "lucide-react";
import ServicePageLayout from "@/components/marketing/ServicePageLayout";

export default function RentCollectionPage() {
  return (
    <ServicePageLayout
      tag="Property Management"
      title="Rent Collection &"
      titleAccent="Arrears Management"
      Icon={CreditCard}
      intro="Consistent cash flow is the foundation of successful property investment. We collect rent via M-Pesa, bank transfer, and other methods preferred by your tenants, issue receipts for every transaction, and pursue arrears firmly but professionally — so you never have to make that awkward call."
      features={[
        {
          title: "M-Pesa & Bank Integration",
          desc: "Tenants pay via M-Pesa (Paybill/Till) or direct bank transfer. Every payment is tracked in real-time and matched to the correct tenant and unit. No cash handling, no ambiguity.",
        },
        {
          title: "Automated Reminders",
          desc: "Tenants receive SMS and WhatsApp reminders before rent is due, on the due date, and when payments are late. This systematic approach improves collection rates without confrontation.",
        },
        {
          title: "Receipt Issuance",
          desc: "Every payment generates an official receipt — timestamped, numbered, and linked to the property. These receipts form part of your KRA-ready documentation for Monthly Rental Income declarations.",
        },
        {
          title: "Arrears Follow-Up",
          desc: "We follow a structured escalation process: friendly reminder, formal demand notice, and if necessary, engagement of legal channels in accordance with Kenyan eviction procedures. No self-help evictions — everything is done lawfully.",
        },
        {
          title: "Owner Disbursement",
          desc: "Collected rent is disbursed to your bank account on a fixed schedule (typically by the 10th of each month), net of the management fee. Full transparency on every deduction.",
        },
        {
          title: "Payment Reporting",
          desc: "Your portal dashboard shows real-time payment status per tenant: paid, pending, or overdue. Monthly and year-to-date summaries are available for download at any time.",
        },
      ]}
      whyUs={[
        "94% average collection rate across all managed properties",
        "Multiple payment channels — M-Pesa, bank transfer, standing orders",
        "Real-time payment tracking visible in your client portal",
        "Structured arrears process — no confrontation, fully legal",
        "Monthly disbursements with detailed income breakdowns",
        "Every payment receipted and documented for KRA compliance",
      ]}
    />
  );
}
