import type { Metadata } from "next";
import { SiteProvider } from "@/components/site-context";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "栖序 · 多站运营台", template: "%s · 栖序" },
  description: "面向多网站的电商经营与数据运营平台",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
