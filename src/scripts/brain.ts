// トップの脳の図。神経網が左から描かれ、部位を押すと各ページへ、光る点（メンバー）を押すとメンバーへ移動する。
export type BrainLobe = { key: string; ja: string; label: string; href: string };
export type BrainMember = { id: string; name: string; project: string; color: string; href: string };

const C = { washi: "#E9ECE6", ai: "#18235E", ai2: "#4F5888", kihada: "#F2C21B" };
const FONT = '"Zen Old Mincho","Hiragino Mincho ProN","Yu Mincho",serif';
// 部位のラベル位置（脳の座標系）
const LABEL: Record<string, [number, number, number]> = {
  frontal: [-0.6, -0.6, 0.078], parietal: [0.14, -0.76, 0.078], occipital: [0.84, -0.26, 0.078],
  hippo: [0.2, 0.07, 0.06], temporal: [-0.22, 0.4, 0.078], cerebellum: [0.66, 0.5, 0.072], stem: [0.33, 0.86, 0.058],
};

const inCer = (x: number, y: number) => x * x + ((y + 0.05) / 0.7) ** 2 < 1 && y < 0.42;
const inTemp = (x: number, y: number) => ((x + 0.15) / 0.62) ** 2 + ((y - 0.28) / 0.3) ** 2 < 1;
const inCbl = (x: number, y: number) => ((x - 0.6) / 0.32) ** 2 + ((y - 0.5) / 0.2) ** 2 < 1;
const inStem = (x: number, y: number) => y > 0.4 && y < 0.95 && x > 0.2 + (y - 0.4) * 0.15 && x < 0.38 + (y - 0.4) * 0.1;
const inside = (x: number, y: number) => inCer(x, y) || inTemp(x, y) || inCbl(x, y) || inStem(x, y);
function lobeOf(x: number, y: number) {
  if (!inCer(x, y) && !inTemp(x, y)) return inStem(x, y) && !inCbl(x, y) ? "stem" : "cerebellum";
  if (((x - 0.15) / 0.2) ** 2 + ((y - 0.2) / 0.08) ** 2 < 1) return "hippo";
  if (y > 0.1 && x < 0.42) return "temporal";
  if (x < -0.3) return "frontal";
  if (x > 0.48) return "occipital";
  return "parietal";
}
const al = (c: string, a: number) => c + Math.round(a * 255).toString(16).padStart(2, "0");

// メンバーの点を前頭葉に、重ならないように決まった順で置く
function placeMembers(n: number): [number, number][] {
  const pts: [number, number][] = [];
  let s = 4242;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let minD = 0.17;
  for (let tries = 1; pts.length < n && tries < 40000; tries++) {
    if (tries % 2500 === 0) minD *= 0.85;
    const x = -0.98 + r() * 0.72, y = -0.58 + r() * 0.74;
    if (!inside(x, y) || lobeOf(x, y) !== "frontal") continue;
    if (Math.hypot(x + 0.6, y + 0.6) < 0.16) continue; // ラベルを避ける
    if (pts.every(([px, py]) => Math.hypot(px - x, py - y) > minD)) pts.push([x, y]);
  }
  return pts;
}

