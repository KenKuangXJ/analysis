import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ============ 密码工具 ============

/** 使用 bcryptjs 哈希密码（cost=12） */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** 验证密码是否匹配 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============ 会话签名 ============

// 会话签名密钥 —— 必须通过环境变量设置，无回退值
const SECRET = (() => {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) {
    throw new Error("NEXTAUTH_SECRET 环境变量未设置，服务拒绝启动");
  }
  return s;
})();
const COOKIE_NAME = "session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 天（秒）

interface SessionPayload {
  userId: string;
  role: string;
}

/** 对 payload 生成 HMAC-SHA256 签名 */
function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/** 编码 + 签名 → cookie 值 */
function encodeSession(data: SessionPayload): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

/** 解码 cookie 值，验证签名后返回 payload，无效则返回 null */
function decodeSession(token: string): SessionPayload | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    // 验证签名
    const expectedSig = sign(payload);
    if (signature !== expectedSig) return null;

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as SessionPayload;
    if (!data.userId || !data.role) return null;

    return data;
  } catch {
    return null;
  }
}

// ============ 会话操作 ============

/** 把用户信息写入 httpOnly Cookie */
export async function setSession(userId: string, role: string) {
  const token = encodeSession({ userId, role });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** 从 Cookie 读取当前用户信息 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return decodeSession(cookie.value);
}

/** 获取当前用户的完整信息（含数据库查询） */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });
  return user;
}

/** 清除 Cookie（退出登录） */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** 兼容旧 API 别名——服务端获取当前会话 */
export async function auth() {
  return getCurrentUser();
}
