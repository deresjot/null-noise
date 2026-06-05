"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const navigationItems = [
  { href: "/", label: "Start" },
  { href: "/suche", label: "Suche" },
  { href: "/erklaerung", label: "Erklärung / Hilfe" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("popstate", onStoreChange);
      return () => window.removeEventListener("popstate", onStoreChange);
    },
    () => window.location.pathname,
    () => "/",
  );

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
    if (!isMenuOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  return (
    <div className="navigation-region" id="top-menu">
      <button
        ref={menuButtonRef}
        aria-controls="mobile-menu"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Menü schließen" : "Menü öffnen"}
        className="mobile-menu-toggle"
        data-open={isMenuOpen ? "true" : "false"}
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
      <nav aria-label="Hauptnavigation" className="desktop-navigation">
        <ul className="nav-list">
          {navigationItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <li key={item.href}>
                <a
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : "false"}
                  href={item.href}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
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
          {navigationItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <li key={item.href}>
                <a
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : "false"}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
