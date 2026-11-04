(function buildHistory() {
  const tbody = document.getElementById("historyBody");
  const status = document.getElementById("historyStatus");
  if (!tbody || !status) return;

  if (typeof tsunamiEvents === "undefined" || !Array.isArray(tsunamiEvents)) {
    status.textContent = "Data riwayat tidak dapat dimuat. Coba muat ulang halaman atau buka katalog NOAA NCEI.";
    return;
  }

  if (tsunamiEvents.length === 0) {
    status.textContent = "Belum ada catatan tsunami terverifikasi untuk ditampilkan.";
    return;
  }

  const sorted = [...tsunamiEvents].sort((a, b) => b.year - a.year);
  sorted.forEach(ev => {
    const row = document.createElement("tr");
    const values = [
      ev.year,
      ev.name,
      Number.isFinite(ev.mag) ? `M${ev.mag}` : "Tidak tersedia",
      Number.isFinite(ev.height) ? `${ev.height} m` : "Tidak tersedia",
      Number.isFinite(ev.deaths) ? ev.deaths.toLocaleString("id-ID") : "Tidak tersedia",
      ev.cause,
    ];

    values.forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      if (index === 2) {
        const badge = document.createElement("span");
        badge.className = `badge-mag ${getMagClass(ev.mag)}`;
        badge.textContent = value;
        cell.replaceChildren(badge);
      }
      row.appendChild(cell);
    });

    const sourceCell = document.createElement("td");
    const sourceLink = document.createElement("a");
    sourceLink.href = `${tsunamiSourceUrl}${ev.sourceId}`;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = "Sumber NOAA";
    sourceLink.setAttribute("aria-label", `Buka catatan NOAA untuk tsunami ${ev.name}, ${ev.year}`);
    sourceCell.appendChild(sourceLink);
    row.appendChild(sourceCell);
    tbody.appendChild(row);
  });

  status.textContent = `${sorted.length} catatan pilihan dari katalog NOAA NCEI. Angka korban merujuk pada korban meninggal yang tercatat.`;

  function getMagClass(magnitude) {
    if (!Number.isFinite(magnitude)) return "mag-low";
    if (magnitude >= 8.5) return "mag-extreme";
    if (magnitude >= 7.8) return "mag-high";
    if (magnitude >= 7.0) return "mag-med";
    return "mag-low";
  }
})();
