import type * as Leaflet from "leaflet";
import type { TsunamiEvent } from "../data/tsunamiEvents";

declare global {
  interface Window {
    tsunamiEvents: TsunamiEvent[];
    L: typeof Leaflet;
    __simitsuMapReady?: boolean;
    setMapFilter?: (filter: "all" | "plates" | "tsunami" | "sensor") => void;
    setMapCriteria?: (query: string, year: string, cause: string) => void;
    updateSim?: () => void;
    initLeafletMap?: () => void;
    initCauseAnimations?: () => void;
    replayCause?: (index: number) => void;
    pauseCause?: (index: number) => void;
    __simitsuLegacyPromise?: Promise<void>;
  }
}

export {};
