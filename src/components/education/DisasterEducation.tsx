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
  return (
    <section id="causes">
      <div className="section-inner">
        <h2 className="section-title">Bagaimana tsunami terjadi</h2>
        <p className="section-sub">
          Pilih ringkasan pada tiap animasi untuk melihat penjelasan singkat tentang pemindahan air laut.
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
                <button
                  className="play-btn"
                  type="button"
                  onClick={() => window.replayCause?.(index)}
                >
                  Putar ulang
                </button>
              </div>
              <div className="cause-body">
                <h3>{cause.title}</h3>
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
