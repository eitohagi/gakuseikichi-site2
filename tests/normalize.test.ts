import { describe, expect, it } from "vitest";
import { cleanHtml, forecastOf, normalize, normalizeSettings, safeUrl, toList } from "../src/lib/content/normalize";
import { SITE_DEFAULTS } from "../src/config/site";

describe("safeUrl", () => {
  it("https だけ通す", () => {
    expect(safeUrl("https://buy.stripe.com/abc")).toBe("https://buy.stripe.com/abc");
    expect(safeUrl("http://example.com")).toBeNull();
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("")).toBeNull();
    expect(safeUrl(undefined)).toBeNull();
  });
});

describe("toList", () => {
  it("配列と区切り文字の両方を受け取る", () => {
    expect(toList(["a", " b "])).toEqual(["a", "b"]);
    expect(toList("物理、 データ,写真")).toEqual(["物理", "データ", "写真"]);
    expect(toList(null)).toEqual([]);
  });
});

describe("forecastOf", () => {
  it("確率を0〜100に収め、年の順に並べ、おかしな行を落とす", () => {
    const f = forecastOf({
      forecastClaim: "未来",
      forecastSteps: [{ year: 2030, probability: 120 }, { year: 2027, probability: -5 }, { year: "x", probability: 50 }],
      forecastAction: "行動",
    });
    expect(f).toEqual({ claim: "未来", action: "行動", steps: [{ year: 2027, prob: 0 }, { year: 2030, prob: 100 }] });
  });
  it("何も書かれていなければ null", () => {
    expect(forecastOf({})).toBeNull();
  });
});

describe("cleanHtml", () => {
  it("script と危ない属性を取り除く", () => {
    const out = cleanHtml('<p onclick="x()">hi<script>alert(1)</script></p><a href="javascript:alert(1)">x</a>');
    expect(out).not.toMatch(/script|onclick|javascript/);
    expect(out).toContain("<p>hi</p>");
  });
  it("外部リンクは新しいタブで開く", () => {
    expect(cleanHtml('<a href="https://example.com">x</a>')).toContain('rel="noopener noreferrer"');
  });
  it("YouTube の埋め込みは残し、それ以外の iframe は消す", () => {
    expect(cleanHtml('<iframe src="https://www.youtube.com/embed/abc"></iframe>')).toContain("youtube.com/embed/abc");
    expect(cleanHtml('<iframe src="https://evil.example/x"></iframe>')).not.toContain("evil");
  });
});

describe("normalize", () => {
  const raw = {
    members: [{ id: "m1", name: "テスト", color: ["朱"], project: "P", photo: { url: "https://images.microcms-assets.io/a.jpg", width: 10, height: 10 } }, { id: "bad" }],
    articles: [
      { id: "a1", title: "T", author: { id: "m1" }, tags: ["研究"], body: "<p>本文</p>", publishedAt: "2026-10-01T00:00:00Z" },
      { id: "a2", title: "T2", author: { id: "unknown" }, publishedAt: "2026-10-02T00:00:00Z" },
    ],
    products: [{ id: "p1", name: "商品", maker: { id: "m1" }, price: "1200", paymentLink: "http://insecure", soldOut: true }],
    demos: [{ id: "d1", title: "D", preset: ["センサー"], specs: [{ label: "L", value: "V" }, { value: "名前なし" }], model: { url: "https://files.microcms-assets.io/m.glb" } }],
  };
  const d = normalize(raw);
  it("名前のないメンバーは除く", () => expect(d.members.map((m) => m.id)).toEqual(["m1"]));
  it("色はセレクトの最初の値", () => expect(d.members[0].color).toBe("朱"));
  it("写真は https の画像だけ", () => expect(d.members[0].photo?.url).toContain("microcms-assets"));
  it("いないメンバーへの参照は null にする", () => expect(d.articles[1].authorId).toBeNull());
  it("価格は数に、http の支払いリンクは捨てる", () => {
    expect(d.products[0].price).toBe(1200);
    expect(d.products[0].paymentLink).toBeNull();
    expect(d.products[0].soldOut).toBe(true);
  });
  it("3Dの見本モデルとファイルを読む", () => {
    expect(d.demos[0].preset).toBe("sensor");
    expect(d.demos[0].modelUrl).toMatch(/\.glb$/);
    expect(d.demos[0].specs).toHaveLength(1);
  });
  it("空の入力でも動く", () => expect(normalize({}).members).toEqual([]));
});

describe("normalizeSettings", () => {
  it("空なら既定値", () => {
    const s = normalizeSettings(null);
    expect(s.name).toBe(SITE_DEFAULTS.name);
    expect(s.cycle).toHaveLength(SITE_DEFAULTS.cycle.length);
  });
  it("入っている項目だけ上書きし、@ を外し、おかしなメールは捨てる", () => {
    const s = normalizeSettings({ name: "新しい名前", instagram: "@kichi", email: "not-mail", cycle: [{ title: "", body: "x" }] });
    expect(s.name).toBe("新しい名前");
    expect(s.instagram).toBe("kichi");
    expect(s.email).toBe(SITE_DEFAULTS.email);
    expect(s.cycle).toHaveLength(SITE_DEFAULTS.cycle.length);
  });
});

describe("役職", () => {
  it("代表 → 副代表 → メンバーの順に並べ、同じ役職では元の順を保つ", () => {
    const d = normalize({
      members: [
        { id: "a", name: "A" }, { id: "b", name: "B", role: ["副代表"] }, { id: "c", name: "C", role: ["代表"] },
        { id: "d", name: "D", role: ["副代表"] }, { id: "e", name: "E", role: ["顧問"] },
      ],
    });
    expect(d.members.map((m) => m.id)).toEqual(["c", "b", "d", "a", "e"]);
    expect(d.members.at(-1)?.role).toBe("メンバー");
  });
});
