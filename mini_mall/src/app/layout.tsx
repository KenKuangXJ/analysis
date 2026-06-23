import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/auth/SessionProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | Mini Mall",
    default: "Mini Mall - 微型电商",
  },
  description: "发现精选好物，畅享便捷购物体验",
  keywords: ["电商", "购物", "Mini Mall", "在线商城"],
  robots: "index, follow",
  openGraph: {
    title: "Mini Mall - 微型电商",
    description: "发现精选好物，畅享便捷购物体验",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
