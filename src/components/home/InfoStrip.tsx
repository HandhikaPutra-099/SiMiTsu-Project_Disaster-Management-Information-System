import { tsunamiEvents } from "../../data/tsunamiEvents";

const numberFormat = new Intl.NumberFormat("id-ID");

const totalDeaths = tsunamiEvents.reduce((sum, event) => sum + (event.deaths ?? 0), 0);
const maxHeight = Math.max(...tsunamiEvents.map((e) => e.height ?? 0));
const largestEvent = tsunamiEvents.find((e) => e.height === maxHeight);
const oldestYear = Math.min(...tsunamiEvents.map((e) => e.year));
const newestYear = Math.max(...tsunamiEvents.map((e) => e.year));
const earthquakeCount = tsunamiEvents.filter((e) => e.cause === "Gempa bumi").length;
const volcanoCount = tsunamiEvents.filter((e) => e.cause === "Erupsi vulkanik").length;

const items: string[] = [
  `${tsunamiEvents.length} kejadian tercatat dalam arsip pilihan NOAA NCEI`,
  `Rentang catatan: ${oldestYear}–${newestYear}`,
  `${earthquakeCount} kejadian akibat gempa bumi`,
  `${volcanoCount} kejadian akibat erupsi vulkanik`,
  largestEvent ? `Gelombang tertinggi: ${maxHeight} m, ${largestEvent.name} (${largestEvent.year})` : "",
  `Total korban tercatat dalam arsip pilihan: ${numberFormat.format(totalDeaths)} jiwa`,
  "Sumber: Katalog Tsunami Historis NOAA NCEI",
  "Arsip ini hanya mencakup catatan pilihan, bukan seluruh kejadian",
  "Situs ini tidak menyajikan peringatan atau pemantauan waktu nyata",
].filter(Boolean);

export default function InfoStrip() {
  const repeated = [...items, ...items];

  return (
    <div className="info-strip" aria-label="Ringkasan data historis tsunami">
      <div className="info-strip-track" aria-hidden="true">
        {repeated.map((item, index) => (
          <span key={index} className="info-strip-item">
            <span className="info-strip-dot" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
      <ul className="sr-only">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
