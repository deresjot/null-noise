import Link from "next/link";

const navigationItems = [
  { href: "/suche", label: "Suche" },
  { href: "/erklaerung", label: "Lesart" },
  { href: "/bedienung", label: "Hilfe" },
];

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link aria-label="null-noise Startseite" className="brand" href="/">
            <span aria-hidden="true" className="brand-mark">
              <span className="brand-mark-shape brand-mark-shape-blue" />
              <span className="brand-mark-shape brand-mark-shape-yellow" />
              <span className="brand-mark-shape brand-mark-shape-coral" />
              <span className="brand-mark-face">
                <span className="brand-mark-eye brand-mark-eye-left" />
                <span className="brand-mark-eye brand-mark-eye-right" />
                <span className="brand-mark-mouth" />
              </span>
            </span>
            <span className="brand-wordmark">null-noise</span>
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
