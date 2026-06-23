import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isLoggedIn = !!token;
    const isAdmin = token?.role === "ADMIN";
    const { pathname } = req.nextUrl;

    // Admin 路由：非管理员重定向到登录页
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // 需登录路由
    if ((pathname.startsWith("/cart") || pathname.startsWith("/orders")) && !isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // 已登录用户访问 auth 页面 → 跳转首页
    if (pathname.startsWith("/auth") && isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // 自定义逻辑全在 middleware 函数中处理
    },
  }
);

export const config = {
  matcher: ["/cart/:path*", "/orders/:path*", "/admin/:path*", "/auth/:path*"],
};
