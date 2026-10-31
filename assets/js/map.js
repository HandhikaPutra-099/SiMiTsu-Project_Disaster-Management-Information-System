// LEAFLET MAP — Accurate tectonic plates & event coordinates
  // ══════════════════════════════════════════════════════════════


  function dotColor(mag) {
    return mag==="-"||mag>=8.0 ? "#ef4444" : mag>=7.0 ? "#f97316" : "#f59e0b";
  }

  // ── Plate label helper (DivIcon) ───────────────────────────
  function plateLabel(layerGroup, map, lat, lng, text, color) {
    var icon = L.divIcon({
      html: '<div style="background:rgba(0,0,0,0.72);color:'+color+';padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap;border:1px solid '+color+';pointer-events:none;">'+text+'</div>',
      className: '', iconAnchor: [50, 10]
    });
    layerGroup.addLayer(L.marker([lat, lng], {icon: icon, interactive: false}));
  }

  // Global layer references for filter toggling
  var mapLayerGroups = { plates: null, tsunami: null, sensor: null };
  var leafletMapRef  = null;
  var activeFilter   = 'all';

  // ── Layer filter function ──────────────────────────────────
  function setMapFilter(filter) {
    activeFilter = filter;
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
    });

    // Update legend visibility
    document.querySelectorAll('#mapLegend .legend-item').forEach(function(li) {
      var layer = li.getAttribute('data-layer');
      li.style.display = (filter === 'all' || filter === layer) ? '' : 'none';
    });
  }

  function initLeafletMap() {
    if (typeof L === "undefined") return;
    var map = L.map("leafletMap", {center:[-2.5,118], zoom:5, zoomControl:true});
    leafletMapRef = map;

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {attribution:"Tiles &copy; Esri &mdash; Source: Esri, USGS, GeoEye, and the GIS User Community", maxZoom:18}
    ).addTo(map);
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {attribution:"", maxZoom:18, opacity:0.85, pane:"shadowPane"}
    ).addTo(map);

    setTimeout(function(){ map.invalidateSize(); }, 200);

    // ══════════════════════════════════════════════════════════
    // LAYER 1 — TSUNAMI HISTORIS
    // ══════════════════════════════════════════════════════════
    var tsunamiLayer = L.layerGroup();
    tsunamiEvents.forEach(function(ev) {
      var coords = eventCoords[ev.id]; if (!coords) return;
      var color = dotColor(ev.mag);
      var r = ev.mag>=8.5?14:ev.mag>=7.8?11:ev.mag>=7.0?9:7;
      tsunamiLayer.addLayer(
        L.circleMarker(coords, {
          radius:r, fillColor:color, color:"#fff",
          weight:1.5, opacity:1, fillOpacity:0.88
        }).bindPopup(
          "<strong>" + ev.name + " (" + ev.year + ")</strong>" +
          "<br>Magnitudo: " + (ev.mag==="-"?"Vulkanik":"M"+ev.mag) +
          "<br>Ketinggian Maks: " + (ev.height==="-"?"—":ev.height+" m") +
          "<br>Korban: " + ev.victims +
          "<br>Penyebab: " + ev.cause
        )
      );
    });
    mapLayerGroups.tsunami = tsunamiLayer;
    tsunamiLayer.addTo(map);

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
    ], {color:"#ff6b00",weight:4,opacity:0.95,dashArray:"12,5"},
       "🔶 Palung Sunda (Java Trench) — Zona Megathrust Utama");
    plateLabel(platesLayer, map, -9.0, 109.5, "PALUNG SUNDA", "#ff6b00");

    // 2. Banda Arc
    addPlate([
      [-9.5,124.0],[-9.2,125.5],[-8.8,127.0],[-8.0,128.5],
      [-7.0,130.0],[-5.5,131.5],[-4.5,132.5],[-3.5,133.5],
      [-2.5,134.5],[-1.5,135.5],[-0.5,136.5],[0.5,137.5]
    ], {color:"#ff6b00",weight:3,opacity:0.9,dashArray:"8,5"},
       "🔶 Busur Banda — Batas Konvergen");
    plateLabel(platesLayer, map, -4.0, 131.5, "BUSUR BANDA", "#ff6b00");

    // 3. Philippine Plate
    addPlate([
      [10.0,127.5],[8.0,127.0],[6.0,126.0],[4.0,125.5],
      [2.0,125.5],[0.5,126.0],[-1.0,126.5],[-2.0,127.0],
      [-3.0,127.5],[-4.0,128.0]
    ], {color:"#8b5cf6",weight:3,opacity:0.9,dashArray:"6,4"},
       "🟣 Batas Lempeng Filipina");
    plateLabel(platesLayer, map, 3.0, 126.2, "LEMPENG FILIPINA", "#8b5cf6");

    // 4. North Sulawesi Trench
    addPlate([
      [4.5,124.0],[3.5,124.5],[2.5,125.0],[1.5,125.5],
      [0.5,126.5],[-0.5,127.0],[-1.5,127.5],[-2.0,128.5]
    ], {color:"#8b5cf6",weight:2.5,opacity:0.9,dashArray:"6,4"},
       "🟣 Palung Sulawesi Utara");
    plateLabel(platesLayer, map, 2.5, 124.8, "PALUNG SULAWESI", "#8b5cf6");

    // 5. Australian Plate (PNG)
    addPlate([
      [-4.5,141.0],[-5.0,143.0],[-5.5,145.0],[-6.0,147.0],
      [-6.5,149.5],[-7.0,152.0],[-7.5,155.0]
    ], {color:"#22c55e",weight:3,opacity:0.9,dashArray:"8,4"},
       "🟢 Batas Lempeng Australia — konvergen dengan PNG");
    plateLabel(platesLayer, map, -6.0, 145.5, "LEMPENG AUSTRALIA", "#22c55e");

    // 6. Australia–Eurasia south of Timor
    addPlate([
      [-10.5,124.0],[-11.0,126.0],[-11.5,128.0],[-12.0,130.0],
      [-12.5,132.0],[-13.0,134.0],[-13.0,136.0],[-12.5,138.0]
    ], {color:"#22c55e",weight:2.5,opacity:0.85,dashArray:"6,4"},
       "🟢 Lempeng Australia — batas selatan Timor");

    // 7. Sumatera Fault
    addPlate([
      [5.5,95.5],[4.5,96.0],[3.5,96.5],[2.5,97.0],[1.5,97.5],
      [0.5,98.0],[-0.5,98.5],[-1.5,99.0],[-2.5,99.5],[-3.5,100.0],
      [-4.5,101.0],[-5.5,102.0],[-5.8,103.5]
    ], {color:"#f59e0b",weight:2.5,opacity:0.85,dashArray:"4,4"},
       "🟡 Sesar Besar Sumatera (Dextral Strike-Slip)");
    plateLabel(platesLayer, map, 1.0, 97.8, "SESAR SUMATERA", "#f59e0b");

    // 8. Palu-Koro
    addPlate([
      [1.5,120.0],[1.0,120.2],[0.5,120.0],[0.0,119.9],
      [-0.5,119.8],[-1.0,119.8],[-1.5,120.2],[-2.0,120.5]
    ], {color:"#f59e0b",weight:2.5,opacity:0.9,dashArray:"4,3"},
       "🟡 Sesar Palu-Koro — Penyebab Tsunami Palu 2018");
    plateLabel(platesLayer, map, 0.0, 120.5, "SESAR PALU-KORO", "#f59e0b");

    // 9. Sorong Fault
    addPlate([
      [-1.0,131.0],[-0.5,132.5],[0.0,134.0],[0.5,135.5],
      [0.8,137.0],[1.0,138.5],[1.0,140.5]
    ], {color:"#f59e0b",weight:2,opacity:0.8,dashArray:"4,4"},
       "🟡 Sesar Sorong");
    plateLabel(platesLayer, map, 0.5, 135.5, "SESAR SORONG", "#f59e0b");

    // 10. Flores Back-Arc Thrust
    addPlate([
      [-7.5,117.0],[-8.0,119.0],[-8.2,121.0],
      [-8.0,123.0],[-7.5,124.5]
    ], {color:"#60a5fa",weight:2,opacity:0.8,dashArray:"5,3"},
       "🔵 Sesar Flores — Penyebab Gempa Flores 1992 & Lombok 2018");
    plateLabel(platesLayer, map, -8.0, 120.5, "SESAR FLORES", "#60a5fa");

    // Plate name labels
    plateLabel(platesLayer, map, 5.0, 105.0, "LEMPENG EURASIA", "#93c5fd");
    plateLabel(platesLayer, map, -14.0, 120.0, "LEMPENG AUSTRALIA", "#86efac");

    mapLayerGroups.plates = platesLayer;
    platesLayer.addTo(map);

    // ══════════════════════════════════════════════════════════
    // LAYER 3 — SENSOR BMKG DI LAUT
    // Sumber: BMKG InaTEWS, DART buoy network, tide gauges
    // ══════════════════════════════════════════════════════════
    var sensorLayer = L.layerGroup();

    // Sensor data: [lat, lng, type, name, desc]
    // type: 'dart'=DART/OBP buoy, 'tide'=Tide Gauge, 'seis'=Seismograf bawah laut
    var sensors = [
      // DART / OBP Buoys (oceanic pressure sensors)
      { lat:-6.5,  lng:100.5, type:"dart", name:"DART 53401",       desc:"Buoy tekanan bawah laut (OBP), Samudra Hindia barat Sumatera. Mendeteksi perubahan tekanan kolom air akibat tsunami." },
      { lat:-8.0,  lng:106.5, type:"dart", name:"DART 56001",       desc:"Buoy DART di selatan Jawa, zona palung Sunda. Real-time data ke InaTEWS BMKG." },
      { lat:-9.5,  lng:112.0, type:"dart", name:"DART 56002",       desc:"Buoy tekanan bawah laut di selatan Jawa Timur. Mendeteksi gelombang megathrust." },
      { lat:-9.0,  lng:120.5, type:"dart", name:"DART 56003",       desc:"Buoy OBP selatan Nusa Tenggara. Mendukung peringatan tsunami regional." },
      { lat:-10.5, lng:118.0, type:"dart", name:"DART 56004",       desc:"Buoy di palung Sumbawa — zona rawan megathrust." },
      { lat:-7.5,  lng:129.0, type:"dart", name:"DART Banda",       desc:"Sensor tekanan Laut Banda, monitoring busur Banda." },
      { lat:-2.5,  lng:130.5, type:"dart", name:"DART Maluku",      desc:"Buoy OBP utara Maluku, area pertemuan 3 lempeng." },
      { lat:2.0,   lng:96.5,  type:"dart", name:"DART 23401",       desc:"Buoy DART barat laut Sumatera, jalur propagasi tsunami Aceh." },
      { lat:-4.0,  lng:99.5,  type:"dart", name:"DART Mentawai",    desc:"OBP buoy kawasan Kepulauan Mentawai — zona megathrust aktif." },
      { lat:0.5,   lng:124.5, type:"dart", name:"DART Sulawesi",    desc:"Sensor laut utara Sulawesi, dekat palung Sulawesi." },
      { lat:-1.0,  lng:136.5, type:"dart", name:"DART Papua",       desc:"Buoy teluk Cenderawasih, Papua." },

      // Tide Gauges — BMKG InaTEWS
      { lat:3.3,   lng:95.3,  type:"tide", name:"Tide Gauge Sabang",       desc:"Stasiun tide gauge Sabang, Aceh. Titik terdepan monitoring tsunami Samudera Hindia." },
      { lat:-5.4,  lng:105.3, type:"tide", name:"Tide Gauge Panjang",      desc:"Tide gauge Pelabuhan Panjang, Lampung. Monitoring Selat Sunda." },
      { lat:-6.1,  lng:106.8, type:"tide", name:"Tide Gauge Tanjung Priok",desc:"Stasiun Jakarta — monitoring teluk Jakarta dan Laut Jawa." },
      { lat:-7.2,  lng:112.7, type:"tide", name:"Tide Gauge Surabaya",     desc:"Tide gauge Tanjung Perak, monitoring Selat Madura." },
      { lat:-8.7,  lng:115.2, type:"tide", name:"Tide Gauge Benoa",        desc:"Stasiun Bali, monitoring Samudera Hindia selatan Bali." },
      { lat:-8.5,  lng:122.2, type:"tide", name:"Tide Gauge Maumere",      desc:"Tide gauge Maumere, NTT — area gempa Flores 1992." },
      { lat:-0.9,  lng:119.8, type:"tide", name:"Tide Gauge Palu",         desc:"Stasiun Palu — pasca tsunami 2018, sistem monitoring ditingkatkan." },
      { lat:-3.7,  lng:128.2, type:"tide", name:"Tide Gauge Ambon",        desc:"Tide gauge Ambon — monitoring Laut Banda dan Laut Seram." },
      { lat:1.0,   lng:124.8, type:"tide", name:"Tide Gauge Manado",       desc:"Stasiun Manado, monitoring utara Sulawesi." },
      { lat:-2.5,  lng:140.7, type:"tide", name:"Tide Gauge Jayapura",     desc:"Tide gauge Jayapura, Papua — monitoring Pasifik." },
      { lat:-1.3,  lng:116.8, type:"tide", name:"Tide Gauge Balikpapan",   desc:"Monitoring Selat Makassar dan Kalimantan Timur." },
      { lat:-8.5,  lng:116.1, type:"tide", name:"Tide Gauge Lombok",       desc:"Tide gauge pasca gempa Lombok 2018." },
      { lat:-2.0,  lng:99.9,  type:"tide", name:"Tide Gauge Padang",       desc:"Stasiun Padang — garis terdepan monitoring megathrust Mentawai." },

      // Seismograf bawah laut (OBS — Ocean Bottom Seismometer)
      { lat:-5.0,  lng:102.5, type:"seis", name:"OBS Bengkulu",     desc:"Ocean Bottom Seismometer barat Bengkulu — monitoring subduksi Sumatera selatan." },
      { lat:-8.5,  lng:108.0, type:"seis", name:"OBS Java Selatan", desc:"OBS di palung selatan Jawa Tengah." },
      { lat:-9.2,  lng:114.0, type:"seis", name:"OBS Banyuwangi",   desc:"OBS selatan Banyuwangi, dekat segmen palung aktif." },
      { lat:-9.8,  lng:119.0, type:"seis", name:"OBS Sumbawa",      desc:"OBS selatan Sumbawa, monitoring segmen subduksi NTB." },
      { lat:0.0,   lng:122.5, type:"seis", name:"OBS Sulawesi Utara",desc:"OBS utara Sulawesi — monitoring seismik Laut Maluku." },
      { lat:-3.5,  lng:135.0, type:"seis", name:"OBS Papua Barat",  desc:"OBS Teluk Bintuni, Papua Barat." },
    ];

    sensors.forEach(function(s) {
      var color = s.type==="dart" ? "#0ea5e9" : s.type==="tide" ? "#22d3ee" : "#818cf8";
      var iconLabel = s.type==="dart" ? "📡" : s.type==="tide" ? "🌊" : "📻";
      var r = s.type==="dart" ? 9 : s.type==="tide" ? 7 : 6;
      var icon = L.divIcon({
        html: '<div style="position:relative;width:'+(r*2+6)+'px;height:'+(r*2+6)+'px;">' +
              '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
              'width:'+(r*2)+'px;height:'+(r*2)+'px;border-radius:50%;background:'+color+';' +
              'border:2px solid #fff;z-index:2;"></div>' +
              '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
              'width:'+(r*2+6)+'px;height:'+(r*2+6)+'px;border-radius:50%;background:'+color+';' +
              'opacity:0.3;animation:sensor-pulse 2s ease-in-out infinite;"></div>' +
              '</div>',
        className: '', iconAnchor: [r+3, r+3]
      });
      sensorLayer.addLayer(
        L.marker([s.lat, s.lng], {icon: icon})
          .bindPopup(
            '<strong style="color:'+color+'">'+iconLabel+' '+s.name+'</strong>' +
            '<br><span style="color:#64748b;font-size:11px;text-transform:uppercase;font-weight:600;">' +
            (s.type==="dart"?"DART/OBP Buoy":s.type==="tide"?"Tide Gauge BMKG":"Ocean Bottom Seismometer") +
            '</span>' +
            '<br><br>'+s.desc
          )
      );
    });

    mapLayerGroups.sensor = sensorLayer;
    sensorLayer.addTo(map);

    // Set initial filter state (all visible, "Semua" button active)
    setMapFilter('all');
  }

  // ══════════════════════════════════════════════════════════════
