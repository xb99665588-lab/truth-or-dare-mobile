import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://truth-or-dare-lintao.gene-devises-6yo9kkl.chatgpt.site/";
const socialImageUrl = new URL("og.png", siteUrl).toString();
const title = "真心话大冒险 · 输家请抽牌";
const description =
  "朋友局与情侣局专用的手机真心话大冒险，2000 道题目随机抽取。";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: socialImageUrl, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImageUrl],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#100a26",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
