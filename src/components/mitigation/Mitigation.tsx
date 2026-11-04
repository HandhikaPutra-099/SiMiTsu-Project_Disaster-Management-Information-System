const guidance = [
  {
    phase: "Sebelum",
    title: "Sebelum terjadi",
    intro: "Persiapan sebelum ancaman membuat respons lebih cepat dan tepat.",
    steps: [
      {
        heading: "Kenali jalur evakuasi",
        detail: "Pelajari rute dan titik kumpul evakuasi yang ditetapkan untuk wilayah Anda, di sekitar rumah, sekolah, dan tempat kerja.",
      },
      {
        heading: "Buat rencana keluarga",
        detail: "Bicarakan rencana berkumpul dan cara menghubungi anggota keluarga jika terpisah saat ancaman.",
      },
      {
        heading: "Siapkan tas darurat",
        detail: "Tas berisi dokumen penting, obat-obatan, air minum, dan kebutuhan dasar agar mudah dibawa saat harus mengungsi.",
      },
    ],
    accent: "before",
  },
  {
    phase: "Saat ancaman",
    title: "Saat ada ancaman",
    intro: "Setiap detik berpengaruh. Tindakan cepat menyelamatkan jiwa.",
    steps: [
      {
        heading: "Gempa kuat atau lama di pesisir?",
        detail: "Segera evakuasi ke tempat yang lebih tinggi atau menjauh dari pantai. Jangan menunggu sirene atau peringatan resmi.",
      },
      {
        heading: "Jauhi pantai dan sungai",
        detail: "Jauhi pantai, muara, dan sungai. Gunakan jalur evakuasi setempat. Bantu orang yang membutuhkan jika aman dilakukan.",
      },
      {
        heading: "Ikuti arahan petugas",
        detail: "Pantau informasi BMKG dan ikuti arahan petugas. Jangan kembali untuk mengambil barang.",
      },
    ],
    accent: "during",
  },
  {
    phase: "Setelah",
    title: "Setelah gelombang",
    intro: "Bahaya belum tentu berakhir setelah gelombang pertama.",
    steps: [
      {
        heading: "Tunggu pernyataan aman",
        detail: "Tetap berada di tempat aman sampai petugas menyatakan keadaan aman. Jangan kembali lebih awal.",
      },
      {
        heading: "Waspadai bahaya sekunder",
        detail: "Perhatikan kemungkinan gelombang susulan, bangunan yang rusak, dan kabel atau benda berbahaya di jalur evakuasi.",
      },
      {
        heading: "Gunakan informasi resmi",
        detail: "Pantau informasi resmi BMKG untuk mengetahui kapan dan melalui jalur mana Anda dapat kembali ke wilayah Anda.",
      },
    ],
    accent: "after",
  },
];

export default function Mitigation() {
  return (
    <section id="mitigation">
      <div className="section-inner">
        <h2 className="section-title">Langkah keselamatan tsunami</h2>
        <p className="section-sub">
          Kenali jalur dan tempat evakuasi yang ditetapkan untuk wilayah Anda. Ikuti petugas serta arahan resmi setempat.
        </p>

        <p className="safety-message">
          Ketika merasakan gempa kuat atau lama di wilayah pesisir, segera menuju tempat yang lebih tinggi atau menjauh dari pantai. Jangan menunggu peringatan jika tanda alam menunjukkan potensi tsunami.
        </p>

        <div className="mitigation-phases">
          {guidance.map((phase) => (
            <article key={phase.phase} className={`mitigation-phase mitigation-phase--${phase.accent}`}>
              <div className="mitigation-phase-head">
                <span className="mitigation-phase-label">{phase.phase}</span>
                <h3>{phase.title}</h3>
                <p className="mitigation-phase-intro">{phase.intro}</p>
              </div>
              <ol className="mitigation-steps-list">
                {phase.steps.map((step) => (
                  <li key={step.heading}>
                    <h4>{step.heading}</h4>
                    <p>{step.detail}</p>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>

        <p className="mitigation-source">
          Rute, titik aman, dan arahan evakuasi mengikuti kondisi setempat. Cari panduan dari{" "}
          <a href="https://www.bnpb.go.id/" target="_blank" rel="noopener noreferrer">BNPB</a>,{" "}
          <a href="https://www.bmkg.go.id/" target="_blank" rel="noopener noreferrer">BMKG</a>, BPBD, dan petugas di wilayah Anda.
        </p>
      </div>
    </section>
  );
}
