import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Fredoka } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteClaim, siteDescription, siteName } from "@/lib/constants";
import { getMetadataBase } from "@/lib/runtime-config";

import "./globals.css";

const headingFont = Fredoka({
  subsets: ["latin"],
  variable: "--font-heading-display",
});

const metadataBase = getMetadataBase();
const shareImageUrl = new URL("/og/og-null-noise-launch-v2.png", metadataBase).toString();

const rootHydrationGuardScript = `
(() => {
  const root = document.documentElement;
  const expectedClassName = ${JSON.stringify(headingFont.variable)};

  if (root.className !== expectedClassName) {
    root.className = expectedClassName;
  }

  if (root.lang !== "de") {
    root.lang = "de";
  }

  if (root.getAttribute("data-scroll-behavior") !== "smooth") {
    root.setAttribute("data-scroll-behavior", "smooth");
  }
})();
`;

export const metadata: Metadata = {
  metadataBase,
  title: siteName,
  description: `${siteClaim} ${siteDescription}`,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  openGraph: {
    title: siteName,
    description: `${siteClaim} ${siteDescription}`,
    images: [
      {
        url: shareImageUrl,
        width: 1200,
        height: 630,
        alt: "null-noise – Filme ruhiger schauen. Klarer wählen.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: `${siteClaim} ${siteDescription}`,
    images: [shareImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={headingFont.variable} data-scroll-behavior="smooth" lang="de">
      <head>
        <script dangerouslySetInnerHTML={{ __html: rootHydrationGuardScript }} />
        <link href="https://use.typekit.net/nqa2jtt.css" rel="stylesheet" />
      </head>
      <body>
        <SiteHeader />
        <div className="site-frame">
          <main id="main-content" className="shell site-main">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
