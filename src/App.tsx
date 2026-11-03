import { lazy, Suspense, useEffect, useState } from "react";
import DisasterEducation from "./components/education/DisasterEducation";
import HistoryTable from "./components/database/HistoryTable";
import HomePage from "./components/home/HomePage";
import Layout from "./components/layout/Layout";
import Mitigation from "./components/mitigation/Mitigation";
import TsunamiSimulator from "./components/simulator/TsunamiSimulator";
import { tsunamiEvents } from "./data/tsunamiEvents";
import { loadLegacyFeatures } from "./integrations/loadLegacyFeatures";

const HistoricalDisasterDatabase = lazy(
  () => import("./components/database/HistoricalDisasterDatabase"),
);

export default function App() {
  const [legacyIntegrationError, setLegacyIntegrationError] = useState("");

  useEffect(() => {
    loadLegacyFeatures(tsunamiEvents).catch((error: unknown) => {
      const message = error instanceof Error
        ? error.message
        : "Fitur peta atau simulasi gagal dimuat. Muat ulang halaman untuk mencoba kembali.";
      setLegacyIntegrationError(message);
      const mapStatus = document.getElementById("mapStatus");
      const simulatorStatus = document.getElementById("simulatorStatus");
      if (mapStatus) mapStatus.textContent = message;
      if (simulatorStatus) simulatorStatus.textContent = message;
    });
  }, []);

  return (
    <Layout>
      <HomePage />
      <DisasterEducation />
      <TsunamiSimulator />
      <Suspense fallback={<p className="section-inner" role="status">Memuat arsip tsunami...</p>}>
        <HistoricalDisasterDatabase />
      </Suspense>
      <HistoryTable />
      <Mitigation />
      {legacyIntegrationError && <p className="sr-only" role="alert">{legacyIntegrationError}</p>}
    </Layout>
  );
}
