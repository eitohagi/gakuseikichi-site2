import { describe, expect, it } from "vitest";
import { enhanceBody } from "../src/lib/content/enhance";

describe("enhanceBody", () => {
  it("時刻で始まる見出しが2つ以上あれば、区切ってタイムラインにする", () => {
    const { html, timeline } = enhanceBody("<p>前書き</p><h2>13:30　到着</h2><p>a</p><h2>9：05 出発</h2><p>b</p><h2>まとめ</h2><p>c</p>");
    expect(timeline).toEqual([{ id: "t-1330", time: "13:30", label: "到着" }, { id: "t-0905", time: "09:05", label: "出発" }]);
    expect(html).toContain('<p>前書き</p><section class="tl-step" id="t-1330">');
    expect(html).toContain("<p>a</p></section><section");
    expect(html).toContain("<p>b</p></section><h2>まとめ</h2><p>c</p>");
  });
  it("最後が時刻の見出しでも閉じる", () => {
    const { html } = enhanceBody("<h2>10:00 a</h2><p>x</p><h2>11:00 b</h2><p>y</p>");
    expect(html.endsWith("<p>y</p></section>")).toBe(true);
  });
  it("時刻の見出しが1つ以下なら何もしない", () => {
    const src = "<h2>13:30 到着</h2><p>a</p><h2>まとめ</h2>";
    expect(enhanceBody(src)).toEqual({ html: src, timeline: [] });
  });
  it("同じ時刻が重なってもIDは重ならない", () => {
    const { timeline } = enhanceBody("<h2>10:00 a</h2><h2>10:00 b</h2>");
    expect(timeline.map((t) => t.id)).toEqual(["t-1000", "t-1000-2"]);
  });
  it("見出しの文字はエスケープする", () => {
    const { html } = enhanceBody("<h2>10:00 &lt;b&gt;</h2><h2>11:00 <em>x</em></h2>");
    expect(html).toContain("<span>x</span>");
    expect(html).toContain("<span>&lt;b&gt;</span>");
  });
});
