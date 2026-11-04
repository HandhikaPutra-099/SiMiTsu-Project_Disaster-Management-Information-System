(function buildHistoryTimeline() {
  const timeline = document.getElementById("historyTimeline");
  const status = document.getElementById("historyStatus");
  if (!timeline || !status) return;

  if (typeof tsunamiEvents === "undefined" || !Array.isArray(tsunamiEvents)) {
    status.textContent = "Linimasa tidak dapat dimuat. Coba muat ulang halaman.";
    return;
  }

  if (tsunamiEvents.length === 0) {
    status.textContent = "Belum ada catatan tsunami untuk ditampilkan.";
    return;
  }

  const recentEvents = [...tsunamiEvents].sort((a, b) => b.year - a.year).slice(0, 5);
  recentEvents.forEach(function(event) {
    const item = document.createElement("li");
    const year = document.createElement("time");
    const title = document.createElement("h3");
    const cause = document.createElement("p");

    year.dateTime = String(event.year);
    year.textContent = String(event.year);
    title.textContent = event.name;
    cause.textContent = event.cause || "Penyebab tidak tersedia";
    item.append(year, title, cause);
    timeline.appendChild(item);
  });

  status.textContent = recentEvents.length + " catatan terbaru dari " + tsunamiEvents.length + " catatan pilihan NOAA NCEI.";
})();
