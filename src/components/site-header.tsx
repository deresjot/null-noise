"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigationItems = [
  { href: "/", label: "Start" },
  { href: "/suche", label: "Suche" },
  { href: "/erklaerung", label: "Erklärung / Hilfe" },
];

const mobileNavigationItems = [
  ...navigationItems,
  { href: "/barrierefreiheit", label: "Barrierefreiheit" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/impressum", label: "Impressum" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

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
        <button
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
          className="mobile-menu-toggle"
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span className="mobile-menu-toggle-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>{isMenuOpen ? "Schließen" : "Menü"}</span>
        </button>
        <div className="navigation-region" id="top-menu">
          <nav aria-label="Hauptnavigation" className="desktop-navigation">
            <ul className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                    data-active={isActivePath(pathname, item.href) ? "true" : "false"}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav
            aria-label="Mobile Navigation"
            className="mobile-navigation"
            data-open={isMenuOpen ? "true" : "false"}
            hidden={!isMenuOpen}
            id="mobile-menu"
          >
            <ul className="mobile-nav-list">
              {mobileNavigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                    data-active={isActivePath(pathname, item.href) ? "true" : "false"}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
