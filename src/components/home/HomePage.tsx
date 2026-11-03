export default function HomePage() {
  return (
    <section id="hero">
      <div className="section-inner home-layout">
        <div className="hero-content">
          <p className="hero-kicker">Sistem Mitigasi Tsunami Indonesia</p>
          <h1 className="hero-title">Kenali tsunami. Siapkan langkah aman.</h1>
          <p className="hero-sub">
            SIMITSU membantu Anda memahami penyebab tsunami, menelusuri catatan historis, dan mempelajari langkah keselamatan.
          </p>
          <div className="hero-ctas">
            <a href="#map" className="btn btn-primary">Buka peta bencana</a>
            <a href="#mitigation" className="btn btn-outline">Pelajari langkah keselamatan</a>
          </div>
        </div>
        <figure className="hero-visual">
          <svg
            viewBox="0 0 760 420"
            role="img"
            aria-labelledby="hero-diagram-title hero-diagram-description"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title id="hero-diagram-title">Skema tsunami bergerak menuju pesisir</title>
            <desc id="hero-diagram-description">
              Ilustrasi konseptual gelombang di atas dasar laut yang terangkat dan bergerak menuju daratan.
            </desc>
            <defs>
              <marker id="wave-direction" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0 0 8 4 0 8Z" fill="#38bdf8" />
              </marker>
              <marker id="uplift-direction" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0 0 8 4 0 8Z" fill="#fb923c" />
              </marker>
            </defs>
            <path d="M24 96H612L675 151 736 166V344H24Z" fill="#0b2638" />
            <path d="M26 112c33-20 61 20 94 0s61 20 94 0 61 20 94 0 61 20 94 0 61 20 94 0 61 20 94 0"
              fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            <path d="M96 76h420" fill="none" stroke="#38bdf8" strokeWidth="2"
              markerEnd="url(#wave-direction)" opacity=".8" />
            <path d="M24 278 286 278 340 251 378 274 430 285 492 282 540 253 586 235 612 151 675 151 736 166V344H24Z"
              fill="#263b49" />
            <path d="M24 278 286 278 340 251 378 274 430 285 492 282 540 253 586 235 612 151"
              fill="none" stroke="#a9c1cf" strokeWidth="3" />
            <path d="m76 372 248-94 113 8 75-44" fill="none" stroke="#fb923c" strokeWidth="5"
              strokeLinecap="round" />
            <path d="M340 249v-76" fill="none" stroke="#fb923c" strokeWidth="3"
              markerEnd="url(#uplift-direction)" />
            <circle cx="340" cy="251" r="7" fill="#fb923c" />
            <text x="50" y="58" fill="#c6d6df" fontSize="16" fontFamily="system-ui, sans-serif">Laut</text>
            <text x="614" y="133" fill="#c6d6df" fontSize="16" fontFamily="system-ui, sans-serif">Pesisir</text>
            <text x="358" y="190" fill="#ffd2aa" fontSize="14" fontFamily="system-ui, sans-serif">Dasar laut terangkat</text>
            <text x="107" y="352" fill="#ffd2aa" fontSize="14" fontFamily="system-ui, sans-serif">Gerak lempeng</text>
          </svg>
          <figcaption id="hero-visual-caption">
            Skema konseptual: dasar laut terangkat dan gelombang bergerak ke pesisir. Bukan peta atau prakiraan.
          </figcaption>
        </figure>
        <p className="hero-source">Catatan historis bersumber dari NOAA NCEI. Situs ini tidak menyajikan peringatan waktu nyata.</p>
      </div>
    </section>
  );
}