export function initBrain(cv: HTMLCanvasElement, tip: HTMLElement, lobes: BrainLobe[], members: BrainMember[]) {
  const ctx = cv.getContext("2d")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cur = document.getElementById("cur");
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const P: { x: number; y: number; l: string; ph: number }[] = [];
  while (P.length < 660) { const x = rnd() * 2.1 - 1.05, y = rnd() * 1.85 - 0.8; if (inside(x, y)) P.push({ x, y, l: lobeOf(x, y), ph: rnd() * 6.28 }); }
  const E: { a: number; b: number; o: number }[] = [];
  P.forEach((p, i) => {
    P.map((q, j) => [j, (p.x - q.x) ** 2 + (p.y - q.y) ** 2] as const)
      .filter(([j, d]) => j !== i && d < 0.013).sort((a, b) => a[1] - b[1]).slice(0, 3)
      .forEach(([j]) => { if (i < j) E.push({ a: i, b: j, o: (Math.min(p.x, P[j].x) + 1.05) / 2.1 }); });
  });
  const adj = new Map<number, number[]>();
  E.forEach((e) => { adj.set(e.a, [...(adj.get(e.a) ?? []), e.b]); adj.set(e.b, [...(adj.get(e.b) ?? []), e.a]); });
  const pos = placeMembers(members.length);
  const M = members.map((m, i) => ({ ...m, x: pos[i]?.[0] ?? -0.7, y: pos[i]?.[1] ?? -0.2 }));
  const signals: { a: number; b: number; t: number; v: number }[] = [];
  let hover: string | null = null, hoverMember: string | null = null;
  let W = 0, H = 0, S = 1, CX = 0, CY = 0, dpr = 1;
  const t0 = performance.now();
  const tx = (x: number) => CX + x * S, ty = (y: number) => CY + y * S;

  function draw(t: number) {
    const prog = reduce ? 1 : Math.min(1, (t - t0) / 1700), ease = 1 - Math.pow(1 - prog, 3);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.lineWidth = 0.7;
    for (const e of E) {
      if (e.o > ease * 1.05) continue;
      const a = P[e.a], b = P[e.b], hl = hover && (a.l === hover || b.l === hover);
      ctx.strokeStyle = hl ? al(C.ai, 0.55) : al(C.ai, 0.16);
      ctx.beginPath(); ctx.moveTo(tx(a.x), ty(a.y)); ctx.lineTo(tx(b.x), ty(b.y)); ctx.stroke();
    }
    for (const p of P) {
      if ((p.x + 1.05) / 2.1 > ease * 1.05) continue;
      const hl = hover === p.l, tw = reduce ? 0.7 : 0.55 + 0.45 * Math.sin(t / 900 + p.ph);
      ctx.fillStyle = hl ? C.ai : al(C.ai, 0.25 + 0.35 * tw);
      ctx.beginPath(); ctx.arc(tx(p.x), ty(p.y), hl ? 2.4 : 1.6, 0, 6.29); ctx.fill();
      if (hl && tw > 0.92) { ctx.fillStyle = C.kihada; ctx.beginPath(); ctx.arc(tx(p.x), ty(p.y), 3.4, 0, 6.29); ctx.fill(); }
    }
    for (const s of signals) {
      const a = P[s.a], b = P[s.b];
      ctx.fillStyle = C.kihada; ctx.strokeStyle = C.ai; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(tx(a.x + (b.x - a.x) * s.t), ty(a.y + (b.y - a.y) * s.t), 2.6, 0, 6.29); ctx.fill(); ctx.stroke();
    }
    if (ease > 0.6) {
      ctx.globalAlpha = Math.min(1, (ease - 0.6) / 0.4); ctx.textAlign = "center";
      for (const L of lobes) {
        const [lx, ly, size] = LABEL[L.key] ?? [0, 0, 0.07];
        const on = hover === L.key, fs = Math.max(12, S * size);
        ctx.font = `900 ${fs}px ${FONT}`;
        if (on) { const w = ctx.measureText(L.ja).width; ctx.fillStyle = C.kihada; ctx.fillRect(tx(lx) - w / 2 - 8, ty(ly) - fs * 0.92, w + 16, fs * 1.22); }
        ctx.fillStyle = C.ai; ctx.fillText(L.ja, tx(lx), ty(ly));
        ctx.font = `700 ${Math.max(11, S * 0.048)}px ${FONT}`; ctx.fillStyle = on ? C.ai : C.ai2;
        ctx.fillText(L.label, tx(lx), ty(ly) + Math.max(15, S * 0.074));
      }
      M.forEach((m, k) => {
        const x = tx(m.x), y = ty(m.y), on = hoverMember === m.id, pulse = reduce ? 0 : Math.sin(t / 650 + k) * 1.6;
        ctx.fillStyle = al(m.color, 0.22); ctx.beginPath(); ctx.arc(x, y, (on ? 16 : 11) + pulse, 0, 6.29); ctx.fill();
        ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(x, y, on ? 7 : 5.5, 0, 6.29); ctx.fill();
        ctx.strokeStyle = C.washi; ctx.lineWidth = 2; ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
  }

  let visible = true;
  function step(t: number) {
    if (visible) {
      if (t - t0 > 1700 && Math.random() < (hover ? 0.55 : 0.2) && signals.length < 46) {
        const pool = hover ? E.filter((e) => P[e.a].l === hover) : E;
        const e = pool[(Math.random() * pool.length) | 0];
        if (e) { const f = Math.random() < 0.5; signals.push({ a: f ? e.a : e.b, b: f ? e.b : e.a, t: 0, v: 0.018 + Math.random() * 0.03 }); }
      }
      for (let i = signals.length - 1; i >= 0; i--) {
        const s = signals[i]; s.t += s.v;
        if (s.t >= 1) {
          const nx = adj.get(s.b) ?? [];
          if (Math.random() < 0.72 && nx.length) { const n = nx[(Math.random() * nx.length) | 0]; s.a = s.b; s.b = n; s.t = 0; }
          else signals.splice(i, 1);
        }
      }
      draw(t);
    }
    requestAnimationFrame(step);
  }
  function size() {
    const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    const narrow = W < 760;
    S = narrow ? Math.min(W / 2.3, H / 2.05) : Math.min(W / 3.6, H / 2.15);
    CX = narrow ? W * 0.52 : W * 0.7; CY = narrow ? H * 0.48 : H * 0.44;
    if (reduce) draw(performance.now());
  }
  function pick(ev: MouseEvent) {
    const r = cv.getBoundingClientRect(), px = ev.clientX - r.left, py = ev.clientY - r.top, x = (px - CX) / S, y = (py - CY) / S;
    const m = M.find((m) => Math.hypot(m.x - x, m.y - y) < 0.065) ?? null;
    return { m, l: m ? null : inside(x, y) ? lobeOf(x, y) : null, px, py };
  }
  function setHover(l: string | null, m: (typeof M)[number] | null, px = 0, py = 0) {
    hover = l || (m ? "frontal" : null); hoverMember = m ? m.id : null;
    if (m) {
      tip.hidden = false; tip.style.left = px + "px"; tip.style.top = py + "px";
      tip.replaceChildren(Object.assign(document.createElement("b"), { textContent: m.name }), `　${m.project}`);
    } else tip.hidden = true;
    cv.style.cursor = l || m ? "pointer" : "default";
    cur?.classList.toggle("big", !!(l || m));
    if (reduce) draw(performance.now());
  }
  cv.addEventListener("pointermove", (e) => { const r = pick(e); setHover(r.l, r.m, r.px, r.py); });
  cv.addEventListener("pointerleave", () => setHover(null, null));
  cv.addEventListener("click", (e) => {
    const r = pick(e);
    const href = r.m ? r.m.href : r.l ? lobes.find((L) => L.key === r.l)?.href : null;
    if (href) location.href = href;
  });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);
  new ResizeObserver(size).observe(cv);
  size();
  document.fonts?.ready.then(() => draw(performance.now()));
  if (!reduce) requestAnimationFrame(step); else draw(performance.now());
}
