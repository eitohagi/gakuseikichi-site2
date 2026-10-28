// データの入り口。ページはここだけを使う。
// microCMS が未接続ならサンプルを返す。
import { createClient } from "microcms-js-sdk";
import type { SiteSettings } from "../../config/site";
import { normalize, normalizeSettings } from "./normalize";
import { SAMPLE } from "./sample";
import type { Member, SiteData } from "./types";

export * from "./types";
export { normalize } from "./normalize";

const domain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = import.meta.env.MICROCMS_API_KEY;
export const isConfigured = Boolean(domain && apiKey);
export const client = isConfigured ? createClient({ serviceDomain: domain!, apiKey: apiKey! }) : null;

async function all(endpoint: string, orders?: string): Promise<Record<string, any>[]> {
  if (!client) return [];
  const out: Record<string, any>[] = [];
  for (let offset = 0; ; offset += 100) {
    const res = await client.getList({ endpoint, queries: { limit: 100, offset, ...(orders ? { orders } : {}) } });
    out.push(...res.contents);
    if (out.length >= res.totalCount || res.contents.length === 0) break;
  }
  return out;
}

// API がまだ作られていない段階でもビルドが止まらないようにする
async function safe<T>(label: string, p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.warn(`[content] ${label} を読み込めませんでした: ${(e as Error).message}`);
    return fallback;
  }
}

let dataCache: Promise<SiteData> | null = null;
export function getSiteData(): Promise<SiteData> {
  if (!client) return Promise.resolve(SAMPLE);
  dataCache ??= (async () => {
    const [members, articles, communities, products, demos] = await Promise.all([
      all("members", "createdAt"),
      all("articles", "-publishedAt"),
      safe("communities", all("communities", "createdAt"), []),
      safe("products", all("products", "-publishedAt"), []),
      safe("demos", all("demos", "createdAt"), []),
    ]);
    return normalize({ members, articles, communities, products, demos });
  })();
  return dataCache;
}

let settingsCache: Promise<SiteSettings> | null = null;
export function getSettings(): Promise<SiteSettings> {
  settingsCache ??= client
    ? safe("settings", client.getObject({ endpoint: "settings" }), null).then(normalizeSettings)
    : Promise.resolve(normalizeSettings(null));
  return settingsCache;
}

export const memberMap = (d: SiteData): Record<string, Member> => Object.fromEntries(d.members.map((m) => [m.id, m]));
