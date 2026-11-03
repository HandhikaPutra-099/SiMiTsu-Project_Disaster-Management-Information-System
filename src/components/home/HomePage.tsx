import { MapPinned } from "lucide-react";
import InteractiveMap from "../map/InteractiveMap";

export default function HomePage() {
  return (
    <section id="hero">
      <div className="home-layout">
        <div className="hero-content">
          <h1 className="hero-title">Kenali Tsunami, Pahami Risikonya, Siapkan Langkah Aman.</h1>
          <p className="hero-sub">
            Pelajari bagaimana tsunami terjadi, telusuri kejadian yang pernah terjadi, dan pahami langkah mitigasi melalui informasi serta simulasi interaktif.
          </p>
          <div className="hero-ctas">
            <a href="#simulator" className="btn btn-primary">Jelajahi Simulasi</a>
            <a href="#database" className="btn btn-outline">Lihat Database Bencana</a>
          </div>
        </div>
        <div className="home-map-column">
          <h2 className="home-map-heading" id="home-map-heading">
            <MapPinned aria-hidden="true" className="inline-block h-5 w-5 align-[-3px]" /> Catatan tsunami dan konteks tektonik
          </h2>
          <p className="home-map-source">
            Kejadian historis dari NOAA NCEI. Garis tektonik dan titik sensor adalah ilustrasi, bukan data operasional.
          </p>
          <InteractiveMap />
        </div>
      </div>
    </section>
  );
}
