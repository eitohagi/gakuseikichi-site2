import { describe, expect, it } from "vitest";
import { cmsImg, fmtDate, pctWord, shortName } from "../src/lib/format";

describe("fmtDate", () => {
  it("日本時間で日付を出す", () => {
    expect(fmtDate("2026-10-11T16:00:00Z")).toBe("2026.10.12");
    expect(fmtDate("bad")).toBe("");
  });
});

describe("cmsImg", () => {
  it("microCMS の画像にだけ大きさと形式の指定をつける", () => {
    const u = new URL(cmsImg("https://images.microcms-assets.io/x.jpg", 720, { h: 540, fit: "crop", faces: true }));
    expect(u.searchParams.get("w")).toBe("720");
    expect(u.searchParams.get("h")).toBe("540");
    expect(u.searchParams.get("crop")).toBe("faces");
    expect(u.searchParams.get("auto")).toBe("format");
    expect(cmsImg("https://example.com/x.jpg", 100)).toBe("https://example.com/x.jpg");
  });
});

describe("ことば", () => {
  it("確率のことば", () => {
    expect(pctWord(10)).toBe("兆し");
    expect(pctWord(50)).toBe("広がる");
    expect(pctWord(80)).toBe("定着");
  });
  it("名前の最初の語", () => {
    expect(shortName("佐倉 ミオ")).toBe("佐倉");
    expect(shortName("ラファエル・オコエ")).toBe("ラファエル");
  });
});
