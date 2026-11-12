import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ============================================================
   1. HD CAN LABEL TEXTURE (Canvas 2D)

   IMPORTANT: the canvas aspect must match the unwrapped cylinder,
   otherwise the artwork gets stretched vertically.

     circumference = 2 * PI * CAN_R = 6.283
     height        = 3.51 (visible body)
     required aspect ≈ 6.283 / 3.55 ≈ 1.77

   So we use 2048 x 1157 (~1.77:1). All vertical positions below are
   expressed as `CH * n`, so they adapt automatically; horizontal
   sizes key off CH (the real-world "up" axis) to stay unstretched.
   ============================================================ */
const CH = 1157;
const CW = 2048;   // 2048 / 1157 = 1.770 — matches the cylinder

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function makeLabelCanvas() {
  const c = document.createElement('canvas');
  c.width = CW; c.height = CH;
  const g = c.getContext('2d');

  /* ---- base red with vertical depth ---- */
  const base = g.createLinearGradient(0, 0, 0, CH);
  base.addColorStop(0,    '#b30122');
  base.addColorStop(0.06, '#DC052D');
  base.addColorStop(0.30, '#e00a31');
  base.addColorStop(0.55, '#cf0429');
  base.addColorStop(0.85, '#a1011f');
  base.addColorStop(1,    '#6d0013');
  g.fillStyle = base;
  g.fillRect(0, 0, CW, CH);

  /* ---- subtle vertical carbon weave ---- */
  g.globalAlpha = 0.05;
  for (let x = 0; x < CW; x += 6) {
    g.fillStyle = (x / 6) % 2 ? '#000' : '#fff';
    g.fillRect(x, 0, 3, CH);
  }
  g.globalAlpha = 1;

  /* ---- blue diagonal band ---- */
  g.save();
  g.translate(CW / 2, CH / 2);
  g.rotate(-0.40);
  g.translate(-CW / 2, -CH / 2);
  const bandGr = g.createLinearGradient(0, CH * 0.30, 0, CH * 0.66);
  bandGr.addColorStop(0,   '#061426');
  bandGr.addColorStop(0.18, '#0B1F3B');
  bandGr.addColorStop(0.5,  '#153a66');
  bandGr.addColorStop(0.82, '#0B1F3B');
  bandGr.addColorStop(1,   '#050f1e');
  g.fillStyle = bandGr;
  g.fillRect(-CW, CH * 0.30, CW * 3, CH * 0.36);

  /* silver pinstripes on the band */
  g.fillStyle = 'rgba(220,228,238,.75)';
  g.fillRect(-CW, CH * 0.305, CW * 3, 7);
  g.fillRect(-CW, CH * 0.650, CW * 3, 7);
  g.restore();

  /* ---- twin arc "energy" motif ---- */
  g.lineCap = 'round';
  // radii key off CH so the arcs stay circular after unwrapping
  const arcR = CH * 0.46;
  const arcs = [
    { cx: CW * 0.30, cy: CH * 0.49, r: arcR,       a0: 2.55, a1: 5.55, w: 26, col: '#FFC700' },
    { cx: CW * 0.70, cy: CH * 0.49, r: arcR,       a0: 3.87, a1: 0.73, w: 26, col: '#FFC700' },
    { cx: CW * 0.30, cy: CH * 0.49, r: arcR * 1.15, a0: 2.70, a1: 5.40, w: 9,  col: 'rgba(255,255,255,.5)' },
    { cx: CW * 0.70, cy: CH * 0.49, r: arcR * 1.15, a0: 4.02, a1: 0.72, w: 9,  col: 'rgba(255,255,255,.5)' },
  ];
  arcs.forEach(a => {
    g.beginPath();
    g.strokeStyle = a.col;
    g.lineWidth = a.w;
    g.arc(a.cx, a.cy, a.r, a.a0, a.a1);
    g.stroke();
  });

  /* ---- wordmark ---- */
  g.textAlign = 'center';
  g.textBaseline = 'middle';

  const drawWord = (txt, y, size, fill, skew = 0.12) => {
    g.save();
    g.translate(CW / 2, y);
    g.transform(1, 0, -skew, 1, 0, 0);
    g.font = `900 ${size}px Anton, Impact, "Arial Black", sans-serif`;
    // soft drop shadow
    g.fillStyle = 'rgba(0,0,0,.35)';
    g.fillText(txt, 6, 10);
    g.fillStyle = fill;
    g.fillText(txt, 0, 0);
    g.restore();
  };

  drawWord('RED',  CH * 0.185, 300, '#ffffff');
  drawWord('BULL', CH * 0.445, 300, '#ffffff');

  /* divider under wordmark */
  g.fillStyle = '#FFC700';
  roundRect(g, CW / 2 - 210, CH * 0.585, 420, 10, 5);
  g.fill();

  /* tagline — manual tracking (ctx.letterSpacing isn't universally supported) */
  g.fillStyle = 'rgba(255,255,255,.86)';
  g.font = '800 62px Inter, sans-serif';
  g.textAlign = 'left';
  const tagline = 'ENERGY DRINK';
  const track = 20;
  const widths = [...tagline].map(ch => g.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + track * (tagline.length - 1);
  let tx = CW / 2 - total / 2;
  [...tagline].forEach((ch, i) => {
    g.fillText(ch, tx, CH * 0.645);
    tx += widths[i] + track;
  });
  g.textAlign = 'center';

  /* nutrition-ish micro text strip */
  g.fillStyle = 'rgba(255,255,255,.5)';
  g.font = '600 34px Inter, sans-serif';
  g.fillText('VITALIZES BODY & MIND', CW / 2, CH * 0.735);

  /* bottom info block */
  g.fillStyle = 'rgba(0,0,0,.22)';
  g.fillRect(0, CH * 0.80, CW, CH * 0.20);

  g.fillStyle = 'rgba(255,255,255,.92)';
  g.font = '900 62px Anton, sans-serif';
  g.textAlign = 'left';
  g.fillText('250 ml', 150, CH * 0.875);

  g.textAlign = 'right';
  g.font = '700 40px Inter, sans-serif';
  g.fillStyle = '#FFC700';
  g.fillText('CAFFEINE • TAURINE • B-COMPLEX', CW - 150, CH * 0.875);

  /* thin silver rings top/bottom of label */
  g.fillStyle = 'rgba(210,218,228,.35)';
  g.fillRect(0, CH * 0.055, CW, 6);
  g.fillRect(0, CH * 0.795, CW, 6);

  return c;
}

/* ============================================================
   2. HD METAL MAP for top/bottom caps
   ============================================================ */
function makeMetalCanvas() {
  const s = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');

  const rg = g.createRadialGradient(s / 2, s / 2, s * 0.05, s / 2, s / 2, s / 2);
  rg.addColorStop(0,    '#f2f5f8');
  rg.addColorStop(0.45, '#c8cfd6');
  rg.addColorStop(0.78, '#9aa2ab');
  rg.addColorStop(0.93, '#6f777f');
  rg.addColorStop(1,    '#4a5057');
  g.fillStyle = rg;
  g.fillRect(0, 0, s, s);

  /* concentric machined grooves */
  for (let r = s * 0.06; r < s * 0.49; r += 8) {
    g.beginPath();
    g.arc(s / 2, s / 2, r, 0, Math.PI * 2);
    g.strokeStyle = `rgba(${r % 16 ? '0,0,0' : '255,255,255'},.055)`;
    g.lineWidth = 2;
    g.stroke();
  }

  /* brushed highlight sweep */
  const sweep = g.createLinearGradient(0, 0, s, s);
  sweep.addColorStop(0,   'rgba(255,255,255,0)');
  sweep.addColorStop(0.42,'rgba(255,255,255,.30)');
  sweep.addColorStop(0.55,'rgba(255,255,255,0)');
  g.fillStyle = sweep;
  g.fillRect(0, 0, s, s);

  return c;
}

/* ============================================================
   3. THREE.JS SCENE BUILDER
   ============================================================ */
const CAN_R = 1;
const CAN_H = 3.55;
const SHOULDER = 0.30;

function buildCanGeometry() {
  // Lathe profile: rounded top shoulder, straight body, rounded bottom
  const pts = [];
  const seg = 24;

  // bottom fillet (from center-ish edge outward-up)
  pts.push(new THREE.Vector2(0.0001, -CAN_H / 2));
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const a = -Math.PI / 2 + t * (Math.PI / 2);
    pts.push(new THREE.Vector2(
      (CAN_R - 0.11) + Math.cos(a) * 0.11,
      -CAN_H / 2 + 0.11 + Math.sin(a) * 0.11
    ));
  }
  // straight body
  pts.push(new THREE.Vector2(CAN_R, -CAN_H / 2 + 0.12));
  pts.push(new THREE.Vector2(CAN_R, CAN_H / 2 - SHOULDER - 0.30));
  // shoulder curve into neck
  for (let i = 1; i <= seg; i++) {
    const t = i / seg;
    const a = t * (Math.PI / 2);
    pts.push(new THREE.Vector2(
      (CAN_R - 0.18) + Math.cos(a) * 0.18,
      CAN_H / 2 - SHOULDER - 0.30 + Math.sin(a) * 0.30
    ));
  }
  // short neck
  pts.push(new THREE.Vector2(CAN_R - 0.18, CAN_H / 2 - 0.04));
  // top lip
  pts.push(new THREE.Vector2(0.0001, CAN_H / 2 - 0.04));

  return new THREE.LatheGeometry(pts, 96);
}

