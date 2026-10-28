// 3Dデモ。microCMS に .glb がアップロードされていればそれを表示し、
// なければ用意してある試作モデル（器・センサー・ワゴン）を表示する。
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type DemoItem = { id: string; preset: "bowl" | "sensor" | "cart" | null; modelUrl: string | null };
type Std = (c: number, r?: number, m?: number) => THREE.Material;

function bowl(gold: THREE.Material, std: Std) {
  const g = new THREE.Group();
  const prof = (t: number) => 0.38 + 0.82 * Math.pow(Math.sin((t * Math.PI) / 2), 0.8);
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector2(prof(t), t * 0.95)); }
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 96), std(0x6a1616, 0.3, 0.1)));
  const inner = new THREE.Mesh(new THREE.CircleGeometry(0.38, 48), std(0x3a0c0c, 0.4));
  inner.rotation.x = -Math.PI / 2; inner.position.y = 0.002; g.add(inner);
  const seam = (a0: number, amp: number, f: number) => {
    const cp: THREE.Vector3[] = [];
    for (let i = 0; i <= 30; i++) {
      const t = 1 - i / 30, a = a0 + amp * Math.sin(t * f) + 0.15 * Math.sin(t * 23), r = prof(t) + 0.012;
      cp.push(new THREE.Vector3(Math.cos(a) * r, t * 0.95, Math.sin(a) * r));
    }
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cp), 120, 0.018, 8), gold);
  };
  g.add(seam(0.4, 0.35, 7), seam(2.6, 0.25, 5));
  g.position.y = -0.45;
  return g;
}

function sensor(gold: THREE.Material, std: Std) {
  const g = new THREE.Group(), metal = std(0xb4bccb, 0.35, 0.6);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 16), metal); pole.position.y = -0.1; g.add(pole);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.3), std(0xf2f2ee, 0.6)); box.position.y = 0.1; g.add(box);
  for (let i = 0; i < 5; i++) {
    const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.2 - 0.012 * i, 0.2 - 0.012 * i, 0.025, 24), std(0xe8e8e2, 0.6));
    fin.position.y = -0.25 - 0.07 * i; g.add(fin);
  }
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.45), std(0x0e1640, 0.25, 0.3));
  panel.position.set(0, 0.42, 0.05); panel.rotation.x = -0.5; g.add(panel);
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.41, 6, 4), new THREE.MeshBasicMaterial({ color: 0xf2c21b, wireframe: true }));
  grid.rotation.x = -Math.PI / 2; grid.position.y = 0.012; panel.add(grid);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 12), metal); hub.position.y = 0.6; g.add(hub);
  const rot = new THREE.Group(); rot.position.y = 0.72;
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), metal);
    arm.rotation.z = Math.PI / 2; arm.rotation.y = a; arm.position.set(Math.cos(a) * 0.15, 0, -Math.sin(a) * 0.15); rot.add(arm);
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12, 0, Math.PI), gold);
    cup.position.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); cup.rotation.y = a; rot.add(cup);
  }
  g.add(rot); g.userData.spin = rot; g.position.y = -0.05;
  return g;
}

function cart(gold: THREE.Material, std: Std) {
  const g = new THREE.Group(), frame = std(0xd9dce4, 0.4, 0.5);
  for (const [x, z] of [[-0.75, -0.4], [0.75, -0.4], [-0.75, 0.4], [0.75, 0.4]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.05), frame); leg.position.set(x, 0, z); g.add(leg);
    const wh = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.03, 10, 20), std(0x222222, 0.8)); wh.position.set(x, -0.62, z); g.add(wh);
  }
  [-0.4, 0.05, 0.52].forEach((y, i) => { const sh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.88), std(i === 2 ? 0xb07a45 : 0xd8c7a8, 0.7)); sh.position.y = y; g.add(sh); });
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.4), std(0xe2c28c, 0.6)); board.position.set(-0.35, 0.57, 0); g.add(board);
  [0xc9583a, 0xe59a5b, 0x2f6b5e].forEach((c, i) => {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 20), std(c, 0.4)); jar.position.set(0.25 + i * 0.2, 0.65, -0.15); g.add(jar);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.03, 20), gold); lid.position.set(0.25 + i * 0.2, 0.765, -0.15); g.add(lid);
  });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.2, 24, 1, true), std(0xb4bccb, 0.3, 0.7)); pot.position.set(0.3, 0.2, 0.05); g.add(pot);
  g.scale.setScalar(0.85); g.position.y = 0.05;
  return g;
}

