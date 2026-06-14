import { Suspense, type ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";

import { NavigationProgress } from "@/components/navigation-progress";
import { PreviewGate } from "@/components/preview-gate";
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

  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  const isLocalHost = localHosts.has(window.location.hostname);

  const clearLocalServiceWorker = async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("null-noise-"))
          .map((cacheName) => caches.delete(cacheName)),
      );
    }
  };

  const register = () => {
    if (isLocalHost) {
      clearLocalServiceWorker().catch(() => {});
      return;
    }

    if (window.location.protocol !== "https:") {
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
})();
`;

const focusRestoreScript = `
(() => {
  const storageKeyPrefix = "null-noise:last-focus:";
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "summary",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const getRouteKey = () => window.location.pathname + window.location.search + window.location.hash;
  const getFocusables = () =>
    Array.from(document.querySelectorAll(focusableSelector)).filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      if (element.hidden || element.closest("[hidden]")) return false;
      return element.tabIndex >= 0;
    });

  const getSignature = (element) => [
    element.tagName,
    element.getAttribute("href") || "",
    element.getAttribute("name") || "",
    element.getAttribute("type") || "",
    element.textContent ? element.textContent.trim().replace(/\\s+/g, " ").slice(0, 80) : "",
  ].join("|");

  const isReload = () => {
    const navigation = performance.getEntriesByType("navigation")[0];
    return navigation ? navigation.type === "reload" : performance.navigation?.type === 1;
  };

  let isRestoringReloadFocus = isReload();

  const saveFocus = (event) => {
    if (isRestoringReloadFocus) return;

    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(focusableSelector)) return;

    const focusables = getFocusables();
    const index = focusables.indexOf(target);
    if (index < 0) return;

    try {
      sessionStorage.setItem(
        storageKeyPrefix + getRouteKey(),
        JSON.stringify({ index, signature: getSignature(target) }),
      );
    } catch {}
  };

  const restoreFocus = (attempt = 0) => {
    if (!isRestoringReloadFocus) return;

    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(storageKeyPrefix + getRouteKey()) || "null");
    } catch {
      saved = null;
    }

    if (!saved || typeof saved.index !== "number") return;

    const focusables = getFocusables();
    const exactMatch = focusables.find((element) => getSignature(element) === saved.signature);
    const fallback = focusables[saved.index];
    const target = exactMatch || (attempt >= 60 ? fallback : null);

    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: false });
      if (attempt < 10) {
        window.setTimeout(() => restoreFocus(attempt + 1), 100);
        return;
      }
      isRestoringReloadFocus = false;
      return;
    }

    if (attempt < 60) {
      window.setTimeout(() => restoreFocus(attempt + 1), 100);
      return;
    }

    isRestoringReloadFocus = false;
  };

  document.addEventListener("focusin", saveFocus);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.requestAnimationFrame(restoreFocus), {
      once: true,
    });
  } else {
    window.requestAnimationFrame(restoreFocus);
  }

  window.addEventListener("load", () => window.setTimeout(() => restoreFocus(0), 250), {
    once: true,
  });
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
  alternates: {
    canonical: "/",
  },
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
    url: "/",
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
        <script dangerouslySetInnerHTML={{ __html: focusRestoreScript }} />
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerRegistrationScript }} />
      </head>
      <body>
        <PreviewGate>
          <SiteHeader />
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <div className="site-frame">
            <main id="main-content" className="shell site-main" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </PreviewGate>
      </body>
    </html>
  );
}
