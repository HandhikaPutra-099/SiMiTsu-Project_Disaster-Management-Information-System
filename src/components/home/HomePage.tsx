import { lazy, Suspense, useEffect, useState } from "react";
import { tsunamiEvents, type TsunamiEvent } from "../../data/tsunamiEvents";

const OceanScene = lazy(() => import("../scene/OceanScene"));
const numberFormat = new Intl.NumberFormat("id-ID");

function HeroScene() {
  const [sceneRequested, setSceneRequested] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updatePreference(event: MediaQueryListEvent) {
      setReducedMotion(event.matches);
      if (event.matches) setSceneRequested(false);
    }

    setReducedMotion(preference.matches);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setTimeout(() => setSceneRequested(true), 250);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <>
      <div className="hero-ocean" aria-hidden="true">
        <StaticOcean />
        {sceneRequested && (
          <Suspense fallback={null}>
            <OceanScene
              phase={0}
              continuous={!paused && !reducedMotion}
              onFallbackChange={setFallback}
            />
          </Suspense>
        )}
      </div>
      {sceneRequested && !fallback && !reducedMotion && (
        <button
          className="hero-motion-control"
          type="button"
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? "Putar gerak laut" : "Jeda gerak laut"}
        </button>
      )}
    </>
  );
}

function StaticOcean() {
  return (
    <svg
      className="static-ocean"
      viewBox="0 0 1200 680"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ocean-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#071827" />
          <stop offset="0.6" stopColor="#0c2b3d" />
          <stop offset="1" stopColor="#051218" />
        </linearGradient>
        <linearGradient id="ocean-shelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#163748" />
          <stop offset="1" stopColor="#0a1f2e" />
        </linearGradient>
        <radialGradient id="depth-light" cx="70%" cy="30%" r="55%">
          <stop offset="0" stopColor="#0d3b5e" stopOpacity="0.6" />
          <stop offset="1" stopColor="#071827" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="680" fill="url(#ocean-depth)" />
      <rect width="1200" height="680" fill="url(#depth-light)" />
      {/* Deep water texture lines */}
      <path d="M0 180c160-22 240 20 380 0s220 22 380 0 190 22 440 0" fill="none" stroke="#83e7ef" strokeOpacity=".12" strokeWidth="2" />
      <path d="M0 260c140-18 210 18 340 0s200 18 360 0 210 18 500 0" fill="none" stroke="#27c6dc" strokeOpacity=".10" strokeWidth="1.5" />
      <path d="M0 340c180-24 260 22 420 0s230 24 420 0 220 24 360 0" fill="none" stroke="#83e7ef" strokeOpacity=".08" strokeWidth="1" />
      {/* Continental shelf */}
      <path d="M0 480h520l80-42 100 20 90-34 70-88 60-30 80 8 200 0v366H0z" fill="url(#ocean-shelf)" opacity=".65" />
      {/* Seafloor ridge */}
      <path d="M560 418c30-12 58-8 80 6s42 20 68 18 56-14 80-22" fill="none" stroke="#83e7ef" strokeOpacity=".32" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tectonic subduction line */}
      <path d="M680 430l-120 42-80 18-70 32-80 60-120 28-210 0" fill="none" stroke="#f97316" strokeOpacity=".28" strokeWidth="2" strokeDasharray="8 4" />
      {/* Depth marker lines */}
      <line x1="300" y1="160" x2="300" y2="480" stroke="#83e7ef" strokeOpacity=".06" strokeWidth="1" />
      <line x1="700" y1="160" x2="700" y2="440" stroke="#83e7ef" strokeOpacity=".06" strokeWidth="1" />
      <line x1="1000" y1="160" x2="1000" y2="480" stroke="#83e7ef" strokeOpacity=".06" strokeWidth="1" />
    </svg>
  );
}

