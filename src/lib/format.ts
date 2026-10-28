// 表示用の小さな関数（テストあり）

/** 2026-10-12T.. → 2026.10.12（日本時間） */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

export const yen = (v: number): string => v.toLocaleString("ja-JP");

/** 確率をことばにする */
export const pctWord = (p: number): string => (p < 40 ? "兆し" : p < 65 ? "広がる" : "定着");

/** microCMS（imgix）の画像URLに、大きさと形式の指定をつける */
export function cmsImg(url: string, w: number, opts: { h?: number; fit?: "crop" | "max"; faces?: boolean } = {}): string {
  let u: URL;
  try { u = new URL(url); } catch { return url; }
  if (!/microcms-assets\.io$/.test(u.hostname)) return url;
  u.searchParams.set("w", String(Math.round(w)));
  if (opts.h) u.searchParams.set("h", String(Math.round(opts.h)));
  if (opts.fit) u.searchParams.set("fit", opts.fit);
  if (opts.faces) u.searchParams.set("crop", "faces");
  u.searchParams.set("auto", "format");
  u.searchParams.set("q", "80");
  return u.href;
}

export const srcset = (url: string, widths: number[], ratio?: number): string =>
  widths.map((w) => `${cmsImg(url, w, ratio ? { h: w * ratio, fit: "crop" } : {})} ${w}w`).join(", ");

/** 名前の最初の語（「佐倉 ミオ」→「佐倉」） */
export const shortName = (name: string): string => name.split(/[\s・]/)[0] || name;
