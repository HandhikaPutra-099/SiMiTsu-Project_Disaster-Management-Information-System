import { useEffect, useState } from "react";

const links = [
  ["Beranda", "#hero"],
  ["Edukasi", "#education"],
  ["Peta Bencana", "#map"],
  ["Simulator", "#simulator"],
  ["Database", "#database"],
  ["Mitigasi", "#mitigation"],
] as const;

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("hero");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
      <header className="site-header">
        <nav aria-label="Navigasi utama">
          <a className="nav-brand" href="#hero" aria-label="SIMITSU, beranda">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 20 Q7 10 14 16 Q21 22 26 10" stroke="#27c6dc" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M2 24 Q8 14 14 20 Q20 26 26 14" stroke="#27c6dc" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
              <circle cx="14" cy="8" r="3" fill="#f97316" />
            </svg>
            <span>SIMITSU</span>
          </a>
          <button
            className="nav-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            Bagian
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
        ↑
      </button>
    </>
  );
}
