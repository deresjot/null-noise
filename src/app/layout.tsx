import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteName } from "@/lib/constants";
import { getMetadataBase } from "@/lib/runtime-config";

import "./globals.css";

const headingFont = Fredoka({
  subsets: ["latin"],
  variable: "--font-heading-display",
});

const metadataBase = getMetadataBase();
const shareImageUrl = new URL("/og/og-null-noise-mobile-20260523.png", metadataBase).toString();
const shareTitle = "null-noise – Filme und Serien ruhiger auswählen";
const shareDescription =
  "Eine ruhige Entscheidungshilfe für Filme und Serien: erste Einschätzung, grobe Reizwirkung und klare Auswahl ohne Konto oder Tracking.";

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

const serviceWorkerRegistrationScript = `
(() => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const register = () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
})();
`;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: shareTitle,
    template: `%s · ${siteName}`,
  },
  description: shareDescription,
  applicationName: siteName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: ["/brand/favicon-32.png"],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    siteName,
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: shareImageUrl,
        width: 1200,
        height: 630,
        alt: "null-noise – Filme und Serien ruhiger auswählen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: [shareImageUrl],
  },
};

export const viewport: Viewport = {
  themeColor: "#fff6e5",
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
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerRegistrationScript }} />
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
