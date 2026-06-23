import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");
  const isLoggedIn = !!sessionCookie?.value;

  // 从 cookie 中提取 role（不做 HMAC 校验，仅作路由导向）
  let isAdmin = false;
  if (isLoggedIn) {
    try {
      const payload = sessionCookie!.value.split(".")[0];
      const decoded = Buffer.from(payload, "base64url").toString("utf-8");
      const data = JSON.parse(decoded) as { role?: string };
      isAdmin = data.role === "ADMIN";
    } catch {
      console.warn("[middleware] session cookie 解析失败，按未登录处理");
    }
  }

  // Admin 路由：需管理员
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 需登录的路由
  if (
    pathname.startsWith("/cart") ||
    pathname.startsWith("/orders")
  ) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 已登录用户访问登录/注册页 → 跳转首页
  if (
    (pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/register")) &&
    isLoggedIn
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
