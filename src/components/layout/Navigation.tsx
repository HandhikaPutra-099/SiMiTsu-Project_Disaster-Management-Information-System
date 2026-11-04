import { useEffect, useState } from "react";

const links = [
  ["Beranda", "#hero"],
  ["Edukasi", "#education"],
  ["Peta Tsunami", "#map"],
  ["Simulator", "#simulator"],
  ["Database", "#database"],
  ["Mitigasi", "#mitigation"],
] as const;

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("hero");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function updateScrollState() {
      const sections = links
        .map(([, href]) => document.querySelector<HTMLElement>(href))
        .filter((section): section is HTMLElement => section !== null)
        .sort((first, second) => first.offsetTop - second.offsetTop);

      let current = "hero";
      sections.forEach((section) => {
        const scrollMargin = Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 80;
        if (window.scrollY >= section.offsetTop - scrollMargin - 1) current = section.id;
      });

      setActiveSection(current);
      setShowScrollTop(window.scrollY > 300);
      setScrolled(window.scrollY > 40);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.querySelector<HTMLButtonElement>(".nav-menu-toggle")?.focus();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
      <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
        <nav aria-label="Navigasi utama">
          <a className="nav-brand" href="#hero" aria-label="SIMITSU, beranda">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 22 Q8 11 16 18 Q24 25 30 12" stroke="#27c6dc" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M2 27 Q9 16 16 23 Q23 30 30 17" stroke="#27c6dc" strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
              <circle cx="16" cy="8" r="3.5" fill="#f97316" />
            </svg>
            <span className="nav-brand-text">SIMITSU</span>
          </a>

          <button
            className="nav-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" width="20" height="20">
              {menuOpen ? (
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
            <span>{menuOpen ? "Tutup" : "Menu"}</span>
          </button>

          <div className={`nav-links${menuOpen ? " is-open" : ""}`} id="primary-navigation">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className={activeSection === href.slice(1) ? "active" : undefined}
                aria-current={activeSection === href.slice(1) ? "location" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <button
        id="scrollTop"
        className={`scroll-top${showScrollTop ? " show" : ""}`}
        type="button"
        aria-label="Kembali ke bagian atas"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" width="18" height="18">
          <path d="M10 16V4M4 10l6-6 6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
