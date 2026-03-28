import type { ReactNode } from "react";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteClaim, siteDescription, siteName } from "@/lib/constants";
import { getMetadataBase } from "@/lib/runtime-config";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: siteName,
  description: `${siteClaim} ${siteDescription}`,
  openGraph: {
    title: siteName,
    description: `${siteClaim} ${siteDescription}`,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: `${siteClaim} ${siteDescription}`,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <SiteHeader />
        <main id="main-content" className="shell site-main">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
