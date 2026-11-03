import { useEffect, useState } from "react";

const mapFilters = [
  ["all", "Semua"],
  ["plates", "Lempeng tektonik"],
  ["tsunami", "Tsunami historis"],
  ["sensor", "Titik ilustratif"],
] as const;

export default function InteractiveMap() {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    function handleMapReady() {
      setMapReady(true);
    }

    window.addEventListener("simitsu:mapready", handleMapReady);
    if (window.__simitsuMapReady) handleMapReady();
    return () => window.removeEventListener("simitsu:mapready", handleMapReady);
  }, []);

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
              <div className="legend-item" data-layer="plates"><span className="legend-line" style={{ background: "#ff6b00", height: 4, opacity: 0.95 }} /> Garis tektonik ilustratif</div>
              <div className="legend-item" data-layer="sensor"><span className="legend-dot" style={{ background: "#0ea5e9", width: 12, height: 12 }} /> Titik ilustratif, bukan lokasi sensor</div>
            </div>
          </div>
          <p className="map-method-note">
            Lingkaran menunjukkan magnitudo pada catatan, bukan tingkat risiko. Garis tektonik dan titik biru bersifat ilustratif. Peta risiko resmi dan lokasi sensor terverifikasi tidak tersedia di sini.
          </p>
          <p className="map-source-note">
            Sumber catatan historis: <a href="https://www.ngdc.noaa.gov/hazel/view/hazards/tsunami/event-data?country=INDONESIA" target="_blank" rel="noopener noreferrer">Katalog Tsunami NOAA NCEI</a>. Peta dasar menggunakan citra Esri.
          </p>
        </div>
      </div>
    </section>
  );
}
