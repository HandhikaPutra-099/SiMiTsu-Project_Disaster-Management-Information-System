import { useState } from "react";

const phases = [
  "Kondisi Normal",
  "Gempa, dasar laut naik",
  "Gelombang terbentuk",
  "Propagasi laut dalam",
  "Pendangkalan dan amplifikasi",
  "Gelombang mencapai pantai",
];

export default function TsunamiSimulator() {
  const [activePhase, setActivePhase] = useState(0);

  function choosePhase(phase: number) {
    setActivePhase(phase);
    window.setPhase?.(phase);
  }

  return (
    <section id="simulator">
      <div className="section-inner">
        <h2 className="section-title">Simulasi tsunami interaktif</h2>
        <p className="section-sub">
          Ubah parameter untuk melihat visualisasi perspektif yang digambar dengan Canvas 2D.
        </p>
        <p className="simulation-notice" role="note">
          Simulasi ini untuk edukasi, bukan prakiraan atau peringatan resmi. Untuk ancaman nyata, ikuti informasi BMKG, BNPB, dan petugas setempat.
        </p>
        <p className="data-status" id="simulatorStatus" role="status" aria-live="polite">
          Simulasi sedang dimuat.
        </p>

        <div className="sim-unified-layout">
          <div className="sim-panel">
            <h3>Parameter gempa</h3>
            <div className="control-group">
              <label className="control-label" htmlFor="magSlider">
                Magnitudo gempa <span className="val" id="magVal">7.5 SR</span>
              </label>
              <input id="magSlider" type="range" min="5.0" max="9.5" step="0.1" defaultValue="7.5" onChange={() => window.updateSim?.()} />
              <div className="range-scale" aria-hidden="true"><span>5.0</span><span>7.0</span><span>8.0</span><span>9.0</span><span>9.5</span></div>
            </div>
            <div className="control-group">
              <label className="control-label" htmlFor="depSlider">
                Kedalaman gempa <span className="val" id="depVal">30 km</span>
              </label>
              <input id="depSlider" type="range" min="5" max="200" step="5" defaultValue="30" onChange={() => window.updateSim?.()} />
              <div className="range-scale" aria-hidden="true"><span>5 km</span><span>Dangkal</span><span>200 km</span></div>
            </div>
            <div className="control-group">
              <label className="control-label" htmlFor="distSlider">
                Jarak episentrum ke pantai <span className="val" id="distVal">80 km</span>
              </label>
              <input id="distSlider" type="range" min="10" max="500" step="10" defaultValue="80" onChange={() => window.updateSim?.()} />
            </div>

            <hr className="sim-divider" />
            <h3>Kondisi lingkungan</h3>
            <div className="control-group">
              <label className="control-label" htmlFor="locSelect">Lokasi / zona laut</label>
              <select id="locSelect" defaultValue="trench" onChange={() => window.updateSim?.()}>
                <option value="shallow">Perairan dangkal / Paparan benua</option>
                <option value="trench">Zona subduksi (palung laut)</option>
                <option value="deep">Laut dalam (&gt;3000 m)</option>
              </select>
            </div>
            <div className="control-group">
              <label className="control-label" htmlFor="coastSelect">Tipe pantai</label>
              <select id="coastSelect" defaultValue="open" onChange={() => window.updateSim?.()}>
                <option value="open">Pantai terbuka / landai</option>
                <option value="bay">Teluk / muara sungai (+80%)</option>
                <option value="cliff">Tebing / pantai curam (-30%)</option>
                <option value="mangrove">Hutan mangrove (-40%)</option>
              </select>
            </div>
            <div className="control-group">
              <label className="control-label" htmlFor="timeSelect">Waktu kejadian</label>
              <select id="timeSelect" defaultValue="day" onChange={() => window.updateSim?.()}>
                <option value="day">Siang hari (06–18)</option>
                <option value="night">Malam / dini hari</option>
              </select>
            </div>
            <button className="btn btn-primary simulator-update" type="button" onClick={() => window.updateSim?.()}>
              Terapkan parameter
            </button>

            <hr className="sim-divider" />
            <h3>Fase simulasi</h3>
            <ul className="phase-list" id="phaseList" aria-label="Pilih fase simulasi">
              {phases.map((phase, index) => (
                <li className={activePhase === index ? "active" : undefined} key={phase}>
                  <button
                    type="button"
                    aria-pressed={activePhase === index}
                    onClick={() => choosePhase(index)}
                  >
                    <span className="ph-num">{index + 1}</span>{phase}
                  </button>
                </li>
              ))}
            </ul>
            <div className="sim-playback">
              <button className="btn btn-primary" type="button" onClick={() => window.autoPlay3D?.()}>
                Putar fase
              </button>
              <button className="btn btn-outline" type="button" onClick={() => { window.resetPhase?.(); setActivePhase(0); }}>
                Atur ulang fase
              </button>
            </div>
            <div id="phaseDesc" className="phase-description" role="status" aria-live="polite">
              Kondisi laut normal. Lihat pantai berpasir, bangunan, vegetasi, dan figur manusia.
            </div>
            <hr className="sim-divider" />
            <h3>Kontrol visualisasi</h3>
            <div className="sim3d-controls">
              <span className="ctrl-hint">Seret dengan tombol kiri untuk memutar</span>
              <span className="ctrl-hint">Seret dengan tombol kanan untuk menggeser</span>
              <span className="ctrl-hint">Gulir untuk memperbesar atau memperkecil</span>
              <span className="ctrl-hint">Layar sentuh: geser atau cubit</span>
            </div>
          </div>

          <div className="sim-right-col">
            <canvas id="threeCanvas" role="img" aria-label="Visualisasi Canvas 2D perspektif tahapan gelombang tsunami">
              Visualisasi Canvas 2D perspektif tahapan gelombang tsunami.
            </canvas>
            <div className="sim-data-panel" id="simResult">
              <div className="alert-bar medium" id="alertBar" role="status" aria-live="polite">
                Simulasi edukatif, bukan peringatan resmi.
              </div>
              <div className="result-body">
                <div className="result-grid">
                  <div className="result-item"><div className="r-label">Tinggi gelombang ilustratif</div><div className="r-val" id="rHeight">Belum dihitung</div></div>
                  <div className="result-item"><div className="r-label">Waktu tempuh model</div><div className="r-val" id="rTime">Belum dihitung</div></div>
                  <div className="result-item"><div className="r-label">Kecepatan model</div><div className="r-val" id="rSpeed">Belum dihitung</div></div>
                  <div className="result-item"><div className="r-label">Jangkauan model</div><div className="r-val" id="rInland">Belum dihitung</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
