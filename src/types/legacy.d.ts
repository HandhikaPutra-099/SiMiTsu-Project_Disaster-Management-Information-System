import type * as Leaflet from "leaflet";
import type { TsunamiEvent } from "../data/tsunamiEvents";

declare global {
  interface Window {
    tsunamiEvents: TsunamiEvent[];
    L: typeof Leaflet;
    __simitsuMapReady?: boolean;
    setMapFilter?: (filter: "all" | "plates" | "tsunami" | "sensor") => void;
    updateSim?: () => void;
    initLeafletMap?: () => void;
    init3DScene?: () => void;
    initCauseAnimations?: () => void;
    setPhase?: (phase: number) => void;
    autoPlay3D?: () => void;
    pauseAutoPlay3D?: () => void;
    resetPhase?: () => void;
    replayCause?: (index: number) => void;
    pauseCause?: (index: number) => void;
    __simitsuLegacyPromise?: Promise<void>;
  }
}

export {};
