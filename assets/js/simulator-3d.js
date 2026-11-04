// SIMULASI 3D — Fully data-driven renderer
  // All visuals respond to: magnitude, depth, distance,
  // location zone, coast type, time of day
  // ══════════════════════════════════════════════════════════════
  var sim3dCanvas, sim3dCtx, sim3dW, sim3dH;
  var currentPhase = 0, waveH = 10, autoPlayTimer = null;
  var sim3dT = 0;
  var simulatorMotionPreference = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceSimulatorMotion = Boolean(simulatorMotionPreference && simulatorMotionPreference.matches);
  var simulatorMotionPaused = reduceSimulatorMotion;
  var cam3d = { theta: 0.45, phi: 0.55, dist: 1, px: 0, py: 0 };
  var drag3d = { active: false, btn: 0, lx: 0, ly: 0 };
  var pinch3d = { active: false, dist: 0 };

  function updateSimulatorMotionControl() {
    var control = document.getElementById("simMotionToggle");
    if (!control) return;
    control.disabled = reduceSimulatorMotion;
    control.setAttribute("aria-pressed", String(simulatorMotionPaused || reduceSimulatorMotion));
    control.textContent = reduceSimulatorMotion
      ? "Gerak dijeda oleh pengaturan perangkat"
      : simulatorMotionPaused ? "Putar gerak 3D" : "Jeda gerak 3D";
    var playSequence = document.getElementById("simPlaySequence");
    if (playSequence) playSequence.disabled = reduceSimulatorMotion || simulatorMotionPaused;
  }

  function setSimulatorMotionPaused(paused) {
    simulatorMotionPaused = paused;
    if (paused) pauseAutoPlay3D();
    updateSimulatorMotionControl();
  }

  if (simulatorMotionPreference) {
    var onSimulatorMotionPreferenceChange = function(event) {
      reduceSimulatorMotion = event.matches;
      if (reduceSimulatorMotion) setSimulatorMotionPaused(true);
      else updateSimulatorMotionControl();
    };
    if (simulatorMotionPreference.addEventListener) {
      simulatorMotionPreference.addEventListener("change", onSimulatorMotionPreferenceChange);
    } else {
      simulatorMotionPreference.addListener(onSimulatorMotionPreferenceChange);
    }
  }

  // ── Simulation state — driven by updateSim() ──────────────────
  var simState = {
    mag: 7.5, dep: 30, dist: 80,
    loc: "trench", coast: "open", time: "day",
    height: 8, eta: 24, speed: 420, inland: 2.0,
    level: "medium"
  };

  function getPhaseDescriptions() {
    var s = simState;
    var coastName = {open:"pantai terbuka",bay:"teluk/muara",cliff:"tebing",mangrove:"mangrove"}[s.coast]||"pantai";
    var timeName = s.time === "night" ? "malam" : "siang";
    var epiDist = s.dist < 50 ? "sangat dekat ("+s.dist+" km)" : s.dist < 150 ? "dekat ("+s.dist+" km)" : "jauh ("+s.dist+" km)";
    return [
      "Kondisi "+coastName+", episentrum "+epiDist+", "+timeName+".",
      "Gempa M"+s.mag.toFixed(1), "Gelombang terbentuk di atas dasar laut.",
      "Gelombang bergerak di laut dalam, model "+s.speed+" km/jam.",
      "Gelombang berubah saat mendekati "+coastName+".",
      "Gelombang mencapai pantai dalam ilustrasi ini."
    ];
  }


  function init3DScene() {
    sim3dCanvas = document.getElementById("threeCanvas");
    if (!sim3dCanvas) return;
    var motionToggle = document.getElementById("simMotionToggle");
    if (motionToggle) {
      motionToggle.addEventListener("click", function() {
        setSimulatorMotionPaused(!simulatorMotionPaused);
      });
    }
    updateSimulatorMotionControl();

    function resize3d() {
      sim3dW = sim3dCanvas.offsetWidth || 800;
      sim3dH = sim3dCanvas.offsetHeight || 500;
      sim3dCanvas.width  = sim3dW;
      sim3dCanvas.height = sim3dH;
    }
    resize3d();
    window.addEventListener("resize", resize3d);
    sim3dCtx = sim3dCanvas.getContext("2d");
    var status = document.getElementById("simulatorStatus");
    if (!sim3dCtx) {
      if (status) {
        status.hidden = false;
        status.textContent = "Simulasi visual tidak tersedia di peramban ini.";
      }
      return;
    }

    sim3dCanvas.addEventListener("mousedown", function(e) {
      drag3d.active = true; drag3d.btn = e.button;
      drag3d.lx = e.clientX; drag3d.ly = e.clientY;
      e.preventDefault();
    });
    window.addEventListener("mouseup",   function() { drag3d.active = false; });
    window.addEventListener("mousemove", function(e) {
      if (!drag3d.active) return;
      var dx = e.clientX - drag3d.lx, dy = e.clientY - drag3d.ly;
      drag3d.lx = e.clientX; drag3d.ly = e.clientY;
      if (drag3d.btn === 0) {
        cam3d.theta -= dx * 0.008;
        cam3d.phi    = Math.max(0.15, Math.min(1.4, cam3d.phi + dy * 0.006));
      } else {
        cam3d.px += dx * 0.3; cam3d.py += dy * 0.3;
      }
    });
    sim3dCanvas.addEventListener("wheel", function(e) {
      cam3d.dist = Math.max(0.4, Math.min(3.0, cam3d.dist + e.deltaY * 0.001));
      e.preventDefault();
    }, {passive: false});
    sim3dCanvas.addEventListener("keydown", function(event) {
      var handled = true;
      if (event.key === "ArrowLeft") {
        if (event.shiftKey) cam3d.px -= 12;
        else cam3d.theta -= 0.08;
      } else if (event.key === "ArrowRight") {
        if (event.shiftKey) cam3d.px += 12;
        else cam3d.theta += 0.08;
      } else if (event.key === "ArrowUp") {
        if (event.shiftKey) cam3d.py -= 12;
        else cam3d.phi = Math.max(0.15, cam3d.phi - 0.08);
      } else if (event.key === "ArrowDown") {
        if (event.shiftKey) cam3d.py += 12;
        else cam3d.phi = Math.min(1.4, cam3d.phi + 0.08);
      } else if (event.key === "+" || event.key === "=") {
        cam3d.dist = Math.max(0.4, cam3d.dist - 0.1);
      } else if (event.key === "-") {
        cam3d.dist = Math.min(3.0, cam3d.dist + 0.1);
      } else if (event.key === "Home") {
        cam3d = { theta: 0.45, phi: 0.55, dist: 1, px: 0, py: 0 };
      } else {
        handled = false;
      }
      if (handled) event.preventDefault();
    });
    sim3dCanvas.addEventListener("touchstart", function(e) {
      if (e.touches.length === 1) {
        drag3d.active = true; drag3d.btn = 0;
        drag3d.lx = e.touches[0].clientX; drag3d.ly = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        drag3d.active = false; pinch3d.active = true;
        pinch3d.dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      }
      e.preventDefault();
    }, {passive: false});
    sim3dCanvas.addEventListener("touchmove", function(e) {
      if (drag3d.active && e.touches.length === 1) {
        var dx = e.touches[0].clientX - drag3d.lx, dy2 = e.touches[0].clientY - drag3d.ly;
        drag3d.lx = e.touches[0].clientX; drag3d.ly = e.touches[0].clientY;
        cam3d.theta -= dx * 0.008;
        cam3d.phi    = Math.max(0.15, Math.min(1.4, cam3d.phi + dy2 * 0.006));
      } else if (pinch3d.active && e.touches.length === 2) {
        var nd = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
        cam3d.dist = Math.max(0.4, Math.min(3.0, cam3d.dist - (nd - pinch3d.dist) * 0.003));
        pinch3d.dist = nd;
      }
      e.preventDefault();
    }, {passive: false});
    sim3dCanvas.addEventListener("touchend", function() { drag3d.active = false; pinch3d.active = false; });
    sim3dCanvas.addEventListener("contextmenu", function(e) { e.preventDefault(); });

    render3DLoop();
  }

  function project3D(wx, wy, wz) {
    var baseDist = 220 * cam3d.dist;
    var cx = baseDist * Math.sin(cam3d.phi) * Math.sin(cam3d.theta) - cam3d.px * Math.cos(cam3d.theta);
    var cz = baseDist * Math.sin(cam3d.phi) * Math.cos(cam3d.theta) + cam3d.px * Math.sin(cam3d.theta);
    var cy = baseDist * Math.cos(cam3d.phi) + cam3d.py;
    var rx = wx - cx, ry = wy - cy, rz = wz - cz;
    var fwdLen = Math.sqrt(cx*cx + cy*cy + cz*cz);
    var fx = -cx/fwdLen, fy = -cy/fwdLen, fz = -cz/fwdLen;
    var rx2 = fy*1 - fz*0, ry2 = fz*0 - fx*1, rz2 = fx*0 - fy*0;
    // right = fwd × up (up = 0,1,0)
    rx2 = fy; ry2 = -fx*0; rz2 = fx;
    // manual: right = cross(fwd, up)
    rx2 = fy*(0) - fz*(1);
    ry2 = fz*(0) - fx*(0);
    rz2 = fx*(1) - fy*(0);
    var rl = Math.sqrt(rx2*rx2+ry2*ry2+rz2*rz2);
    if(rl<0.00001){rx2=1;ry2=0;rz2=0;}else{rx2/=rl; ry2/=rl; rz2/=rl;}
    var uux = ry2*fz - rz2*fy, uuy = rz2*fx - rx2*fz, uuz = rx2*fy - ry2*fx;
    var camX = rx*rx2 + ry*ry2 + rz*rz2;
    var camY = rx*uux + ry*uuy + rz*uuz;
    var camZ = rx*fx  + ry*fy  + rz*fz;
    if (camZ <= 0.1) return null;
    var fov = sim3dH * 1.15;
    return {x: sim3dW*0.5 + (camX/camZ)*fov, y: sim3dH*0.5 - (camY/camZ)*fov, z: camZ};
  }

  // ── Data-driven wave height function ──────────────────────────
  // All parameters flow from simState → waveH
  function waveAt(wx, wz) {
    var t = sim3dT;
    var h = waveH; // waveH is set by updateSim()
    var s = simState;

    // Base swell — scales with magnitude (more energetic ocean for bigger quakes)
    var swellAmp = 0.4 + Math.max(0, (s.mag - 6) * 0.12);
    // Swell frequency — shallower depth = choppier
    var swellFreq = s.dep < 30 ? 0.07 : s.dep < 70 ? 0.05 : 0.035;
    // Speed multiplier — ocean speed affects wave propagation direction
    var propSpeed = s.loc==="trench" ? 20 : s.loc==="shallow" ? 13 : 18;

    if (currentPhase === 0) {
      // Normal ocean: multi-component swell tuned to location
      return swellAmp * Math.sin(wx*swellFreq + t*0.9)
           + swellAmp*0.7 * Math.sin(wz*0.04 + t*0.65)
           + swellAmp*0.4 * Math.sin((wx+wz)*0.03 + t*1.1)
           + swellAmp*0.25 * Math.cos(wx*0.09 - t*0.5);

    } else if (currentPhase === 1) {
      // Earthquake shockwave — magnitude drives intensity, depth drives spread
      var shockAmp = Math.max(1.0, (s.mag - 5.5) * 1.2);
      var spread = 400 + s.dep * 8; // deeper = wider spread
      var shock = shockAmp * Math.max(0, Math.sin(t*14)) * Math.exp(-(wx*wx+wz*wz)/spread);
      return shock + swellAmp * Math.sin(wx*swellFreq+t)*0.6;

    } else if (currentPhase === 2) {
      // Wave formation — radial, magnitude scales amplitude
      var d = Math.sqrt(wx*wx + wz*wz);
      var radialAmp = h * 0.18 * Math.max(0.5, s.mag/9.5);
      return radialAmp * Math.exp(-d*d/1600) * Math.cos(d*0.08 - t*3)
           + swellAmp * Math.sin(wx*swellFreq+t)*0.4;

    } else if (currentPhase === 3) {
      // Open ocean propagation — distance affects perceived wavefront position
      var propOff = -(s.dist / 120) * 5; // shift wavefront based on distance
      return h * 0.08 * Math.sin((wx + propOff - t*propSpeed)*0.035)
           + swellAmp * Math.sin(wx*swellFreq+t)*0.3;

    } else if (currentPhase === 4) {
      // Shoaling — coast type changes amplification profile
      var coastAmp = {open:1.0, bay:1.8, cliff:0.8, mangrove:0.6}[s.coast] || 1.0;
      var depthAmp = 1 + Math.max(0, (wx+50)/55) * (3 + coastAmp);
      return h * 0.055 * depthAmp * Math.sin((wx - t*13)*0.055)
           + swellAmp * Math.sin(wx*swellFreq+t)*0.2;

    } else {
      // Impact — height, inland reach, coast type all affect shape
      if (wx < 55) {
        var inlandFactor = Math.max(0, 1 + (wx+65)/(100 + s.inland*8));
        var coastFactor  = {open:0.32, bay:0.48, cliff:0.22, mangrove:0.18}[s.coast] || 0.32;
        var impAmp = h * coastFactor * inlandFactor;
        return impAmp * Math.sin((wx - t*9)*0.08) + swellAmp*0.1 * Math.sin(wx*swellFreq+t);
      }
      return 0;
    }
  }

  // ── Draw a human figure at a projected screen point ──────────
  function drawHuman(ctx, sp, scale, color, running, floodDepth) {
    if (!sp) return;
    var s = scale || 1;
    var x = sp.x, y = sp.y;
    var alpha = Math.min(1, 3 / sp.z);
    if (alpha < 0.05) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    // legs — animate if running
    var legSwing = running ? Math.sin(sim3dT * 8 + x * 0.5) * 4 * s : 0;
    var bodyBob  = running ? Math.abs(Math.sin(sim3dT*8+x*0.5)) * 1.5 * s : 0;
    // body
    var bodyH = 8 * s, headR = 3.5 * s;
    var bodyY = y - floodDepth;
    ctx.fillStyle = color || "#f4c06f";
    // legs
    ctx.strokeStyle = color || "#f4c06f"; ctx.lineWidth = 1.8 * s;
    ctx.beginPath(); ctx.moveTo(x, bodyY); ctx.lineTo(x - 2*s + legSwing*0.5, bodyY + bodyH*0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, bodyY); ctx.lineTo(x + 2*s - legSwing*0.5, bodyY + bodyH*0.7); ctx.stroke();
    // torso
    ctx.fillStyle = color === "#fca5a5" ? "#ef4444" : (color === "#86efac" ? "#22c55e" : "#2563eb");
    ctx.fillRect(x - 2.5*s, bodyY - bodyH*0.85 - bodyBob, 5*s, bodyH*0.75);
    // arms
    ctx.strokeStyle = color || "#f4c06f"; ctx.lineWidth = 1.5*s;
    ctx.beginPath(); ctx.moveTo(x-2.5*s, bodyY-bodyH*0.7-bodyBob); ctx.lineTo(x-5*s, bodyY-bodyH*0.3-bodyBob+legSwing); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+2.5*s, bodyY-bodyH*0.7-bodyBob); ctx.lineTo(x+5*s, bodyY-bodyH*0.3-bodyBob-legSwing); ctx.stroke();
    // head
    ctx.fillStyle = "#f4c06f";
    ctx.beginPath(); ctx.arc(x, bodyY - bodyH - headR*0.5 - bodyBob, headR, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // ── Draw a textured building ──────────────────────────────────
  function drawBuilding3D(ctx, b, floodWave) {
    var floodH = 0;
    if (currentPhase === 5) {
      floodH = Math.max(0, floodWave * Math.max(0, 1 - (b.x-55)/55));
      if (floodH > b.h) floodH = b.h;
    }
    var by = floodH;
    var w = b.w, d = b.d || b.w;
    var base = [
      project3D(b.x,   by,   b.z),
      project3D(b.x+w, by,   b.z),
      project3D(b.x+w, by,   b.z+d),
      project3D(b.x,   by,   b.z+d),
    ];
    var top = [
      project3D(b.x,   by+b.h, b.z),
      project3D(b.x+w, by+b.h, b.z),
      project3D(b.x+w, by+b.h, b.z+d),
      project3D(b.x,   by+b.h, b.z+d),
    ];
    if (!base[0]||!top[0]) return;

    // Front face with window pattern
    if (top[0]&&top[1]&&base[1]&&base[0]) {
      ctx.beginPath();
      ctx.moveTo(top[0].x,top[0].y); ctx.lineTo(top[1].x,top[1].y);
      ctx.lineTo(base[1].x,base[1].y); ctx.lineTo(base[0].x,base[0].y);
      ctx.closePath();
      ctx.fillStyle = b.col || "#3b4f6e"; ctx.fill();
      ctx.strokeStyle="rgba(0,0,0,0.4)"; ctx.lineWidth=0.8; ctx.stroke();

      // Windows on front face
      if (b.h > 6 && top[0] && base[0]) {
        var floors = Math.floor(b.h / 4);
        var faceW  = Math.abs(top[1].x - top[0].x);
        var faceH  = Math.abs(base[0].y - top[0].y);
        var bx0 = Math.min(top[0].x, top[1].x);
        var by0 = top[0].y;
        var wFlood = currentPhase === 5 && floodH > 0;
        for (var fl=0; fl<floors; fl++) {
          var wy2 = by0 + faceH*(fl+0.2)/floors;
          var wh2 = faceH*0.35/floors;
          for (var wc=0; wc<2; wc++) {
            var wx2 = bx0 + faceW*(wc*0.4+0.15);
            var ww2 = faceW*0.2;
            ctx.fillStyle = wFlood && fl < 2 ? "rgba(56,189,248,0.5)" :
                            (Math.random() > 0.98 ? "#fef9c3" : "rgba(255,255,180,0.25)");
            ctx.fillRect(wx2, wy2, ww2, wh2);
          }
        }
      }
    }
    // Side face
    if (top[1]&&top[2]&&base[2]&&base[1]) {
      ctx.beginPath();
      ctx.moveTo(top[1].x,top[1].y); ctx.lineTo(top[2].x,top[2].y);
      ctx.lineTo(base[2].x,base[2].y); ctx.lineTo(base[1].x,base[1].y);
      ctx.closePath();
      ctx.fillStyle = shadeColor(b.col||"#3b4f6e", -30); ctx.fill();
      ctx.strokeStyle="rgba(0,0,0,0.3)"; ctx.lineWidth=0.8; ctx.stroke();
    }
    // Roof — gable or flat
    if (top[0]&&top[1]&&top[2]&&top[3]) {
      if (b.gable) {
        // Peaked roof
        var rpx = (top[0].x+top[1].x)*0.5, rpy = top[0].y - Math.abs(top[0].y-base[0].y)*0.18;
        ctx.beginPath();
        ctx.moveTo(top[0].x,top[0].y); ctx.lineTo(top[1].x,top[1].y);
        ctx.lineTo(rpx, rpy); ctx.closePath();
        ctx.fillStyle = b.roofCol || "#8B3030"; ctx.fill();
        ctx.strokeStyle="rgba(0,0,0,0.3)"; ctx.lineWidth=0.6; ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(top[0].x,top[0].y); ctx.lineTo(top[1].x,top[1].y);
        ctx.lineTo(top[2].x,top[2].y); ctx.lineTo(top[3].x,top[3].y);
        ctx.closePath(); ctx.fillStyle = shadeColor(b.col||"#3b4f6e",25); ctx.fill();
      }
    }
    // Flood water level indicator
    if (floodH > 0.5) {
      var fBase = [
        project3D(b.x-0.3,0,b.z-0.3), project3D(b.x+w+0.3,0,b.z-0.3),
        project3D(b.x+w+0.3,0,b.z+d+0.3), project3D(b.x-0.3,0,b.z+d+0.3)
      ];
      if(fBase[0]&&fBase[1]&&fBase[2]&&fBase[3]) {
        ctx.beginPath();
        ctx.moveTo(fBase[0].x,fBase[0].y); ctx.lineTo(fBase[1].x,fBase[1].y);
        ctx.lineTo(fBase[2].x,fBase[2].y); ctx.lineTo(fBase[3].x,fBase[3].y);
        ctx.closePath(); ctx.fillStyle="rgba(56,189,248,0.4)"; ctx.fill();
      }
    }
    return {floodH: floodH, base: base};
  }

  // ── Draw a palm tree ──────────────────────────────────────────
  function drawPalmTree(ctx, wx, wz, height, isNight) {
    var base = project3D(wx, 0, wz);
    var top  = project3D(wx, height, wz);
    if (!base || !top) return;
    var alpha = Math.min(1, 4/base.z);
    if (alpha < 0.05) return;
    ctx.save(); ctx.globalAlpha = alpha;
    // trunk curve
    var midX = (base.x+top.x)*0.5 + Math.sin(sim3dT*0.5+wx)*1.5;
    ctx.strokeStyle = "#8B6914"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(base.x,base.y);
    ctx.quadraticCurveTo(midX, (base.y+top.y)*0.5, top.x, top.y);
    ctx.stroke();
    // fronds
    var fLen = height * 4;
    var pScale = Math.abs(top.y-base.y) / Math.max(1,height);
    for(var fi=0;fi<6;fi++){
      var ang = (fi/6)*Math.PI*2 + sim3dT*0.3;
      ctx.strokeStyle = "#22863a"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(top.x, top.y);
      ctx.lineTo(top.x + Math.cos(ang)*fLen*pScale*0.7,
                 top.y + Math.sin(ang)*fLen*pScale*0.35 - fLen*pScale*0.15);
      ctx.stroke();
    }
    ctx.restore();
  }

  function render3DLoop() {
    requestAnimationFrame(render3DLoop);
    if (!sim3dCtx) return;
    if (!reduceSimulatorMotion && !simulatorMotionPaused) sim3dT += 0.022;

    var ctx = sim3dCtx, W = sim3dW, H = sim3dH;
    var s = simState;
    var isNight = s.time === "night";

    // ══════════════════════════════════════════════════════════
    // SKY — night/day/storm driven by parameters
    // ══════════════════════════════════════════════════════════
    var sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    if (currentPhase >= 5) {
      // Impact: blood-red sky
      sky.addColorStop(0, isNight ? "#0d0003" : "#1a0508");
      sky.addColorStop(0.5, isNight ? "#1a0208" : "#2d0a10");
      sky.addColorStop(1, "#041428");
    } else if (currentPhase === 1) {
      // Earthquake: dark shaking
      sky.addColorStop(0, isNight ? "#000008" : "#0a0510");
      sky.addColorStop(0.5, "#08182a");
      sky.addColorStop(1, "#041428");
    } else if (isNight) {
      sky.addColorStop(0, "#000005"); sky.addColorStop(0.5, "#030818"); sky.addColorStop(1, "#041428");
    } else {
      sky.addColorStop(0, "#020810"); sky.addColorStop(0.5, "#041428"); sky.addColorStop(1, "#062040");
    }
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // Moon or sun glow
    if (isNight) {
      var moonG = ctx.createRadialGradient(W*0.75, H*0.1, 2, W*0.75, H*0.1, 40);
      moonG.addColorStop(0, "rgba(220,230,255,0.25)"); moonG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = moonG; ctx.fillRect(0,0,W,H);
      // Moon disc
      ctx.fillStyle = "rgba(230,235,255,0.85)";
      ctx.beginPath(); ctx.arc(W*0.75, H*0.1, 8, 0, Math.PI*2); ctx.fill();
    } else if (currentPhase <= 3) {
      // Sunrise/sunset glow
      var sunG = ctx.createRadialGradient(W*0.8, H*0.08, 3, W*0.8, H*0.08, 60);
      sunG.addColorStop(0, "rgba(255,200,80,0.18)"); sunG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sunG; ctx.fillRect(0,0,W,H);
    }

    // Stars (night, or phases 0-2 day)
    if (isNight || currentPhase <= 1) {
      ctx.fillStyle = isNight ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)";
      var starCount = isNight ? 60 : 20;
      for(var si=0; si<starCount; si++){
        var stx = ((si*137+23)%W), sty = ((si*97+11)%(H*0.42));
        // twinkle
        var twinkle = isNight ? (0.5 + 0.5*Math.sin(sim3dT*3+si)) : 1;
        ctx.globalAlpha = twinkle * (isNight ? 0.8 : 0.3);
        ctx.fillRect(stx, sty, si%3===0?1.5:1, si%3===0?1.5:1);
      }
      ctx.globalAlpha = 1;
    }

    // Clouds — more visible in day, storm-like in high magnitude
    if (!isNight || currentPhase <= 2) {
      var cloudDensity = Math.min(1, s.mag/9.0);
      ctx.save();
      ctx.globalAlpha = isNight ? 0.04 : (0.06 + cloudDensity*0.08);
      ctx.fillStyle = currentPhase >= 4 ? "#6a7080" : "#b0c8e8";
      var cloudOff = sim3dT * (2 + cloudDensity);
      for(var ci=0; ci<5; ci++){
        var cxp = ((ci*160+cloudOff*9)%W), cyp = H*0.1 + ci*8;
        var cw = 50 + ci*18 + cloudDensity*30;
        ctx.beginPath(); ctx.ellipse(cxp, cyp, cw, 12+ci*4, 0, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }

    // Horizon glow
    var hgColor = isNight ? "rgba(20,50,100,0.2)" : "rgba(14,165,233,0.18)";
    var hg = ctx.createLinearGradient(0, H*0.38, 0, H*0.58);
    hg.addColorStop(0, "rgba(0,0,0,0)"); hg.addColorStop(1, hgColor);
    ctx.fillStyle = hg; ctx.fillRect(0, H*0.38, W, H*0.2);

    // ══════════════════════════════════════════════════════════
    // OCEAN GRID
    // ══════════════════════════════════════════════════════════
    var COLS = 42, ROWS = 30;
    var X0=-120, X1=62, Z0=-88, Z1=88;
    var dx2=(X1-X0)/COLS, dz2=(Z1-Z0)/ROWS;

    // Seabed uplift: scaled to magnitude & depth
    var upliftScale = Math.max(0, (s.mag - 6.5) / 3) * (1 - s.dep/250);
    var seabedLift = 0;
    if (currentPhase===1) seabedLift = Math.max(0,Math.sin(sim3dT*2))*waveH*0.4*upliftScale;

    // Build projected ocean grid
    var pts = [];
    for (var row=0; row<=ROWS; row++) {
      pts[row] = [];
      for (var col=0; col<=COLS; col++) {
        var wx3 = X0+col*dx2, wz3 = Z0+row*dz2;
        pts[row][col] = project3D(wx3, waveAt(wx3, wz3), wz3);
      }
    }

    // Painter sort back-to-front
    var rowOrder = [];
    for (var r=0; r<ROWS; r++) rowOrder.push(r);
    rowOrder.sort(function(a,b){
      var zA = pts[a][Math.floor(COLS/2)] ? pts[a][Math.floor(COLS/2)].z : 0;
      var zB = pts[b][Math.floor(COLS/2)] ? pts[b][Math.floor(COLS/2)].z : 0;
      return zB - zA;
    });

    rowOrder.forEach(function(row) {
      for (var col=0; col<COLS; col++) {
        var p00=pts[row][col], p10=pts[row][col+1];
        var p01=pts[row+1][col], p11=pts[row+1][col+1];
        if (!p00||!p10||!p01||!p11) continue;
        var wxc=X0+(col+0.5)*dx2, wzc=Z0+(row+0.5)*dz2;
        if (wxc > 44) continue;

        var wh = waveAt(wxc, wzc);

        // Ocean color: depth + shoaling + surge + night tint
        var depthFactor = Math.max(0, Math.min(1, 1-(wxc+120)/162));
        var shoreFactor = Math.max(0, (wxc+85)/130);
        var surgeFactor = currentPhase>=4 ? Math.max(0,(wxc+65)/105) : 0;

        // Location color tint: trench=deep blue, shallow=teal, deep=dark navy
        var locR = s.loc==="shallow" ? 15 : s.loc==="deep" ? 5 : 8;
        var locG = s.loc==="shallow" ? 70 : s.loc==="deep" ? 50 : 60;
        var locB = s.loc==="shallow" ? 130: s.loc==="deep" ? 140: 120;

        var rC = Math.round(locR + depthFactor*12 + wh*9 + surgeFactor*50);
        var gC = Math.round(locG + shoreFactor*35 + wh*12+ surgeFactor*25);
        var bC = Math.round(locB + depthFactor*55+ wh*18+ surgeFactor*(-40));
        if (isNight) { rC=Math.round(rC*0.4); gC=Math.round(gC*0.5); bC=Math.round(bC*0.7); }
        rC=Math.min(255,Math.max(0,rC)); gC=Math.min(255,Math.max(0,gC)); bC=Math.min(255,Math.max(0,bC));

        // Fresnel shimmer
        var normH = (wh - waveAt(wxc-dx2*0.5, wzc)) / dx2;
        var fresnel = Math.max(0, normH * (isNight ? 20 : 35));
        rC=Math.min(255,rC+fresnel*2); gC=Math.min(255,gC+fresnel*5); bC=Math.min(255,bC+fresnel*18);

        ctx.beginPath();
        ctx.moveTo(p00.x,p00.y); ctx.lineTo(p10.x,p10.y);
        ctx.lineTo(p11.x,p11.y); ctx.lineTo(p01.x,p01.y); ctx.closePath();
        ctx.fillStyle="rgba("+rC+","+gC+","+bC+",0.9)"; ctx.fill();

        // Foam on large waves
        var foamThresh = waveH * (0.15 + (s.mag>8?0.05:0));
        if (wh > foamThresh && currentPhase >= 2) {
          ctx.strokeStyle = isNight ? "rgba(180,210,255,0.3)" : "rgba(220,240,255,0.4)";
          ctx.lineWidth = 0.7; ctx.stroke();
        } else {
          ctx.strokeStyle="rgba(20,80,160,0.12)"; ctx.lineWidth=0.3; ctx.stroke();
        }
      }
    });

    // ── Night ocean sparkle ───────────────────────────────────
    if (isNight && currentPhase <= 3) {
      ctx.save();
      for(var ns=0; ns<12; ns++){
        var nsx = X0 + ((ns*73+sim3dT*8)%(X1-X0-10));
        var nsz = Z0 + ((ns*53)%(Z1-Z0));
        var nsp = project3D(nsx, waveAt(nsx,nsz)+0.5, nsz);
        if(nsp){
          ctx.globalAlpha = 0.2+0.3*Math.sin(sim3dT*4+ns);
          ctx.fillStyle="#93c5fd";
          ctx.fillRect(nsp.x,nsp.y,2,2);
        }
      }
      ctx.restore();
    }

    // ── Seabed (translucent, shows depth & fault) ─────────────
    if (currentPhase <= 2) {
      var sbDepth = -14 - (s.loc==="deep" ? 8 : s.loc==="shallow" ? 4 : 0);
      for(var sr=0; sr<5; sr++) {
        for(var sc3=0; sc3<8; sc3++) {
          var sbx=X0+sc3*(X1-X0)/8, sbz=Z0+sr*(Z1-Z0)/5;
          var sbY2 = sbDepth + (currentPhase===1 ? seabedLift*Math.max(0,1-Math.abs(sbx)/50) : 0);
          var sp0=project3D(sbx,sbY2,sbz), sp1=project3D(sbx+dx2*5,sbY2,sbz);
          var sp2=project3D(sbx+dx2*5,sbY2,sbz+dz2*5), sp3=project3D(sbx,sbY2,sbz+dz2*5);
          if(!sp0||!sp1||!sp2||!sp3) continue;
          // Seabed color by location
          var sbCol = s.loc==="shallow" ? "rgba(50,90,60,0.3)" : s.loc==="deep" ? "rgba(10,25,60,0.4)" : "rgba(30,55,80,0.35)";
          ctx.beginPath();
          ctx.moveTo(sp0.x,sp0.y); ctx.lineTo(sp1.x,sp1.y);
          ctx.lineTo(sp2.x,sp2.y); ctx.lineTo(sp3.x,sp3.y); ctx.closePath();
          ctx.fillStyle=sbCol; ctx.fill();
        }
      }
      // Fault line during earthquake
      if (currentPhase===1 && seabedLift>0.5) {
        var faultLen = Math.min(80, 20 + s.mag * 8);
        var fa=project3D(0, sbDepth+seabedLift*0.5, -faultLen*0.5);
        var fb=project3D(0, sbDepth+seabedLift*0.5, faultLen*0.5);
        if(fa&&fb){
          var faultAlpha = Math.min(0.9, seabedLift/5);
          ctx.strokeStyle="rgba(239,68,68,"+faultAlpha+")"; ctx.lineWidth=2+upliftScale;
          ctx.setLineDash([4,3]); ctx.beginPath();
          ctx.moveTo(fa.x,fa.y); ctx.lineTo(fb.x,fb.y); ctx.stroke();
          ctx.setLineDash([]);
          // Glow
          ctx.strokeStyle="rgba(255,120,50,"+faultAlpha*0.4+")"; ctx.lineWidth=5+upliftScale*2;
          ctx.beginPath(); ctx.moveTo(fa.x,fa.y); ctx.lineTo(fb.x,fb.y); ctx.stroke();
        }
      }
    }

    // ══════════════════════════════════════════════════════════
    // COASTLINE — type driven by coast selector
    // ══════════════════════════════════════════════════════════
    // Shallow water haze
    for(var cz3=-85; cz3<85; cz3+=8) {
      var shPts = [];
      for(var cxs=38; cxs<=48; cxs+=2) {
        shPts.push(project3D(cxs, waveAt(cxs,cz3+4)*0.4, cz3));
      }
      if(shPts[0]&&shPts[1]) {
        ctx.beginPath(); ctx.moveTo(shPts[0].x,shPts[0].y);
        for(var pi=1;pi<shPts.length;pi++){ if(shPts[pi]) ctx.lineTo(shPts[pi].x,shPts[pi].y); }
        ctx.strokeStyle = isNight ? "rgba(60,140,180,0.15)" : "rgba(100,200,220,0.22)";
        ctx.lineWidth=1; ctx.stroke();
      }
    }

    // Beach bands — color & width vary by coast type
    var beachColor1 = {open:"#a07840",bay:"#7a9870",cliff:"#606880",mangrove:"#3a6040"}[s.coast]||"#a07840";
    var beachColor2 = {open:"#d4a96a",bay:"#9ab890",cliff:"#808898",mangrove:"#4a8050"}[s.coast]||"#d4a96a";
    var beachBands = {open:6, bay:4, cliff:2, mangrove:5}[s.coast]||6;
    for(var br=0; br<beachBands; br++) {
      var bx0s=43+br*2, bx1s=45+br*2;
      var bpArr=[project3D(bx0s,0,Z0),project3D(bx1s,0,Z0),project3D(bx1s,0,Z1),project3D(bx0s,0,Z1)];
      if(!bpArr[0]||!bpArr[1]||!bpArr[2]||!bpArr[3]) continue;
      ctx.beginPath();
      ctx.moveTo(bpArr[0].x,bpArr[0].y); ctx.lineTo(bpArr[1].x,bpArr[1].y);
      ctx.lineTo(bpArr[2].x,bpArr[2].y); ctx.lineTo(bpArr[3].x,bpArr[3].y); ctx.closePath();
      var bc = br<2 ? beachColor1 : beachColor2;
      if(isNight){ bc = shadeColor(bc,-40); }
      ctx.fillStyle=bc; ctx.fill();
      // Mangrove: draw tree stubs on each band
      if(s.coast==="mangrove" && br===2) {
        for(var mz=-80;mz<80;mz+=12){
          var mp=project3D(bx0s+1,0.5,mz);
          if(mp){
            ctx.strokeStyle=isNight?"#1a4025":"#2d6035"; ctx.lineWidth=1.5;
            ctx.beginPath(); ctx.moveTo(mp.x,mp.y); ctx.lineTo(mp.x,mp.y-8); ctx.stroke();
            ctx.strokeStyle=isNight?"#0d3018":"#1e5028"; ctx.lineWidth=3;
            ctx.beginPath(); ctx.arc(mp.x,mp.y-9,4,0,Math.PI*2); ctx.stroke();
          }
        }
      }
      // Cliff face for cliff type
      if(s.coast==="cliff" && br===1) {
        for(var cfz=-80;cfz<80;cfz+=6){
          var cf0=project3D(bx0s,0,cfz), cf1=project3D(bx0s,-8,cfz);
          if(cf0&&cf1){
            ctx.strokeStyle=isNight?"#404060":"#606880"; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(cf0.x,cf0.y); ctx.lineTo(cf1.x,cf1.y); ctx.stroke();
          }
        }
      }
    }

    // Shore foam — intensity varies by phase & coast
    var foamIntensity = {open:1.0,bay:0.7,cliff:1.5,mangrove:0.4}[s.coast]||1.0;
    for(var fz2=-82; fz2<82; fz2+=9) {
      var fP = (sim3dT*2 + fz2*0.05) % (Math.PI*2);
      var fmX = 43 + Math.sin(fP)*3;
      var fmP = project3D(fmX, 0.3, fz2);
      if(fmP) {
        var fa2 = (0.2 + Math.sin(fP)*0.18) * foamIntensity;
        if(isNight) fa2 *= 0.5;
        ctx.fillStyle="rgba(255,255,255,"+fa2+")";
        var fw=Math.abs(fmP.x-(project3D(fmX+3,0.3,fz2)||fmP).x);
        ctx.beginPath(); ctx.ellipse(fmP.x,fmP.y,Math.max(3,fw*0.8),2.5,0,0,Math.PI*2); ctx.fill();
      }
    }

    // ══════════════════════════════════════════════════════════
    // INLAND TERRAIN — elevation, flood reach, coast influence
    // ══════════════════════════════════════════════════════════
    var landX1 = 125;
    var landCols2=12, landRows2=7;
    var ldx3=(landX1-56)/landCols2, ldz3=(Z1-Z0)/landRows2;

    // Flood wave: scaled to actual inland reach from simState
    var floodWave=0;
    var maxFlood = s.inland * 6; // world units
    if(currentPhase===5) {
      var floodT = sim3dT - (s.eta/60)*0.5; // timing offset
      floodWave = Math.max(0, Math.sin((55-sim3dT*9)*0.075) * waveH *
        ({open:0.30,bay:0.52,cliff:0.18,mangrove:0.14}[s.coast]||0.30));
    }

    for(var lr=0;lr<landRows2;lr++){
      for(var lc=0;lc<landCols2;lc++){
        var lx=56+lc*ldx3, lz=Z0+lr*ldz3;
        // Terrain elevation — varies by location type
        var elev = 0.3 + Math.sin(lx*0.08)*0.8 + Math.cos(lz*0.07)*0.6
                 + lc * (s.loc==="shallow" ? 0.3 : 0.2); // shallow=flatter inland
        var ly = floodWave>0 ? Math.max(0, floodWave*(1 - (lx-56)/Math.max(1,maxFlood))) : elev;
        var lp=[
          project3D(lx,ly,lz), project3D(lx+ldx3,ly,lz),
          project3D(lx+ldx3,ly,lz+ldz3), project3D(lx,ly,lz+ldz3)
        ];
        if(!lp[0]||!lp[1]||!lp[2]||!lp[3]) continue;
        var flooded = floodWave>0 && ly > elev * 0.5;
        var gR,gG,gB;
        if(flooded){
          gR=10; gG=60; gB=110;
        } else {
          // Coast-specific terrain color
          var baseGreen = {open:[30,80,35],bay:[25,90,38],cliff:[50,60,55],mangrove:[20,75,28]}[s.coast]||[30,80,35];
          gR=Math.round(baseGreen[0]+lc*7); gG=Math.round(baseGreen[1]+elev*18); gB=Math.round(baseGreen[2]+elev*4);
        }
        if(isNight){ gR=Math.round(gR*0.45); gG=Math.round(gG*0.55); gB=Math.round(gB*0.65); }
        ctx.beginPath();
        ctx.moveTo(lp[0].x,lp[0].y); ctx.lineTo(lp[1].x,lp[1].y);
        ctx.lineTo(lp[2].x,lp[2].y); ctx.lineTo(lp[3].x,lp[3].y); ctx.closePath();
        ctx.fillStyle="rgb("+Math.min(255,gR)+","+Math.min(255,gG)+","+Math.min(255,gB)+")";
        ctx.fill();
        ctx.strokeStyle="rgba(0,0,0,0.07)"; ctx.lineWidth=0.3; ctx.stroke();
      }
    }

    // ── Palm trees — hidden if coast is cliff ─────────────────
    if(s.coast !== "cliff") {
      var palmCount = s.coast==="mangrove" ? 0 : 13;
      var palmPos = [
        {x:57,z:-40},{x:57,z:-20},{x:57,z:0},{x:57,z:20},{x:57,z:40},
        {x:59,z:-60},{x:59,z:60},{x:61,z:-50},{x:61,z:10},{x:63,z:-30},
        {x:65,z:50},{x:67,z:-45},{x:67,z:35}
      ];
      palmPos.slice(0,palmCount).forEach(function(p){
        if(floodWave>0 && floodWave*(1-(p.x-56)/maxFlood)>3) return; // submerged
        drawPalmTree(ctx, p.x, p.z, 5+Math.sin(p.x*p.z*0.001)*2, isNight);
      });
    }

    // ══════════════════════════════════════════════════════════
    // BUILDINGS — quantity & density varies by level
    // ══════════════════════════════════════════════════════════
    var bldgDefs = [
      // Near shore huts
      {x:68,z:-50,w:5,d:5,h:6, col:"#7a3a20",roofCol:"#c84020",gable:true},
      {x:68,z:-38,w:5,d:5,h:5, col:"#6a4030",roofCol:"#b03818",gable:true},
      {x:68,z:-25,w:6,d:5,h:6, col:"#7a4020",roofCol:"#c84020",gable:true},
      {x:68,z:15, w:5,d:5,h:5, col:"#6a4030",roofCol:"#a03010",gable:true},
      {x:68,z:30, w:5,d:5,h:7, col:"#8a3820",roofCol:"#c04018",gable:true},
      // Mid-town
      {x:74,z:-42,w:7,d:7,h:14,col:"#3a4f6e"},
      {x:74,z:-25,w:6,d:6,h:10,col:"#2d3f5e"},
      {x:74,z:5,  w:7,d:7,h:16,col:"#4a5f7e"},
      {x:74,z:25, w:6,d:6,h:12,col:"#3a4a6e"},
      {x:74,z:42, w:7,d:7,h:9, col:"#3b4f6e"},
      // Downtown towers
      {x:82,z:-35,w:8,d:8,h:20,col:"#4a5060"},
      {x:82,z:0,  w:8,d:8,h:24,col:"#3a4060"},
      {x:82,z:35, w:8,d:8,h:18,col:"#4a5070"},
      {x:92,z:-20,w:9,d:9,h:28,col:"#303848"},
      {x:92,z:20, w:9,d:9,h:22,col:"#2a3448"},
      // Mosque
      {x:78,z:-10,w:8,d:8,h:12,col:"#e8d8a0",roofCol:"#4a8040",gable:true},
    ];
    bldgDefs.sort(function(a,b){
      var pA=project3D(a.x,0,a.z), pB=project3D(b.x,0,b.z);
      return (pB?pB.z:0)-(pA?pA.z:0);
    });
    bldgDefs.forEach(function(b){
      // Night: dark buildings with lit windows
      if(isNight) b = Object.assign({},b,{col:shadeColor(b.col,-50)});
      drawBuilding3D(ctx, b, floodWave);
    });

    // ══════════════════════════════════════════════════════════
    // HUMAN FIGURES — react to phase & time of day
    // ══════════════════════════════════════════════════════════
    var humanDefs = [
      {wx:56,wz:-35,col:"#fbbf24"},{wx:57,wz:-15,col:"#34d399"},
      {wx:56,wz:10, col:"#f87171"},{wx:57,wz:25, col:"#a78bfa"},
      {wx:55,wz:45, col:"#fbbf24"},{wx:65,wz:-40,col:"#60a5fa"},
      {wx:67,wz:20, col:"#f472b6"},{wx:70,wz:-10,col:"#34d399"},
    ];
    var running = (currentPhase>=4);
    humanDefs.forEach(function(h3,hi){
      var flee = running ? hi*2.5 : 0;
      var floodDp = (currentPhase===5) ? Math.max(0,floodWave*(1-(h3.wx-55)/50))*3 : 0;
      // Night: reduce visibility / crowd runs faster
      var runSpeed = isNight && running ? 1.3 : 1.0;
      var wxh = h3.wx + (running ? flee*0.8*runSpeed : 0);
      var sp3 = project3D(wxh, 0, h3.wz);
      var distScale = sp3 ? Math.max(0.4,Math.min(2,250/sp3.z)) : 1;
      var col3 = currentPhase===5 ? "#fca5a5" : (running ? "#86efac" : h3.col);
      if(isNight) col3 = "#a0b0ff"; // night: blue-ish silhouettes
      drawHuman(ctx, sp3, distScale*0.55, col3, running, floodDp);
    });

    // ══════════════════════════════════════════════════════════
    // EPICENTER SHOCKWAVE — scaled to magnitude
    // ══════════════════════════════════════════════════════════
    if (currentPhase===1||currentPhase===2) {
      var ep=project3D(0, waveAt(0,0)+1.5, 0);
      if(ep){
        var ringCount = s.mag >= 8.5 ? 4 : 3;
        for(var ri=0;ri<ringCount;ri++){
          var rr=(sim3dT*15+ri*22)%90+5;
          var rAlpha = (0.8-ri*0.18) * Math.max(0.3, upliftScale);
          ctx.strokeStyle="rgba(239,68,68,"+rAlpha+")"; ctx.lineWidth=2.5-ri*0.4;
          ctx.beginPath(); ctx.arc(ep.x,ep.y,rr,0,Math.PI*2); ctx.stroke();
        }
        // Inner glow
        var epGlow = ctx.createRadialGradient(ep.x,ep.y,0,ep.x,ep.y,20+upliftScale*10);
        epGlow.addColorStop(0,"rgba(255,100,30,0.5)"); epGlow.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=epGlow; ctx.fillRect(ep.x-40,ep.y-40,80,80);
        ctx.fillStyle="#ef4444"; ctx.beginPath(); ctx.arc(ep.x,ep.y,5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle="#fca5a5"; ctx.font="bold 11px sans-serif";
        ctx.fillText("⚡ M"+s.mag.toFixed(1)+" — "+s.dep+"km",ep.x+8,ep.y-8);
      }
    }

    // ── Bay amplification funnel (phase 4-5) ──────────────────
    if(s.coast==="bay" && currentPhase>=4) {
      var funnelAlpha = (currentPhase===5) ? 0.35 : 0.2;
      var funnelColor = "rgba(56,189,248,"+funnelAlpha+")";
      for(var fRow=0;fRow<3;fRow++){
        var fz0=-40+fRow*10, fz1=40-fRow*10;
        var fx0=40-fRow*5, fx1=56;
        var fp=[project3D(fx0,0,fz0),project3D(fx1,0,fz0),project3D(fx1,0,fz1),project3D(fx0,0,fz1)];
        if(fp[0]&&fp[1]&&fp[2]&&fp[3]){
          ctx.beginPath(); ctx.moveTo(fp[0].x,fp[0].y); ctx.lineTo(fp[1].x,fp[1].y);
          ctx.lineTo(fp[2].x,fp[2].y); ctx.lineTo(fp[3].x,fp[3].y); ctx.closePath();
          ctx.fillStyle=funnelColor; ctx.fill();
        }
      }
    }

    // ── Impact effects (phase 5) ──────────────────────────────
    if (currentPhase===5) {
      // Spray particles — count scales with height
      var sprayCount = Math.round(10 + waveH * 0.8);
      for(var fs=0;fs<sprayCount;fs++){
        var fsx = 36+Math.sin(sim3dT*4+fs)*18;
        var fsz = Z0+fs*(Z1-Z0)/sprayCount;
        var fsP = project3D(fsx, waveAt(fsx,fsz)+1.2, fsz);
        if(fsP){
          var spAlpha = (0.4+Math.sin(sim3dT*6+fs)*0.3)*Math.min(1,waveH/10);
          ctx.fillStyle="rgba(255,255,255,"+spAlpha+")";
          ctx.beginPath(); ctx.arc(fsP.x,fsP.y,Math.max(0.5,1.5+Math.sin(sim3dT*3+fs)*2),0,Math.PI*2); ctx.fill();
        }
      }
      // Wave crest ridge
      ctx.strokeStyle=isNight?"rgba(180,210,255,0.7)":"rgba(255,255,255,0.75)"; ctx.lineWidth=2.5;
      ctx.beginPath();
      var crstStarted=false;
      for(var wci=-85;wci<=85;wci+=4){
        var wcP=project3D(33+Math.sin(sim3dT*2+wci*0.04)*6, waveAt(33,wci)+waveH*0.38, wci);
        if(wcP){ crstStarted?ctx.lineTo(wcP.x,wcP.y):ctx.moveTo(wcP.x,wcP.y); crstStarted=true; }
      }
      ctx.stroke();

      // The color reflects only the illustrative model category.
      var warnColors = {extreme:"rgba(239,68,68,0.95)",high:"rgba(249,115,22,0.95)",medium:"rgba(245,158,11,0.9)",low:"rgba(34,197,94,0.85)"};
      var warnTexts = {extreme:"MODEL: ILUSTRASI SANGAT TINGGI",high:"MODEL: ILUSTRASI TINGGI",medium:"MODEL: ILUSTRASI MENENGAH",low:"MODEL: ILUSTRASI RENDAH"};
      ctx.fillStyle=warnColors[s.level]||warnColors.medium; ctx.font="bold 13px sans-serif";
      var warnP=project3D(36,waveH*0.45,0);
      if(warnP) ctx.fillText(warnTexts[s.level]||"",warnP.x-90,warnP.y-12);
    }

    // ══════════════════════════════════════════════════════════
    // HUD overlay for educational model parameters.
    // ══════════════════════════════════════════════════════════
    // Left HUD box
    ctx.fillStyle="rgba(2,8,20,0.82)";
    if(ctx.roundRect) ctx.roundRect(8,8,240,80,8); else ctx.rect(8,8,240,80);
    ctx.fill();
    // Phase + magnitude
    ctx.fillStyle="#0ea5e9"; ctx.font="bold 12px sans-serif";
    ctx.fillText("FASE "+(currentPhase+1)+"/6",18,26);
    ctx.fillStyle="#f59e0b"; ctx.font="bold 11px sans-serif";
    ctx.fillText("M"+s.mag.toFixed(1)+" · "+s.dep+"km · "+s.dist+"km",18,42);
    // Illustrative category bar
    var lvlColors={extreme:"#ef4444",high:"#f97316",medium:"#f59e0b",low:"#22c55e"};
    ctx.fillStyle=lvlColors[s.level]||"#f59e0b"; ctx.font="bold 10px sans-serif";
    ctx.fillText(({extreme:"MODEL: SANGAT TINGGI",high:"MODEL: TINGGI",medium:"MODEL: MENENGAH",low:"MODEL: RENDAH"}[s.level]||""),18,58);
    ctx.fillStyle="#a8b4c6"; ctx.font="9px sans-serif";
    ctx.fillText("Drag: orbit  |  Scroll: zoom  |  Kanan: geser",18,72);

    // Right top: wave height + speed real-time
    ctx.fillStyle="rgba(2,8,20,0.75)";
    if(ctx.roundRect) ctx.roundRect(W-100,8,92,58,6); else ctx.rect(W-100,8,92,58);
    ctx.fill();
    ctx.fillStyle="#0ea5e9"; ctx.font="bold 14px sans-serif"; ctx.textAlign="center";
    ctx.fillText(waveH.toFixed(1)+" m",W-54,28);
    ctx.fillStyle="#a8b4c6"; ctx.font="9px sans-serif";
    ctx.fillText("Tinggi ilustrasi",W-54,40);
    ctx.fillStyle="#a8b4c6"; ctx.font="10px sans-serif";
    ctx.fillText(s.speed+" km/j · ~"+s.eta+" mnt (model)",W-54,54);
    ctx.textAlign="left";

    // Compass (bottom right)
    var cxc=W-45, cyc=H-45;
    ctx.save(); ctx.translate(cxc,cyc); ctx.rotate(cam3d.theta);
    ctx.strokeStyle="rgba(255,255,255,0.4)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(0,14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14,0); ctx.lineTo(14,0); ctx.stroke();
    ctx.fillStyle="#ef4444"; ctx.font="bold 10px sans-serif"; ctx.textAlign="center";
    ctx.fillText("U",0,-17);
    ctx.fillStyle="#a8b4c6";
    ctx.fillText("S",0,24); ctx.fillText("B",-18,4); ctx.fillText("T",18,4);
    ctx.restore(); ctx.textAlign="left";

    // Night overlay vignette
    if(isNight) {
      var vig = ctx.createRadialGradient(W*0.5,H*0.5,H*0.3,W*0.5,H*0.5,H*0.9);
      vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(1,"rgba(0,0,10,0.45)");
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    }
  }

  function shadeColor(hex, pct) {
    var num = parseInt(hex.slice(1), 16);
    var r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + pct));
    var g = Math.min(255, Math.max(0, ((num >> 8)  & 0xff) + pct));
    var b2= Math.min(255, Math.max(0, ( num        & 0xff) + pct));
    return "rgb("+r+","+g+","+b2+")";
  }

  function setPhase(n) {
    if (!Number.isInteger(n) || n < 0 || n > 5) return;
    currentPhase = n;
    document.querySelectorAll(".phase-list li").forEach(function(li, i) {
      li.classList.toggle("active", i === n);
      var button = li.querySelector("button");
      if (button) button.setAttribute("aria-pressed", String(i === n));
    });
    document.getElementById("phaseDesc").textContent = getPhaseDescriptions()[n];
  }

  function autoPlay3D() {
    if (reduceSimulatorMotion || simulatorMotionPaused) return;
    if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
    var p = 0; setPhase(p);
    autoPlayTimer = setInterval(function() {
      p++; if (p > 5) { clearInterval(autoPlayTimer); autoPlayTimer = null; return; }
      setPhase(p);
    }, 4500);
  }

  function pauseAutoPlay3D() {
    if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
  }

  function resetPhase() {
    if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
    setPhase(0);
  }

  // ══════════════════════════════════════════════════════════════
