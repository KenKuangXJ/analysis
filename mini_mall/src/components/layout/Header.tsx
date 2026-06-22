"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          Mini Mall
        </Link>

        {/* 导航 */}
        <nav className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            全部商品
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/cart"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                购物车
              </Link>
              <Link
                href="/orders"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                我的订单
              </Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    后台管理
                  </Button>
                </Link>
              )}
              <span className="text-sm text-gray-400">
                {session.user.name || session.user.email}
              </span>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">注册</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
