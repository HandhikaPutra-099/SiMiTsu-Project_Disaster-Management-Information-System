import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { ExternalLink, Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  tsunamiCatalogUrl,
  tsunamiEvents,
  tsunamiSourceUrl,
  type TsunamiCause,
  type TsunamiEvent,
} from "../../data/tsunamiEvents";

type SortOrder = "year-desc" | "year-asc" | "name-asc" | "deaths-desc";

const numberFormat = new Intl.NumberFormat("id-ID");

function formatValue(value: number | null, suffix = ""): string {
  return value === null ? "Tidak tersedia" : `${numberFormat.format(value)}${suffix}`;
}

export default function HistoricalDisasterDatabase() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [cause, setCause] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("year-desc");
  const [selectedEvent, setSelectedEvent] = useState<TsunamiEvent | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduceMotion = useReducedMotion();

  const years = useMemo(
    () => [...new Set(tsunamiEvents.map((event) => event.year))].sort((first, second) => second - first),
    [],
  );
  const locations = useMemo(
    () => [...new Set(tsunamiEvents.map((event) => event.name))].sort((first, second) => first.localeCompare(second, "id")),
    [],
  );
  const causes = useMemo(
    () => [...new Set(tsunamiEvents.map((event) => event.cause))].sort((first, second) => first.localeCompare(second, "id")),
    [],
  );

  const records = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id");
    const filtered = tsunamiEvents.filter((event) =>
      (!query || event.name.toLocaleLowerCase("id").includes(query)) &&
      (!year || String(event.year) === year) &&
      (!location || event.name === location) &&
      (!cause || event.cause === cause)
    );

    return filtered.sort((first, second) => {
      switch (sortOrder) {
        case "year-asc":
          return first.year - second.year;
        case "name-asc":
          return first.name.localeCompare(second.name, "id");
        case "deaths-desc":
          return (second.deaths ?? -1) - (first.deaths ?? -1);
        default:
          return second.year - first.year;
      }
    });
  }, [cause, location, search, sortOrder, year]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedEvent && !dialog.open) dialog.showModal();
    if (!selectedEvent && dialog.open) dialog.close();
  }, [selectedEvent]);

  function resetFilters() {
    setSearch("");
    setYear("");
    setLocation("");
    setCause("");
    setSortOrder("year-desc");
  }

  return (
    <section id="database" className="database-section">
      <div className="section-inner">
        <h2 className="section-title">Database bencana</h2>
        <p className="section-sub">
          Telusuri catatan tsunami Indonesia pilihan dari katalog NOAA NCEI. Arsip ini berisi kejadian historis, bukan pemantauan waktu nyata.
        </p>

        <div className="database-filters" role="group" aria-label="Filter arsip tsunami">
          <label htmlFor="databaseSearch">
            Cari nama kejadian
            <span className="archive-search-wrap">
              <Search aria-hidden="true" size={17} />
              <input
                id="databaseSearch"
                className="archive-search"
                type="search"
                placeholder="Contoh: Flores"
                autoComplete="off"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
            </span>
          </label>
          <label htmlFor="databaseYear">
            Tahun
            <select id="databaseYear" value={year} onChange={(event) => setYear(event.currentTarget.value)}>
              <option value="">Semua tahun</option>
              {years.map((recordYear) => <option key={recordYear} value={recordYear}>{recordYear}</option>)}
            </select>
          </label>
          <label htmlFor="databaseLocation">
            Lokasi
            <select id="databaseLocation" value={location} onChange={(event) => setLocation(event.currentTarget.value)}>
              <option value="">Semua lokasi</option>
              {locations.map((recordLocation) => <option key={recordLocation}>{recordLocation}</option>)}
            </select>
          </label>
          <label htmlFor="databaseCause">
            Penyebab
            <select
              id="databaseCause"
              value={cause}
              onChange={(event) => setCause(event.currentTarget.value as "" | TsunamiCause)}
            >
              <option value="">Semua penyebab</option>
              {causes.map((recordCause) => <option key={recordCause}>{recordCause}</option>)}
            </select>
          </label>
          <label htmlFor="databaseSort">
            Urutkan
            <select id="databaseSort" value={sortOrder} onChange={(event) => setSortOrder(event.currentTarget.value as SortOrder)}>
              <option value="year-desc">Tahun terbaru</option>
              <option value="year-asc">Tahun terlama</option>
              <option value="name-asc">Nama A–Z</option>
              <option value="deaths-desc">Korban meninggal terbanyak</option>
            </select>
          </label>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p id="databaseStatus" className="database-status" role="status" aria-live="polite">
            {records.length
              ? `${records.length} catatan ditampilkan dari arsip tsunami historis NOAA NCEI.`
              : "Tidak ada catatan yang cocok. Ubah kata pencarian atau filter."}
          </p>
          <button className="archive-reset" type="button" onClick={resetFilters}>
            <Filter aria-hidden="true" size={16} />
            Atur ulang filter
          </button>
        </div>

        <div className="table-wrap database-table-wrap" tabIndex={0} role="region" aria-label="Tabel database kejadian tsunami">
          <MotionConfig reducedMotion="user">
            <table className="database-table">
              <caption className="sr-only">Arsip kejadian tsunami Indonesia dari NOAA NCEI</caption>
              <thead>
                <tr>
                  <th scope="col">Kejadian / lokasi</th>
                  <th scope="col">Tahun</th>
                  <th scope="col">Penyebab</th>
                  <th scope="col">Magnitudo</th>
                  <th scope="col">Ketinggian maksimum tercatat</th>
                  <th scope="col">Korban meninggal</th>
                  <th scope="col">Detail</th>
                </tr>
              </thead>
              <tbody id="databaseBody">
                <AnimatePresence initial={false}>
                  {records.map((event) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.14 }}
                    >
                      <td>{event.name}</td>
                      <td>{event.year}</td>
                      <td>{event.cause}</td>
                      <td>{event.mag === null ? "Tidak tersedia" : `M${event.mag}`}</td>
                      <td>{formatValue(event.height, " m")}</td>
                      <td>{formatValue(event.deaths)}</td>
                      <td>
                        <button className="database-detail-button" type="button" onClick={() => setSelectedEvent(event)}>
                          Lihat detail
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </MotionConfig>
          {tsunamiEvents.length === 0 && (
            <p className="database-empty" role="alert">
              Arsip tidak tersedia. Muat ulang halaman atau buka katalog NOAA NCEI.
            </p>
          )}
        </div>
        <p className="database-source">
          Sumber data: <a href={tsunamiCatalogUrl} target="_blank" rel="noopener noreferrer">Katalog Tsunami Historis NOAA NCEI</a>.
          Nilai ketinggian mengikuti catatan sumber. Data korban hilang, luka-luka, dan pengungsi tidak tersedia pada dataset pilihan ini.
        </p>

        <dialog
          id="databaseDialog"
          className="database-dialog"
          aria-labelledby="databaseDialogTitle"
          ref={dialogRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setSelectedEvent(null);
            }
          }}
          onCancel={(event) => {
            event.preventDefault();
            setSelectedEvent(null);
          }}
          onClose={() => setSelectedEvent(null)}
        >
          {selectedEvent && (
            <>
              <div className="database-dialog-heading">
                <h2 id="databaseDialogTitle">{selectedEvent.name}</h2>
                <button
                  className="database-dialog-close"
                  type="button"
                  aria-label="Tutup detail kejadian"
                  onClick={() => setSelectedEvent(null)}
                >
                  <X aria-hidden="true" size={20} />
                </button>
              </div>
              <dl className="database-detail-list">
                <Detail label="Tanggal" value={selectedEvent.date ?? "Tidak tersedia"} />
                <Detail label="Tahun" value={String(selectedEvent.year)} />
                <Detail label="Jenis penyebab" value={selectedEvent.cause} />
                <Detail label="Magnitudo gempa" value={selectedEvent.mag === null ? "Tidak tersedia" : `M${selectedEvent.mag}`} />
                <Detail label="Ketinggian maksimum tercatat" value={formatValue(selectedEvent.height, " m")} />
                <Detail label="Korban meninggal" value={formatValue(selectedEvent.deaths)} />
                <Detail label="Orang hilang" value={formatValue(selectedEvent.missing)} />
                <Detail label="Korban luka-luka" value={formatValue(selectedEvent.injured)} />
                <Detail label="Pengungsi" value={formatValue(selectedEvent.displaced)} />
                <Detail label="Dokumentasi" value="Tidak tersedia dalam dataset ini" />
              </dl>
              <p className="database-detail-source">
                Sumber informasi:{" "}
                <a href={`${tsunamiSourceUrl}${selectedEvent.sourceId}`} target="_blank" rel="noopener noreferrer">
                  Buka catatan NOAA NCEI <ExternalLink aria-hidden="true" className="inline-block" size={14} />
                </a>
              </p>
              <button className="database-dialog-dismiss" type="button" onClick={() => setSelectedEvent(null)}>
                Tutup
              </button>
            </>
          )}
        </dialog>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
