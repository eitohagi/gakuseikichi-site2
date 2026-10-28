// 記事のRSS（/rss.xml）
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getSettings, getSiteData, memberMap } from "../lib/content";

export const GET: APIRoute = async (context) => {
  const [s, data] = await Promise.all([getSettings(), getSiteData()]);
  const byId = memberMap(data);
  return rss({
    title: `${s.name}の記事`,
    description: s.description,
    site: context.site!,
    items: data.articles.map((a) => ({
      title: a.title,
      link: `/articles/${a.id}/`,
      pubDate: new Date(a.publishedAt),
      description: a.excerpt,
      author: a.authorId ? byId[a.authorId]?.name : undefined,
      categories: a.tags,
    })),
    customData: "<language>ja</language>",
  });
};
