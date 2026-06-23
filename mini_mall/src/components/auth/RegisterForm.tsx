"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/auth/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("密码至少需要 6 位");
      setLoading(false);
      return;
    }

    const result = await register(name, email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // 注册成功 → 跳转首页
    router.push("/");
    router.refresh();
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
        placeholder="请设置密码（至少 6 位）"
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
