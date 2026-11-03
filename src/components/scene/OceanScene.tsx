import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

interface OceanSceneProps {
  phase: number;
  animate?: boolean;
  continuous?: boolean;
  interactive?: boolean;
  className?: string;
  onFallbackChange?: (fallback: boolean) => void;
}

function StaticOcean() {
  return (
    <svg
      className="ocean-scene-fallback"
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="scene-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c3553" />
          <stop offset="1" stopColor="#071827" />
        </linearGradient>
      </defs>
      <rect width="1000" height="560" fill="url(#scene-depth)" />
      <path d="M0 180c120-22 170 22 290 0s170 22 290 0 170 22 290 0 100 8 130 2" fill="none" stroke="#83e7ef" strokeOpacity=".36" strokeWidth="3" />
      <path d="M0 258c120-18 170 18 290 0s170 18 290 0 170 18 290 0 100 10 130 2" fill="none" stroke="#27c6dc" strokeOpacity=".24" strokeWidth="2" />
      <path d="M0 428h422l96-26 94 18 126-34 90-108 72-36 100 15v303H0z" fill="#163345" />
      <path d="M85 529c206-30 323-73 440-110s183-45 287-130" fill="none" stroke="#83e7ef" strokeOpacity=".48" strokeWidth="2" />
    </svg>
  );
}

