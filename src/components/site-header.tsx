"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navigationItems = [
  { href: "/suche", label: "Suche" },
  { href: "/erklaerung", label: "Einordnung" },
  { href: "/bedienung", label: "Hilfe" },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const syncMobileAppView = () => {
      const enabled = new URLSearchParams(window.location.search).get("view") === "app";

      if (enabled) {
        document.documentElement.dataset.mobileAppView = "true";
      } else {
        delete document.documentElement.dataset.mobileAppView;
      }
    };

    syncMobileAppView();
    window.addEventListener("popstate", syncMobileAppView);
    return () => {
      window.removeEventListener("popstate", syncMobileAppView);
      delete document.documentElement.dataset.mobileAppView;
    };
  }, []);

  useEffect(() => {
    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 10);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  return (
    <header className="site-header mobile-app-shell" data-scrolled={isScrolled ? "true" : "false"}>
      <nav aria-label="Sprunglinks" className="skip-links">
        <a className="skip-link" href="#top-menu">
          Zum Top-Menü springen
        </a>
        <a className="skip-link" href="#main-content">
          Zum Inhalt springen
        </a>
        <a className="skip-link" href="#site-footer">
          Zum Footer springen
        </a>
      </nav>
      <div className="shell header-inner">
        <Link aria-label="Null Noise – Startseite" className="brand" href="/">
          <span className="brand-image-frame" aria-hidden="true">
            <Image
              alt=""
              className="brand-image"
              height={1254}
              priority
              sizes="(max-width: 760px) 56px, 72px"
              src="/brand/nullnoise-logo.svg"
              width={1603}
            />
          </span>
          <span className="brand-wordmark-frame" aria-hidden="true">
            <Image
              alt=""
              className="brand-wordmark-image"
              height={1080}
              priority
              sizes="(max-width: 760px) 136px, 190px"
              src="/brand/nullnoise-wortmarke.svg"
              width={1920}
            />
          </span>
        </Link>
        <nav aria-label="Hauptnavigation" id="top-menu">
          <ul className="nav-list">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
