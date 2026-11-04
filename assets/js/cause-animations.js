// CAUSE ANIMATIONS — fully self-contained canvas 2D animations
  // ══════════════════════════════════════════════════════════════
  var causeT = [0, 0, 0, 0];
  var causeCtx = [null, null, null, null];
  var causeW   = [0, 0, 0, 0];
  var causeH   = [0, 0, 0, 0];
  var causePaused = [true, true, true, true];
  var causeVisible = [false, false, false, false];
  var causeTicks = [];
  var causeMotionPaused = false;
  var causePalette = {
    water: getComputedStyle(document.documentElement).getPropertyValue("--water").trim() || "#65c4cd",
    caution: getComputedStyle(document.documentElement).getPropertyValue("--caution").trim() || "#f29a58",
    muted: getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#c1ced1"
  };
  var causeMotionPreference = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceCauseMotion = Boolean(causeMotionPreference && causeMotionPreference.matches);

  function updateCauseMotionPreference(event) {
    reduceCauseMotion = event.matches;
    for (var index = 0; index < causePaused.length; index++) {
      if (reduceCauseMotion || causeMotionPaused || !causeVisible[index]) pauseCause(index);
      else replayCause(index);
    }
    updateCauseMotionControl();
  }

  if (causeMotionPreference) {
    if (causeMotionPreference.addEventListener) {
      causeMotionPreference.addEventListener("change", updateCauseMotionPreference);
    } else {
      causeMotionPreference.addListener(updateCauseMotionPreference);
    }
  }

  function scheduleCauseFrame(tick, index) {
    if (!reduceCauseMotion && !causePaused[index]) requestAnimationFrame(tick);
  }

  function replayCause(idx) {
    if (Number.isInteger(idx) && idx >= 0 && idx < causeT.length) {
      causePaused[idx] = false;
      causeT[idx] = 0;
      if (causeTicks[idx]) causeTicks[idx]();
    }
  }

  function pauseCause(idx) {
    if (Number.isInteger(idx) && idx >= 0 && idx < causePaused.length) causePaused[idx] = true;
  }

  function updateCauseMotionControl() {
    var control = document.getElementById("causeMotionToggle");
    if (!control) return;
    control.disabled = reduceCauseMotion;
    control.setAttribute("aria-pressed", String(causeMotionPaused || reduceCauseMotion));
    control.textContent = reduceCauseMotion
      ? "Animasi dijeda oleh pengaturan perangkat"
      : causeMotionPaused ? "Putar animasi" : "Jeda animasi";
  }

  function setCauseMotionPaused(paused) {
    causeMotionPaused = paused;
    for (var index = 0; index < causePaused.length; index++) {
      if (paused || reduceCauseMotion || !causeVisible[index]) pauseCause(index);
      else replayCause(index);
    }
    updateCauseMotionControl();
  }

  function setCauseDetails(details, open, openedBy) {
    var summary = details.querySelector("summary");
    details.open = open;
    details.dataset.openedBy = open ? openedBy : "";
    summary.setAttribute("aria-expanded", String(open));
  }

  function initCauseDetails() {
    var cards = Array.from(document.querySelectorAll("[data-cause-card]"));
    cards.forEach(function(card) {
      var details = card.querySelector("details");
      var summary = details.querySelector("summary");
      var close = details.querySelector(".cause-close");
      summary.setAttribute("aria-expanded", "false");

      summary.addEventListener("click", function(event) {
        event.preventDefault();
        if (details.open && details.dataset.openedBy === "hover") {
          details.dataset.openedBy = "user";
        } else {
          setCauseDetails(details, !details.open, "user");
        }
      });

      card.addEventListener("pointerenter", function(event) {
        if (event.pointerType === "mouse" && !details.open) {
          setCauseDetails(details, true, "hover");
        }
      });

      card.addEventListener("pointerleave", function() {
        if (details.dataset.openedBy === "hover" && !details.contains(document.activeElement)) {
          setCauseDetails(details, false);
        }
      });

      close.addEventListener("click", function() {
        setCauseDetails(details, false);
        summary.focus();
      });
    });

    document.addEventListener("click", function(event) {
      cards.forEach(function(card) {
        var details = card.querySelector("details");
        if (details.open && !card.contains(event.target)) {
          var summary = details.querySelector("summary");
          var focusIsInside = details.contains(document.activeElement);
          setCauseDetails(details, false);
          if (focusIsInside) summary.focus();
        }
      });
    });

    document.addEventListener("keydown", function(event) {
      if (event.key !== "Escape") return;
      cards.forEach(function(card) {
        var details = card.querySelector("details");
        if (!details.open) return;
        var summary = details.querySelector("summary");
        var focusIsInside = details.contains(document.activeElement);
        setCauseDetails(details, false);
        if (focusIsInside) summary.focus();
      });
    });
  }

  function initCauseAnimations() {
    var motionToggle = document.getElementById("causeMotionToggle");
    if (motionToggle) {
      motionToggle.addEventListener("click", function() {
        setCauseMotionPaused(!causeMotionPaused);
      });
    }
    updateCauseMotionControl();
    initCauseDetails();

    // Setup each canvas once — no resize every frame
    for (var ci = 0; ci < 4; ci++) {
      (function(idx) {
        var c = document.getElementById("causeCanvas" + idx);
        if (!c) return;
        function resize() {
          causeW[idx] = c.parentElement.offsetWidth || 680;
          causeH[idx] = 200;
          c.width  = causeW[idx];
          c.height = causeH[idx];
        }
        resize();
        window.addEventListener("resize", resize);
        causeCtx[idx] = c.getContext("2d");
      })(ci);
    }

    // ── Animasi 0: Gempa Subduksi ────────────────────────────────
    (function tick() {
      causeTicks[0] = tick;
      var ctx = causeCtx[0]; if (!ctx) { scheduleCauseFrame(tick, 0); return; }
      var W = causeW[0], H = causeH[0], t = causeT[0];
      causeT[0] += 0.016;
      if (causeT[0] > 12) causeT[0] = 0;

      // Sky / water background
      var bgGrad = ctx.createLinearGradient(0,0,0,H);
      bgGrad.addColorStop(0,"#020c18"); bgGrad.addColorStop(1,"#041828");
      ctx.fillStyle = bgGrad; ctx.fillRect(0,0,W,H);

      var phase = causeT[0];
      var quaking  = phase > 4.5 && phase < 7.5;
      var qShake   = quaking ? Math.sin(phase * 25) * 2.5 : 0;
      var seaRise  = phase > 5.5 ? Math.min((phase - 5.5) * 8, 22) : 0;
      var waveSpd  = phase > 6   ? Math.min((phase - 6) * 1.5, 1) : 0;

      // --- Oceanic plate (left, subducting) ---
      ctx.save();
      ctx.translate(0, qShake * 0.5);
      var platGrad = ctx.createLinearGradient(0, H*0.5, 0, H);
      platGrad.addColorStop(0, "#8B5A2B"); platGrad.addColorStop(1, "#4a2e10");
      ctx.fillStyle = platGrad;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.78); ctx.lineTo(W * 0.5, H * 0.62);
      ctx.lineTo(W * 0.5, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      // Subduction movement arrows
      for (var a = 0; a < 3; a++) {
        var ax = (W * 0.08 + a * W * 0.12 + (phase * 0.4 * W * 0.08) % (W * 0.38));
        var ay = H * 0.75 - (ax / (W * 0.5)) * H * 0.15;
        ctx.fillStyle = "rgba(239,80,80," + (0.4 + a * 0.2) + ")";
        ctx.beginPath();
        ctx.moveTo(ax, ay); ctx.lineTo(ax + 12, ay - 5); ctx.lineTo(ax + 12, ay + 5);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      // --- Continental plate (right, rises) ---
      ctx.save();
      ctx.translate(0, -seaRise * 0.4 + qShake * 0.3);
      var contGrad = ctx.createLinearGradient(0, H*0.4, 0, H);
      contGrad.addColorStop(0, "#4a7c3a"); contGrad.addColorStop(0.4, "#3a5e2a"); contGrad.addColorStop(1, "#2a4020");
      ctx.fillStyle = contGrad;
      ctx.beginPath();
      ctx.moveTo(W * 0.5, H * 0.62 - seaRise);
      ctx.bezierCurveTo(W * 0.65, H * 0.52 - seaRise * 0.8, W * 0.82, H * 0.44 - seaRise * 0.5, W, H * 0.4 - seaRise * 0.3);
      ctx.lineTo(W, H); ctx.lineTo(W * 0.5, H); ctx.closePath(); ctx.fill();
      // Fault line flash
      if (quaking && Math.sin(phase * 20) > 0.3) {
        ctx.strokeStyle = causePalette.caution; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(W*0.5, H*0.62 - seaRise); ctx.lineTo(W*0.5, H); ctx.stroke();
      }
      ctx.restore();

      // --- Water layer ---
      var waterTop = H * 0.34 - seaRise * 0.75;
      var waterGrad = ctx.createLinearGradient(0, waterTop, 0, H * 0.55);
      waterGrad.addColorStop(0, "#102b3a"); waterGrad.addColorStop(1, "#071a25");
      ctx.fillStyle = waterGrad; ctx.fillRect(0, 0, W, waterTop);

      // --- Tsunami wave on water surface ---
      if (waveSpd > 0) {
        var wAmp = Math.min(waveSpd * 28, 28);
        ctx.strokeStyle = causePalette.water; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (var xi = 0; xi <= W; xi += 2) {
          var envelope = Math.exp(-Math.pow((xi / W) - 0.5, 2) * 5) * wAmp;
          var wy = waterTop - envelope * Math.sin((xi / W) * 10 - phase * 4);
          xi === 0 ? ctx.moveTo(xi, wy) : ctx.lineTo(xi, wy);
        }
        ctx.stroke();
        // Fill under wave
        ctx.fillStyle = causePalette.water;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        for (var xi2 = 0; xi2 <= W; xi2 += 2) {
          var env2 = Math.exp(-Math.pow((xi2 / W) - 0.5, 2) * 5) * wAmp;
          var wy2 = waterTop - env2 * Math.sin((xi2 / W) * 10 - phase * 4);
          xi2 === 0 ? ctx.moveTo(xi2, wy2) : ctx.lineTo(xi2, wy2);
        }
        ctx.lineTo(W, waterTop); ctx.lineTo(0, waterTop); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Water surface shimmer line
      ctx.strokeStyle = causePalette.water; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, waterTop); ctx.lineTo(W, waterTop); ctx.stroke();
      ctx.globalAlpha = 1;

      // --- Labels ---
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = causePalette.muted;
      ctx.fillText("← Lempeng Samudra", 8, H * 0.72 + qShake * 0.3);
      ctx.fillText("Lempeng Benua →", W * 0.55, H * 0.55 - seaRise * 0.4);
      ctx.fillStyle = causePalette.water; ctx.font = "10px sans-serif";
      ctx.fillText("Laut dalam", 6, waterTop - 6);
      if (seaRise > 3) {
        ctx.fillStyle = causePalette.caution; ctx.font = "bold 12px sans-serif";
        ctx.fillText("DASAR LAUT BERUBAH", W * 0.22, waterTop + 18);
      }
      if (quaking) {
        ctx.fillStyle = causePalette.caution; ctx.font = "bold 11px sans-serif";
        ctx.fillText("GEMPA BAWAH LAUT", W * 0.28, H * 0.15);
      }

      scheduleCauseFrame(tick, 0);
    })();

    // ── Animasi 1: Erupsi Vulkanik ───────────────────────────────
    (function tick() {
      causeTicks[1] = tick;
      var ctx = causeCtx[1]; if (!ctx) { scheduleCauseFrame(tick, 1); return; }
      var W = causeW[1], H = causeH[1], t = causeT[1];
      causeT[1] += 0.018;

      // Sky
      ctx.fillStyle = "#02080f"; ctx.fillRect(0, 0, W, H);

      var cycle = causeT[1] % 10;
      var erupting = cycle > 2.5;
      var erupt    = erupting ? Math.min((cycle - 2.5) * 14, 80) : 0;
      var waveProp = erupting && erupt > 20 ? Math.min((cycle - 4.5) * 1.2, 1) : 0;

      // Water deep bg
      var seaGrad = ctx.createLinearGradient(0, 0, 0, H);
      seaGrad.addColorStop(0, "rgba(2,20,40,0.95)"); seaGrad.addColorStop(1, "rgba(2,10,25,1)");
      ctx.fillStyle = seaGrad; ctx.fillRect(0, 0, W, H * 0.62);

      // Seabed / ground
      var sbGrad = ctx.createLinearGradient(0, H * 0.62, 0, H);
      sbGrad.addColorStop(0, "#2a1a0a"); sbGrad.addColorStop(1, "#180e04");
      ctx.fillStyle = sbGrad; ctx.fillRect(0, H * 0.62, W, H);

      var vx = W * 0.5, vy0 = H * 0.88;
      // Volcano main body
      var volcGrad = ctx.createLinearGradient(vx - 90, vy0, vx, vy0 - 80);
      volcGrad.addColorStop(0, "#4a2810"); volcGrad.addColorStop(1, "#2a1408");
      ctx.fillStyle = volcGrad;
      ctx.beginPath();
      ctx.moveTo(vx - 90, vy0); ctx.lineTo(vx - 20, vy0 - 80); ctx.lineTo(vx + 20, vy0 - 80); ctx.lineTo(vx + 90, vy0);
      ctx.closePath(); ctx.fill();

      // Eruption center and displaced water
      if (erupting) {
        ctx.fillStyle = causePalette.caution;
        ctx.beginPath(); ctx.ellipse(vx, vy0 - 80, 18, 5, 0, 0, Math.PI * 2); ctx.fill();

        // Eruption column
        ctx.fillStyle = causePalette.caution;
        ctx.globalAlpha = 0.75;
        ctx.beginPath(); ctx.ellipse(vx, vy0 - 80 - erupt * 0.5, 14 + erupt * 0.25, erupt * 0.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        // Debris particles
        for (var dp = 0; dp < 10; dp++) {
          var ang2 = (dp / 10) * Math.PI * 2 + causeT[1] * 2;
          var rad  = 15 + erupt * 0.7 * ((dp % 3) / 3 + 0.3);
          var px2  = vx + Math.cos(ang2) * rad * 0.5;
          var py2  = vy0 - 82 - erupt * 0.4 - Math.abs(Math.sin(ang2)) * rad * 0.7;
          ctx.fillStyle = causePalette.caution;
          ctx.beginPath(); ctx.arc(px2, py2, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Water surface
      var wSurf = H * 0.62;
      ctx.strokeStyle = causePalette.water; ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, wSurf); ctx.lineTo(W, wSurf); ctx.stroke();
      ctx.globalAlpha = 1;

      // Propagating circular waves
      if (waveProp > 0) {
        for (var ring = 0; ring < 3; ring++) {
          var ringR = (waveProp * 1.6 * W * 0.5 - ring * 55) % (W * 0.6);
          if (ringR > 0) {
            var alpha = Math.max(0, 0.8 - ring * 0.25) * waveProp;
            ctx.strokeStyle = causePalette.water;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 2 - ring * 0.4;
            ctx.beginPath();
            ctx.ellipse(vx, wSurf, ringR, ringR * 0.25, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Labels
      ctx.fillStyle = causePalette.water; ctx.font = "10px sans-serif";
      ctx.fillText("Permukaan laut", 6, wSurf - 5);
      ctx.fillStyle = causePalette.muted; ctx.font = "11px sans-serif";
      ctx.fillText("Gunung Berapi Bawah Laut", vx - 72, H * 0.94);
      if (erupting) {
        ctx.fillStyle = causePalette.caution; ctx.font = "bold 12px sans-serif";
        ctx.fillText("ERUPSI VULKANIK", vx - 55, H * 0.12);
      }
      if (waveProp > 0.3) {
        ctx.fillStyle = causePalette.water; ctx.font = "bold 11px sans-serif";
        ctx.fillText("Gelombang menyebar", vx - 64, wSurf + 18);
      }

      scheduleCauseFrame(tick, 1);
    })();

    // ── Animasi 2: Longsor Bawah Laut ───────────────────────────
    (function tick() {
      causeTicks[2] = tick;
      var ctx = causeCtx[2]; if (!ctx) { scheduleCauseFrame(tick, 2); return; }
      var W = causeW[2], H = causeH[2], t = causeT[2];
      causeT[2] += 0.015;

      ctx.fillStyle = "#020c18"; ctx.fillRect(0, 0, W, H);

      var cycle3 = causeT[2] % 11;
      var sliding   = cycle3 > 2;
      var slideAmt  = sliding ? Math.min((cycle3 - 2) * 9, 80) : 0;
      var waveAmt   = slideAmt > 25 ? Math.min((slideAmt - 25) / 55, 1) : 0;

      // Deep ocean bg
      var deepGrad = ctx.createLinearGradient(0, 0, 0, H);
      deepGrad.addColorStop(0, "rgba(2,18,38,0.95)"); deepGrad.addColorStop(1, "rgba(2,8,20,1)");
      ctx.fillStyle = deepGrad; ctx.fillRect(0, 0, W, H * 0.35);

      // --- Terrain: stable right side (continental shelf) ---
      var shelfGrad = ctx.createLinearGradient(0, H * 0.4, 0, H);
      shelfGrad.addColorStop(0, "#3a5c2a"); shelfGrad.addColorStop(1, "#1e3015");
      ctx.fillStyle = shelfGrad;
      ctx.beginPath();
      ctx.moveTo(W * 0.52, H * 0.45); ctx.lineTo(W, H * 0.32);
      ctx.lineTo(W, H); ctx.lineTo(W * 0.52, H); ctx.closePath(); ctx.fill();

      // --- Slope floor ---
      var slopeGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
      slopeGrad.addColorStop(0, "#1a2a3a"); slopeGrad.addColorStop(1, "#0d1822");
      ctx.fillStyle = slopeGrad;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.78); ctx.lineTo(W * 0.52, H * 0.45);
      ctx.lineTo(W * 0.52, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

      // --- Sliding sediment mass ---
      var sX = slideAmt * 1.4, sY = slideAmt * 0.7;
      var startX = W * 0.52 - 70;
      if (startX + sX < W * 0.52 + 30) {
        var slideAlpha = Math.min(0.5 + slideAmt / 100, 0.92);
        var slidGrad = ctx.createLinearGradient(startX + sX, H * 0.44, startX + sX, H * 0.44 + 45 + sY);
        slidGrad.addColorStop(0, "rgba(242,154,88," + slideAlpha + ")");
        slidGrad.addColorStop(1, "rgba(103,67,43," + (slideAlpha * 0.8) + ")");
        ctx.fillStyle = slidGrad;
        ctx.beginPath();
        ctx.moveTo(startX + sX,       H * 0.44 - 4);
        ctx.lineTo(startX + sX + 85,  H * 0.44 - 4);
        ctx.lineTo(startX + sX + 65,  H * 0.44 + 45 + sY);
        ctx.lineTo(startX + sX - 15,  H * 0.44 + 45 + sY);
        ctx.closePath(); ctx.fill();
        // Sediment dust trail
        if (sliding) {
          var dustGrad = ctx.createLinearGradient(startX, H * 0.44, startX + sX, H * 0.44 + sY);
          dustGrad.addColorStop(0, "rgba(242,154,88,0)"); dustGrad.addColorStop(1, "rgba(242,154,88,0.18)");
          ctx.fillStyle = dustGrad;
          ctx.fillRect(startX - 10, H * 0.44, sX + 10, sY + 10);
        }
      }

      // Water surface
      var wTop = H * 0.33;
      var waterGrad3 = ctx.createLinearGradient(0, wTop - 20, 0, wTop + 20);
      waterGrad3.addColorStop(0, "rgba(4,80,130,0.9)"); waterGrad3.addColorStop(1, "rgba(2,40,80,0)");
      ctx.fillStyle = waterGrad3; ctx.fillRect(0, 0, W, wTop);

      // Tsunami waves above landslide
      if (waveAmt > 0) {
        var wCX = W * 0.52 + sX * 0.3;
        for (var wr = 0; wr < 3; wr++) {
          var wRad = (waveAmt * W * 0.55 - wr * 60) % (W * 0.58);
          if (wRad > 5) {
            ctx.strokeStyle = causePalette.water;
            ctx.globalAlpha = Math.max(0, 0.85 - wr * 0.25);
            ctx.lineWidth = 2.5 - wr * 0.5;
            ctx.beginPath();
            ctx.ellipse(wCX, wTop, wRad, wRad * 0.3, 0, Math.PI, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      ctx.strokeStyle = causePalette.water; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, wTop); ctx.lineTo(W, wTop); ctx.stroke();
      ctx.globalAlpha = 1;

      // Labels
      ctx.fillStyle = causePalette.muted; ctx.font = "11px sans-serif";
      ctx.fillText("Continental Shelf", W * 0.58, H * 0.42);
      ctx.fillText("Lereng Bawah Laut", 8, H * 0.72);
      ctx.fillStyle = causePalette.water; ctx.font = "10px sans-serif";
      ctx.fillText("Permukaan laut", 6, wTop - 5);
      if (slideAmt > 10) {
        ctx.fillStyle = causePalette.caution; ctx.font = "bold 12px sans-serif";
        ctx.fillText("⬇ LONGSOR " + Math.round(slideAmt) + "m!", W * 0.28, H * 0.5 + sY * 0.3);
      }
      if (waveAmt > 0.2) {
        ctx.fillStyle = causePalette.water; ctx.font = "bold 11px sans-serif";
        ctx.fillText("Tsunami lokal terbentuk!", W * 0.28, wTop + 18);
      }

      scheduleCauseFrame(tick, 2);
    })();

    (function tick() {
      causeTicks[3] = tick;
      var ctx = causeCtx[3]; if (!ctx) { scheduleCauseFrame(tick, 3); return; }
      var W = causeW[3], H = causeH[3];
      causeT[3] = (causeT[3] + 0.016) % 10;
      var phase = causeT[3];
      var waterY = H * 0.52;
      ctx.fillStyle = "#07111c";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#102a3b";
      ctx.fillRect(0, waterY, W, H - waterY);
      ctx.strokeStyle = causePalette.water;
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, waterY);
      ctx.lineTo(W, waterY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      var impactX = W * 0.58;
      var falling = phase < 4;
      var impactY = waterY - 5;
      if (falling) {
        var asteroidY = H * 0.12 + phase / 4 * (waterY - H * 0.18);
        ctx.fillStyle = "#b9a78b";
        ctx.beginPath();
        ctx.arc(impactX, asteroidY, Math.max(5, Math.min(12, W * 0.035)), 0, Math.PI * 2);
        ctx.fill();
      } else {
        var waveProgress = (phase - 4) / 6;
        var ringRadius = waveProgress * W * 0.58;
        for (var ring = 0; ring < 3; ring++) {
          var radius = ringRadius - ring * 22;
          if (radius <= 0) continue;
          ctx.strokeStyle = causePalette.water;
          ctx.globalAlpha = 0.75 - ring * 0.18;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(impactX, impactY, radius, Math.max(4, radius * 0.24), 0, Math.PI, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      ctx.fillStyle = causePalette.muted;
      ctx.font = "12px sans-serif";
      ctx.fillText("Skema tumbukan ke laut", 10, 20);
      ctx.fillStyle = "#b6c4cf";
      ctx.font = "10px sans-serif";
      ctx.fillText(falling ? "Benda langit memasuki laut" : "Gelombang menyebar dari titik tumbukan", 10, H - 12);
      scheduleCauseFrame(tick, 3);
    })();

    var cards = document.querySelectorAll("[data-cause-card]");
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var index = Array.prototype.indexOf.call(cards, entry.target);
          causeVisible[index] = entry.isIntersecting;
          if (entry.isIntersecting && !causeMotionPaused && !reduceCauseMotion) replayCause(index);
          else pauseCause(index);
        });
      }, { threshold: 0.1 });
      cards.forEach(function(card) { observer.observe(card); });
    } else {
      causeVisible = [true, true, true, true];
      if (!causeMotionPaused && !reduceCauseMotion) {
        causeVisible.forEach(function(visible, index) {
          if (visible) replayCause(index);
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
