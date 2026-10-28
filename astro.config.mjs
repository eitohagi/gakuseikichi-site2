import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

// 公開URL。Vercel の環境変数 SITE_URL に本番のURL（例：https://gakusei-kichi.jp）を入れる。
// 未設定なら Vercel が付けるURL、それもなければ仮のURLを使う。
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://example.com");

// ほとんどのページは静的に書き出す（記事を公開したら Webhook で再ビルド）。
// フォーム送信（/api/apply）と下書きプレビュー（/preview）だけ、サーバーで動かす。
export default defineConfig({
  site,
  output: "static",
  adapter: vercel(),
  trailingSlash: "ignore",
  integrations: [sitemap({ filter: (page) => !/\/(preview|api)\b/.test(page) })],
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  build: { inlineStylesheets: "auto" },
});
