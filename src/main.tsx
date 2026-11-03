import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./styles/tailwind.css";
import "../assets/css/style.css";
import "../assets/css/responsive.css";
import "./styles/components.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemen root aplikasi tidak ditemukan.");
}

createRoot(rootElement).render(<App />);
