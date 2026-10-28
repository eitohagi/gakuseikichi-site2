// microCMS の返り値を、サイトで使う形に整える（純粋な関数だけ。テストあり）。
// フィールドIDは docs/microcms.md の表と対応している。
import sanitizeHtml from "sanitize-html";
import { SITE_DEFAULTS, type SiteSettings } from "../../config/site";
import { ROLES, type Article, type Community, type Demo, type DemoPreset, type Forecast, type Img, type Member, type Product, type Role, type SiteData } from "./types";

type Raw = Record<string, any>;

const str = (v: unknown, max = 2000): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const first = (v: unknown): string => (Array.isArray(v) ? str(v[0]) : str(v));
export const toList = (v: unknown): string[] =>
  (Array.isArray(v) ? v.map((x) => str(x)) : str(v).split(/[,、]/)).map((s) => s.trim()).filter(Boolean);
const refId = (v: unknown): string | null =>
  v && typeof v === "object" ? str((v as Raw).id) || null : str(v) || null;

/** https のURLだけ通す（入力ミスや javascript: などを防ぐ） */
export function safeUrl(v: unknown): string | null {
  try {
    const u = new URL(str(v));
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

function img(v: unknown, alt = ""): Img | null {
  if (!v || typeof v !== "object") return null;
  const url = safeUrl((v as Raw).url);
  if (!url) return null;
  const { width, height } = v as Raw;
  return { url, width: Number(width) || undefined, height: Number(height) || undefined, alt };
}

export function forecastOf(c: Raw): Forecast | null {
  const steps = (Array.isArray(c.forecastSteps) ? c.forecastSteps : [])
    .map((s: Raw) => ({ year: Math.round(Number(s.year)), prob: Math.round(Number(s.probability)) }))
    .filter((s: { year: number; prob: number }) => s.year >= 1900 && s.year <= 2200 && Number.isFinite(s.prob))
    .map((s: { year: number; prob: number }) => ({ ...s, prob: Math.max(0, Math.min(100, s.prob)) }))
    .sort((a: { year: number }, b: { year: number }) => a.year - b.year)
    .slice(0, 4);
  const claim = str(c.forecastClaim, 200);
  if (!claim && steps.length === 0) return null;
  return { claim, steps, action: str(c.forecastAction, 300) };
}

/** 記事本文のHTMLを、安全なタグだけに絞る */
export function cleanHtml(html: unknown): string {
  return sanitizeHtml(str(html, 200_000), {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
      "blockquote", "pre", "code", "figure", "figcaption", "img", "table", "thead", "tbody", "tr", "th", "td", "iframe", "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"],
      th: ["colspan", "rowspan"], td: ["colspan", "rowspan"],
      "*": ["id"],
    },
    allowedSchemes: ["https", "mailto"],
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com", "www.instagram.com", "cdn.iframe.ly"],
    transformTags: {
      a: (_tag, attribs) => {
        const external = /^https:/.test(attribs.href ?? "");
        return { tagName: "a", attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs };
      },
      img: (_tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
      iframe: (_tag, attribs) => ({ tagName: "iframe", attribs: { ...attribs, loading: "lazy" } }),
    },
  });
}

export const roleOf = (v: unknown): Role => {
  const r = first(v);
  return (ROLES as readonly string[]).includes(r) ? (r as Role) : "メンバー";
};
/** 役職の順に並べる（同じ役職の中では元の順を保つ） */
export const byRole = <T extends { role: Role }>(list: T[]): T[] =>
  list.map((m, i) => ({ m, i })).sort((a, b) => ROLES.indexOf(a.m.role) - ROLES.indexOf(b.m.role) || a.i - b.i).map((x) => x.m);

const PRESET: Record<string, DemoPreset> = { 器: "bowl", センサー: "sensor", ワゴン: "cart" };

export type RawContent = { members: Raw[]; articles: Raw[]; communities: Raw[]; products: Raw[]; demos: Raw[] };

export function normalize(input: Partial<RawContent>): SiteData {
  const raw: RawContent = { members: [], articles: [], communities: [], products: [], demos: [], ...input };
  const members: Member[] = byRole(raw.members.filter((c) => c?.id && c.name).map((c) => ({
    id: c.id, name: str(c.name, 60), role: roleOf(c.role), field: str(c.field, 60), color: first(c.color) || "藍",
    photo: img(c.photo, `${str(c.name)}の写真`), project: str(c.project, 80), description: str(c.description, 400),
    forecast: forecastOf(c),
  })));
  const ids = new Set(members.map((m) => m.id));
  const known = (id: string | null) => (id && ids.has(id) ? id : null);
  const articles: Article[] = raw.articles.filter((c) => c?.id && c.title).map((c) => ({
    id: c.id, title: str(c.title, 120), authorId: known(refId(c.author)), tags: toList(c.tags),
    cover: img(c.cover), excerpt: str(c.excerpt, 300), body: cleanHtml(c.body), forecast: forecastOf(c),
    publishedAt: str(c.publishedAt) || str(c.createdAt) || new Date(0).toISOString(),
    updatedAt: str(c.revisedAt) || str(c.updatedAt) || str(c.publishedAt) || new Date(0).toISOString(),
  }));
  const communities: Community[] = raw.communities.filter((c) => c?.id && c.name).map((c) => ({
    id: c.id, name: str(c.name, 60), type: first(c.type) || "学ぶ", description: str(c.description, 600),
    frequency: str(c.frequency, 30), memberCount: Math.max(0, Math.round(Number(c.memberCount) || 0)), tags: toList(c.tags),
  }));
  const products: Product[] = raw.products.filter((c) => c?.id && c.name).map((c) => ({
    id: c.id, name: str(c.name, 80), makerId: known(refId(c.maker)), price: Math.max(0, Math.round(Number(c.price) || 0)),
    category: str(c.category, 30), image: img(c.image, str(c.name)), paymentLink: safeUrl(c.paymentLink), soldOut: Boolean(c.soldOut),
  }));
  const demos: Demo[] = raw.demos.filter((c) => c?.id && c.title).map((c) => ({
    id: c.id, title: str(c.title, 80), makerId: known(refId(c.maker)), description: str(c.description, 600),
    specs: (Array.isArray(c.specs) ? c.specs : []).map((s: Raw) => ({ label: str(s.label, 30), value: str(s.value, 120) })).filter((s: { label: string }) => s.label),
    preset: PRESET[first(c.preset)] ?? null, modelUrl: safeUrl(c.model?.url),
  }));
  return { members, articles, communities, products, demos, source: "cms" };
}

/** microCMS の settings（オブジェクト形式）を、既定値で補う */
export function normalizeSettings(c: Raw | null | undefined): SiteSettings {
  const s = c ?? {};
  const cycle = (Array.isArray(s.cycle) ? s.cycle : [])
    .map((x: Raw) => ({ title: str(x.title, 30), body: str(x.body, 300) }))
    .filter((x: { title: string }) => x.title);
  const handle = (v: unknown) => str(v, 60).replace(/^@/, "");
  return {
    name: str(s.name, 40) || SITE_DEFAULTS.name,
    nameEn: str(s.nameEn, 40) || SITE_DEFAULTS.nameEn,
    mission: str(s.mission, 120) || SITE_DEFAULTS.mission,
    lede: str(s.lede, 120) || SITE_DEFAULTS.lede,
    description: str(s.description, 200) || SITE_DEFAULTS.description,
    cycle: cycle.length ? cycle : SITE_DEFAULTS.cycle.map((x) => ({ ...x })),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(s.email)) ? str(s.email) : SITE_DEFAULTS.email,
    instagram: handle(s.instagram) || SITE_DEFAULTS.instagram,
    youtube: safeUrl(s.youtube) ?? SITE_DEFAULTS.youtube,
    x: handle(s.x) || SITE_DEFAULTS.x,
    ogImage: img(s.ogImage)?.url ?? null,
    legalHtml: cleanHtml(s.legal),
    privacyHtml: cleanHtml(s.privacy),
  };
}
