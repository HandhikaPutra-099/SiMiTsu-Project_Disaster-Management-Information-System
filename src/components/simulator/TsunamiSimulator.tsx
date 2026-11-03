import { useEffect, useRef, useState } from "react";

const phases = [
  "Kondisi normal",
  "Gempa dan dasar laut",
  "Gelombang terbentuk",
  "Rambatan di laut dalam",
  "Pendangkalan gelombang",
  "Gelombang mencapai pantai",
];

export default function TsunamiSimulator() {
  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimeout = useRef<number | null>(null);

  function clearPlaybackTimeout() {
    if (playbackTimeout.current !== null) {
      window.clearTimeout(playbackTimeout.current);
      playbackTimeout.current = null;
    }
  }

  function pausePlayback() {
    window.pauseAutoPlay3D?.();
    clearPlaybackTimeout();
    setIsPlaying(false);
  }

  function choosePhase(phase: number) {
    pausePlayback();
    setActivePhase(phase);
    window.setPhase?.(phase);
  }

  function playPhases() {
    clearPlaybackTimeout();
    window.autoPlay3D?.();
    setActivePhase(0);
    setIsPlaying(true);
    playbackTimeout.current = window.setTimeout(() => {
      setIsPlaying(false);
      playbackTimeout.current = null;
    }, 27_000);
  }

  function resetPhases() {
    pausePlayback();
    window.resetPhase?.();
    setActivePhase(0);
  }

  useEffect(() => () => {
    clearPlaybackTimeout();
    window.pauseAutoPlay3D?.();
  }, []);

  return (
    <section id="simulator" className="simulator-section">
      <div className="section-inner">
        <div className="section-heading">
          <h2 className="section-title">Simulasi tsunami</h2>
          <p className="section-sub">
            Atur kondisi skenario untuk melihat perubahan gelombang dan urutan prosesnya.
          </p>
        </div>
        <p className="simulation-notice" role="note">
          Visualisasi perspektif ini digambar dengan Canvas 2D. Hasilnya berasal dari rumus sederhana untuk edukasi, bukan prakiraan, data observasi, atau peringatan resmi. Jangan gunakan nilai model untuk keputusan evakuasi.
        </p>
        <p className="data-status simulator-status" id="simulatorStatus" role="status" aria-live="polite">
          Simulasi sedang dimuat.
        </p>

        <div className="sim-unified-layout">
          <div className="sim-right-col">
            <div className="sim-canvas-frame">
              <canvas id="threeCanvas" role="img" aria-label="Visualisasi perspektif Canvas 2D tahapan gelombang tsunami">
                Visualisasi perspektif Canvas 2D tahapan gelombang tsunami.
              </canvas>
            </div>

            <div className="sim-timeline">
              <h3 id="phaseHeading">Urutan simulasi</h3>
              <ol className="phase-list" id="phaseList" aria-label="Pilih tahap simulasi">
                {phases.map((phase, index) => (
                  <li className={activePhase === index ? "active" : undefined} key={phase}>
                    <button
                      type="button"
                      aria-pressed={activePhase === index}
                      onClick={() => choosePhase(index)}
                    >
                      <span className="ph-num" aria-hidden="true">{index + 1}</span>
                      <span>{phase}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="sim-playback">
                <button className="btn btn-primary" type="button" onClick={playPhases} disabled={isPlaying}>
                  Putar semua tahap
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
              <p id="phaseDesc" className="phase-description" role="status" aria-live="polite">
                Pilih tahap untuk melihat penjelasannya.
              </p>
            </div>

            <div className="sim-data-panel" id="simResult">
              <div className="alert-bar medium" id="alertBar" role="status" aria-live="polite">
                Keluaran model bersifat ilustratif, bukan peringatan resmi.
              </div>
              <div className="result-body">
                <h3>Hasil skenario model</h3>
                <p className="model-output-note">
                  Nilai dihitung dari parameter di bawah dengan rumus sederhana. Nilai ini tidak menggambarkan kondisi pantai tertentu.
                </p>
                <div className="result-grid">
                  <div className="result-item"><div className="r-label">Tinggi gelombang model</div><div className="r-val" id="rHeight">Belum dihitung</div></div>
                  <div className="result-item"><div className="r-label">Waktu tempuh model</div><div className="r-val" id="rTime">Belum dihitung</div></div>
                  <div className="result-item"><div className="r-label">Kecepatan model</div><div className="r-val" id="rSpeed">Belum dihitung</div></div>
                  <div className="result-item"><div className="r-label">Jangkauan model</div><div className="r-val" id="rInland">Belum dihitung</div></div>
                </div>
              </div>
            </div>
          </div>

          <aside className="sim-panel" aria-label="Parameter skenario simulasi">
            <details className="sim-controls">
              <summary>Atur parameter</summary>
              <div className="sim-control-content">
                <fieldset>
                  <legend>Gempa</legend>
                  <div className="control-group">
                    <label className="control-label" htmlFor="magSlider">
                      Magnitudo <span className="val" id="magVal">7.5 SR</span>
                    </label>
                    <input id="magSlider" type="range" min="5.0" max="9.5" step="0.1" defaultValue="7.5" onChange={() => window.updateSim?.()} />
                    <div className="range-scale" aria-hidden="true"><span>5.0</span><span>7.0</span><span>8.0</span><span>9.0</span><span>9.5</span></div>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="depSlider">
                      Kedalaman <span className="val" id="depVal">30 km</span>
                    </label>
                    <input id="depSlider" type="range" min="5" max="200" step="5" defaultValue="30" onChange={() => window.updateSim?.()} />
                    <div className="range-scale" aria-hidden="true"><span>5 km</span><span>Dangkal</span><span>200 km</span></div>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="distSlider">
                      Jarak ke pantai <span className="val" id="distVal">80 km</span>
                    </label>
                    <input id="distSlider" type="range" min="10" max="500" step="10" defaultValue="80" onChange={() => window.updateSim?.()} />
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Kondisi lokasi</legend>
                  <div className="control-group">
                    <label className="control-label" htmlFor="locSelect">Kedalaman perairan</label>
                    <select id="locSelect" defaultValue="trench" onChange={() => window.updateSim?.()}>
                      <option value="shallow">Perairan dangkal</option>
                      <option value="trench">Zona subduksi</option>
                      <option value="deep">Laut dalam</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="coastSelect">Tipe pantai</label>
                    <select id="coastSelect" defaultValue="open" onChange={() => window.updateSim?.()}>
                      <option value="open">Pantai terbuka</option>
                      <option value="bay">Teluk atau muara</option>
                      <option value="cliff">Tebing</option>
                      <option value="mangrove">Hutan mangrove</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label className="control-label" htmlFor="timeSelect">Waktu skenario</label>
                    <select id="timeSelect" defaultValue="day" onChange={() => window.updateSim?.()}>
                      <option value="day">Siang hari</option>
                      <option value="night">Malam atau dini hari</option>
                    </select>
                  </div>
                </fieldset>
                <p className="sim-auto-update">Nilai model berubah saat parameter diubah.</p>
              </div>
            </details>

            <div className="sim3d-controls" aria-label="Kontrol visualisasi">
              <h3>Kontrol visual</h3>
              <span className="ctrl-hint">Seret untuk mengubah sudut pandang.</span>
              <span className="ctrl-hint">Gulir untuk memperbesar atau memperkecil.</span>
              <span className="ctrl-hint">Layar sentuh: geser atau cubit.</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
