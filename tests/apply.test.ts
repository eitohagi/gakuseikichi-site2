import { describe, expect, it } from "vitest";
import { validate } from "../src/lib/apply";

const ok = { kind: "join", name: "エイト", email: "a@b.jp", like: "物理", way: "メンバーになる" };

describe("validate", () => {
  it("正しい参加フォームを通す", () => {
    const r = validate(ok, []);
    expect(r.ok).toBe(true);
  });
  it("見えない欄に入力があれば自動投稿として扱う", () => {
    const r = validate({ ...ok, website: "http://spam" }, []);
    expect(r).toMatchObject({ ok: false, spam: true });
  });
  it("メールの形を確かめる", () => expect(validate({ ...ok, email: "nope" }, []).ok).toBe(false));
  it("知らない関わり方は既定値にする", () => {
    const r = validate({ ...ok, way: "<script>" }, []);
    expect(r.ok && r.value.way).toBe("メンバーになる");
  });
  it("存在しないコミュニティへの申し込みは断る", () => {
    expect(validate({ kind: "community", name: "x", email: "a@b.jp", community: "偽の会" }, ["本物の会"]).ok).toBe(false);
    expect(validate({ kind: "community", name: "x", email: "a@b.jp", community: "本物の会" }, ["本物の会"]).ok).toBe(true);
  });
  it("長すぎる入力は切り詰める", () => {
    const r = validate({ ...ok, name: "あ".repeat(100) }, []);
    expect(r.ok && r.value.name.length).toBe(40);
  });
});
