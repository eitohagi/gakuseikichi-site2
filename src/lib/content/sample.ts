// microCMS が未接続のときに表示するサンプル。
// メンバーは実際の名簿。記事・商品・3Dなどは見た目を確かめるための架空の内容で、書き手は空にしてある。
import type { SiteData } from "./types";

const f = (claim: string, steps: [number, number][], action: string) => ({
  claim, action, steps: steps.map(([year, prob]) => ({ year, prob })),
});
const html = (blocks: [string, string][]) => blocks.map(([t, s]) => (t === "h" ? `<h2>${s}</h2>` : `<p>${s}</p>`)).join("");

export const SAMPLE: SiteData = {
  source: "sample",
  // 実際のメンバー。プロジェクトと予報は、各自から届いたら microCMS に入れる
  members: [
    { id: "shiori", name: "Shiori", role: "代表", field: "", color: "藍", photo: null, project: "", description: "", forecast: null },
    { id: "mei", name: "Mei", role: "副代表", field: "", color: "桃", photo: null, project: "", description: "", forecast: null },
    { id: "eito", name: "Eito", role: "副代表", field: "", color: "山吹", photo: null, project: "", description: "", forecast: null },
    { id: "mana", name: "Mana", role: "メンバー", field: "", color: "緑青", photo: null, project: "", description: "", forecast: null },
    { id: "akari", name: "Akari", role: "メンバー", field: "", color: "朱", photo: null, project: "", description: "", forecast: null },
    { id: "nodoka", name: "Nodoka", role: "メンバー", field: "", color: "紫", photo: null, project: "", description: "", forecast: null },
    { id: "marina", name: "Marina", role: "メンバー", field: "", color: "藍", photo: null, project: "", description: "", forecast: null },
    { id: "saki", name: "Saki", role: "メンバー", field: "", color: "漆", photo: null, project: "", description: "", forecast: null },
    { id: "miku", name: "Miku", role: "メンバー", field: "", color: "緑青", photo: null, project: "", description: "", forecast: null },
  ],
  articles: [
    { id: "miku-solo-stadium", title: "全部の席が動くスタジアムで、はじめてのひとり観戦", authorId: "miku", tags: ["未来予報"], cover: null,
      excerpt: "座席が浮かび、ごはんはコンベアで届く。リニューアルしたスタジアムでのひとり観戦を、時間を追ってレポートします。",
      body: `
<p>こんにちは、学生基地のmikuです！</p>
<p>今日は全休ということで、はじめてのスポーツ観戦に行ってきました。しかも、ひとりで！</p>
<p>なんといっても、先月リニューアルしたばかりの話題のスタジアムで、試合のチケットが取れたのです。ひとりでのスポーツ観戦って実際どうなの？ 正直にレポートしていきます。</p>
<h2>13:30　スタジアム到着</h2>
<figure class="ph"><div></div><figcaption>スタジアムの外観</figcaption></figure>
<p>最寄り駅を出ると、目の前にドーンと現れたのが例のスタジアム！ 駅直結なので、初めてでも迷う心配はなさそうです。</p>
<p>入場口で驚いたのが、長い列がどこにもないこと。チケット画面をかざして中に入ると、ベルトコンベアのような床が、目的のブロックの近くまで自動で運んでくれます。階段やエスカレーターを探して歩き回らなくていいのはありがたいですよね。お年寄りや、体の不自由な方も来やすいと思います。</p>
<h2>13:40　いざ、座席へ</h2>
<p>指定されたシートに着席。すると……階段を上ることもなく、座った瞬間にシートそのものがスーッと上へ昇りはじめました。</p>
<p>このスタジアム、全座席が可動式になっていて、自分の観覧エリアまでシートが全自動で運んでくれるんです。重い荷物を持って階段を移動しなくていいのは、本当に助かる……！</p>
<h2>13:45　フードを注文</h2>
<p>試合前にお腹が空いてきたので、フードを注文することに。スタジアムグルメは現地観戦の醍醐味ですよね。</p>
<p>キャッシュレス決済なら、肘置きのパネルでメニューを見て注文できます。注文ボタンを押して数分後……座席の横に敷かれた専用のベルトコンベアに乗って、注文したフードが自動で運ばれてきました！</p>
<figure class="ph"><div></div><figcaption>座席で撮ったスタジアムグルメ</figcaption></figure>
<p>席から1歩も動かずに、おいしいスタジアムグルメを楽しめるのは最高です。</p>
<h2>13:55　座席を動かしてみる</h2>
<p>フードをセットしたら、次は座席の操作です。手元のパネルで起動ボタンを押すと、座席がフワッと浮かび上がり、好きな観戦ポジションへ自由に移動できます。</p>
<p>360度どこからでも見渡せる全球型の構造だからこそ、自分だけのベストポジションを作れるんです。プールは水族館のように、サッカーはなんと下から観戦できたりもします。食事も観戦位置も思いどおりになるストレスフリーさに感動しました。</p>
<h2>14:05　ひとり観戦の暇つぶし</h2>
<p>14:30の試合開始まで、まだ20分ほどあったので、暇つぶしにパネルを操作してみることに。すると、ひとり観戦の私にうれしすぎる機能を2つ見つけました！</p>
<p>まず試したのが「AIリアルタイムデータ＆AR分析」。パネルをタッチすると、今日の両チームの対戦成績や選手の最新コンディションがARで浮かび上がってきて、オタク心がくすぐられます。</p>
<p>もう一つが「観戦者限定チャット」。アプリを開くと、会場にいる観客のコメントがタイムラインに流れていて、「今日のスタメンアツすぎ！」「ポテトおいしいー」といった声援や雑談が飛び交っていました。ひとり観戦でも、スタジアム全体の一体感や盛り上がりを共有できるのがすごく楽しかったです。</p>
<h2>14:30　試合開始</h2>
<p>パネルを見ているとあっという間に試合開始の時間に。笛の音とともに、いよいよ試合がスタート！ 座席からはピッチ全体がよく見渡せます。</p>
<p>ここでVRモードのスイッチを入れると、なんと選手や審判の目線の映像に一瞬で切り替えられるんです。肉眼でピッチ全体を見渡しながら、手元のモニターでボールを持っている選手を同時にチェックする、ハイブリッド観戦。プロのすごさがダイレクトに伝わってきます。</p>
<p>好きな角度から肉眼で見つつ、手元で選手の目線も味わえるなんて、テレビ観戦でも、これまでの現地観戦でも味わえない贅沢な体験です。</p>
<h2>16:20　試合終了、そして退場</h2>
<p>後半戦も終わり、試合はホームチームの勝利！ 余韻に浸りながら退場します。帰りも可動式シートとコンベアの床が大活躍。手元のパネルで退場ボタンを押すと、座席がスムーズに降りて、出口へ向かうメインレーンへ。楽しかったー！</p>
<h2>まとめ</h2>
<p>初めてのひとり観戦は、想像をはるかに超える満足度でした。</p>
<p>「スポーツ観戦に行ってみたいけど、混雑が苦手……」「ひとりで行くのはハードルが高いかも……」と思っている大学生にこそ、全力でおすすめしたい最新スポットです。チケットの倍率は高めですが、休日にチャレンジしてみる価値は大アリ！ みなさんもぜひ体験してみてください。</p>
`.trim(),
      forecast: null, publishedAt: "2026-10-25T12:00:00.000Z", updatedAt: "2026-10-25T12:00:00.000Z" },
    { id: "kitchen-first-month", title: "空き店舗をキッチンにして1か月、わかったこと", authorId: null, tags: ["活動報告"], cover: null,
      excerpt: "来た人の半分は「料理を習いたい」ではなく「誰かと食べたい」人でした。",
      body: html([["h", "なぜ空き店舗だったのか"], ["p", "商店街を歩くと、シャッターが下りた店が目につきます。店主さんに話を聞くと、貸したくないのではなく、借りる人が見つからないだけでした。"], ["h", "やってみたこと"], ["p", "毎週土曜の午後だけ店を借り、近所の八百屋さんで売れ残りそうな野菜を安く分けてもらって、来た人と一緒に一品つくりました。4回で延べ37人が来てくれました。"], ["h", "わかったこと"], ["p", "参加者の半分は、料理を習いたい人ではなく、誰かと一緒に食べたい人でした。次の1か月は「つくる」より「囲む」ことを中心に組み直します。"]]),
      forecast: f("食べる場所が、つくる場所に変わっていく。", [[2027, 34], [2030, 60], [2035, 76]], "近所の商店で「いちばん売れ残る食材」を聞いて、それで一品つくってみる。"),
      publishedAt: "2026-10-12T09:00:00.000Z", updatedAt: "2026-10-12T09:00:00.000Z" },
    { id: "rooftop-heatmap", title: "屋上センサー12台で、学校のまわりの暑さを地図にした", authorId: null, tags: ["研究"], cover: null,
      excerpt: "同じ時刻でも、木の多い通りは最大で3℃低くなっていました。",
      body: html([["h", "測ったもの"], ["p", "気温、湿度、風速を10分ごとに記録しました。センサーは小型ソーラーパネルで動くので、電源工事は要りません。"], ["h", "見えてきたこと"], ["p", "木の多い通りと、アスファルトの広い通りでは、同じ時刻でも最大で3℃の差がありました。"], ["h", "次にやること"], ["p", "このデータを地図にして、通学路の「涼しい道」を地域に公開します。"]]),
      forecast: null, publishedAt: "2026-10-05T09:00:00.000Z", updatedAt: "2026-10-05T09:00:00.000Z" },
    { id: "kintsugi-resin", title: "漆の代わりに植物由来の樹脂を試す", authorId: null, tags: ["制作記録"], cover: null,
      excerpt: "強さは本漆に届きませんでしたが、1日で仕上がるのは大きな違いでした。",
      body: html([["h", "きっかけ"], ["p", "祖母の家で割れた器を見つけ、直したいと思ったのが始まりです。本漆は乾くまでに何週間もかかります。"], ["h", "試したこと"], ["p", "3Dプリントで割れ目に合う型をつくり、植物由来の樹脂で接着してから表面に金粉をのせました。"], ["p", "強さは本漆に届きませんでしたが、1日で仕上がるのは大きな違いでした。"]]),
      forecast: null, publishedAt: "2026-09-28T09:00:00.000Z", updatedAt: "2026-09-28T09:00:00.000Z" },
    { id: "rap-zine-making", title: "6か国語のリリックで、ZINEを1冊つくった", authorId: null, tags: ["制作記録", "活動報告"], cover: null,
      excerpt: "子どもたち11人のリリックを、母語と日本語の対訳で並べました。",
      body: html([["h", "ZINEにした理由"], ["p", "ラップは声に出すと消えてしまいます。家族に見せられる形で残したい、という声が子どもたちから出ました。"], ["h", "つくり方"], ["p", "左のページに母語、右のページに日本語を置きました。訳せない言葉は、訳さずに注をつけています。印刷は地域の公民館の輪転機を借りました。"]]),
      forecast: null, publishedAt: "2026-09-20T09:00:00.000Z", updatedAt: "2026-09-20T09:00:00.000Z" },
    { id: "boardgame-test", title: "試験前の教室で、ボードゲームを30人に遊んでもらった", authorId: null, tags: ["活動報告"], cover: null,
      excerpt: "世界史の範囲をすごろくにして、終わったあとの小テストを比べました。",
      body: html([["h", "やったこと"], ["p", "教科書の1章ぶんを、マスに書いた問題と年号カードにしました。昼休みに遊んでもらいました。"], ["h", "結果"], ["p", "遊んだグループは、遊ばなかったグループより小テストの平均が少し高くなりました。ただ人数が少ないので、次は2クラスで比べます。"]]),
      forecast: null, publishedAt: "2026-09-11T09:00:00.000Z", updatedAt: "2026-09-11T09:00:00.000Z" },
  ],
  communities: [
    { id: "c1", name: "夜更かし物理部", type: "学ぶ", description: "毎週金曜の夜、気になった論文や動画を一つ持ち寄って、わかるまで話す。", frequency: "毎週金", memberCount: 38, tags: ["物理", "オンライン"] },
    { id: "c2", name: "路地裏ZINE会議", type: "つくる", description: "街で拾った看板や張り紙を写真に撮り、季節ごとに一冊のZINEにまとめる。", frequency: "月2回", memberCount: 21, tags: ["写真", "印刷"] },
    { id: "c3", name: "多言語ごはん会", type: "話す", description: "それぞれの家の料理を一品持ち寄り、その料理の名前を全員の言語で言ってみる。", frequency: "月1回", memberCount: 54, tags: ["料理", "多言語"] },
    { id: "c4", name: "なおす日", type: "つくる", description: "壊れた家電や服を持ってきて、直し方をみんなで考えるリペアカフェ。", frequency: "第3土", memberCount: 33, tags: ["修理", "金継ぎ"] },
    { id: "c5", name: "屋上ラボ", type: "学ぶ", description: "学校の屋上で気温や風を測り、データを見ながら街の未来を予報する。", frequency: "毎週水", memberCount: 17, tags: ["気候", "データ"] },
    { id: "c6", name: "古典×ラップ研究会", type: "話す", description: "和歌や漢詩を読み、韻とリズムを今のラップと比べて遊ぶ。", frequency: "隔週日", memberCount: 26, tags: ["古典", "音楽"] },
  ],
  products: [
    { id: "p1", name: "まちの台所スパイス缶", makerId: null, price: 1200, category: "Food", image: null, paymentLink: null, soldOut: false },
    { id: "p2", name: "うるしリペアキット", makerId: null, price: 3800, category: "Craft", image: null, paymentLink: null, soldOut: false },
    { id: "p3", name: "母語ラップZINE vol.2", makerId: null, price: 800, category: "Zine", image: null, paymentLink: null, soldOut: false },
    { id: "p4", name: "屋上温度センサー自作キット", makerId: null, price: 4500, category: "Kit", image: null, paymentLink: null, soldOut: false },
    { id: "p5", name: "ボードゲーム「赤点回避」", makerId: null, price: 2900, category: "Game", image: null, paymentLink: null, soldOut: false },
    { id: "p6", name: "さわる服薬カレンダー（試作）", makerId: null, price: 5200, category: "Textile", image: null, paymentLink: null, soldOut: true },
  ],
  demos: [
    { id: "d1", title: "うるしリペアの器", makerId: null, preset: "bowl", modelUrl: null,
      description: "割れた器を植物由来の樹脂でつなぎ、継ぎ目に金を入れた試作品。継ぎ目の線は割れ方ごとに一つしかありません。",
      specs: [{ label: "素材", value: "植物由来樹脂、金粉" }, { label: "直径", value: "12 cm" }, { label: "工程", value: "3Dプリント型、漆塗り、金継ぎ" }] },
    { id: "d2", title: "屋上温度センサー", makerId: null, preset: "sensor", modelUrl: null,
      description: "太陽光で動く温度・風速センサー。学校の屋上に置き、10分ごとに街の暑さを記録します。",
      specs: [{ label: "測定", value: "気温、湿度、風速" }, { label: "電源", value: "小型ソーラーパネル" }, { label: "間隔", value: "10分ごと" }] },
    { id: "d3", title: "まちの台所ワゴン", makerId: null, preset: "cart", modelUrl: null,
      description: "空き店舗の前に出せる移動式の調理台。棚を組み替えて、販売台にも作業台にもなります。",
      specs: [{ label: "サイズ", value: "W90 × D50 × H85 cm" }, { label: "棚", value: "3段、組み替え可" }, { label: "車輪", value: "4輪、ストッパー付き" }] },
  ],
};
