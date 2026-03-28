import { BarChart3 } from "lucide-react";
import ServicePageLayout from "@/components/marketing/ServicePageLayout";

export default function FinancialReportingPage() {
  return (
    <ServicePageLayout
      tag="Property Management"
      title="Financial Reporting &"
      titleAccent="Analytics"
      Icon={BarChart3}
      intro="Your client portal gives you full financial visibility — income by property, outstanding payments, expense tracking, year-to-date summaries, and documentation structured for KRA Monthly Rental Income (MRI) filings. Whether you're in Eldoret or overseas, you see exactly what's happening with your money."
      features={[
        {
          title: "Real-Time Dashboard",
          desc: "Log in anytime to see your portfolio snapshot: total rent collected, outstanding balances, occupancy rates, and recent transactions. Updated in real-time as payments come in.",
        },
        {
          title: "Monthly Owner Statements",
          desc: "Detailed statements showing income collected per property and unit, management fees deducted, maintenance expenses, and net disbursement amount. Available for download by the 5th of each month.",
        },
        {
          title: "KRA MRI-Ready Reports",
          desc: "Monthly income summaries structured specifically for KRA Monthly Rental Income declarations. Gross rent figures, tenant-by-tenant breakdowns, and annual totals — ready for your iTax filing.",
        },
        {
          title: "Expense Tracking",
          desc: "Every property expense — maintenance, county rates, NEMA fees, insurance — is logged, categorised, and visible in your portal. No hidden costs, no surprises.",
        },
        {
          title: "Year-to-Date Summaries",
          desc: "Consolidated annual reports showing total income, expenses, net returns, and occupancy trends across your entire portfolio. Essential for annual KRA returns filed by 30th June.",
        },
        {
          title: "Income vs. Budget Analysis",
          desc: "Compare actual performance against expected rent to identify collection gaps, seasonal patterns, and properties that need attention. Data-driven insights for portfolio optimisation.",
        },
      ]}
      whyUs={[
        "24/7 portal access — check your finances from anywhere in the world",
        "Reports structured for KRA MRI compliance out of the box",
        "Every expense documented and categorised automatically",
        "Monthly statements delivered by the 5th of each month",
        "Annual summaries ready for your KRA tax return deadline",
        "Transparent fee breakdowns — no hidden management charges",
      ]}
    />
  );
}
