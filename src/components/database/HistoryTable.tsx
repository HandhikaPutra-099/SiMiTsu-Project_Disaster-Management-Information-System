import { tsunamiEvents, tsunamiSourceUrl } from "../../data/tsunamiEvents";
import AnalyticsSummary from "./AnalyticsSummary";

const numberFormat = new Intl.NumberFormat("id-ID");

function magnitudeClass(magnitude: number | null): string {
  if (magnitude === null) return "mag-low";
  if (magnitude >= 8.5) return "mag-extreme";
  if (magnitude >= 7.8) return "mag-high";
  if (magnitude >= 7.0) return "mag-med";
  return "mag-low";
}

export default function HistoryTable() {
  const sortedEvents = [...tsunamiEvents].sort((first, second) => second.year - first.year);

  return (
    <section id="history">
      <div className="section-inner">
        <h2 className="section-title">Riwayat tsunami Indonesia</h2>
        <AnalyticsSummary />
        <div className="table-wrap" role="region" aria-label="Tabel riwayat tsunami, dapat digulir secara horizontal" tabIndex={0}>
          <table id="historyTable">
            <caption className="sr-only">Riwayat tsunami Indonesia dari katalog NOAA NCEI</caption>
            <thead>
              <tr>
                <th scope="col">Tahun</th>
                <th scope="col">Lokasi</th>
                <th scope="col">Magnitudo</th>
                <th scope="col">Ketinggian maksimum</th>
                <th scope="col">Korban meninggal</th>
                <th scope="col">Penyebab</th>
                <th scope="col">Sumber</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.year}</td>
                  <td>{event.name}</td>
                  <td>
                    <span className={`badge-mag ${magnitudeClass(event.mag)}`}>
                      {event.mag === null ? "Tidak tersedia" : `M${event.mag}`}
                    </span>
                  </td>
                  <td>{event.height === null ? "Tidak tersedia" : `${numberFormat.format(event.height)} m`}</td>
                  <td>{event.deaths === null ? "Tidak tersedia" : numberFormat.format(event.deaths)}</td>
                  <td>{event.cause}</td>
                  <td>
                    <a
                      href={`${tsunamiSourceUrl}${event.sourceId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Buka catatan NOAA untuk tsunami ${event.name}, ${event.year}`}
                    >
                      Sumber NOAA
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="data-status mt-3">
          {sortedEvents.length} catatan pilihan dari katalog NOAA NCEI. Angka korban merujuk pada korban meninggal yang tercatat.
        </p>
      </div>
    </section>
  );
}
