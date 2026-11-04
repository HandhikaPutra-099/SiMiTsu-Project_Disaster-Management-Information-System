import { useEffect, useMemo, useState } from "react";
import { tsunamiEvents } from "../../data/tsunamiEvents";

const mapFilters = [
  ["all", "Semua"],
  ["plates", "Lempeng tektonik"],
  ["tsunami", "Tsunami historis"],
  ["sensor", "Titik ilustratif"],
] as const;

const mostRecentEvent = tsunamiEvents.reduce((latest, event) =>
  event.year > latest.year ? event : latest
);
const greatestHeightEvent = tsunamiEvents.reduce((greatest, event) =>
  (event.height ?? 0) > (greatest.height ?? 0) ? event : greatest
);

export default function InteractiveMap() {
  const [mapReady, setMapReady] = useState(false);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [cause, setCause] = useState("");
  const years = useMemo(
    () => [...new Set(tsunamiEvents.map((event) => event.year))].sort((first, second) => second - first),
    [],
  );
  const causes = useMemo(
    () => [...new Set(tsunamiEvents.map((event) => event.cause))],
    [],
  );

  useEffect(() => {
    function handleMapReady() {
      setMapReady(true);
    }

    window.addEventListener("simitsu:mapready", handleMapReady);
    if (window.__simitsuMapReady) handleMapReady();
    return () => window.removeEventListener("simitsu:mapready", handleMapReady);
  }, []);

  useEffect(() => {
    if (mapReady) window.setMapCriteria?.(search, year, cause);
  }, [cause, mapReady, search, year]);

  return (
    <section id="map" className="map-section" aria-labelledby="map-heading">
      <div className="section-inner">
        <div className="section-heading">
          <h2 className="section-title" id="map-heading">Peta tsunami historis Indonesia</h2>
          <p className="section-sub">
            Telusuri catatan tsunami historis dan konteks tektonik. Peta ini tidak menampilkan peta risiko resmi atau peringatan aktif.
          </p>
        </div>
        <div className="interactive-map map-workspace">
          <div className="map-main">
            <div className="map-search-controls">
              <label htmlFor="mapSearch">
                Cari nama kejadian atau lokasi
                <input
                  id="mapSearch"
                  type="search"
                  placeholder="Contoh: Flores"
                  value={search}
                  disabled={!mapReady}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />
              </label>
              <label htmlFor="mapYear">
                Tahun kejadian
                <select id="mapYear" value={year} disabled={!mapReady} onChange={(event) => setYear(event.currentTarget.value)}>
                  <option value="">Semua tahun</option>
                  {years.map((recordYear) => <option key={recordYear} value={recordYear}>{recordYear}</option>)}
                </select>
              </label>
              <label htmlFor="mapCause">
                Penyebab
                <select id="mapCause" value={cause} disabled={!mapReady} onChange={(event) => setCause(event.currentTarget.value)}>
                  <option value="">Semua penyebab</option>
                  {causes.map((recordCause) => <option key={recordCause} value={recordCause}>{recordCause}</option>)}
                </select>
              </label>
            </div>
            <p className="map-records-status" id="mapRecordsStatus" role="status" aria-live="polite">
              Catatan historis berasal dari arsip NOAA NCEI.
            </p>
            <div className="map-filter-bar" role="group" aria-label="Pilih lapisan peta">
              <span className="filter-label">Lapisan peta</span>
              {mapFilters.map(([filter, label]) => (
                <button
                  key={filter}
                  className={`map-filter-btn${filter === "all" ? " active-all" : ""}`}
                  id={`filter${filter[0].toUpperCase()}${filter.slice(1)}`}
                  type="button"
                  aria-pressed={filter === "all"}
                  disabled={!mapReady}
                  onClick={() => window.setMapFilter?.(filter)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="data-status" id="mapStatus" role="status" aria-live="polite" hidden={mapReady}>
              Peta sedang dimuat.
            </p>
            <p className="data-status" id="mapEmptyState" role="status" hidden>
              Tidak ada catatan untuk lapisan ini.
            </p>
            <div className="map-container">
              <div
                id="leafletMap"
                role="region"
                aria-label="Peta interaktif catatan tsunami historis dan fitur tektonik ilustratif"
              />
            </div>
            <p className="map-method-note">
              Lingkaran menunjukkan magnitudo pada catatan, bukan tingkat risiko. Garis tektonik dan titik biru bersifat ilustratif, bukan lokasi sensor atau data operasional.
            </p>
          </div>

          <aside className="map-context" aria-labelledby="map-context-heading">
            <div className="map-context-heading">
              <p className="map-context-kicker">Membaca peta</p>
              <h3 id="map-context-heading">Catatan dan lapisan</h3>
            </div>
            <div className="map-legend" id="mapLegend" aria-label="Legenda peta">
              <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#ef4444" }} /> Catatan NOAA, magnitudo 8 ke atas</div>
              <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#f97316" }} /> Catatan NOAA, magnitudo 7 sampai 7,9</div>
              <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#f59e0b" }} /> Catatan NOAA, magnitudo di bawah 7</div>
              <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#e2e8f0" }} /> Magnitudo tidak tersedia</div>
              <div className="legend-item" data-layer="plates"><span className="legend-line" style={{ background: "#ff6b00", height: 4, opacity: 0.95 }} /> Garis tektonik ilustratif</div>
              <div className="legend-item" data-layer="sensor"><span className="legend-dot" style={{ background: "#0ea5e9", width: 12, height: 12 }} /> Titik ilustratif, bukan sensor</div>
            </div>
            <div className="map-event-highlights">
              {[mostRecentEvent, greatestHeightEvent].map((event) => (
                <article className="map-event-note" key={event.id}>
                  <p>{event.year} · {event.cause}</p>
                  <h4>{event.name}</h4>
                  <dl>
                    <div>
                      <dt>Magnitudo</dt>
                      <dd>{event.mag === null ? "Tidak tersedia" : `M${event.mag}`}</dd>
                    </div>
                    <div>
                      <dt>Ketinggian tercatat</dt>
                      <dd>{event.height === null ? "Tidak tersedia" : `${event.height} m`}</dd>
                    </div>
                  </dl>
                  <a href="#database">Baca catatan arsip</a>
                </article>
              ))}
            </div>
            <p className="map-source-note">
              Catatan historis:{" "}
              <a href="https://www.ngdc.noaa.gov/hazel/view/hazards/tsunami/event-data?country=INDONESIA" target="_blank" rel="noopener noreferrer">Katalog NOAA NCEI</a>.
              Peta dasar menggunakan citra Esri.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