export default function OceanScene({
  phase,
  animate = false,
  continuous = false,
  interactive = false,
  className = "",
  onFallbackChange,
}: OceanSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<() => void>(() => undefined);
  const syncLoopRef = useRef<() => void>(() => undefined);
  const stageUniformRef = useRef({ value: phase });
  const animateRef = useRef(animate);
  const cameraControlRef = useRef<(action: "left" | "right" | "in" | "out") => void>(() => undefined);
  const fallbackCallbackRef = useRef(onFallbackChange);
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fallbackCallbackRef.current = onFallbackChange;
  }, [onFallbackChange]);

  useEffect(() => {
    stageUniformRef.current.value = phase;
    renderRef.current();
  }, [phase]);

  useEffect(() => {
    animateRef.current = animate;
    syncLoopRef.current();
  }, [animate]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;

    const browser = navigator as Navigator & { deviceMemory?: number };
    const lowPowerDevice =
      (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) ||
      (typeof browser.deviceMemory === "number" && browser.deviceMemory <= 2);
    if (lowPowerDevice) {
      setFallback(true);
      fallbackCallbackRef.current?.(true);
      return;
    }

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.innerWidth >= 700,
        powerPreference: "low-power",
      });
    } catch {
      setFallback(true);
      setReady(false);
      fallbackCallbackRef.current?.(true);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x071827, 12, 25);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    const view = { angle: 0.28, radius: 13, height: 5.4 };
    const uniforms = {
      uTime: { value: 0 },
      uStage: stageUniformRef.current,
    };
    let visible = true;
    let pageVisible = document.visibilityState === "visible";
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId = 0;
    let lastFrameTime = 0;

    const updateCamera = () => {
      camera.position.set(
        view.radius * Math.sin(view.angle),
        view.height,
        view.radius * Math.cos(view.angle),
      );
      camera.lookAt(0, -0.15, 0);
    };
    updateCamera();

    scene.add(new THREE.HemisphereLight(0x83e7ef, 0x071827, 1.4));
    const keyLight = new THREE.DirectionalLight(0xb9f6f7, 2.1);
    keyLight.position.set(-4, 8, 5);
    scene.add(keyLight);

    const seabed = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 9),
      new THREE.MeshStandardMaterial({ color: 0x163345, roughness: 0.94 }),
    );
    seabed.rotation.x = -Math.PI / 2;
    seabed.position.y = -1.35;
    scene.add(seabed);

    const fault = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.28, 7.4),
      new THREE.MeshStandardMaterial({ color: 0xf2a36f, emissive: 0x4a2714 }),
    );
    fault.position.set(-2.3, -1.18, 0);
    scene.add(fault);

    const upliftArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(-2.3, -1.25, 0),
      0.68,
      0xf2a36f,
      0.2,
      0.12,
    );
    scene.add(upliftArrow);

    const coastShape = new THREE.Shape();
    coastShape.moveTo(5.2, -1.2);
    coastShape.lineTo(5.6, -0.58);
    coastShape.lineTo(6.1, -0.24);
    coastShape.lineTo(6.55, 0.22);
    coastShape.lineTo(7.5, 0.34);
    coastShape.lineTo(7.5, -1.2);
    coastShape.closePath();
    const coast = new THREE.Mesh(
      new THREE.ExtrudeGeometry(coastShape, { depth: 5, bevelEnabled: false }),
      new THREE.MeshStandardMaterial({ color: 0x354d49, roughness: 0.96 }),
    );
    coast.position.z = -2.5;
    scene.add(coast);

    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0c5d78,
      roughness: 0.24,
      metalness: 0.22,
      clearcoat: 0.72,
      clearcoatRoughness: 0.3,
      transparent: true,
      opacity: 0.91,
    });
    waterMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uStage = uniforms.uStage;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>
        uniform float uTime;
        uniform float uStage;
        float simSurfaceHeight(vec2 p) {
          float calm = 0.045 * sin(p.x * 1.25 + uTime * 0.32) * cos(p.y * 1.1 + uTime * 0.18);
          float wavePhaseFactor = smoothstep(1.0, 2.6, uStage);
          float travel = sin((p.x + 2.8 - uTime * 0.64) * 1.3) * 0.085 * wavePhaseFactor;
          float shore = smoothstep(1.6, 5.1, p.x) * smoothstep(3.2, 4.2, uStage);
          float shoaling = sin((p.x + 2.8 - uTime * 0.55) * 1.45) * 0.12 * shore;
          float uplift = exp(-dot(p - vec2(-2.3, 0.0), p - vec2(-2.3, 0.0)) * 1.6)
            * 0.055 * (1.0 - smoothstep(1.0, 1.35, uStage)) * smoothstep(0.8, 1.0, uStage);
          return calm + travel + shoaling + uplift;
        }`,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
        float simStep = 0.035;
        float simDx = simSurfaceHeight(position.xy + vec2(simStep, 0.0))
          - simSurfaceHeight(position.xy - vec2(simStep, 0.0));
        float simDy = simSurfaceHeight(position.xy + vec2(0.0, simStep))
          - simSurfaceHeight(position.xy - vec2(0.0, simStep));
        objectNormal = normalize(vec3(-simDx, -simDy, simStep * 2.0));`,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        transformed.z += simSurfaceHeight(position.xy);`,
      );
    };

    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(
        14,
        8,
        window.innerWidth < 700 ? 48 : 88,
        window.innerWidth < 700 ? 28 : 52,
      ),
      waterMaterial,
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.02;
    scene.add(water);

    const particlePositions = new Float32Array(84 * 3);
    for (let index = 0; index < 84; index += 1) {
      particlePositions[index * 3] = ((index * 37) % 140) / 10 - 7;
      particlePositions[index * 3 + 1] = ((index * 19) % 28) / 10 - 1.1;
      particlePositions[index * 3 + 2] = ((index * 53) % 80) / 10 - 4;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x83e7ef,
        size: 0.026,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      }),
    );
    scene.add(particles);

    renderer.setClearColor(0x071827, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.touchAction = interactive ? "pan-y" : "auto";
    setFallback(false);
    setReady(true);
    fallbackCallbackRef.current?.(false);

    function resize() {
      const width = Math.max(hostRef.current?.clientWidth ?? 1, 1);
      const height = Math.max(hostRef.current?.clientHeight ?? 1, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.75));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    function renderFrame() {
      fault.visible = uniforms.uStage.value >= 1 && uniforms.uStage.value < 5;
      upliftArrow.visible = uniforms.uStage.value >= 1 && uniforms.uStage.value < 2;
      renderer.render(scene, camera);
    }

    function shouldAnimate() {
      return (continuous || animateRef.current) && visible && pageVisible && !reducedMotion;
    }

    function tick(time: number) {
      frameId = 0;
      if (!shouldAnimate()) return;
      if (lastFrameTime) uniforms.uTime.value += Math.min((time - lastFrameTime) / 1000, 0.05) * 0.32;
      lastFrameTime = time;
      renderFrame();
      frameId = window.requestAnimationFrame(tick);
    }

    function syncLoop() {
      if (shouldAnimate() && !frameId) {
        lastFrameTime = 0;
        frameId = window.requestAnimationFrame(tick);
      } else if (!shouldAnimate() && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
        lastFrameTime = 0;
        renderFrame();
      }
    }

    renderRef.current = renderFrame;
    syncLoopRef.current = syncLoop;
    resize();

    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    const canvas = renderer.domElement;
    function onPointerDown(event: PointerEvent) {
      if (!interactive || event.button !== 0) return;
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    }
    function onPointerMove(event: PointerEvent) {
      if (!dragging) return;
      view.angle -= (event.clientX - previousX) * 0.006;
      view.height = THREE.MathUtils.clamp(view.height + (event.clientY - previousY) * 0.012, 2.8, 8.5);
      previousX = event.clientX;
      previousY = event.clientY;
      updateCamera();
      renderFrame();
    }
    function onPointerUp() {
      dragging = false;
    }
    function onWheel(event: WheelEvent) {
      if (!interactive) return;
      event.preventDefault();
      view.radius = THREE.MathUtils.clamp(view.radius + event.deltaY * 0.008, 8, 19);
      updateCamera();
      renderFrame();
    }
    function onVisibilityChange() {
      pageVisible = document.visibilityState === "visible";
      syncLoop();
    }
    function onMotionChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      syncLoop();
    }

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        syncLoop();
      }, { rootMargin: "100px" })
      : null;
    observer?.observe(host);

    cameraControlRef.current = (action) => {
      if (action === "left") view.angle -= 0.18;
      if (action === "right") view.angle += 0.18;
      if (action === "in") view.radius = Math.max(8, view.radius - 1);
      if (action === "out") view.radius = Math.min(19, view.radius + 1);
      updateCamera();
      renderFrame();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionChange);
    syncLoop();

    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      renderer.dispose();
      water.geometry.dispose();
      waterMaterial.dispose();
      seabed.geometry.dispose();
      (seabed.material as THREE.Material).dispose();
      fault.geometry.dispose();
      (fault.material as THREE.Material).dispose();
      coast.geometry.dispose();
      (coast.material as THREE.Material).dispose();
      particleGeometry.dispose();
      (particles.material as THREE.Material).dispose();
      host.removeChild(canvas);
      renderRef.current = () => undefined;
      syncLoopRef.current = () => undefined;
      cameraControlRef.current = () => undefined;
    };
  }, [continuous, interactive]);

  return (
    <div className={`ocean-scene ${className}`} ref={hostRef}>
      <StaticOcean />
      {fallback && interactive && (
        <p className="scene-fallback-note" role="status">
          Visualisasi 3D tidak tersedia di perangkat ini. Diagram statis tetap ditampilkan.
        </p>
      )}
      {interactive && ready && !fallback && (
        <div className="ocean-camera-controls" role="group" aria-label="Kontrol sudut pandang">
          <button type="button" aria-label="Putar sudut pandang ke kiri" onClick={() => cameraControlRef.current("left")}>Kiri</button>
          <button type="button" aria-label="Putar sudut pandang ke kanan" onClick={() => cameraControlRef.current("right")}>Kanan</button>
          <button type="button" aria-label="Perbesar tampilan" onClick={() => cameraControlRef.current("in")}>+</button>
          <button type="button" aria-label="Perkecil tampilan" onClick={() => cameraControlRef.current("out")}>-</button>
        </div>
      )}
    </div>
  );
}