function buildTopCap() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, CAN_R - 0.185, 0, Math.PI * 2, false);
  return new THREE.ShapeGeometry(shape, 72);
}

function buildPullTab() {
  const grp = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xdfe4ea, metalness: 1, roughness: 0.22, clearcoat: 0.6,
  });
  // rivet
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.03, 24), mat);
  rivet.position.y = 0.016;
  grp.add(rivet);
  // tab plate (extruded rounded shape)
  const s = new THREE.Shape();
  s.absarc(0, 0, 0.30, Math.PI * 0.18, Math.PI * 0.82, true);
  s.lineTo(0.10, 0.0);
  s.lineTo(-0.10, 0.0);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.022, bevelEnabled: true, bevelThickness: 0.008,
    bevelSize: 0.008, bevelSegments: 3, curveSegments: 32,
  });
  geo.rotateX(-Math.PI / 2);
  const plate = new THREE.Mesh(geo, mat);
  plate.position.set(0, 0.026, 0.02);
  plate.position.z = 0.18;
  grp.add(plate);
  // slot hole (dark)
  const slot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.026, 20),
    new THREE.MeshStandardMaterial({ color: 0x0a0c0f, metalness: 0.4, roughness: 0.7 })
  );
  slot.position.set(0, 0.032, 0.30);
  grp.add(slot);
  return grp;
}

