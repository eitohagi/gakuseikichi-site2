// 記事本文の見せ方を整える（純粋な関数。テストあり）。
// 「13:30　スタジアム到着」のように時刻で始まる見出し（見出し2）が2つ以上あると、
// その見出しから次の見出しまでをひとまとまりにして、タイムラインとして表示する。

export type TimelineStep = { id: string; time: string; label: string };

const H2 = /<h2([^>]*)>([\s\S]*?)<\/h2>/g;
const TIME = /^\s*(\d{1,2})[:：](\d{2})[\s　]*(.*)$/;
const text = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function enhanceBody(html: string): { html: string; timeline: TimelineStep[] } {
  const heads = [...html.matchAll(H2)];
  const timed = heads.filter((m) => TIME.test(text(m[2])));
  if (timed.length < 2) return { html, timeline: [] };

  const timeline: TimelineStep[] = [];
  const used = new Set<string>();
  let out = "";
  let last = 0;
  let open = false;
  for (const m of heads) {
    const start = m.index!;
    out += html.slice(last, start);
    if (open) { out += "</section>"; open = false; }
    const t = text(m[2]).match(TIME);
    if (t) {
      const time = `${t[1].padStart(2, "0")}:${t[2]}`;
      let id = `t-${time.replace(":", "")}`;
      for (let n = 2; used.has(id); n++) id = `t-${time.replace(":", "")}-${n}`;
      used.add(id);
      const label = t[3].trim();
      timeline.push({ id, time, label });
      out += `<section class="tl-step" id="${id}"><h2 class="tl-head"><time>${time}</time><span>${esc(label)}</span></h2>`;
      open = true;
    } else {
      out += m[0];
    }
    last = start + m[0].length;
  }
  out += html.slice(last);
  if (open) out += "</section>";
  return { html: out, timeline };
}
