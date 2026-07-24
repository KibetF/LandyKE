import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.landyke.com"),
  title: {
    default: "LandyKe — Property Management in Eldoret, Kenya",
    template: "%s | LandyKe",
  },
  description:
    "Professional property management in Eldoret, Kenya. Rent collection, tenant management, maintenance coordination, and full financial reporting for local and diaspora landlords.",
  openGraph: {
    type: "website",
    siteName: "LandyKe",
    locale: "en_KE",
    url: "https://www.landyke.com",
    title: "LandyKe — Property Management in Eldoret, Kenya",
    description:
      "Professional property management in Eldoret, Kenya. Rent collection, tenant management, maintenance coordination, and full financial reporting.",
  },
  verification: {
    other: {
      "facebook-domain-verification": "xjqdxxf672xpl53xm4tgbdzxasbzgp",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
