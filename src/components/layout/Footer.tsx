import { tsunamiCatalogUrl } from "../../data/tsunamiEvents";

const navLinks = [
  ["Beranda", "#hero"],
  ["Edukasi", "#education"],
  ["Peta Tsunami", "#map"],
  ["Simulator", "#simulator"],
  ["Database", "#database"],
  ["Mitigasi", "#mitigation"],
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <a className="footer-brand" href="#hero" aria-label="SIMITSU, kembali ke beranda">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32" fill="none" width="28" height="28">
              <path d="M2 22 Q8 11 16 18 Q24 25 30 12" stroke="#27c6dc" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M2 27 Q9 16 16 23 Q23 30 30 17" stroke="#27c6dc" strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
              <circle cx="16" cy="8" r="3.5" fill="#f97316" />
            </svg>
            <span>SIMITSU</span>
          </a>
          <p className="footer-desc">
            Platform edukasi tsunami Indonesia. Membantu masyarakat mempelajari proses tsunami, menelusuri catatan historis, dan memahami langkah kesiapsiagaan melalui peta, simulasi, dan arsip ilmiah.
          </p>
          <p className="footer-disclaimer-inline">
            Bukan sumber peringatan resmi. Informasi di situs ini bersifat edukatif.
          </p>
        </div>

        <nav className="footer-nav-col" aria-label="Jelajahi bagian situs">
          <h2>Jelajahi SiMiTsu</h2>
          <ul>
            {navLinks.map(([label, href]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="footer-resources-col" aria-label="Sumber data dan kontak resmi">
          <h2>Sumber dan informasi resmi</h2>
          <ul>
            <li>
              <a href={tsunamiCatalogUrl} target="_blank" rel="noopener noreferrer">
                Katalog tsunami NOAA NCEI
              </a>
            </li>
            <li>
              <a href="https://www.bmkg.go.id/" target="_blank" rel="noopener noreferrer">
                BMKG
              </a>
            </li>
            <li>
              <a href="https://www.bnpb.go.id/" target="_blank" rel="noopener noreferrer">
                BNPB
              </a>
            </li>
            <li>
              BMKG Contact Center: <a href="tel:196">196</a>
            </li>
            <li>
              Kantor Graha BNPB: <a href="tel:+622129827793">(021) 2982 7793</a>
            </li>
          </ul>
          <p className="footer-contact-note">
            Nomor kantor BNPB bukan layanan darurat. Untuk kedaruratan, ikuti arahan petugas setempat.
          </p>
        </section>
      </div>

      <div className="footer-bottom">
        <p className="footer-credit">
          &copy; SIMITSU. Data historis ditautkan ke sumber masing-masing.
          Situs ini tidak menyajikan peringatan atau pemantauan waktu nyata.
        </p>
        <p className="footer-official-links">
          Informasi resmi:{" "}
          <a href="https://www.bmkg.go.id/" target="_blank" rel="noopener noreferrer">BMKG</a>,{" "}
          <a href="https://www.bnpb.go.id/" target="_blank" rel="noopener noreferrer">BNPB</a>,{" "}
          BPBD wilayah setempat.
        </p>
      </div>
    </footer>
  );
}