function buildCanMesh(envMap) {
  const group = new THREE.Group();

  const labelTex = new THREE.CanvasTexture(makeLabelCanvas());
  labelTex.colorSpace = THREE.SRGBColorSpace;
  labelTex.anisotropy = 16;
  labelTex.wrapS = THREE.RepeatWrapping;

  const bodyMat = new THREE.MeshPhysicalMaterial({
    map: labelTex,
    metalness: 0.32,
    roughness: 0.30,
    clearcoat: 1.0,
    clearcoatRoughness: 0.10,
    envMap,
    envMapIntensity: 1.25,
    side: THREE.FrontSide,
  });

  const body = new THREE.Mesh(buildCanGeometry(), bodyMat);
  group.add(body);

  const metalTex = new THREE.CanvasTexture(makeMetalCanvas());
  metalTex.colorSpace = THREE.SRGBColorSpace;
  metalTex.anisotropy = 16;

  const capMat = new THREE.MeshPhysicalMaterial({
    map: metalTex,
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.24,
    envMap,
    envMapIntensity: 1.4,
  });

  const cap = new THREE.Mesh(buildTopCap(), capMat);
  cap.rotation.x = -Math.PI / 2;
  cap.position.y = CAN_H / 2 - 0.045;
  group.add(cap);

  const tab = buildPullTab();
  tab.position.y = CAN_H / 2 - 0.035;
  group.add(tab);

  return group;
}

