import { useEffect, useState } from "react";

const causes = [
  {
    title: "Gempa subduksi",
    label: "Skema subduksi dan dasar laut terangkat",
    summary: "Pemicu paling umum tsunami besar",
    description: "Gempa dangkal di zona subduksi dapat menggeser dasar laut secara vertikal. Perubahan dasar laut memindahkan kolom air dan dapat membangkitkan tsunami. Indonesia berada di atas Cincin Api Pasifik, menjadikannya salah satu wilayah paling aktif tektonik di dunia.",
    example: "Flores 1992 (M7.8, 26 m), Sumatra 2004 (M9.1, 50.9 m)",
    canvasIndex: 0,
  },
  {
    title: "Erupsi atau runtuhan gunung api",
    label: "Skema erupsi gunung api dan gelombang di laut",
    summary: "Pemindahan air oleh material vulkanik",
    description: "Letusan, runtuhnya lereng, atau material gunung api yang masuk ke laut dapat memindahkan air. Dampaknya bergantung pada proses dan kondisi setempat. Krakatau 1883 menghasilkan gelombang hingga 41 meter dan tercatat sebagai salah satu bencana tsunami terbesar dalam sejarah.",
    example: "Krakatau 1883 (41 m, 36.000+ jiwa)",
    canvasIndex: 1,
  },
  {
    title: "Longsor bawah laut",
    label: "Skema longsoran sedimen di lereng bawah laut",
    summary: "Pergerakan massa sedimen di dasar laut",
    description: "Sedimen yang bergerak cepat di dasar laut dapat mendorong air di sekitarnya. Tsunami akibat longsor sering berdampak lokal tetapi dapat sangat destruktif di kawasan sekitarnya, terutama di zona pesisir dengan kemiringan lereng bawah laut yang curam.",
    example: "Biasanya berdampak lokal, sulit diprediksi dari pantai",
    canvasIndex: 2,
  },
  {
    title: "Jatuhnya benda langit",
    label: "Skema benda langit memasuki laut dan membentuk gelombang",
    summary: "Tumbukan objek luar angkasa di lautan",
    description: "Tumbukan asteroid berukuran besar ke laut dapat memindahkan air dan membangkitkan gelombang tsunami. Pemicu ini sangat jarang dibandingkan gempa bumi dan tidak pernah tercatat dalam sejarah modern.",
    example: "Sangat jarang — tidak ada catatan modern yang terverifikasi",
    canvasIndex: 3,
  },
];

export default function DisasterEducation() {
  const [pausedCauses, setPausedCauses] = useState([true, true, true, true]);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updateMotionPreference(event: MediaQueryListEvent) {
      setReducedMotion(event.matches);
      if (event.matches) setPausedCauses([true, true, true, true]);
    }

    preference.addEventListener("change", updateMotionPreference);
    return () => preference.removeEventListener("change", updateMotionPreference);
  }, []);

  function toggleCause(index: number) {
    const shouldPause = !pausedCauses[index];
    if (shouldPause) {
      window.pauseCause?.(index);
    } else {
      window.replayCause?.(index);
    }
    setPausedCauses((previous) => previous.map((isPaused, causeIndex) =>
      causeIndex === index ? shouldPause : isPaused
    ));
  }

  function replayCause(index: number) {
    window.replayCause?.(index);
    setPausedCauses((previous) => previous.map((isPaused, causeIndex) =>
      causeIndex === index ? false : isPaused
    ));
  }

  return (
    <section id="education" className="education-section">
      <div className="section-inner">
        <div className="education-header">
          <h2 className="section-title">Pahami penyebab tsunami</h2>
          <p className="section-sub">
            Tsunami dipicu oleh gangguan besar yang memindahkan kolom air. Empat mekanisme utama dijelaskan di bawah, dengan animasi skematik dan contoh dari catatan historis.
          </p>
        </div>

        {/* Featured cause — larger, full-width treatment for most common cause */}
        <article className="cause-featured" key={causes[0].title}>
          <div className="cause-featured-visual">
            <canvas
              id={`causeCanvas${causes[0].canvasIndex}`}
              width="840"
              height="240"
              role="img"
              aria-label={causes[0].label}
            >
              {causes[0].label}
            </canvas>
            {!reducedMotion && (
              <div className="cause-controls">
                <button
                  className="cause-control"
                  type="button"
                  aria-label={`Putar ulang animasi: ${causes[0].title}`}
                  onClick={() => replayCause(causes[0].canvasIndex)}
                >
                  Putar ulang
                </button>
                <button
                  className="cause-control"
                  type="button"
                  aria-label={`${pausedCauses[causes[0].canvasIndex] ? "Putar" : "Jeda"} animasi: ${causes[0].title}`}
                  onClick={() => toggleCause(causes[0].canvasIndex)}
                >
                  {pausedCauses[causes[0].canvasIndex] ? "Putar" : "Jeda"}
                </button>
              </div>
            )}
            {reducedMotion && (
              <p className="cause-motion-note">Animasi nonaktif sesuai preferensi perangkat.</p>
            )}
          </div>
          <div className="cause-featured-body">
            <p className="cause-tag">{causes[0].summary}</p>
            <h3>{causes[0].title}</h3>
            <p>{causes[0].description}</p>
            <p className="cause-example">
              <strong>Contoh dari arsip:</strong> {causes[0].example}
            </p>
          </div>
        </article>

        {/* Remaining three causes in grid */}
        <div className="causes-grid">
          {causes.slice(1).map((cause) => (
            <article className="cause-card" key={cause.title}>
              <div className="cause-canvas-wrap">
                <canvas
                  id={`causeCanvas${cause.canvasIndex}`}
                  width="680"
                  height="180"
                  role="img"
                  aria-label={cause.label}
                >
                  {cause.label}
                </canvas>
              </div>
              <div className="cause-body">
                <p className="cause-tag">{cause.summary}</p>
                <h3>{cause.title}</h3>
                {reducedMotion ? (
                  <p className="cause-motion-note">
                    Animasi nonaktif sesuai preferensi perangkat.
                  </p>
                ) : (
                  <div className="cause-controls">
                    <button
                      className="cause-control"
                      type="button"
                      aria-label={`Putar ulang animasi: ${cause.title}`}
                      onClick={() => replayCause(cause.canvasIndex)}
                    >
                      Putar ulang
                    </button>
                    <button
                      className="cause-control"
                      type="button"
                      aria-label={`${pausedCauses[cause.canvasIndex] ? "Putar" : "Jeda"} animasi: ${cause.title}`}
                      onClick={() => toggleCause(cause.canvasIndex)}
                    >
                      {pausedCauses[cause.canvasIndex] ? "Putar" : "Jeda"}
                    </button>
                  </div>
                )}
                <details className="cause-info">
                  <summary>Baca penjelasan</summary>
                  <p>{cause.description}</p>
                  <p className="cause-example">
                    <strong>Catatan:</strong> {cause.example}
                  </p>
                </details>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
