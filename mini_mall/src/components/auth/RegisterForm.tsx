"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("密码至少需要 8 位");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        setLoading(false);
        return;
      }

      // 注册成功 → 跳转首页
      window.location.href = "/";
    } catch {
      setError("网络错误，请稍后再试");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold text-center">注册</h1>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Input
        id="name"
        label="昵称（可选）"
        type="text"
        placeholder="请输入昵称"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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
        placeholder="请设置密码（至少 8 位）"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "注册中..." : "注册"}
      </Button>

      <p className="text-center text-sm text-gray-500">
        已有账号？{" "}
        <a href="/auth/login" className="text-primary hover:underline">
          去登录
        </a>
      </p>
    </form>
  );
}
