// SIMULATOR (2D wave canvas)
  // ══════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════
  // UNIFIED SIMULATOR — parameters drive both data panel & 3D
  // ══════════════════════════════════════════════════════════════
  function updateSim() {
    var mag   = parseFloat(document.getElementById("magSlider").value);
    var dep   = parseFloat(document.getElementById("depSlider").value);
    var dist  = parseFloat(document.getElementById("distSlider").value);
    var loc   = document.getElementById("locSelect").value;
    var coast = document.getElementById("coastSelect").value;
    var time  = document.getElementById("timeSelect").value;

    document.getElementById("magVal").textContent  = mag.toFixed(1) + " SR";
    document.getElementById("depVal").textContent  = dep + " km";
    document.getElementById("distVal").textContent = dist + " km";

    // ── Physics calculation ────────────────────────────────────
    var baseH = 0;
    if      (mag >= 9.0) baseH = 25 + (mag-9)*15;
    else if (mag >= 8.0) baseH = 10 + (mag-8)*15;
    else if (mag >= 7.0) baseH = 3  + (mag-7)*7;
    else                 baseH = 0.5 + (mag-5)*1.25;
    // Depth factor: shallower = stronger uplift
    baseH *= (dep < 30 ? 1.4 : dep < 70 ? 1.0 : 0.6);
    // Locale factor
    baseH *= ({shallow:1.5, trench:1.2, deep:0.8}[loc] || 1);
    // Coast amplification
    var cFact = ({open:1.0, bay:1.8, cliff:0.7, mangrove:0.6}[coast] || 1);
    baseH *= cFact;

    var height = Math.max(0.2, baseH).toFixed(1);
    var waveSpeedMs = Math.sqrt(9.8 * Math.max(200, 4000 - dist * 3)); // m/s, decreases with depth near shore
    var waveSpeedKmh = Math.round(waveSpeedMs * 3.6);
    var eta    = Math.round(dist / Math.max(waveSpeedKmh, 1) * 60);
    var inland = (baseH * 0.25 * cFact).toFixed(1);
    // Energy proxy (Richter scale: each 1.0 = 31.6x)
    var energy = Math.pow(10, 1.5 * (mag - 5)).toFixed(0);

    // ── Alert level ───────────────────────────────────────────
    var level, alertClass, alertText;
    if      (baseH >= 20) { level="extreme"; alertClass="extreme"; alertText="🚨 BAHAYA EKSTREM — Evakuasi Segera!"; }
    else if (baseH >= 7)  { level="high";    alertClass="high";    alertText="⛔ PERINGATAN TINGGI — Segera Evakuasi!"; }
    else if (baseH >= 2)  { level="medium";  alertClass="medium";  alertText="⚠️ WASPADA MENENGAH — Bersiap Evakuasi"; }
    else                  { level="low";     alertClass="low";     alertText="ℹ️ WASPADA RENDAH — Pantau Informasi"; }

    document.getElementById("alertBar").className   = "alert-bar " + alertClass;
    document.getElementById("alertBar").textContent  = alertText;
    document.getElementById("rHeight").textContent   = height + " m";
    document.getElementById("rTime").textContent     = (eta < 5 ? "<5" : "~"+eta) + " mnt";
    document.getElementById("rSpeed").textContent    = waveSpeedKmh + " km/j";
    document.getElementById("rInland").textContent   = inland + " km";

    // ── Drive 3D simulation with calculated wave height ────────
    // Map tsunami height → 3D wave height param (scale for visual clarity)
    var sim3dHeight = Math.max(2, Math.min(30, parseFloat(height) * 0.9));
    waveH = sim3dHeight;
    // ── Sync ALL fields into simState so render3DLoop reads them ─
    simState.mag    = mag;
    simState.dep    = dep;
    simState.dist   = dist;
    simState.loc    = loc;
    simState.coast  = coast;
    simState.time   = time;
    simState.height = parseFloat(height);
    simState.eta    = eta;
    simState.speed  = waveSpeedKmh;
    simState.inland = parseFloat(inland);
    simState.level  = level;
    // Also auto-select appropriate phase if currently on phase 0
    // (let user override by clicking phases manually)
    if (currentPhase === 0) {
      // reflect severity in 3D: high magnitude starts at seismic phase
      if (baseH >= 7 && !autoPlayTimer) setPhase(0);
    }

    // ── Mitigation steps ──────────────────────────────────────
    var tp = time === "night" ? "⚠️ Malam hari: gunakan senter. " : "";
    var tCoast = {
      open:"Pantai terbuka — gelombang langsung masuk tanpa hambatan.",
      bay:"Teluk/muara — energi gelombang TERKONSENTRASI, dampak hingga 1.8× lebih besar!",
      cliff:"Tebing pantai — gelombang memantul, risiko lebih terlokalisir.",
      mangrove:"Mangrove membantu MEREDAM energi gelombang hingga 40%."
    }[coast] || "";

    var steps = {
      extreme:[
        "🏃 LARI SEKARANG! Jangan ambil barang apapun.",
        tp+"⛰️ Capai elevasi 30m dpl dalam <5 menit.",
        "🌉 Hindari jembatan, tepi sungai, & muara.",
        "🏢 Naik ke gedung beton lantai 4+ jika tak bisa lari keluar.",
        "📢 Beritahu semua orang di sekitar Anda.",
        "⏳ Jangan kembali minimal 3 jam meski air surut.",
        "📞 Hubungi BNPB 117 & keluarga.",
        "ℹ️ "+tCoast
      ],
      high:[
        "🚶 Evakuasi segera tanpa menunggu sirine.",
        tp+"🎒 Ambil Go Bag & pergi dalam <3 menit.",
        "🚧 Ikuti jalur evakuasi yang bertanda.",
        "👴 Bantu lansia, anak-anak, & disabilitas.",
        "⏳ Tunggu minimal 3 jam di titik aman.",
        "📻 Pantau BMKG, radio, & media resmi.",
        "ℹ️ "+tCoast
      ],
      medium:[
        "🎒 Siapkan tas darurat & dokumen penting.",
        tp+"📡 Pantau BMKG & BNPB terus-menerus.",
        "🚫 Jauhi pantai & muara sungai.",
        "🗺️ Kenali jalur evakuasi terdekat.",
        "📱 Hubungi & informasikan keluarga.",
        "ℹ️ "+tCoast
      ],
      low:[
        "📡 Pantau BMKG & BNPB secara berkala.",
        "🚫 Jangan berenang saat ada notifikasi gempa.",
        "🎒 Pastikan Go Bag sudah siap.",
        "📢 Informasikan kepada tetangga.",
        "ℹ️ "+tCoast
      ]
    };
    var list = document.getElementById("stepsList");
    list.innerHTML = "";
    (steps[level]||steps.low).forEach(function(s,i){
      list.innerHTML += "<li><div class=\"step-num\">"+(i+1)+"</div><span>"+s+"</span></li>";
    });
  }

  // ══════════════════════════════════════════════════════════════
