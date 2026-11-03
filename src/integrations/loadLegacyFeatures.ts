import type { TsunamiEvent } from "../data/tsunamiEvents";
import controlsUrl from "../../assets/js/simulator-controls.js?url";
import simulatorUrl from "../../assets/js/simulator-3d.js?url";
import causesUrl from "../../assets/js/cause-animations.js?url";
import mapUrl from "../../assets/js/map.js?url";

const scripts = [controlsUrl, simulatorUrl, causesUrl, mapUrl];

function appendClassicScript(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Gagal memuat modul fitur lama: ${source}`));
    };
    document.head.appendChild(script);
  });
}

export function loadLegacyFeatures(events: TsunamiEvent[]): Promise<void> {
  if (window.__simitsuLegacyPromise) return window.__simitsuLegacyPromise;

  window.tsunamiEvents = events;

  const initialization = import("leaflet")
    .then(({ default: leaflet }) => {
      window.L = leaflet;
    })
    .then(() =>
      scripts.reduce<Promise<void>>(
        (pending, source) => pending.then(() => appendClassicScript(source)),
        Promise.resolve(),
      ),
    )
    .then(() => {
      if (
        !window.updateSim ||
        !window.initLeafletMap ||
        !window.init3DScene ||
        !window.initCauseAnimations
      ) {
        throw new Error("Modul peta atau simulasi tidak menyediakan fungsi inisialisasi.");
      }

      window.updateSim();
      window.initLeafletMap();
      window.init3DScene();
      window.initCauseAnimations();
    });

  window.__simitsuLegacyPromise = initialization;
  return initialization;
}
