/* eslint-disable @next/next/no-img-element */

"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
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

function getMenuCloseDuration() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 190;
}

export function SiteNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuRendered, setIsMenuRendered] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const menuCloseTimerRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);
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

    window.requestAnimationFrame(() => {
      mobileMenuRef.current?.querySelector<HTMLElement>(".mobile-navigation-close")?.focus();
    });

    const main = document.querySelector<HTMLElement>("main");
    const footer = document.querySelector<HTMLElement>("#site-footer");
    const inertTargets = [main, footer].filter((target): target is HTMLElement => Boolean(target));
    const bodyStyle = document.body.style;
    const previousBodyOverflow = bodyStyle.overflow;
    const previousBodyPosition = bodyStyle.position;
    const previousBodyTop = bodyStyle.top;
    const previousBodyWidth = bodyStyle.width;

    scrollPositionRef.current = window.scrollY;
    bodyStyle.overflow = "hidden";
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollPositionRef.current}px`;
    bodyStyle.width = "100%";

    inertTargets.forEach((target) => {
      target.setAttribute("aria-hidden", "true");
      (target as HTMLElement & { inert?: boolean }).inert = true;
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (menuCloseTimerRef.current !== null) {
          window.clearTimeout(menuCloseTimerRef.current);
        }

        setIsMenuOpen(false);
        menuCloseTimerRef.current = window.setTimeout(() => {
          setIsMenuRendered(false);
          menuCloseTimerRef.current = null;
        }, getMenuCloseDuration());
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }

      if (event.key !== "Tab" || !mobileMenuRef.current) {
        return;
      }

      const focusableElements = Array.from(
        mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);

      if (!focusableElements.length) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      inertTargets.forEach((target) => {
        target.removeAttribute("aria-hidden");
        (target as HTMLElement & { inert?: boolean }).inert = false;
      });
      bodyStyle.overflow = previousBodyOverflow;
      bodyStyle.position = previousBodyPosition;
      bodyStyle.top = previousBodyTop;
      bodyStyle.width = previousBodyWidth;
      window.scrollTo(0, scrollPositionRef.current);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      if (menuCloseTimerRef.current !== null) {
        window.clearTimeout(menuCloseTimerRef.current);
      }
    };
  }, []);

  function openMenu() {
    if (menuCloseTimerRef.current !== null) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }

    setIsMenuRendered(true);
    setIsMenuOpen(true);
  }

  function closeMenu() {
    if (menuCloseTimerRef.current !== null) {
      window.clearTimeout(menuCloseTimerRef.current);
    }

    setIsMenuOpen(false);
    menuCloseTimerRef.current = window.setTimeout(() => {
      setIsMenuRendered(false);
      menuCloseTimerRef.current = null;
    }, getMenuCloseDuration());
  }

  function closeMenuWithFocusReturn() {
    closeMenu();
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  return (
    <div className="navigation-region" id="top-menu">
      <button
        ref={menuButtonRef}
        aria-controls="mobile-menu"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Menü schließen" : "Menü öffnen"}
        className="mobile-menu-toggle"
        data-open={isMenuOpen ? "true" : "false"}
        tabIndex={0}
        type="button"
        onClick={() => (isMenuOpen ? closeMenuWithFocusReturn() : openMenu())}
      >
        <span className="mobile-menu-toggle-icon" aria-hidden="true">
          {isMenuOpen ? <X size={18} strokeWidth={2.8} /> : <Menu size={18} strokeWidth={2.8} />}
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
                  tabIndex={0}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <nav
        ref={mobileMenuRef}
        aria-label="Mobile Navigation"
        className="mobile-navigation"
        data-open={isMenuOpen ? "true" : "false"}
        data-state={isMenuOpen ? "open" : "closing"}
        hidden={!isMenuRendered}
        id="mobile-menu"
      >
        <div className="mobile-navigation-panel">
          <div className="mobile-navigation-head">
            <Link
              aria-label="Null Noise – Startseite"
              className="mobile-navigation-brand"
              href="/"
              tabIndex={0}
            >
              <span className="mobile-navigation-brand-image-frame" aria-hidden="true">
                <img
                  alt=""
                  className="mobile-navigation-brand-image"
                  height={1254}
                  src="/brand/nullnoise-logo.svg"
                  width={1603}
                />
              </span>
              <span className="mobile-navigation-brand-wordmark-frame" aria-hidden="true">
                <img
                  alt=""
                  className="mobile-navigation-brand-wordmark"
                  height={1080}
                  src="/brand/nullnoise-wortmarke.svg"
                  width={1920}
                />
              </span>
            </Link>
            <button
              className="mobile-navigation-close"
              tabIndex={0}
              type="button"
              onClick={closeMenuWithFocusReturn}
            >
              <X aria-hidden="true" size={18} strokeWidth={2.8} />
              <span>Schließen</span>
            </button>
          </div>

          <ul className="mobile-nav-list">
            {navigationItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <li key={item.href}>
                  <a
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    data-active={active ? "true" : "false"}
                    href={item.href}
                    tabIndex={0}
                    onClick={closeMenu}
                  >
                    <span className="mobile-nav-link-copy">
                      <span className="mobile-nav-link-label">{item.label}</span>
                      {active ? (
                        <span className="mobile-nav-link-state" aria-hidden="true">
                          Aktuelle Seite
                        </span>
                      ) : null}
                    </span>
                    <ArrowRight aria-hidden="true" size={19} strokeWidth={2.8} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
