const guidance = [
  {
    title: "Sebelum terjadi",
    steps: [
      "Kenali tanda alam, jalur evakuasi, dan tempat aman di sekitar rumah, sekolah, atau tempat kerja.",
      "Bicarakan rencana berkumpul dan cara menghubungi keluarga.",
      "Siapkan tas darurat berisi kebutuhan penting agar mudah dibawa saat harus mengungsi.",
    ],
  },
  {
    title: "Saat ada ancaman",
    steps: [
      "Jika gempa kuat atau lama terasa di pesisir, segera evakuasi ke tempat yang lebih tinggi atau menjauh dari pantai.",
      "Jauhi pantai, muara, dan sungai. Gunakan jalur evakuasi setempat dan bantu orang yang membutuhkan jika aman dilakukan.",
      "Pantau informasi BMKG dan ikuti arahan petugas. Jangan kembali untuk mengambil barang.",
    ],
  },
  {
    title: "Setelah gelombang",
    steps: [
      "Tetap berada di tempat aman sampai petugas menyatakan keadaan aman.",
      "Waspadai gelombang susulan, bangunan rusak, dan kabel atau benda berbahaya.",
      "Gunakan informasi resmi untuk mengetahui kapan dan melalui jalur mana Anda dapat kembali.",
    ],
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
          Ketika merasakan gempa kuat atau lama di wilayah pesisir, segera menuju tempat yang lebih tinggi atau menjauh dari pantai. Jangan menunggu peringatan jika tanda alam menunjukkan potensi tsunami. Ikuti arahan petugas dan informasi resmi.
        </p>
        <div className="mitigation-steps">
          {guidance.map((phase) => (
            <article key={phase.title}>
              <h3>{phase.title}</h3>
              <ul>
                {phase.steps.map((step) => <li key={step}>{step}</li>)}
              </ul>
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
