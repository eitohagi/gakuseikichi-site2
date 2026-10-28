// キャンバスに描く絵：メンバーのモザイク肖像と、和柄（青海波・市松・絣・縞）。
// <canvas data-art="mosaic|pattern" data-pal='["#..","#..","#.."]' data-seed="1" data-kind="0" data-photo="..."> を探して描く。

const C = { washi: "#E9ECE6", paper: "#F5F6F2", rule: "#C3C8D3", kihada: "#F2C21B" };
type Pal = [string, string, string];

function rng(seed: number) {
  let s = (seed * 7919 + 3) % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function fit(c: HTMLCanvasElement): [CanvasRenderingContext2D, number, number] | null {
  const r = c.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  const d = Math.min(devicePixelRatio || 1, 2);
  c.width = Math.round(r.width * d);
  c.height = Math.round(r.height * d);
  const g = c.getContext("2d")!;
  g.setTransform(d, 0, 0, d, 0, 0);
  return [g, r.width, r.height];
}

export function drawPattern(c: HTMLCanvasElement, pal: Pal, kind: number, seed = 1) {
  const f = fit(c); if (!f) return;
  const [g, w, h] = f; const r = rng(seed);
  g.fillStyle = pal[2]; g.fillRect(0, 0, w, h);
  if (kind === 0) { // 青海波
    const R = Math.max(w, h) / 7; g.lineWidth = Math.max(1, R / 16);
    for (let row = 0, y = -R; y < h + R; y += R / 2, row++) {
      for (let x = (row % 2 ? R : 0) - R; x < w + R; x += R * 2) {
        for (let k = 0; k < 4; k++) {
          g.beginPath(); g.arc(x, y, R * (1 - k * 0.24), Math.PI, 0); g.closePath();
          g.fillStyle = k % 2 ? pal[1] : pal[0]; g.fill(); g.strokeStyle = pal[2]; g.stroke();
        }
      }
    }
  } else if (kind === 1) { // 市松
    const z = Math.max(w, h) / 8;
    for (let y = 0; y < h; y += z) for (let x = 0; x < w; x += z) {
      g.fillStyle = (Math.round(x / z) + Math.round(y / z)) % 2 ? pal[0] : pal[1]; g.fillRect(x, y, z + 0.5, z + 0.5);
    }
    g.fillStyle = pal[2]; g.globalAlpha = 0.3;
    for (let y = 0; y < h; y += z) for (let x = 0; x < w; x += z) if (r() < 0.12) g.fillRect(x, y, z + 0.5, z + 0.5);
    g.globalAlpha = 1;
  } else if (kind === 2) { // 絣
    g.fillStyle = pal[0]; g.fillRect(0, 0, w, h);
    const z = Math.max(w, h) / 11; g.fillStyle = pal[2];
    for (let y = z / 2, row = 0; y < h + z; y += z, row++) for (let x = (row % 2 ? z / 2 : 0) + z / 2; x < w + z; x += z) {
      const j = (r() - 0.5) * z * 0.15, len = z * (0.32 + r() * 0.12);
      g.fillRect(x - len / 2 + j, y - z * 0.06, len, z * 0.12); g.fillRect(x - z * 0.06 + j, y - len / 2, z * 0.12, len);
    }
  } else { // 縞
    let x = 0;
    while (x < w) { const sw = (0.02 + r() * 0.09) * w; g.fillStyle = pal[(r() * 3) | 0]; g.fillRect(x, 0, sw + 1, h); x += sw; }
    g.fillStyle = C.washi; g.globalAlpha = 0.5; for (let i = 0; i < 5; i++) g.fillRect(r() * w, 0, 1.5, h); g.globalAlpha = 1;
  }
}

// 写真を 16×18 のタイル色に縮める（失敗したら null）
const photoCache = new Map<string, Promise<Uint8ClampedArray | null>>();
function photoTiles(url: string): Promise<Uint8ClampedArray | null> {
  if (!photoCache.has(url)) {
    photoCache.set(url, new Promise((resolve) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.decoding = "async";
      im.onload = () => {
        try {
          const cv = document.createElement("canvas"); cv.width = 16; cv.height = 18;
          const g = cv.getContext("2d", { willReadFrequently: true })!;
          // 縦長に切り抜いて縮める
          const ar = 16 / 18, iw = im.naturalWidth, ih = im.naturalHeight;
          let sw = iw, sh = iw / ar; if (sh > ih) { sh = ih; sw = ih * ar; }
          g.drawImage(im, (iw - sw) / 2, 0, sw, sh, 0, 0, 16, 18);
          resolve(g.getImageData(0, 0, 16, 18).data);
        } catch { resolve(null); }
      };
      im.onerror = () => resolve(null);
      im.src = url;
    }));
  }
  return photoCache.get(url)!;
}

