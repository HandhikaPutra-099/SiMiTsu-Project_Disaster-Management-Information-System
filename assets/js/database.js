(function initDisasterDatabase() {
  const search = document.getElementById("databaseSearch");
  const yearFilter = document.getElementById("databaseYear");
  const locationFilter = document.getElementById("databaseLocation");
  const causeFilter = document.getElementById("databaseCause");
  const magnitudeFilter = document.getElementById("databaseMagnitude");
  const sortSelect = document.getElementById("databaseSort");
  const tbody = document.getElementById("databaseBody");
  const status = document.getElementById("databaseStatus");
  const dialog = document.getElementById("databaseDialog");
  const dialogBody = document.getElementById("databaseDialogBody");
  const dialogTitle = document.getElementById("databaseDialogTitle");

  if (!search || !yearFilter || !locationFilter || !causeFilter || !magnitudeFilter || !sortSelect ||
      !tbody || !status || !dialog || !dialogBody || !dialogTitle) return;

  if (typeof tsunamiEvents === "undefined" || !Array.isArray(tsunamiEvents)) {
    status.textContent = "Arsip tidak dapat dimuat. Muat ulang halaman atau buka katalog NOAA NCEI.";
    return;
  }

  const numberFormat = new Intl.NumberFormat("id-ID");
  const sourceUrl = "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events/";

  function formatValue(value, suffix) {
    if (!Number.isFinite(value)) return "Tidak tersedia";
    return numberFormat.format(value) + (suffix || "");
  }

  function addFilterOptions(select, values) {
    values.forEach(function(value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  addFilterOptions(yearFilter, [...new Set(tsunamiEvents.map(event => event.year))].sort((a, b) => b - a));
  addFilterOptions(locationFilter, [...new Set(tsunamiEvents.map(event => event.name))].sort((a, b) => a.localeCompare(b, "id")));
  addFilterOptions(causeFilter, [...new Set(tsunamiEvents.map(event => event.cause).filter(Boolean))].sort((a, b) => a.localeCompare(b, "id")));
  addFilterOptions(magnitudeFilter, [...new Set(tsunamiEvents
    .map(event => Number.isFinite(event.mag) ? String(event.mag) : "")
    .filter(Boolean))].sort((a, b) => Number(a) - Number(b)).map(value => "M" + value));
  Array.from(magnitudeFilter.options).slice(1).forEach(function(option) {
    option.value = option.textContent.slice(1);
  });

  function createCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  function showDetails(event) {
    dialogTitle.textContent = event.name;
    dialogBody.replaceChildren();

    const fields = [
      ["Tanggal", event.date || "Tidak tersedia"],
      ["Tahun", formatValue(event.year)],
      ["Jenis penyebab", event.cause || "Tidak tersedia"],
      ["Magnitudo gempa", Number.isFinite(event.mag) ? "M" + event.mag : "Tidak tersedia"],
      ["Ketinggian maksimum tercatat", formatValue(event.height, " m")],
      ["Korban meninggal", formatValue(event.deaths)],
      ["Orang hilang", formatValue(event.missing)],
      ["Korban luka-luka", formatValue(event.injured)],
      ["Pengungsi", formatValue(event.displaced)],
      ["Dokumentasi", "Tidak tersedia dalam dataset ini"]
    ];
    const list = document.createElement("dl");
    list.className = "database-detail-list";
    fields.forEach(function(field) {
      const term = document.createElement("dt");
      const value = document.createElement("dd");
      term.textContent = field[0];
      value.textContent = field[1];
      list.append(term, value);
    });

    const source = document.createElement("p");
    source.className = "database-detail-source";
    const link = document.createElement("a");
    link.href = sourceUrl + event.sourceId;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Buka catatan NOAA NCEI";
    source.append("Sumber informasi: ", link);

    dialogBody.append(list, source);
    dialog.showModal();
  }

  function getRecords() {
    const query = search.value.trim().toLocaleLowerCase("id");
    const selectedYear = yearFilter.value;
    const selectedLocation = locationFilter.value;
    const selectedCause = causeFilter.value;
    const selectedMagnitude = magnitudeFilter.value;
    const records = tsunamiEvents.filter(function(event) {
      const matchesSearch = !query || event.name.toLocaleLowerCase("id").includes(query);
      return matchesSearch &&
        (!selectedYear || String(event.year) === selectedYear) &&
        (!selectedLocation || event.name === selectedLocation) &&
        (!selectedCause || event.cause === selectedCause) &&
        (!selectedMagnitude || String(event.mag) === selectedMagnitude);
    });

    const comparators = {
      "year-desc": (a, b) => b.year - a.year,
      "year-asc": (a, b) => a.year - b.year,
      "name-asc": (a, b) => a.name.localeCompare(b.name, "id"),
      "deaths-desc": (a, b) => (b.deaths ?? -1) - (a.deaths ?? -1),
      "magnitude-desc": (a, b) => (b.mag ?? -1) - (a.mag ?? -1),
      "magnitude-asc": (a, b) => (a.mag ?? Infinity) - (b.mag ?? Infinity)
    };
    return records.sort(comparators[sortSelect.value] || comparators["year-desc"]);
  }

  function render() {
    const records = getRecords();
    tbody.replaceChildren();
    records.forEach(function(event) {
      const row = document.createElement("tr");
      createCell(row, event.name);
      createCell(row, String(event.year));
      createCell(row, event.cause || "Tidak tersedia");
      createCell(row, Number.isFinite(event.mag) ? "M" + event.mag : "Tidak tersedia");
      createCell(row, formatValue(event.height, " m"));
      createCell(row, formatValue(event.deaths));

      const actionCell = document.createElement("td");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "database-detail-button";
      button.textContent = "Lihat detail";
      button.setAttribute("aria-label", "Lihat detail untuk " + event.name + ", " + event.year);
      button.addEventListener("click", function() {
        showDetails(event);
      });
      actionCell.appendChild(button);
      row.appendChild(actionCell);

      const sourceCell = document.createElement("td");
      const sourceLink = document.createElement("a");
      sourceLink.href = sourceUrl + event.sourceId;
      sourceLink.target = "_blank";
      sourceLink.rel = "noopener noreferrer";
      sourceLink.textContent = "NOAA NCEI";
      sourceLink.setAttribute("aria-label", "Buka sumber NOAA NCEI untuk " + event.name + ", " + event.year);
      sourceCell.appendChild(sourceLink);
      row.appendChild(sourceCell);
      tbody.appendChild(row);
    });

    status.textContent = records.length
      ? records.length + " catatan ditampilkan dari arsip tsunami historis NOAA NCEI."
      : "Tidak ada catatan yang cocok. Ubah kata pencarian atau filter.";
  }

  [search, yearFilter, locationFilter, causeFilter, magnitudeFilter, sortSelect].forEach(function(control) {
    control.addEventListener(control === search ? "input" : "change", render);
  });

  render();
})();
