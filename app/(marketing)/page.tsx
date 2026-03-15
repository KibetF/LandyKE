import HeroSection from "@/components/marketing/HeroSection";
import StatsBelt from "@/components/marketing/StatsBelt";
import ServicesGrid from "@/components/marketing/ServicesGrid";
import PortfolioSection from "@/components/marketing/PortfolioSection";
import HowItWorks from "@/components/marketing/HowItWorks";
import AboutSection from "@/components/marketing/AboutSection";
import TrustSection from "@/components/marketing/TrustSection";
import CtaBand from "@/components/marketing/CtaBand";
import ContactSection from "@/components/marketing/ContactSection";
import Footer from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBelt />
      <ServicesGrid />
      <PortfolioSection />
      <HowItWorks />
      <AboutSection />
      <TrustSection />
      <CtaBand />
      <ContactSection />
      <Footer />
    </>
  );
}
