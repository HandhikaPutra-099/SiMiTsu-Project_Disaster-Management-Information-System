// LEAFLET MAP — Historical records and illustrative tectonic lines
  // ══════════════════════════════════════════════════════════════
var mapColors = {
  water: getComputedStyle(document.documentElement).getPropertyValue("--water").trim() || "#65c4cd",
  caution: getComputedStyle(document.documentElement).getPropertyValue("--caution").trim() || "#f29a58",
  paper: getComputedStyle(document.documentElement).getPropertyValue("--paper").trim() || "#f5f1e7"
};

  // ── Plate label helper (DivIcon) ───────────────────────────
  function plateLabel(layerGroup, map, lat, lng, text, color) {
    var icon = L.divIcon({
      html: '<div style="background:rgba(0,0,0,0.72);color:'+color+';padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap;border:1px solid '+color+';pointer-events:none;">'+text+'</div>',
      className: '', iconAnchor: [50, 10]
    });
    layerGroup.addLayer(L.marker([lat, lng], {icon: icon, interactive: false, keyboard: false}));
  }

  // Global layer references for filter toggling
  var mapLayerGroups = { plates: null, tsunami: null, sensor: null };
  var historicalMarkers = [];
  var leafletMapRef  = null;
  var mapCriteria = { query: '', year: '', cause: '' };

  function setMapCriteria(query, year, cause) {
    mapCriteria = {
      query: (query || '').trim().toLocaleLowerCase('id'),
      year: year || '',
      cause: cause || ''
    };

    var layer = mapLayerGroups.tsunami;
    if (!layer) return;

    layer.clearLayers();
    var visibleCount = 0;
    historicalMarkers.forEach(function(record) {
      var matchesQuery = !mapCriteria.query ||
        record.event.name.toLocaleLowerCase('id').indexOf(mapCriteria.query) !== -1;
      var matchesYear = !mapCriteria.year || String(record.event.year) === mapCriteria.year;
      var matchesCause = !mapCriteria.cause || record.event.cause === mapCriteria.cause;
      if (matchesQuery && matchesYear && matchesCause) {
        layer.addLayer(record.marker);
        visibleCount += 1;
      }
    });

    var resultStatus = document.getElementById('mapRecordsStatus');
    if (resultStatus) {
      resultStatus.textContent = visibleCount
        ? visibleCount + ' catatan historis cocok dengan filter.'
        : 'Tidak ada catatan historis yang cocok. Ubah pencarian atau filter.';
    }
  }

  // ── Layer filter function ──────────────────────────────────
  function setMapFilter(filter) {
    var map = leafletMapRef;
    if (!map) return;

    var showPlates  = (filter === 'all' || filter === 'plates');
    var showTsunami = (filter === 'all' || filter === 'tsunami');
    var showSensor  = (filter === 'all' || filter === 'sensor');

    // Toggle layers
    if (mapLayerGroups.plates)  { showPlates  ? map.addLayer(mapLayerGroups.plates)  : map.removeLayer(mapLayerGroups.plates);  }
    if (mapLayerGroups.tsunami) { showTsunami ? map.addLayer(mapLayerGroups.tsunami) : map.removeLayer(mapLayerGroups.tsunami); }
    if (mapLayerGroups.sensor)  { showSensor  ? map.addLayer(mapLayerGroups.sensor)  : map.removeLayer(mapLayerGroups.sensor);  }

    // Update button states
    var btns = { all:'filterAll', plates:'filterPlates', tsunami:'filterTsunami', sensor:'filterSensor' };
    var classes = { all:'active-all', plates:'active-plates', tsunami:'active-tsunami', sensor:'active-sensor' };
    Object.keys(btns).forEach(function(k) {
      var el = document.getElementById(btns[k]);
      if (!el) return;
      el.className = 'map-filter-btn' + (k === filter ? ' ' + classes[k] : '');
      el.setAttribute("aria-pressed", String(k === filter));
    });

    // Update legend visibility
    document.querySelectorAll('#mapLegend .legend-item').forEach(function(li) {
      var layer = li.getAttribute('data-layer');
      li.style.display = (filter === 'all' || filter === layer) ? '' : 'none';
    });

    var status = document.getElementById("mapRecordsStatus");
    if (filter === "plates" && status) {
      status.textContent = "Garis tektonik pada peta bersifat ilustratif.";
    } else if (filter === "sensor" && status) {
      status.textContent = "Titik yang ditampilkan bukan lokasi sensor aktual.";
    } else if (filter === "all" || filter === "tsunami") {
      setMapCriteria(mapCriteria.query, mapCriteria.year, mapCriteria.cause);
    }

  }

  function initLeafletMap() {
    var status = document.getElementById("mapStatus");
    if (typeof L === "undefined") {
      if (status) {
        status.textContent = "Peta tidak dapat dimuat. Periksa koneksi internet atau coba muat ulang halaman.";
        status.hidden = false;
      }
      return;
    }
    if (typeof tsunamiEvents === "undefined" || !Array.isArray(tsunamiEvents)) {
      if (status) {
        status.textContent = "Catatan peta tidak dapat dimuat. Coba muat ulang halaman atau buka Database.";
        status.hidden = false;
      }
      return;
    }
    var map = L.map("leafletMap", {center:[-2.5,118], zoom:5, zoomControl:true});
    leafletMapRef = map;
    map.createPane("historicalEventsPane").style.zIndex = "625";

    var baseLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {attribution:"Tiles &copy; Esri. Source: Esri, USGS, GeoEye, and the GIS User Community", maxZoom:18}
    );
    baseLayer.on("tileerror", function() {
      if (status) {
        status.textContent = "Latar peta gagal dimuat. Catatan historis tetap tersedia; periksa koneksi internet untuk melihat peta.";
        status.hidden = false;
      }
    });
    baseLayer.addTo(map);
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {attribution:"", maxZoom:18, opacity:0.85, pane:"shadowPane"}
    ).addTo(map);

    setTimeout(function(){ map.invalidateSize(); }, 200);
    map.whenReady(function() {
      if (status) status.hidden = true;
    });

    // ══════════════════════════════════════════════════════════
    // LAYER 1 — TSUNAMI HISTORIS
    // ══════════════════════════════════════════════════════════
    var tsunamiLayer = L.layerGroup();
    tsunamiEvents.forEach(function(ev) {
      var color = mapColors.water;
      var r = ev.mag>=8.5?14:ev.mag>=7.8?11:ev.mag>=7.0?9:7;
      var marker = L.circleMarker([ev.lat, ev.lng], {
        pane:"historicalEventsPane",
        radius:r, fillColor:color, color:mapColors.paper,
        weight:1.5, opacity:1, fillOpacity:0.88
      }).bindPopup(
        "<strong>" + ev.name + " (" + ev.year + ")</strong>" +
        "<br>Magnitudo: " + (Number.isFinite(ev.mag)?"M"+ev.mag:"Tidak tersedia") +
        "<br>Ketinggian maksimum: " + (Number.isFinite(ev.height) ? ev.height + " m" : "Tidak tercatat") +
        "<br>Korban meninggal: " + (Number.isFinite(ev.deaths) ? ev.deaths.toLocaleString("id-ID") : "Tidak tersedia") +
        "<br>Penyebab: " + ev.cause
      );
      marker.on("add", function() {
        var element = marker.getElement();
        if (!element) return;
        element.setAttribute("role", "button");
        element.setAttribute("aria-label", "Kejadian tsunami historis: " + ev.name + ", " + ev.year + ". Buka detail.");
        element.setAttribute("tabindex", "0");
        element.onkeydown = function(event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            marker.openPopup();
          }
        };
      });
      historicalMarkers.push({ event: ev, marker: marker });
    });
    mapLayerGroups.tsunami = tsunamiLayer;
    tsunamiLayer.addTo(map);
    setMapCriteria(mapCriteria.query, mapCriteria.year, mapCriteria.cause);

    // ══════════════════════════════════════════════════════════
    // LAYER 2 — LEMPENG TEKTONIK
    // ══════════════════════════════════════════════════════════
    var platesLayer = L.layerGroup();

    function addPlate(coords, opts, tooltip) {
      platesLayer.addLayer(L.polyline(coords, opts).bindTooltip(tooltip, {sticky:true}));
    }

    // 1. Sunda Trench
    addPlate([
      [14.0,93.0],[12.0,93.5],[10.0,93.8],[8.0,94.5],[6.0,94.8],[4.0,95.0],
      [2.0,95.5],[0.0,96.5],[-1.5,97.5],[-3.0,99.0],[-4.5,100.5],[-5.5,102.0],
      [-6.5,103.5],[-7.5,105.0],[-8.5,106.5],[-9.0,108.5],[-9.5,110.5],
      [-9.8,112.5],[-9.8,114.5],[-9.5,116.5],[-9.8,118.5],[-10.0,120.5],
      [-10.2,122.0],[-10.0,124.0]
    ], {color:mapColors.water,weight:4,opacity:0.95,dashArray:"12,5"},
       "Garis ilustratif: Palung Sunda (Java Trench)");
    plateLabel(platesLayer, map, -9.0, 109.5, "PALUNG SUNDA", mapColors.water);

    // 2. Banda Arc
    addPlate([
      [-9.5,124.0],[-9.2,125.5],[-8.8,127.0],[-8.0,128.5],
      [-7.0,130.0],[-5.5,131.5],[-4.5,132.5],[-3.5,133.5],
      [-2.5,134.5],[-1.5,135.5],[-0.5,136.5],[0.5,137.5]
    ], {color:mapColors.water,weight:3,opacity:0.9,dashArray:"8,5"},
       "Garis ilustratif: Busur Banda");
    plateLabel(platesLayer, map, -4.0, 131.5, "BUSUR BANDA", mapColors.water);

    // 3. Philippine Plate
    addPlate([
      [10.0,127.5],[8.0,127.0],[6.0,126.0],[4.0,125.5],
      [2.0,125.5],[0.5,126.0],[-1.0,126.5],[-2.0,127.0],
      [-3.0,127.5],[-4.0,128.0]
    ], {color:mapColors.water,weight:3,opacity:0.9,dashArray:"6,4"},
       "Garis ilustratif: batas Lempeng Filipina");
    plateLabel(platesLayer, map, 3.0, 126.2, "LEMPENG FILIPINA", mapColors.water);

    // 4. North Sulawesi Trench
    addPlate([
      [4.5,124.0],[3.5,124.5],[2.5,125.0],[1.5,125.5],
      [0.5,126.5],[-0.5,127.0],[-1.5,127.5],[-2.0,128.5]
    ], {color:mapColors.water,weight:2.5,opacity:0.9,dashArray:"6,4"},
       "Garis ilustratif: Palung Sulawesi Utara");
    plateLabel(platesLayer, map, 2.5, 124.8, "PALUNG SULAWESI", mapColors.water);

    // 5. Australian Plate (PNG)
    addPlate([
      [-4.5,141.0],[-5.0,143.0],[-5.5,145.0],[-6.0,147.0],
      [-6.5,149.5],[-7.0,152.0],[-7.5,155.0]
    ], {color:mapColors.water,weight:3,opacity:0.9,dashArray:"8,4"},
       "Garis ilustratif: batas Lempeng Australia dengan Papua Nugini");
    plateLabel(platesLayer, map, -6.0, 145.5, "LEMPENG AUSTRALIA", mapColors.water);

    // 6. Australia–Eurasia south of Timor
    addPlate([
      [-10.5,124.0],[-11.0,126.0],[-11.5,128.0],[-12.0,130.0],
      [-12.5,132.0],[-13.0,134.0],[-13.0,136.0],[-12.5,138.0]
    ], {color:mapColors.water,weight:2.5,opacity:0.85,dashArray:"6,4"},
       "Garis ilustratif: batas Lempeng Australia di selatan Timor");

    // 7. Sumatera Fault
    addPlate([
      [5.5,95.5],[4.5,96.0],[3.5,96.5],[2.5,97.0],[1.5,97.5],
      [0.5,98.0],[-0.5,98.5],[-1.5,99.0],[-2.5,99.5],[-3.5,100.0],
      [-4.5,101.0],[-5.5,102.0],[-5.8,103.5]
    ], {color:mapColors.caution,weight:2.5,opacity:0.85,dashArray:"4,4"},
       "Garis ilustratif: Sesar Besar Sumatera");
    plateLabel(platesLayer, map, 1.0, 97.8, "SESAR SUMATERA", mapColors.caution);

    // 8. Palu-Koro
    addPlate([
      [1.5,120.0],[1.0,120.2],[0.5,120.0],[0.0,119.9],
      [-0.5,119.8],[-1.0,119.8],[-1.5,120.2],[-2.0,120.5]
    ], {color:mapColors.caution,weight:2.5,opacity:0.9,dashArray:"4,3"},
       "Garis ilustratif: Sesar Palu-Koro");
    plateLabel(platesLayer, map, 0.0, 120.5, "SESAR PALU-KORO", mapColors.caution);

    // 9. Sorong Fault
    addPlate([
      [-1.0,131.0],[-0.5,132.5],[0.0,134.0],[0.5,135.5],
      [0.8,137.0],[1.0,138.5],[1.0,140.5]
    ], {color:mapColors.caution,weight:2,opacity:0.8,dashArray:"4,4"},
       "Garis ilustratif: Sesar Sorong");
    plateLabel(platesLayer, map, 0.5, 135.5, "SESAR SORONG", mapColors.caution);

    // 10. Flores Back-Arc Thrust
    addPlate([
      [-7.5,117.0],[-8.0,119.0],[-8.2,121.0],
      [-8.0,123.0],[-7.5,124.5]
    ], {color:mapColors.caution,weight:2,opacity:0.8,dashArray:"5,3"},
       "Garis ilustratif: Sesar Flores");
    plateLabel(platesLayer, map, -8.0, 120.5, "SESAR FLORES", mapColors.caution);

    // Plate name labels
    plateLabel(platesLayer, map, 5.0, 105.0, "LEMPENG EURASIA", mapColors.water);
    plateLabel(platesLayer, map, -14.0, 120.0, "LEMPENG AUSTRALIA", mapColors.water);

    mapLayerGroups.plates = platesLayer;
    platesLayer.addTo(map);

    // ══════════════════════════════════════════════════════════
    // LAYER 3 — ILLUSTRATIVE POINTS
    // ══════════════════════════════════════════════════════════
    var sensorLayer = L.layerGroup();

    // Positions are illustrative and do not represent verified sensor stations.
    var sensors = [
      { lat:-6.5, lng:100.5 }, { lat:-8.0, lng:106.5 }, { lat:-9.5, lng:112.0 },
      { lat:-9.0, lng:120.5 }, { lat:-10.5, lng:118.0 }, { lat:-7.5, lng:129.0 },
      { lat:-2.5, lng:130.5 }, { lat:2.0, lng:96.5 }, { lat:-4.0, lng:99.5 },
      { lat:0.5, lng:124.5 }, { lat:-1.0, lng:136.5 }, { lat:3.3, lng:95.3 },
      { lat:-5.4, lng:105.3 }, { lat:-6.1, lng:106.8 }, { lat:-7.2, lng:112.7 },
      { lat:-8.7, lng:115.2 }, { lat:-8.5, lng:122.2 }, { lat:-0.9, lng:119.8 },
      { lat:-3.7, lng:128.2 }, { lat:1.0, lng:124.8 }, { lat:-2.5, lng:140.7 },
      { lat:-1.3, lng:116.8 }, { lat:-8.5, lng:116.1 }, { lat:-2.0, lng:99.9 },
      { lat:-5.0, lng:102.5 }, { lat:-8.5, lng:108.0 }, { lat:-9.2, lng:114.0 },
      { lat:-9.8, lng:119.0 }, { lat:0.0, lng:122.5 }, { lat:-3.5, lng:135.0 }
    ];

    sensors.forEach(function(s, index) {
      var color = mapColors.water;
      var r = 7;
      var icon = L.divIcon({
        html: '<div style="position:relative;width:'+(r*2+6)+'px;height:'+(r*2+6)+'px;">' +
              '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
              'width:'+(r*2)+'px;height:'+(r*2)+'px;border-radius:50%;background:'+color+';' +
              'border:2px solid '+mapColors.paper+';z-index:2;"></div>' +
              '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
              'width:'+(r*2+6)+'px;height:'+(r*2+6)+'px;border-radius:50%;background:'+color+';' +
              'opacity:0.3;"></div>' +
              '</div>',
        className: '', iconAnchor: [r+3, r+3]
      });
      sensorLayer.addLayer(
        L.marker([s.lat, s.lng], {icon: icon, title: "Titik ilustrasi " + (index + 1)})
          .bindPopup(
            '<strong style="color:'+color+'">Titik ilustrasi '+(index+1)+'</strong>' +
            '<br>Posisi ini bukan lokasi sensor aktual dan tidak menampilkan data operasional.'
          )
      );
    });

    mapLayerGroups.sensor = sensorLayer;
    sensorLayer.addTo(map);

    // Set initial filter state (all visible, "Semua" button active)
    setMapFilter('all');
    window.__simitsuMapReady = true;
    window.dispatchEvent(new Event("simitsu:mapready"));
  }

  // ══════════════════════════════════════════════════════════════