/* ============================================================
   4. RENDERER (shared helpers)
   ============================================================ */
function createStage(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  /* studio env for reflections */
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  const envMap = envRT.texture;
  scene.environment = envMap;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.15, 12.5);

  /* key light (warm), fill (cool), rim (red) */
  const key = new THREE.DirectionalLight(0xfff4e6, 3.2);
  key.position.set(4, 6, 6);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x9ec3ff, 1.1);
  fill.position.set(-6, 1, 4);
  scene.add(fill);

  const rim = new THREE.SpotLight(0xff2149, 42, 30, Math.PI / 5, 0.6, 1.6);
  rim.position.set(-3, 5, -7);
  scene.add(rim);

  const rim2 = new THREE.PointLight(0xffc700, 22, 20, 2);
  rim2.position.set(3.5, -2.5, -4);
  scene.add(rim2);

  const can = buildCanMesh(envMap);
  scene.add(can);

  /* ---- sizing: frame the whole can regardless of aspect ---- */
  const CAN_TOP = CAN_H / 2 + 0.07;      // includes tab sticking up
  const CAN_BOTTOM = -CAN_H / 2 - 0.07;
  const CAN_HALF_W = CAN_R + 0.06;
  const TARGET_Y = 0.0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // vertical fit
    const halfH = (CAN_TOP - CAN_BOTTOM) / 2 * 1.06;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const zV = halfH / Math.tan(vFov / 2);

    // horizontal fit
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const zH = CAN_HALF_W / Math.tan(hFov / 2);

    camera.position.set(0, TARGET_Y, Math.max(zV, zH));
    camera.lookAt(0, TARGET_Y, 0);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return { renderer, scene, camera, can, envRT };
}

/* ============================================================
   5. HERO CAN — scroll spin + mouse tilt
   ============================================================ */
const heroCanvas = document.getElementById('gl');
const fallback = document.getElementById('fallback');
let hero = null;

try {
  hero = createStage(heroCanvas);
  hero.can.scale.setScalar(0.98);
  heroCanvas.classList.add('ready');
} catch (err) {
  console.warn('WebGL tidak tersedia:', err);
  heroCanvas.style.display = 'none';
  fallback.hidden = false;
}

/* if browser has no WebGL at all */
function webglSupported() {
  try {
    const t = document.createElement('canvas');
    return !!(t.getContext('webgl2') || t.getContext('webgl'));
  } catch { return false; }
}
if (!webglSupported()) {
  if (heroCanvas) heroCanvas.style.display = 'none';
  fallback.hidden = false;
}

let scrollSpin = 0, smoothSpin = 0;
let mouseX = 0, mouseY = 0, smoothMX = 0, smoothMY = 0;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX / window.innerWidth - 0.5;
  mouseY = e.clientY / window.innerHeight - 0.5;
}, { passive: true });

function updateScrollSpin() {
  const heroSec = document.querySelector('.hero');
  const rect = heroSec.getBoundingClientRect();
  const p = Math.min(Math.max(-rect.top / (rect.height * 1.05), 0), 1);
  scrollSpin = p * Math.PI * 4;          // 720°
  heroCanvas.style.opacity = String(1 - p * 0.9);
}

window.addEventListener('scroll', updateScrollSpin, { passive: true });
updateScrollSpin();

const clock = new THREE.Clock();

