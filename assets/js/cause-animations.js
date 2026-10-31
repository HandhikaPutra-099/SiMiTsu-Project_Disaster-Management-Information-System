// CAUSE ANIMATIONS — fully self-contained canvas 2D animations
  // ══════════════════════════════════════════════════════════════
  var causeT = [0, 0, 0];
  var causeCtx = [null, null, null];
  var causeW   = [0, 0, 0];
  var causeH   = [0, 0, 0];

  function replayCause(idx) { causeT[idx] = 0; }

  function initCauseAnimations() {
    // Setup each canvas once — no resize every frame
    for (var ci = 0; ci < 3; ci++) {
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
      var ctx = causeCtx[0]; if (!ctx) { requestAnimationFrame(tick); return; }
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
        ctx.strokeStyle = "rgba(255,200,50,0.9)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(W*0.5, H*0.62 - seaRise); ctx.lineTo(W*0.5, H); ctx.stroke();
      }
      ctx.restore();

      // --- Water layer ---
      var waterTop = H * 0.34 - seaRise * 0.75;
      var waterGrad = ctx.createLinearGradient(0, waterTop, 0, H * 0.55);
      waterGrad.addColorStop(0, "rgba(4,100,160,0.9)"); waterGrad.addColorStop(1, "rgba(2,40,80,0.95)");
      ctx.fillStyle = waterGrad; ctx.fillRect(0, 0, W, waterTop);

      // --- Tsunami wave on water surface ---
      if (waveSpd > 0) {
        var wAmp = Math.min(waveSpd * 28, 28);
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (var xi = 0; xi <= W; xi += 2) {
          var envelope = Math.exp(-Math.pow((xi / W) - 0.5, 2) * 5) * wAmp;
          var wy = waterTop - envelope * Math.sin((xi / W) * 10 - phase * 4);
          xi === 0 ? ctx.moveTo(xi, wy) : ctx.lineTo(xi, wy);
        }
        ctx.stroke();
        // Fill under wave
        ctx.fillStyle = "rgba(56,189,248,0.15)";
        ctx.beginPath();
        for (var xi2 = 0; xi2 <= W; xi2 += 2) {
          var env2 = Math.exp(-Math.pow((xi2 / W) - 0.5, 2) * 5) * wAmp;
          var wy2 = waterTop - env2 * Math.sin((xi2 / W) * 10 - phase * 4);
          xi2 === 0 ? ctx.moveTo(xi2, wy2) : ctx.lineTo(xi2, wy2);
        }
        ctx.lineTo(W, waterTop); ctx.lineTo(0, waterTop); ctx.closePath(); ctx.fill();
      }

      // Water surface shimmer line
      ctx.strokeStyle = "rgba(14,165,233,0.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, waterTop); ctx.lineTo(W, waterTop); ctx.stroke();

      // --- Labels ---
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#94a3b8";
      ctx.fillText("← Lempeng Samudra", 8, H * 0.72 + qShake * 0.3);
      ctx.fillText("Lempeng Benua →", W * 0.55, H * 0.55 - seaRise * 0.4);
      ctx.fillStyle = "rgba(14,165,233,0.7)"; ctx.font = "10px sans-serif";
      ctx.fillText("Laut dalam", 6, waterTop - 6);
      if (seaRise > 3) {
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 12px sans-serif";
        ctx.fillText("⚡ DASAR LAUT NAIK " + Math.round(seaRise) + "m!", W * 0.22, waterTop + 18);
      }
      if (quaking) {
        ctx.fillStyle = "#f59e0b"; ctx.font = "bold 11px sans-serif";
        ctx.fillText("M 9.1 GEMPA MEGATHRUST!", W * 0.28, H * 0.15);
      }

      requestAnimationFrame(tick);
    })();

    // ── Animasi 1: Erupsi Vulkanik ───────────────────────────────
    (function tick() {
      var ctx = causeCtx[1]; if (!ctx) { requestAnimationFrame(tick); return; }
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

      // Lava glow inside crater
      if (erupting) {
        var glowR = ctx.createRadialGradient(vx, vy0 - 80, 2, vx, vy0 - 80, 30 + erupt * 0.4);
        glowR.addColorStop(0, "rgba(255,180,30,0.9)"); glowR.addColorStop(0.5, "rgba(239,68,68,0.5)"); glowR.addColorStop(1, "rgba(239,68,68,0)");
        ctx.fillStyle = glowR;
        ctx.beginPath(); ctx.arc(vx, vy0 - 80, 30 + erupt * 0.4, 0, Math.PI * 2); ctx.fill();

        // Eruption column
        var colGrad = ctx.createLinearGradient(vx, vy0 - 80 - erupt, vx, vy0 - 80);
        colGrad.addColorStop(0, "rgba(200,80,20,0)"); colGrad.addColorStop(0.4, "rgba(239,68,68,0.8)"); colGrad.addColorStop(1, "rgba(255,160,30,0.95)");
        ctx.fillStyle = colGrad;
        ctx.beginPath(); ctx.ellipse(vx, vy0 - 80 - erupt * 0.5, 14 + erupt * 0.25, erupt * 0.6, 0, 0, Math.PI * 2); ctx.fill();

        // Debris particles
        for (var dp = 0; dp < 10; dp++) {
          var ang2 = (dp / 10) * Math.PI * 2 + causeT[1] * 2;
          var rad  = 15 + erupt * 0.7 * ((dp % 3) / 3 + 0.3);
          var px2  = vx + Math.cos(ang2) * rad * 0.5;
          var py2  = vy0 - 82 - erupt * 0.4 - Math.abs(Math.sin(ang2)) * rad * 0.7;
          ctx.fillStyle = dp % 2 === 0 ? "#f97316" : "#fbbf24";
          ctx.beginPath(); ctx.arc(px2, py2, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Water surface
      var wSurf = H * 0.62;
      ctx.strokeStyle = "rgba(14,165,233,0.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, wSurf); ctx.lineTo(W, wSurf); ctx.stroke();

      // Propagating circular waves
      if (waveProp > 0) {
        for (var ring = 0; ring < 3; ring++) {
          var ringR = (waveProp * 1.6 * W * 0.5 - ring * 55) % (W * 0.6);
          if (ringR > 0) {
            var alpha = Math.max(0, 0.8 - ring * 0.25) * waveProp;
            ctx.strokeStyle = "rgba(56,189,248," + alpha + ")";
            ctx.lineWidth = 2 - ring * 0.4;
            ctx.beginPath();
            ctx.ellipse(vx, wSurf, ringR, ringR * 0.25, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // Labels
      ctx.fillStyle = "rgba(14,165,233,0.7)"; ctx.font = "10px sans-serif";
      ctx.fillText("Permukaan laut", 6, wSurf - 5);
      ctx.fillStyle = "#94a3b8"; ctx.font = "11px sans-serif";
      ctx.fillText("Gunung Berapi Bawah Laut", vx - 72, H * 0.94);
      if (erupting) {
        ctx.fillStyle = "#ef4444"; ctx.font = "bold 12px sans-serif";
        ctx.fillText("🌋 ERUPSI EKSPLOSIF!", vx - 68, H * 0.12);
      }
      if (waveProp > 0.3) {
        ctx.fillStyle = "#0ea5e9"; ctx.font = "bold 11px sans-serif";
        ctx.fillText("Tsunami menjalar ke segala arah!", vx - 105, wSurf + 18);
      }

      requestAnimationFrame(tick);
    })();

    // ── Animasi 2: Longsor Bawah Laut ───────────────────────────
    (function tick() {
      var ctx = causeCtx[2]; if (!ctx) { requestAnimationFrame(tick); return; }
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
        slidGrad.addColorStop(0, "rgba(139,92,246," + slideAlpha + ")");
        slidGrad.addColorStop(1, "rgba(100,60,180," + (slideAlpha * 0.6) + ")");
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
          dustGrad.addColorStop(0, "rgba(139,92,246,0)"); dustGrad.addColorStop(1, "rgba(139,92,246,0.25)");
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
            ctx.strokeStyle = "rgba(56,189,248," + Math.max(0, 0.85 - wr * 0.25) + ")";
            ctx.lineWidth = 2.5 - wr * 0.5;
            ctx.beginPath();
            ctx.ellipse(wCX, wTop, wRad, wRad * 0.3, 0, Math.PI, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      ctx.strokeStyle = "rgba(14,165,233,0.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, wTop); ctx.lineTo(W, wTop); ctx.stroke();

      // Labels
      ctx.fillStyle = "#94a3b8"; ctx.font = "11px sans-serif";
      ctx.fillText("Continental Shelf", W * 0.58, H * 0.42);
      ctx.fillText("Lereng Bawah Laut", 8, H * 0.72);
      ctx.fillStyle = "rgba(14,165,233,0.7)"; ctx.font = "10px sans-serif";
      ctx.fillText("Permukaan laut", 6, wTop - 5);
      if (slideAmt > 10) {
        ctx.fillStyle = "#8b5cf6"; ctx.font = "bold 12px sans-serif";
        ctx.fillText("⬇ LONGSOR " + Math.round(slideAmt) + "m!", W * 0.28, H * 0.5 + sY * 0.3);
      }
      if (waveAmt > 0.2) {
        ctx.fillStyle = "#0ea5e9"; ctx.font = "bold 11px sans-serif";
        ctx.fillText("Tsunami lokal terbentuk!", W * 0.28, wTop + 18);
      }

      requestAnimationFrame(tick);
    })();
  }

  // ══════════════════════════════════════════════════════════════
