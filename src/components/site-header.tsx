import Link from "next/link";

import { MascotMark } from "@/components/mascot-mark";

const navigationItems = [
  { href: "/suche", label: "Suche" },
  { href: "/erklaerung", label: "Was bedeutet das?" },
  { href: "/bedienung", label: "So funktioniert die Bedienung" },
];

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <MascotMark decorative />
            </span>
            <span className="brand-copy">
              <strong>null-noise</strong>
              <span>ruhiger schauen, klarer wählen</span>
            </span>
          </Link>
          <nav aria-label="Hauptnavigation">
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
    </>
  );
}
