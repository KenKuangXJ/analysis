"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/products", label: "商品管理", icon: "📦" },
  { href: "/admin/orders", label: "订单管理", icon: "📋" },
  { href: "/admin/categories", label: "分类管理", icon: "🏷️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname === link.href ||
                (link.href !== "/admin" && pathname.startsWith(link.href))
                ? "bg-primary/10 text-primary font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mx-4 border-t border-gray-100 pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-100 transition-colors"
        >
          ← 返回商城
        </Link>
      </div>
    </aside>
  );
}
