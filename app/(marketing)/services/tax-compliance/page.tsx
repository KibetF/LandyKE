import { Lock } from "lucide-react";
import ServicePageLayout from "@/components/marketing/ServicePageLayout";

export default function TaxCompliancePage() {
  return (
    <ServicePageLayout
      tag="Property Management"
      title="KRA Tax Compliance"
      titleAccent="Support"
      Icon={Lock}
      intro="Rental income tax is one of the most commonly misunderstood obligations for Kenyan landlords. We structure your monthly income reports for KRA Monthly Rental Income (MRI) declarations, help you understand your obligations, and ensure you stay fully compliant — avoiding late filing penalties of KES 2,000 per month and interest charges."
      features={[
        {
          title: "MRI Tax Guidance",
          desc: "Individual landlords with gross annual rental income between KES 288,000 and KES 15 million fall under the MRI regime — a simplified tax at 7.5% of gross monthly rent (Finance Act 2023). We ensure your reports match this structure exactly.",
        },
        {
          title: "Monthly Income Schedules",
          desc: "Each month, we provide a clear breakdown of gross rent collected per property and unit — the exact figures you need for your iTax MRI return. Due by the 20th of the following month.",
        },
        {
          title: "iTax Filing Support",
          desc: "We prepare the documentation needed for your monthly iTax filing: gross rental income figures, property details, and payment summaries. Your accountant or tax advisor can file directly using our reports.",
        },
        {
          title: "Withholding Tax Tracking",
          desc: "When your tenants are companies or institutions, they must withhold 10% of gross rent and remit to KRA on your behalf. We track withholding tax certificates and ensure you're credited correctly.",
        },
        {
          title: "Annual Return Preparation",
          desc: "By 30th June each year, landlords must file an annual rental income return. We provide consolidated 12-month summaries with all the figures needed for your annual KRA filing.",
        },
        {
          title: "Compliance Risk Alerts",
          desc: "KRA increasingly uses KPLC, county land rates, and water utility data to identify undeclared rental income. We help you stay ahead by ensuring all income is properly documented and declared.",
        },
      ]}
      whyUs={[
        "Reports structured for KRA MRI (7.5% of gross rent) compliance",
        "Monthly schedules ready before the 20th filing deadline",
        "Withholding tax certificates tracked for corporate tenants",
        "Annual summaries prepared for the 30th June return deadline",
        "Avoid late filing penalties — KES 2,000/month + 5% interest",
        "Proactive compliance in an era of increased KRA audits",
      ]}
      ctaText="Discuss Your Tax Obligations"
    />
  );
}
