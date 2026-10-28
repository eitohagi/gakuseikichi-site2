// サイト全体の基本情報。
// microCMS の「settings」に値が入っていればそちらが優先され、空の項目だけここの値が使われる。
// 団体名を変えるときは、まず microCMS の settings を変更する（コードの変更は不要）。

export const SITE_DEFAULTS = {
  /** 団体名（日本語） */
  name: "学生基地",
  /** 団体名のローマ字。トップの大きなロゴに使う。2語までがきれいに収まる */
  nameEn: "Gakusei Kichi",
  /** 団体の一文説明。トップと検索結果に出る */
  mission: "未来を予測し、遠い未来の準備をしながら、近い未来を実現する。",
  /** トップの見出し */
  lede: "ひとりひとりの「すき」が、\nひとつの脳の神経細胞になる。",
  /** 検索結果・SNS用の説明（120文字程度） */
  description:
    "学生基地は、メンバーそれぞれのプロジェクトから未来を予報し、今日できる行動に変えていく学生団体です。プロジェクト、記事、コミュニティ、プロダクトを紹介しています。",
  /** 団体の動き方。団体についてページに出る（順番どおりに回る） */
  cycle: [
    { title: "水曜に決める", body: "毎週水曜日に集まり、これから何をやるかを決めます。三が日とクリスマスは休みです。" },
    { title: "ペアで試す", body: "会議のない日は、2人組のペアごとに手を動かします。小さく作って、すぐ外に出します。" },
    { title: "持ち寄って育てる", body: "次の水曜に結果を持ち寄ります。手応えのあったものだけを、少しずつ大きく育てます。" },
  ],
  /** 連絡先とSNS（空なら表示しない） */
  email: "",
  instagram: "",
  youtube: "",
  x: "",
} as const;

export type SiteSettings = {
  name: string;
  nameEn: string;
  mission: string;
  lede: string;
  description: string;
  cycle: { title: string; body: string }[];
  email: string;
  instagram: string;
  youtube: string;
  x: string;
  ogImage: string | null;
  /** 特定商取引法に基づく表記（HTML）。空なら「準備中」 */
  legalHtml: string;
  /** 個人情報の扱い（HTML）。空なら既定の文面 */
  privacyHtml: string;
};

/** ナビゲーション。脳の部位とページの対応（サイトの骨組み） */
export const NAV = [
  { key: "frontal", lobe: "前頭葉", role: "計画と予測", label: "プロジェクトと未来予報", short: "未来予報", href: "/members/" },
  { key: "hippo", lobe: "海馬", role: "経験を記憶へ", label: "記事", short: "記事", href: "/articles/" },
  { key: "temporal", lobe: "側頭葉", role: "ことばと人", label: "コミュニティ", short: "コミュニティ", href: "/community/" },
  { key: "parietal", lobe: "頭頂葉", role: "手ざわりと重さ", label: "プロダクト", short: "プロダクト", href: "/products/" },
  { key: "occipital", lobe: "後頭葉", role: "見ること", label: "3Dデモ", short: "3Dデモ", href: "/demos/" },
  { key: "cerebellum", lobe: "小脳", role: "くり返しを体へ", label: "参加する", short: "参加する", href: "/join/" },
  { key: "stem", lobe: "脳幹", role: "すべての土台", label: "学生基地について", short: "団体について", href: "/about/" },
] as const;

export type NavKey = (typeof NAV)[number]["key"];
export const navOf = (key: NavKey) => NAV.find((n) => n.key === key)!;
