export type ForecastStep = { year: number; prob: number };
export type Forecast = { claim: string; steps: ForecastStep[]; action: string };

export type Img = { url: string; width?: number; height?: number; alt?: string };

/** 役職。並び順もこの順（代表 → 副代表 → メンバー） */
export const ROLES = ["代表", "副代表", "メンバー"] as const;
export type Role = (typeof ROLES)[number];

export type Member = {
  id: string;
  name: string;
  role: Role;
  field: string;
  /** 色名（朱・緑青・漆・藍・紫・桃・山吹） */
  color: string;
  /** 上半身の写真。あればモザイク画の元になる */
  photo: Img | null;
  project: string;
  description: string;
  forecast: Forecast | null;
};

export type Article = {
  id: string;
  title: string;
  authorId: string | null;
  tags: string[];
  cover: Img | null;
  excerpt: string;
  /** HTML（microCMSのリッチエディタ） */
  body: string;
  forecast: Forecast | null;
  publishedAt: string;
  updatedAt: string;
};

export type Community = {
  id: string;
  name: string;
  /** つくる / 話す / 学ぶ */
  type: string;
  description: string;
  frequency: string;
  memberCount: number;
  tags: string[];
};

export type Product = {
  id: string;
  name: string;
  makerId: string | null;
  price: number;
  category: string;
  image: Img | null;
  /** Stripeの支払いリンク */
  paymentLink: string | null;
  soldOut: boolean;
};

export type DemoPreset = "bowl" | "sensor" | "cart";
export type Demo = {
  id: string;
  title: string;
  makerId: string | null;
  description: string;
  specs: { label: string; value: string }[];
  preset: DemoPreset | null;
  /** .glb */
  modelUrl: string | null;
};

export type SiteData = {
  members: Member[];
  articles: Article[];
  communities: Community[];
  products: Product[];
  demos: Demo[];
  source: "cms" | "sample";
};
