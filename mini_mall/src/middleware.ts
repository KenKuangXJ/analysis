import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  // Admin 路由：非管理员重定向到登录页
  if (pathname.startsWith("/admin") && !isAdmin) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 需登录路由：未登录重定向到登录页
  const protectedPaths = ["/cart", "/orders"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已登录用户访问 auth 页面 → 跳转首页
  if (pathname.startsWith("/auth") && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/cart/:path*", "/orders/:path*", "/admin/:path*", "/auth/:path*"],
};
