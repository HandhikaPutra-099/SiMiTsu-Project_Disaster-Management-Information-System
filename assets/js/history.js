// HISTORY TABLE — runs immediately since DOM is ready
  // ══════════════════════════════════════════════════════════════
  (function buildHistory() {
    function getMagClass(m) {
      if (m === "-") return "mag-low";
      if (m >= 8.5)  return "mag-extreme";
      if (m >= 7.8)  return "mag-high";
      if (m >= 7.0)  return "mag-med";
      return "mag-low";
    }
    function getMagLabel(m) {
      if (m === "-") return "Vulkanik";
      if (m >= 8.5)  return "Ekstrem";
      if (m >= 7.8)  return "Besar";
      if (m >= 7.0)  return "Menengah";
      return "Kecil";
    }
    const tbody = document.getElementById("historyBody");
    if (!tbody) return;
    const sorted = [...tsunamiEvents].sort((a, b) => b.year - a.year);
    sorted.forEach(ev => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td><strong>${ev.year}</strong></td>` +
        `<td>${ev.name}</td>` +
        `<td><span class="badge-mag ${getMagClass(ev.mag)}">${ev.mag === "-" ? "—" : "M" + ev.mag} ${getMagLabel(ev.mag)}</span></td>` +
        `<td>${ev.height === "-" ? "—" : ev.height + " m"}</td>` +
        `<td style="color:${ev.victims === "N/A" ? "var(--muted)" : "var(--danger)"}">${ev.victims}</td>` +
        `<td style="color:var(--muted)">${ev.cause}</td>`;
      tbody.appendChild(tr);
    });
  })();

  // ══════════════════════════════════════════════════════════════
