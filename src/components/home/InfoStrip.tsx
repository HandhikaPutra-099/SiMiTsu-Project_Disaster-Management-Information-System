import { tsunamiEvents } from "../../data/tsunamiEvents";

const numberFormat = new Intl.NumberFormat("id-ID");

const totalDeaths = tsunamiEvents.reduce((sum, event) => sum + (event.deaths ?? 0), 0);
const maxHeight = Math.max(...tsunamiEvents.map((e) => e.height ?? 0));
const largestEvent = tsunamiEvents.find((e) => e.height === maxHeight);
const oldestYear = Math.min(...tsunamiEvents.map((e) => e.year));
const newestYear = Math.max(...tsunamiEvents.map((e) => e.year));

const items: string[] = [
  `${numberFormat.format(tsunamiEvents.length)} kejadian dalam arsip pilihan`,
  `Rentang catatan ${oldestYear} sampai ${newestYear}`,
  largestEvent ? `Ketinggian maksimum tercatat ${maxHeight} m, ${largestEvent.name} (${largestEvent.year})` : "",
  `Korban meninggal tercatat dalam arsip pilihan: ${numberFormat.format(totalDeaths)} jiwa`,
  "Sumber catatan historis: NOAA NCEI",
  "Arsip pilihan ini tidak mencakup seluruh kejadian",
  "Bukan pemantauan waktu nyata atau sumber peringatan",
].filter(Boolean);

export default function InfoStrip() {
  return (
    <section className="info-strip" aria-label="Ringkasan arsip tsunami historis">
      <div className="info-strip-heading">
        <span>Catatan historis</span>
        <span>Arsip pilihan · NOAA NCEI</span>
      </div>
      <ul className="info-strip-track" aria-label="Ringkasan data arsip">
        {items.map((item) => (
          <li key={item} className="info-strip-item">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