// 読み込んだモデルの大きさと位置をそろえる
function fitModel(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const s = 1.8 / Math.max(size.x, size.y, size.z || 1);
  obj.scale.multiplyScalar(s);
  obj.position.sub(center.multiplyScalar(s));
  obj.position.y += (size.y * s) / 2 - 0.65;
  const g = new THREE.Group(); g.add(obj); return g;
}

export function initDemo(canvas: HTMLCanvasElement, items: DemoItem[], ui: { status: HTMLElement; auto: HTMLButtonElement; wire: HTMLButtonElement }) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch { ui.status.hidden = false; ui.status.textContent = "このブラウザでは3D表示が使えません。"; return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 4 / 3, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xfff6dd, 0x2a3470, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xf2c21b, 1.4); rim.position.set(-4, 2, -3); scene.add(rim);
  const gold = new THREE.MeshStandardMaterial({ color: 0xe2ad3c, metalness: 1, roughness: 0.26 });
  const std: Std = (c, r = 0.5, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, side: THREE.DoubleSide });
  const builders = { bowl, sensor, cart };
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.07, 96), new THREE.MeshBasicMaterial({ color: 0xf2c21b, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -0.66; scene.add(ring);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.665; scene.add(shadow);
  const holder = new THREE.Group(); scene.add(holder);
  const cache = new Map<string, THREE.Group>();
  const loader = new GLTFLoader();
  let rotY = 0.6, rotX = 0.32, vY = 0, dist = 4.9, auto = !reduce, wire = false, token = 0;
  let drag: { x: number; y: number } | null = null;
  ui.auto.setAttribute("aria-pressed", String(auto));

  const applyWire = () => holder.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (!m) return;
    (Array.isArray(m) ? m : [m]).forEach((x) => { if (x.type !== "MeshBasicMaterial") (x as THREE.MeshStandardMaterial).wireframe = wire; });
  });

  async function show(i: number) {
    const it = items[i]; if (!it) return;
    const my = ++token;
    holder.clear();
    let g = cache.get(it.id);
    if (!g) {
      if (it.modelUrl) {
        ui.status.hidden = false; ui.status.textContent = "モデルを読み込んでいます";
        try { g = fitModel((await loader.loadAsync(it.modelUrl)).scene); }
        catch { if (my === token) ui.status.textContent = "モデルを読み込めませんでした。ファイルが .glb 形式か確かめてください。"; return; }
      } else g = builders[it.preset ?? "bowl"](gold, std);
      cache.set(it.id, g);
    }
    if (my !== token) return;
    ui.status.hidden = true;
    holder.add(g); applyWire();
  }
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas); resize();
  canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
    vY = dx * 0.008; rotY += vY; rotX = Math.max(-0.2, Math.min(1.1, rotX + dy * 0.006));
  });
  const end = () => (drag = null);
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("wheel", (e) => { e.preventDefault(); dist = Math.max(2.8, Math.min(8, dist + e.deltaY * 0.004)); }, { passive: false });
  ui.auto.addEventListener("click", () => { auto = !auto; ui.auto.setAttribute("aria-pressed", String(auto)); });
  ui.wire.addEventListener("click", () => { wire = !wire; ui.wire.setAttribute("aria-pressed", String(wire)); applyWire(); });

  // 画面に見えているあいだだけ描く
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  const loop = () => {
    if (visible) {
      if (!drag) { vY *= 0.94; rotY += vY + (auto ? 0.004 : 0); }
      cam.position.set(Math.sin(rotY) * Math.cos(rotX) * dist, Math.sin(rotX) * dist + 0.1, Math.cos(rotY) * Math.cos(rotX) * dist);
      cam.lookAt(0, -0.05, 0);
      holder.traverse((o) => { if (o.userData.spin && !reduce) (o.userData.spin as THREE.Object3D).rotation.y += 0.05; });
      renderer.render(scene, cam);
    }
    requestAnimationFrame(loop);
  };
  loop();
  void show(0);
  return { show };
}
