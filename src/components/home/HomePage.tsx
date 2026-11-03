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
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ocean-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c3553" />
          <stop offset="1" stopColor="#071827" />
        </linearGradient>
        <linearGradient id="ocean-shore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#557b79" />
          <stop offset="1" stopColor="#1c343b" />
        </linearGradient>
      </defs>
      <rect width="1000" height="560" fill="url(#ocean-depth)" />
      <path d="M0 204c110-17 153 17 264 0s155 17 266 0 155 17 266 0 153 17 204 0" fill="none" stroke="#83e7ef" strokeOpacity=".35" strokeWidth="3" />
      <path d="M0 286c116-17 156 17 273 0s156 17 273 0 156 17 273 0 126 13 181 6" fill="none" stroke="#27c6dc" strokeOpacity=".26" strokeWidth="2" />
      <path d="M0 422h408l90-30 98 18 115-30 91-116 72-35 126 12v319H0z" fill="#102b3c" />
      <path d="M0 444h414l88-26 99 15 107-28 91-117 76-36 125 13v295H0z" fill="url(#ocean-shore)" />
      <path d="M84 532c202-28 312-72 420-108s179-43 277-126" fill="none" stroke="#83e7ef" strokeOpacity=".55" strokeWidth="2" />
      <path d="M130 200h548" fill="none" stroke="#83e7ef" strokeOpacity=".18" strokeWidth="1" />
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
          <h1 className="hero-title" id="hero-title">Kenali tsunami. Siapkan langkah aman.</h1>
          <p className="hero-sub">
            Pelajari bagaimana tsunami terbentuk, telusuri catatan historis, dan kenali langkah keselamatan untuk wilayah pesisir.
          </p>
          <div className="hero-ctas">
            <a href="#map" className="btn btn-primary">Buka peta bencana</a>
            <a href="#mitigation" className="btn btn-outline">Pelajari langkah keselamatan</a>
          </div>
        </div>
        <aside className="hero-note">
          <p>Di bawah permukaan laut</p>
          <h2>Gelombang kecil di laut dalam dapat berubah saat mendekati pantai.</h2>
          <span>Ilustrasi konseptual, bukan prakiraan atau peringatan.</span>
        </aside>
        <p className="hero-source">
          Catatan historis berasal dari katalog NOAA NCEI. Situs ini tidak menyajikan peringatan waktu nyata.
        </p>
      </div>
    </section>
  );
}