function formatCoordinate(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`;
}

function ArchiveVisualization() {
  const latestEvent = tsunamiEvents.reduce((latest, event) =>
    event.year > latest.year ? event : latest
  );
  const selectedEvent: TsunamiEvent = latestEvent;

  return (
    <aside className="hero-visual" aria-label="Visualisasi lokasi catatan tsunami historis Indonesia">
      <div className="hero-visual-heading">
        <div>
          <p className="hero-visual-kicker">Arsip historis Indonesia</p>
          <h2>Jejak kejadian di kepulauan</h2>
        </div>
        <span className="hero-visual-source">NOAA NCEI</span>
      </div>

      <div className="hero-map-canvas">
        <HeroScene />
        <svg
          className="hero-coordinate-map"
          viewBox="0 0 1000 410"
          role="img"
          aria-labelledby="hero-map-title hero-map-desc"
        >
          <title id="hero-map-title">Sebaran koordinat kejadian tsunami historis di Indonesia</title>
          <desc id="hero-map-desc">
            Plot koordinat geografis catatan arsip NOAA NCEI dari Sumatra hingga Papua. Titik menandai lokasi kejadian, bukan tingkat risiko.
          </desc>
          <g className="hero-map-grid" aria-hidden="true">
            {[95, 105, 115, 125, 135].map((longitude) => {
              const x = 70 + ((longitude - 95) / 46) * 860;
              return (
                <g key={longitude}>
                  <line x1={x} y1="30" x2={x} y2="360" />
                  <text x={x} y="385" textAnchor="middle">{longitude}° BT</text>
                </g>
              );
            })}
            {[5, 0, -5, -10].map((latitude) => {
              const y = 45 + ((7 - latitude) / 19) * 310;
              return (
                <g key={latitude}>
                  <line x1="70" y1={y} x2="930" y2={y} />
                  <text x="54" y={y + 4} textAnchor="end">
                    {Math.abs(latitude)}° {latitude >= 0 ? "LU" : "LS"}
                  </text>
                </g>
              );
            })}
          </g>
          <text className="hero-map-region" x="125" y="185">SUMATRA</text>
          <text className="hero-map-region" x="390" y="300">JAWA</text>
          <text className="hero-map-region" x="560" y="200">SULAWESI</text>
          <text className="hero-map-region" x="830" y="150">PAPUA</text>
          <g className="hero-map-points">
            {tsunamiEvents.map((event) => {
              const x = 70 + ((event.lng - 95) / 46) * 860;
              const y = 45 + ((7 - event.lat) / 19) * 310;
              const radius = event.mag === null ? 5 : 4 + (event.mag - 5) * 1.15;
              return (
                <circle
                  key={event.id}
                  className={event.id === latestEvent.id ? "is-latest" : undefined}
                  cx={x}
                  cy={y}
                  r={Math.max(radius, 4)}
                  aria-label={`${event.name}, ${event.year}, ${formatCoordinate(event.lat, "LU", "LS")}, ${formatCoordinate(event.lng, "BT", "BB")}`}
                >
                  <title>
                    {event.name}, {event.year}, {formatCoordinate(event.lat, "LU", "LS")}, {formatCoordinate(event.lng, "BT", "BB")}
                  </title>
                </circle>
              );
            })}
          </g>
          <text className="hero-map-axis-label" x="500" y="405" textAnchor="middle">
            Koordinat lokasi kejadian dalam arsip pilihan
          </text>
        </svg>
      </div>

      <div className="hero-visual-footer">
        <div className="hero-event-preview">
          <span className="hero-event-year">{selectedEvent.year}</span>
          <div>
            <p className="hero-event-label">Catatan terbaru dalam arsip pilihan</p>
            <h3>{selectedEvent.name}</h3>
            <p>
              {selectedEvent.cause}
              {selectedEvent.mag !== null && ` · M${numberFormat.format(selectedEvent.mag)}`}
            </p>
          </div>
        </div>
        <p className="hero-coordinate">
          {formatCoordinate(selectedEvent.lat, "LU", "LS")}
          <br />
          {formatCoordinate(selectedEvent.lng, "BT", "BB")}
        </p>
      </div>
      <p className="hero-visual-note">
        Titik menunjukkan lokasi catatan historis, bukan peta risiko atau pemantauan waktu nyata.
        {" "}
        <a
          href="https://www.ngdc.noaa.gov/hazel/view/hazards/tsunami/event-data?country=INDONESIA"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sumber NOAA NCEI
        </a>
      </p>
    </aside>
  );
}

export default function HomePage() {
  return (
    <section id="hero" aria-labelledby="hero-title">
      <div className="section-inner home-layout">
        <div className="hero-content">
          <p className="hero-kicker">Sistem Mitigasi Tsunami Indonesia</p>
          <h1 className="hero-title" id="hero-title">
            Membaca tsunami dari laut hingga pesisir.
          </h1>
          <p className="hero-sub">
            Pelajari proses terbentuknya tsunami, telusuri catatan historis Indonesia, dan kenali langkah keselamatan untuk wilayah pesisir.
          </p>
          <div className="hero-ctas">
            <a href="#map" className="btn btn-primary">Telusuri peta historis</a>
            <a href="#education" className="btn btn-outline">Pelajari proses tsunami</a>
          </div>
          <p className="hero-scope-note">
            Materi edukatif dan arsip pilihan. Situs ini tidak menyajikan peringatan aktif.
          </p>
        </div>
        <ArchiveVisualization />
      </div>
    </section>
  );
}
