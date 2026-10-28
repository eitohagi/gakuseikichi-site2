// メンバーの色。CMSでは色名を選ぶだけにして、実際の色はここで管理する
export const PALETTES: Record<string, [string, string, string]> = {
  朱: ["#C9583A", "#E59A5B", "#7A3B2A"],
  緑青: ["#2F6B5E", "#5EA88F", "#1E3F39"],
  漆: ["#7A2020", "#C0913A", "#2A1414"],
  藍: ["#2E4C8F", "#6C8FD6", "#18264A"],
  紫: ["#5B3A8C", "#9B7BD1", "#2C1C47"],
  桃: ["#B5486E", "#E28BA8", "#5A2236"],
  山吹: ["#B98A12", "#E6C15A", "#5C4508"],
};
export const COLOR_NAMES = Object.keys(PALETTES);
export const paletteOf = (name: string) => PALETTES[name] ?? PALETTES["藍"];
