import type { Metadata } from "next";
import ServicesHero from "@/components/marketing/services/ServicesHero";
import AudienceTabs from "@/components/marketing/services/AudienceTabs";
import TenantServices from "@/components/marketing/services/TenantServices";
import LandlordServices from "@/components/marketing/services/LandlordServices";
import WhyLandyKe from "@/components/marketing/services/WhyLandyKe";
import ServicesCta from "@/components/marketing/services/ServicesCta";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Services | LandyKe \u2014 Property Management, Internet, Maintenance & More",
  description:
    "Explore LandyKe\u2019s full range of property services for tenants and landlords in Eldoret, Kenya. WiFi packages, cleaning, maintenance, legal support, and more.",
};

export default function ServicesPage() {
  return (
    <div style={{ paddingTop: "72px" }}>
      <ServicesHero />
      <AudienceTabs
        tenantContent={<TenantServices />}
        ownerContent={<LandlordServices />}
      />
      <WhyLandyKe />
      <ServicesCta />
      <Footer />
    </div>
  );
}
