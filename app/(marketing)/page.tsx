import HeroSection from "@/components/marketing/HeroSection";
import StatsBelt from "@/components/marketing/StatsBelt";
import ServicesGrid from "@/components/marketing/ServicesGrid";
import PortfolioSection from "@/components/marketing/PortfolioSection";
import HowItWorks from "@/components/marketing/HowItWorks";
import TrustSection from "@/components/marketing/TrustSection";
import CtaBand from "@/components/marketing/CtaBand";
import Footer from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBelt />
      <ServicesGrid />
      <PortfolioSection />
      <HowItWorks />
      <TrustSection />
      <CtaBand />
      <Footer />
    </>
  );
}
