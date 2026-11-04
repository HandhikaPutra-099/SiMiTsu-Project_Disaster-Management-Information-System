import { lazy, Suspense, useEffect, useState } from "react";

const OceanScene = lazy(() => import("../scene/OceanScene"));

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

export default function HomePage() {
  return (
    <section id="hero" aria-labelledby="hero-title">
      <HeroScene />
      <div className="section-inner home-layout">
        <div className="hero-content">
          <p className="hero-kicker">Sistem Mitigasi Tsunami Indonesia</p>
          <h1 className="hero-title" id="hero-title">
            Memahami Tsunami, Membangun Kesiapsiagaan.
          </h1>
          <p className="hero-sub">
            Kenali proses terjadinya tsunami, pelajari catatan sejarah, dan pahami langkah penyelamatan melalui informasi ilmiah yang mudah diakses.
          </p>
          <div className="hero-ctas">
            <a href="#map" className="btn btn-primary">Jelajahi Peta Tsunami</a>
            <a href="#simulator" className="btn btn-outline">Mulai Simulasi</a>
          </div>
        </div>

        <aside className="hero-note" aria-label="Catatan ilustrasi">
          <p className="hero-note-label">Di bawah permukaan laut</p>
          <h2 className="hero-note-heading">Gelombang kecil di laut dalam dapat berubah saat mendekati pantai.</h2>
          <dl className="hero-note-data">
            <div>
              <dt>Kecepatan di laut dalam</dt>
              <dd>hingga 800 km/jam</dd>
            </div>
            <div>
              <dt>Ketinggian di pantai</dt>
              <dd>dapat melebihi 30 m</dd>
            </div>
          </dl>
          <span className="hero-note-disclaimer">Ilustrasi konseptual. Bukan prakiraan atau peringatan.</span>
        </aside>

        <p className="hero-source">
          Catatan historis berasal dari katalog{" "}
          <a href="https://www.ngdc.noaa.gov/hazel/view/hazards/tsunami/event-data?country=INDONESIA" target="_blank" rel="noopener noreferrer">NOAA NCEI</a>.
          {" "}Situs ini tidak menyajikan peringatan waktu nyata.
        </p>
      </div>
    </section>
  );
}
