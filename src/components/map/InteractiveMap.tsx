const mapFilters = [
  ["all", "Semua"],
  ["plates", "Lempeng tektonik"],
  ["tsunami", "Tsunami historis"],
  ["sensor", "Titik ilustratif"],
] as const;

export default function InteractiveMap() {
  return (
    <div id="map" className="home-map" aria-labelledby="home-map-heading">
      <div className="map-filter-bar" role="group" aria-label="Pilih lapisan peta">
        <span className="filter-label">Lapisan</span>
        {mapFilters.map(([filter, label]) => (
          <button
            key={filter}
            className={`map-filter-btn${filter === "all" ? " active-all" : ""}`}
            id={`filter${filter[0].toUpperCase()}${filter.slice(1)}`}
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => window.setMapFilter?.(filter)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="data-status" id="mapStatus" role="status" aria-live="polite">
        Peta sedang dimuat. Titik yang ditampilkan sebagai sensor adalah ilustrasi statis.
      </p>
      <p className="data-status" id="mapEmptyState" role="status" hidden>
        Tidak ada catatan untuk lapisan ini.
      </p>
      <div className="map-container">
        <div
          id="leafletMap"
          role="region"
          aria-label="Peta interaktif catatan tsunami dan garis tektonik ilustratif Indonesia"
        />
        <div className="map-legend" id="mapLegend">
          <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#ef4444" }} /> Tsunami besar (M≥8.0)</div>
          <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#f97316" }} /> Tsunami menengah (7.0–7.9)</div>
          <div className="legend-item" data-layer="tsunami"><span className="legend-dot" style={{ background: "#f59e0b" }} /> Tsunami kecil (&lt;7.0)</div>
          <div className="legend-item" data-layer="plates"><span className="legend-line" style={{ background: "#ff6b00", height: 4, opacity: 0.95 }} /> Palung Sunda / Busur Banda</div>
          <div className="legend-item" data-layer="plates"><span className="legend-line" style={{ background: "#8b5cf6", opacity: 0.9 }} /> Lempeng Filipina / Palung Sulawesi</div>
          <div className="legend-item" data-layer="plates"><span className="legend-line" style={{ background: "#22c55e", opacity: 0.9 }} /> Lempeng Australia</div>
          <div className="legend-item" data-layer="plates"><span className="legend-line" style={{ background: "#f59e0b", opacity: 0.85 }} /> Sesar aktif</div>
          <div className="legend-item" data-layer="plates"><span className="legend-line" style={{ background: "#60a5fa", opacity: 0.8 }} /> Sesar Flores</div>
          <div className="legend-item" data-layer="sensor"><span className="legend-dot" style={{ background: "#0ea5e9", width: 12, height: 12 }} /> Titik ilustrasi, bukan sensor aktual</div>
        </div>
      </div>
    </div>
  );
}
