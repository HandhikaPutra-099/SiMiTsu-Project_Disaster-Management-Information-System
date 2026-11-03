import { tsunamiCatalogUrl } from "../../data/tsunamiEvents";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <section className="footer-about" aria-labelledby="footer-about-title">
          <h2 id="footer-about-title">Tentang SIMITSU</h2>
          <p>
            SIMITSU membantu masyarakat mempelajari tsunami melalui penjelasan, catatan historis, peta, dan simulasi edukatif. Informasi di situs ini bukan pemantauan atau peringatan waktu nyata.
          </p>
        </section>
        <section aria-labelledby="footer-sources-title">
          <h2 id="footer-sources-title">Sumber informasi</h2>
          <ul>
            <li><a href="https://www.bnpb.go.id/" target="_blank" rel="noopener noreferrer">BNPB</a></li>
            <li><a href="https://www.bmkg.go.id/" target="_blank" rel="noopener noreferrer">BMKG</a></li>
            <li><a href={tsunamiCatalogUrl} target="_blank" rel="noopener noreferrer">Katalog tsunami NOAA NCEI</a></li>
          </ul>
        </section>
        <section aria-labelledby="footer-contacts-title">
          <h2 id="footer-contacts-title">Kontak resmi</h2>
          <ul>
            <li>BMKG Contact Center: <a href="tel:196">196</a></li>
            <li>Kantor Graha BNPB: <a href="tel:+622129827793">(021) 2982 7793</a></li>
          </ul>
          <p className="footer-contact-note">
            Nomor kantor BNPB bukan nomor layanan darurat. Untuk arahan kedaruratan, ikuti informasi resmi dan petugas setempat.
          </p>
        </section>
      </div>
      <p className="footer-credit">© SIMITSU. Data historis ditautkan ke sumber masing-masing.</p>
    </footer>
  );
}
