// フォーム入力のチェック。サーバー側（/api/apply）で使う。
export type Application = {
  kind: "join" | "community";
  name: string;
  email: string;
  like?: string;
  way?: string;
  community?: string;
  message?: string;
};

const WAYS = ["メンバーになる", "コミュニティに参加する", "プロジェクトを応援する"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v: unknown, max: number) =>
  String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

export function validate(input: any, communities: string[]):
  { ok: true; value: Application } | { ok: false; error: string; spam?: boolean } {
  if (!input || typeof input !== "object") return { ok: false, error: "入力内容を読み取れませんでした。" };
  // 人には見えない欄に入力があるのは自動投稿
  if (clean(input.website, 200)) return { ok: false, error: "送信できませんでした。", spam: true };
  const kind = input.kind === "community" ? "community" : input.kind === "join" ? "join" : null;
  if (!kind) return { ok: false, error: "フォームの種類が正しくありません。" };
  const name = clean(input.name, 40);
  const email = clean(input.email, 120);
  if (!name) return { ok: false, error: "名前を入力してください。" };
  if (!EMAIL.test(email)) return { ok: false, error: "メールアドレスの形が正しくありません。" };
  if (kind === "join") {
    const like = clean(input.like, 60);
    if (!like) return { ok: false, error: "「すき」なことを入力してください。" };
    const way = WAYS.includes(input.way) ? input.way : WAYS[0];
    return { ok: true, value: { kind, name, email, like, way } };
  }
  const community = clean(input.community, 60);
  if (communities.length && !communities.includes(community)) return { ok: false, error: "そのコミュニティは見つかりませんでした。" };
  return { ok: true, value: { kind, name, email, community, message: clean(input.message, 200) } };
}