function heroLoop() {
  requestAnimationFrame(heroLoop);
  if (!hero) return;

  const t = clock.getElapsedTime();

  smoothSpin += (scrollSpin - smoothSpin) * 0.075;
  smoothMX += (mouseX - smoothMX) * 0.06;
  smoothMY += (mouseY - smoothMY) * 0.06;

  // rotation: scroll spin + slow idle drift
  hero.can.rotation.y = smoothSpin + Math.sin(t * 0.42) * 0.21;
  hero.can.rotation.x = -smoothMY * 0.26;
  hero.can.rotation.z = Math.sin(t * 0.55) * 0.03 - smoothMX * 0.10;

  // floating
  hero.can.position.y = Math.sin(t * 0.9) * 0.10;

  hero.renderer.render(hero.scene, hero.camera);
}
if (hero) heroLoop();

/* ============================================================
   6. SHOWCASE CAN (autonomous rotation)
   ============================================================ */
const showcaseCanvas = document.getElementById('gl2');
let showcase = null;
try {
  showcase = createStage(showcaseCanvas);
  showcaseCanvas.classList.add('ready');
} catch (err) {
  console.warn('WebGL showcase gagal:', err);
  showcaseCanvas.style.display = 'none';
}

function showcaseLoop() {
  requestAnimationFrame(showcaseLoop);
  if (!showcase) return;
  const t = clock.getElapsedTime();
  showcase.can.rotation.y = t * 0.55;
  showcase.can.rotation.x = Math.sin(t * 0.6) * 0.14;
  showcase.can.position.y = Math.sin(t * 1.1) * 0.12;
  showcase.renderer.render(showcase.scene, showcase.camera);
}
if (showcase) showcaseLoop();

/* pause rendering when tab is hidden (saves battery) */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clock.stop(); else clock.start();
});

/* ============================================================
   7. UI: MARQUEES, PROGRESS, GLOW, REVEALS, COUNTERS, METERS
   ============================================================ */
const words = ['GIVES YOU WINGS', 'ENERGY', 'FOKUS', 'TAURIN', 'ADRENALIN', 'VITALIZES BODY & MIND', 'KAFEIN', 'TANPA KOMPROMI'];
function fillMarquee(el, arr) {
  let html = '';
  for (let r = 0; r < 2; r++) {
    arr.forEach(w => { html += '<span>' + w + '<i class="sep">◆</i></span>'; });
  }
  el.innerHTML = html;
}
fillMarquee(document.getElementById('track1'), words);
fillMarquee(document.getElementById('track2'), words.slice().reverse());

const progress = document.getElementById('progress');
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* cursor glow */
const glow = document.getElementById('glow');
let gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy;
addEventListener('mousemove', e => { gx = e.clientX; gy = e.clientY; }, { passive: true });
(function follow() {
  cx += (gx - cx) * 0.09;
  cy += (gy - cy) * 0.09;
  glow.style.left = cx + 'px';
  glow.style.top = cy + 'px';
  requestAnimationFrame(follow);
})();

/* reveals */
const io = new IntersectionObserver(entries => {
  entries.forEach((en, i) => {
    if (en.isIntersecting) {
      setTimeout(() => en.target.classList.add('in'), i * 80);
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.16, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* counters */
const cio = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const end = parseInt(el.dataset.count, 10);
    if (end === 0) { el.textContent = '0'; cio.unobserve(el); return; }
    const dur = 1500, t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased).toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    cio.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

/* meters */
const meter = document.getElementById('meter');
if (meter) {
  const mio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { meter.classList.add('in-view'); mio.unobserve(meter); }
    });
  }, { threshold: 0.35 });
  mio.observe(meter);
}

/* ============================================================
   8. LOADER
   ============================================================ */
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
const pct = document.getElementById('pct');
let loadP = 0;
const loadTimer = setInterval(() => {
  loadP = Math.min(100, loadP + Math.random() * 17 + 6);
  loaderFill.style.height = loadP + '%';
  pct.textContent = String(Math.round(loadP));
  if (loadP >= 100) {
    clearInterval(loadTimer);
    setTimeout(() => loader.classList.add('done'), 260);
  }
}, 110);
