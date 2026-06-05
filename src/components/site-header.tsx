/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { SiteNavigation } from "@/components/site-navigation";

export function SiteHeader() {
  return (
    <header className="site-header mobile-app-shell">
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
        <a aria-label="Null Noise – Startseite" className="brand" href="/">
          <span className="brand-image-frame" aria-hidden="true">
            <img
              alt=""
              className="brand-image"
              height={1254}
              src="/brand/nullnoise-logo.svg"
              width={1603}
            />
          </span>
          <span className="brand-wordmark-frame" aria-hidden="true">
            <img
              alt=""
              className="brand-wordmark-image"
              height={1080}
              src="/brand/nullnoise-wortmarke.svg"
              width={1920}
            />
          </span>
        </a>
        <SiteNavigation />
      </div>
    </header>
  );
}
