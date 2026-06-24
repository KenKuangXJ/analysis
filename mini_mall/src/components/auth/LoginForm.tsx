"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** 从当前 URL 解析 callbackUrl，避免依赖 useSearchParams + Suspense */
function getCallbackUrl(): string {
  if (typeof window === "undefined") return "/";
  const params = new URLSearchParams(window.location.search);
  return params.get("callbackUrl") || "/";
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "邮箱或密码错误");
        setLoading(false);
        return;
      }

      // 登录成功，用浏览器原生跳转确保 cookie 生效
      window.location.href = getCallbackUrl();
    } catch {
      setError("网络错误，请稍后再试");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold text-center">登录</h1>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Input
        id="email"
        label="邮箱"
        type="email"
        placeholder="请输入邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        id="password"
        label="密码"
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </Button>

      <p className="text-center text-sm text-gray-500">
        还没有账号？{" "}
        <a href="/auth/register" className="text-primary hover:underline">
          立即注册
        </a>
      </p>
    </form>
  );
}
