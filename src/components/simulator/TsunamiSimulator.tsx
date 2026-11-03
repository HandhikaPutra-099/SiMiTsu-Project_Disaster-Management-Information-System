import { lazy, Suspense, useEffect, useRef, useState } from "react";

const OceanScene = lazy(() => import("../scene/OceanScene"));

const phases = [
  {
    title: "Kondisi laut normal",
    description: "Permukaan laut bergerak dengan gelombang kecil. Pada tahap ini belum ada gangguan dasar laut.",
  },
  {
    title: "Gempa dan dasar laut bergeser",
    description: "Gempa bawah laut yang cukup kuat dan dangkal dapat menggeser dasar laut. Tidak semua gempa memicu tsunami.",
  },
  {
    title: "Kolom air terdorong",
    description: "Perubahan dasar laut memindahkan air di atasnya. Perpindahan ini dapat membentuk gelombang yang menyebar ke berbagai arah.",
  },
  {
    title: "Gelombang merambat di laut dalam",
    description: "Di laut dalam, gelombang tsunami dapat bergerak cepat dengan tinggi permukaan yang relatif rendah dan panjang gelombang yang besar.",
  },
  {
    title: "Gelombang mendekati pantai",
    description: "Saat kedalaman laut berkurang, gelombang melambat dan tinggi air dapat bertambah. Bentuk pantai dan dasar laut memengaruhi dampaknya.",
  },
  {
    title: "Air mencapai daratan",
    description: "Air dapat mengalir ke daratan dan kembali ke laut dengan arus kuat. Visualisasi ini hanya menjelaskan proses, bukan memprediksi dampak suatu pantai.",
  },
];

