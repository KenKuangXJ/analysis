// 已迁移至自定义 Cookie Session 认证，此文件废弃
// 新 API: /api/auth/login, /api/auth/register, /api/auth/me, /api/auth/logout
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "已废弃" }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ error: "已废弃" }, { status: 410 });
}
