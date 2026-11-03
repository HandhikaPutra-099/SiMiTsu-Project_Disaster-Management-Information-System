import { tsunamiEvents } from "../../data/tsunamiEvents";

const causeCounts = tsunamiEvents.reduce<Record<string, number>>((counts, event) => {
  counts[event.cause] = (counts[event.cause] ?? 0) + 1;
  return counts;
}, {});

export default function AnalyticsSummary() {
  return (
    <div className="archive-analytics mt-6 border-y border-[var(--border)] py-4">
      <h3 className="mb-2 text-sm font-semibold">Ringkasan arsip pilihan</h3>
      <p className="text-sm text-[var(--muted)]">
        {tsunamiEvents.length} catatan:{" "}
        {Object.entries(causeCounts)
          .map(([cause, count]) => `${count} ${cause.toLocaleLowerCase("id")}`)
          .join(", ")}.
        Jumlah ini hanya merangkum catatan yang ditampilkan, bukan seluruh kejadian tsunami.
      </p>
    </div>
  );
}