export default function TsunamiSimulator() {
  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const playbackInterval = useRef<number | null>(null);
  const phaseRef = useRef(0);

  function clearPlaybackInterval() {
    if (playbackInterval.current !== null) {
      window.clearInterval(playbackInterval.current);
      playbackInterval.current = null;
    }
  }

  function pausePlayback() {
    clearPlaybackInterval();
    setIsPlaying(false);
  }

  function choosePhase(phase: number) {
    pausePlayback();
    phaseRef.current = phase;
    setActivePhase(phase);
  }

  function playPhases() {
    clearPlaybackInterval();
    phaseRef.current = 0;
    setActivePhase(0);
    setIsPlaying(true);
    playbackInterval.current = window.setInterval(() => {
      const nextPhase = phaseRef.current + 1;
      if (nextPhase >= phases.length) {
        pausePlayback();
        return;
      }
      phaseRef.current = nextPhase;
      setActivePhase(nextPhase);
    }, 4_000);
  }

  function resetPhases() {
    pausePlayback();
    phaseRef.current = 0;
    setActivePhase(0);
  }

  useEffect(() => {
    const section = document.getElementById("simulator");
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      setSectionVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setSectionVisible(entry.isIntersecting);
      if (!entry.isIntersecting) {
        clearPlaybackInterval();
        setIsPlaying(false);
      }
    }, { threshold: 0.1 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updateMotionPreference(event: MediaQueryListEvent) {
      setReducedMotion(event.matches);
      if (event.matches) pausePlayback();
    }
    preference.addEventListener("change", updateMotionPreference);
    return () => preference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => () => clearPlaybackInterval(), []);

  return (
    <section id="simulator" className="simulator-section" aria-labelledby="simulator-heading">
      <div className="section-inner">
        <div className="section-heading">
          <h2 className="section-title" id="simulator-heading">Bagaimana tsunami terjadi?</h2>
          <p className="section-sub">
            Ikuti perjalanan gelombang dari dasar laut ke pesisir. Pilih tahap untuk membaca penjelasan dan melihat perubahan pada visualisasi.
          </p>
        </div>
        <p className="simulation-notice" role="note">
          Adegan 3D ini menjelaskan konsep secara sederhana. Visualisasi dan keluaran parameter bukan prakiraan, data pengamatan, atau peringatan resmi. Jangan gunakan simulasi ini untuk keputusan evakuasi.
        </p>
        <p className="data-status simulator-status" id="simulatorStatus" role="status" aria-live="polite">
          Memuat parameter skenario dan ilustrasi penyebab.
        </p>

        <div className="sim-unified-layout">
          <div className="sim-right-col">
            <figure
              className="sim-canvas-frame"
              aria-label={`Visualisasi konseptual tahap ${activePhase + 1}: ${phases[activePhase].title}`}
            >
              <Suspense fallback={<div className="scene-loading" role="status">Menyiapkan visualisasi laut...</div>}>
                <OceanScene phase={activePhase} animate={isPlaying && sectionVisible} interactive />
              </Suspense>
              <figcaption className="scene-caption">
                Skema konseptual, bukan model prakiraan atau gambaran kondisi lokasi tertentu.
              </figcaption>
            </figure>

            <div className="sim-timeline">
              <h3 id="phaseHeading">Tahapan terbentuknya tsunami</h3>
              <ol className="phase-list" id="phaseList" aria-label="Pilih tahap proses tsunami">
                {phases.map((phase, index) => (
                  <li className={activePhase === index ? "active" : undefined} key={phase.title}>
                    <button
                      type="button"
                      aria-pressed={activePhase === index}
                      onClick={() => choosePhase(index)}
                    >
                      <span className="ph-num" aria-hidden="true">{index + 1}</span>
                      <span>{phase.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="sim-playback">
                <button className="btn btn-primary" type="button" onClick={playPhases} disabled={isPlaying || reducedMotion || !sectionVisible}>
                  Putar tahapan
                </button>
                {isPlaying && (
                  <button className="btn btn-outline" type="button" onClick={pausePlayback}>
                    Jeda
                  </button>
                )}
                <button className="btn btn-outline" type="button" onClick={resetPhases}>
                  Mulai kembali
                </button>
              </div>
              {reducedMotion && (
                <p className="phase-motion-note">
                  Gerak otomatis dinonaktifkan sesuai pengaturan perangkat. Anda tetap dapat memilih setiap tahap.
                </p>
              )}
              <p id="phaseDesc" className="phase-description" role="status" aria-live="polite">
                {phases[activePhase].description}
              </p>
            </div>

            <div className="sim-data-panel" id="simResult">
              <div className="alert-bar medium" id="alertBar" role="status" aria-live="polite">
                Skenario edukatif. Bukan peringatan resmi.
              </div>
              <div className="result-body">
                <h3>Keluaran skenario sederhana</h3>
                <p className="model-output-note">
                  Ubah parameter untuk melihat keluaran rumus ilustratif. Hasilnya tidak menggambarkan kondisi pantai tertentu.
                </p>
                <div className="result-grid">
                  <div className="result-item"><div className="r-label">Tinggi gelombang skenario</div><div className="r-val" id="rHeight">Belum dihitung</div></div>
                  <div className="result-item"><div className="r-label">Waktu tempuh skenario</div><div className="r-val" id="rTime">Belum dihitung</div></div>
                  <div className="result-item"><div className="r-label">Kecepatan skenario</div><div className="r-val" id="rSpeed">Belum dihitung</div></div>
                  <div className="result-item"><div className="r-label">Jangkauan darat skenario</div><div className="r-val" id="rInland">Belum dihitung</div></div>
                </div>
              </div>
            </div>
          </div>

          <aside className="sim-panel" aria-label="Parameter skenario edukatif">
            <details className="sim-controls" open>
              <summary>Ubah parameter skenario</summary>
              <div className="sim-control-content">
                <fieldset>
                  <legend>Gempa bawah laut</legend>
                  <div className="control-group">
                    <label className="control-label" htmlFor="magSlider">
                      Magnitudo skenario <span className="val" id="magVal">7.5</span>
                    </label>
                    <input id="magSlider" type="range" min="5.0" max="9.5" step="0.1" defaultValue="7.5" onChange={() => window.updateSim?.()} />
                    <div className="range-scale" aria-hidden="true"><span>5.0</span><span>7.0</span><span>8.0</span><span>9.0</span><span>9.5</span></div>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="depSlider">
                      Kedalaman skenario <span className="val" id="depVal">30 km</span>
                    </label>
                    <input id="depSlider" type="range" min="5" max="200" step="5" defaultValue="30" onChange={() => window.updateSim?.()} />
                    <div className="range-scale" aria-hidden="true"><span>5 km</span><span>Dangkal</span><span>200 km</span></div>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="distSlider">
                      Jarak skenario ke pantai <span className="val" id="distVal">80 km</span>
                    </label>
                    <input id="distSlider" type="range" min="10" max="500" step="10" defaultValue="80" onChange={() => window.updateSim?.()} />
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Konteks ilustrasi</legend>
                  <div className="control-group">
                    <label className="control-label" htmlFor="locSelect">Kedalaman perairan</label>
                    <select id="locSelect" defaultValue="trench" onChange={() => window.updateSim?.()}>
                      <option value="shallow">Perairan dangkal</option>
                      <option value="trench">Zona subduksi</option>
                      <option value="deep">Laut dalam</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="coastSelect">Bentuk pesisir</label>
                    <select id="coastSelect" defaultValue="open" onChange={() => window.updateSim?.()}>
                      <option value="open">Pantai terbuka</option>
                      <option value="bay">Teluk atau muara</option>
                      <option value="cliff">Tebing</option>
                      <option value="mangrove">Hutan mangrove</option>
                    </select>
                  </div>
                </fieldset>
                <p className="sim-auto-update">Angka berubah mengikuti parameter dan hanya untuk pembelajaran.</p>
              </div>
            </details>
          </aside>
        </div>
      </div>
    </section>
  );
}
