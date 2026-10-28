# 学生基地 Webサイト

学生団体「学生基地」の公式サイトです。
メンバーは microCMS の管理画面から記事・未来予報・商品・3Dモデルを登録し、サイトは自動で更新されます。

```
メンバーが microCMS で書いて「公開」
        ↓ Webhook（自動）
Vercel がサイトを作り直す（1〜2分）
        ↓
サイトに反映
```

microCMS をつなぐ前は、サンプルデータで表示されます（実在の人物ではありません）。

| 読むもの | 内容 |
|---|---|
| この README | 仕組み、最初の準備、公開、フォルダ構成 |
| [docs/microcms.md](docs/microcms.md) | microCMS に作るAPIとフィールドの一覧 |
| [docs/operations.md](docs/operations.md) | 日々の運用（記事を書く、メンバーを足す、申し込みに返事する、販売を始める） |

---

## ページ構成

サイト全体をひとつの脳に見立てています。部位とページの対応は `src/config/site.ts` の `NAV` で決めています。

| URL | 部位 | 中身 |
|---|---|---|
| `/` | — | トップ（脳の図、各ページの抜粋） |
| `/members/`、`/members/[id]/` | 前頭葉 | メンバー、プロジェクト、未来予報 |
| `/articles/`、`/articles/[id]/` | 海馬 | 記事 |
| `/community/` | 側頭葉 | コミュニティと申し込み |
| `/products/` | 頭頂葉 | プロダクト（Stripeで購入） |
| `/demos/` | 後頭葉 | 3Dデモ |
| `/join/` | 小脳 | 参加フォーム |
| `/about/` | 脳幹 | 団体について |
| `/privacy/`、`/legal/` | — | 個人情報の扱い、特定商取引法に基づく表記 |
| `/preview` | — | 記事の下書きプレビュー（検索エンジンには載らない） |
| `/api/apply` | — | フォームの受け取り |
| `/rss.xml`、`/sitemap-index.xml`、`/robots.txt` | — | 自動で作られる |

## 使っている技術

| 役割 | 使っているもの |
|---|---|
| サイトの生成 | Astro 5（ほぼ全ページを静的に書き出し、フォームとプレビューだけサーバーで動かす） |
| 記事などの管理 | microCMS |
| 公開 | Vercel（無料の Hobby プランで動く） |
| 決済 | Stripe の支払いリンク |
| 3D | three.js（3Dの近くまでスクロールしてから読み込む） |
| 文字 | Zen Old Mincho、Anybody（サイト内に同梱。外部のフォント配信に頼らない） |
| 品質 | TypeScript（strict）、Vitest、GitHub Actions |

---

## 1. 手元で動かす

Node.js 22 以上が必要です。

```bash
npm install
cp .env.example .env   # microCMS をつなぐときだけ中身を書く
npm run dev            # http://localhost:4321
```

| コマンド | すること |
|---|---|
| `npm run dev` | 開発用サーバーを起動 |
| `npm run check` | 型のチェック |
| `npm test` | テスト |
| `npm run build` | 本番用に書き出す |
| `npm run verify` | 上の3つをまとめて実行（変更したら必ず通す） |

## 2. microCMS を準備する

[docs/microcms.md](docs/microcms.md) のとおりに、APIを7つ作ります。
キーは2つ作り、`.env`（手元）と Vercel の環境変数に入れます。

| 変数 | 中身 |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | サービスID（`https://xxxx.microcms.io` の `xxxx`） |
| `MICROCMS_API_KEY` | 読み込み用キー |
| `MICROCMS_WRITE_KEY` | 書き込み用キー（申し込みの保存だけに使う） |
| `SITE_URL` | 本番のURL（例：`https://gakusei-kichi.jp`）。検索結果やSNSに出るURLになる |

## 3. 公開する（Vercel）

1. このフォルダを GitHub にあげる（`.env` はあげない。`.gitignore` で除外済み）
2. Vercel でそのリポジトリを読み込む（Astro として自動で認識される）
3. 上の環境変数を Vercel の「Settings → Environment Variables」に入れる
4. 「Settings → Git → Deploy Hooks」で再ビルド用のURLを作り、microCMS の各APIの Webhook に登録する
5. 独自ドメインを使う場合は「Settings → Domains」で追加し、`SITE_URL` も合わせる

GitHub にあげると、プッシュのたびに GitHub Actions で型チェック・テスト・ビルドが走ります（`.github/workflows/ci.yml`）。

### 守りの設定

`vercel.json` で、次のセキュリティ用のヘッダーをつけています。

- 読み込める先を、このサイト自身と microCMS の画像・ファイル、YouTube などの埋め込みに限定（Content-Security-Policy）
- 他のサイトの中に埋め込ませない、余計なブラウザ機能を使わせない

記事本文は表示する前に、安全なタグだけに絞っています（`src/lib/content/normalize.ts` の `cleanHtml`）。
YouTube 以外の埋め込みを増やす場合は、`cleanHtml` の `allowedIframeHostnames` と `vercel.json` の `frame-src` の両方に足してください。

---

## 4. フォルダ構成

```
src/
  config/site.ts          団体名などの既定値と、ページの骨組み（NAV）
  lib/
    content/
      index.ts            データの入り口（ページはここだけを使う）
      normalize.ts        microCMS の値を整え、安全にする
      sample.ts           未接続のときのサンプル
      types.ts            データの型
    apply.ts              フォーム入力のチェック
    format.ts             日付、金額、画像URLなど
    palette.ts            メンバーの色名と実際の色
  layouts/BaseLayout.astro  全ページの外枠
  components/
    layout/               ヘッダーと目次、フッター、検索・SNS用の情報、カーソル
    ui/                   見出し、未来予報、モザイク肖像、画像の枠、メンバーカード
    sections/             トップの脳、記事の目次、コミュニティ、プロダクト、3D、参加フォーム、記事本文
  pages/                  URL と1対1のページ
  scripts/                脳の図、モザイクと和柄、3D、フォーム送信
  styles/global.css       色・文字・余白の土台
tests/                    テスト
docs/                     運用の手順
public/                   アイコン、SNS用画像（og.png）
```

### 見た目を変えるとき

- **色・文字・余白**：`src/styles/global.css` の先頭（`:root`）
- **各部品の見た目**：それぞれの `.astro` ファイルの `<style>`（その部品にだけ効く）
- **団体名・説明文**：microCMS の `settings`（コードの変更は不要）
- **メンバーの色の種類**：`src/lib/palette.ts`（増やしたら microCMS の選択肢にも足す）
- **SNS用画像**：`public/og.png`（1200×630）。microCMS の `settings` に画像を入れればそちらが優先される

## まだつながっていないもの

- アクセス解析（使う場合は Vercel Web Analytics をオンにするのが手軽です）
- 特定商取引法に基づく表記の中身（販売を始める前に `settings` に書く。手順は docs/operations.md）
