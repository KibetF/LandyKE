import Navbar from "@/components/marketing/Navbar";

// LocalBusiness structured data for Google local search / rich results.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "LandyKe Property Management",
  url: "https://www.landyke.com",
  email: "yafredkibet@gmail.com",
  telephone: "+254759342765",
  foundingDate: "2021",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kapsoya, near Moi Girls High School",
    addressLocality: "Eldoret",
    addressRegion: "Uasin Gishu County",
    addressCountry: "KE",
  },
  areaServed: {
    "@type": "City",
    name: "Eldoret",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "17:00",
  },
  description:
    "Professional property management in Eldoret, Kenya. Rent collection, tenant management, maintenance coordination, and full financial reporting for local and diaspora landlords.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
      <Navbar />
      {children}
    </>
  );
}
