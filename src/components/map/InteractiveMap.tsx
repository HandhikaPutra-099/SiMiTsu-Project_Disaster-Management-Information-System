import { useEffect, useMemo, useState } from "react";
import { tsunamiEvents } from "../../data/tsunamiEvents";

const mapFilters = [
  ["all", "Semua"],
  ["plates", "Lempeng tektonik"],
  ["tsunami", "Tsunami historis"],
  ["sensor", "Titik ilustratif"],
] as const;

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
          <h2 className="section-title" id="map-heading">Peta bencana</h2>
          <p className="section-sub">
            Telusuri catatan tsunami historis dan konteks tektonik. Peta ini tidak menampilkan peta risiko resmi atau peringatan aktif.
          </p>
        </div>
        <div className="interactive-map">
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
            <span className="filter-label">Tampilkan</span>
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
          <p className="data-status" id="mapStatus" role="status" aria-live="polite">
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
            <div className="map-legend" id="mapLegend">
              <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#ef4444" }} /> Catatan historis NOAA, magnitudo 8 ke atas</div>
              <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#f97316" }} /> Catatan historis NOAA, magnitudo 7–7,9</div>
              <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#f59e0b" }} /> Catatan historis NOAA, magnitudo di bawah 7</div>
              <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#e2e8f0" }} /> Catatan historis tanpa data magnitudo</div>
              <div className="legend-item" data-layer="plates"><span className="legend-line" style={{ background: "#ff6b00", height: 4, opacity: 0.95 }} /> Garis tektonik ilustratif</div>
              <div className="legend-item" data-layer="sensor"><span className="legend-dot" style={{ background: "#0ea5e9", width: 12, height: 12 }} /> Titik ilustratif, bukan lokasi sensor</div>
            </div>
          </div>
          <p className="map-method-note">
            Lingkaran menunjukkan magnitudo pada catatan, bukan tingkat risiko. Garis tektonik dan titik biru bersifat ilustratif, bukan lokasi sensor atau data operasional.
          </p>
          <p className="map-source-note">
            Sumber catatan historis: <a href="https://www.ngdc.noaa.gov/hazel/view/hazards/tsunami/event-data?country=INDONESIA" target="_blank" rel="noopener noreferrer">Katalog Tsunami NOAA NCEI</a>. Peta dasar menggunakan citra Esri.
          </p>
        </div>
      </div>
    </section>
  );
}
