import HeroSection from "@/components/marketing/HeroSection";
import StatsBelt from "@/components/marketing/StatsBelt";
import ServicesGrid from "@/components/marketing/ServicesGrid";
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
      <HowItWorks />
      <TrustSection />
      <CtaBand />
      <Footer />
    </>
  );
}
