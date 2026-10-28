// 参加フォームとコミュニティ申し込みを受け取り、microCMS の applications API に保存する。
// 書き込みキーはここ（サーバー）でだけ使い、ブラウザには出さない。
import type { APIRoute } from "astro";
import { validate } from "../../lib/apply";
import { client } from "../../lib/content";
import { SAMPLE } from "../../lib/content/sample";

export const prerender = false;

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

async function communityNames(): Promise<string[]> {
  if (!client) return SAMPLE.communities.map((c) => c.name);
  const res = await client.getList({ endpoint: "communities", queries: { fields: "name", limit: 100 } });
  return res.contents.map((c: { name: string }) => c.name);
}

export const POST: APIRoute = async ({ request, url }) => {
  // 他のサイトから送りつけられたものは受け付けない
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== url.host) return json(403, { error: "このサイトのフォームから送信してください。" });
  if (!(request.headers.get("content-type") || "").includes("application/json")) return json(415, { error: "送信形式が正しくありません。" });

  const text = await request.text();
  if (text.length > 4000) return json(413, { error: "入力が長すぎます。" });
  let input: unknown;
  try { input = JSON.parse(text); } catch { return json(400, { error: "入力内容を読み取れませんでした。" }); }

  let names: string[] = [];
  try { names = await communityNames(); } catch { /* 一覧が取れなくても受け付ける */ }
  const r = validate(input, names);
  // 自動投稿には成功したふりをして、保存はしない
  if (!r.ok) return r.spam ? json(200, { ok: true }) : json(400, { error: r.error });

  const domain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
  const writeKey = import.meta.env.MICROCMS_WRITE_KEY;
  if (!domain || !writeKey) return json(503, { error: "フォームの送信先がまだ設定されていません。運営メンバーに直接連絡してください。" });

  const v = r.value;
  const payload = {
    kind: [v.kind === "join" ? "参加希望" : "コミュニティ申し込み"],
    name: v.name, email: v.email,
    like: v.like ?? "", way: v.way ?? "", community: v.community ?? "", message: v.message ?? "",
    status: ["未対応"],
  };
  const res = await fetch(`https://${domain}.microcms.io/api/v1/applications?status=draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-MICROCMS-API-KEY": writeKey },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("microCMS write failed", res.status, await res.text().catch(() => ""));
    return json(502, { error: "送信できませんでした。時間をおいてもう一度試してください。" });
  }
  return json(200, { ok: true });
};

export const ALL: APIRoute = () => json(405, { error: "POSTで送信してください。" });
