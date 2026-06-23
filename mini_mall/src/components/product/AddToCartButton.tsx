"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleAddToCart() {
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=" + window.location.pathname);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } else {
      const data = await res.json();
      setError(data.error || "添加失败");
    }
  }

  if (stock <= 0) return null;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAddToCart}
        size="lg"
        className="w-full lg:w-auto"
        disabled={loading}
      >
        {loading ? "添加中..." : success ? "✓ 已加入购物车" : "加入购物车"}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
