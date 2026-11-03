import { useEffect, useState } from "react";

const causes = [
  {
    title: "Gempa subduksi",
    label: "Skema subduksi dan dasar laut terangkat",
    description: "Gempa dangkal di zona subduksi dapat menggeser dasar laut secara vertikal. Perubahan dasar laut memindahkan kolom air dan dapat membangkitkan tsunami.",
  },
  {
    title: "Erupsi atau runtuhan gunung api",
    label: "Skema erupsi gunung api dan gelombang di laut",
    description: "Letusan, runtuhnya lereng, atau material gunung api yang masuk ke laut dapat memindahkan air. Dampaknya bergantung pada proses dan kondisi setempat.",
  },
  {
    title: "Longsor bawah laut",
    label: "Skema longsoran sedimen di lereng bawah laut",
    description: "Sedimen yang bergerak cepat di dasar laut dapat mendorong air di sekitarnya. Tsunami akibat longsor sering berdampak lokal, tetapi tingkat bahayanya tetap bergantung pada kondisi lokasi.",
  },
  {
    title: "Jatuhnya benda langit",
    label: "Skema benda langit memasuki laut dan membentuk gelombang",
    description: "Tumbukan asteroid berukuran besar ke laut dapat memindahkan air dan membangkitkan gelombang tsunami. Pemicu ini sangat jarang dibandingkan gempa bumi.",
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
        <h2 className="section-title">Pahami penyebab tsunami</h2>
        <p className="section-sub">
          Gempa bumi, aktivitas gunung api, dan longsor bawah laut dapat memindahkan air laut. Ringkasan menjelaskan tiap proses.
        </p>
        <div className="causes-grid">
          {causes.map((cause, index) => (
            <article className="cause-card" key={cause.title}>
              <div className="cause-canvas-wrap">
                <canvas
                  id={`causeCanvas${index}`}
                  width="680"
                  height="200"
                  role="img"
                  aria-label={cause.label}
                >
                  {cause.label}
                </canvas>
              </div>
              <div className="cause-body">
                <h3>{cause.title}</h3>
                {reducedMotion ? (
                  <p className="cause-motion-note">
                    Skema tetap ditampilkan. Animasi bergerak nonaktif sesuai preferensi perangkat.
                  </p>
                ) : (
                  <div className="cause-controls">
                    <button
                      className="cause-control"
                      type="button"
                      aria-label={`Putar ulang animasi: ${cause.title}`}
                      onClick={() => replayCause(index)}
                    >
                      Putar ulang animasi
                    </button>
                    <button
                      className="cause-control"
                      type="button"
                      aria-label={`${pausedCauses[index] ? "Putar" : "Jeda"} animasi: ${cause.title}`}
                      onClick={() => toggleCause(index)}
                    >
                      {pausedCauses[index] ? "Putar animasi" : "Jeda animasi"}
                    </button>
                  </div>
                )}
                <details className="cause-info">
                  <summary>Baca ringkasan</summary>
                  <p>{cause.description}</p>
                </details>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