export async function drawMosaic(c: HTMLCanvasElement, pal: Pal, seed: number, photo?: string) {
  const tiles = photo ? await photoTiles(photo) : null;
  const f = fit(c); if (!f) return;
  const [g, w, h] = f; const r = rng(seed * 131 + 7);
  g.save(); g.scale(w / 96, h / 112);
  const T = 6;
  g.fillStyle = C.paper; g.fillRect(0, 0, 96, 112);
  const hr = [16 + r() * 4, 19 + r() * 4], hy = 37 + r() * 3;
  for (let ty = 0, y = 0; y < 112; y += T, ty++) for (let tx = 0, x = 0; x < 96; x += T, tx++) {
    const cx = x + T / 2, cy = y + T / 2;
    const head = ((cx - 48) / hr[0]) ** 2 + ((cy - hy) / hr[1]) ** 2 < 1;
    const neck = Math.abs(cx - 48) < 8 && cy > hy + 12 && cy < 76;
    const body = ((cx - 48) / 44) ** 2 + ((cy - 120) / 47) ** 2 < 1;
    if (head || neck || body) {
      if (tiles && ty < 18) {
        const i = (ty * 16 + tx) * 4;
        g.fillStyle = `rgb(${tiles[i]},${tiles[i + 1]},${tiles[i + 2]})`; g.globalAlpha = 1;
      } else {
        g.fillStyle = pal[head ? (r() < 0.72 ? 1 : 0) : r() < 0.6 ? 0 : 2]; g.globalAlpha = 0.72 + r() * 0.28;
      }
      g.fillRect(x + 0.5, y + 0.5, T - 1, T - 1);
    } else if (r() < 0.06) { g.fillStyle = C.rule; g.globalAlpha = 1; g.fillRect(x + 0.5, y + 0.5, T - 1, T - 1); }
    else if (r() < 0.012) { g.fillStyle = tiles ? pal[0] : C.kihada; g.globalAlpha = 1; g.fillRect(x + 0.5, y + 0.5, T - 1, T - 1); }
  }
  g.restore(); g.globalAlpha = 1;
}

function paint(c: HTMLCanvasElement) {
  const pal = JSON.parse(c.dataset.pal || "[]") as Pal;
  const seed = Number(c.dataset.seed || 1);
  if (c.dataset.art === "mosaic") void drawMosaic(c, pal, seed, c.dataset.photo || undefined);
  else drawPattern(c, pal, Number(c.dataset.kind || 0), seed);
}

const seen = new WeakMap<HTMLCanvasElement, number>();
const ro = new ResizeObserver((entries) => {
  for (const e of entries) {
    const c = e.target as HTMLCanvasElement;
    const w = Math.round(e.contentRect.width);
    if (seen.get(c) !== w) { seen.set(c, w); paint(c); }
  }
});

export function paintAll(root: ParentNode = document) {
  root.querySelectorAll<HTMLCanvasElement>("canvas[data-art]").forEach((c) => ro.observe(c));
}
