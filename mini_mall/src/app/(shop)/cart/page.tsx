"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<{
    items: any[];
    totalAmount: number;
    itemCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/auth/login?callbackUrl=/cart");
        return;
      }
      const data = await res.json();
      setCart(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchCart();
    else if (session === null) {
      router.push("/auth/login?callbackUrl=/cart");
    }
  }, [session]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        <p className="mt-4 text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">购物车是空的</p>
        <button
          onClick={() => router.push("/products")}
          className="mt-4 text-primary hover:underline"
        >
          去逛逛
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">我的购物车</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} onUpdate={fetchCart} />
          ))}
        </div>

        <div>
          <CartSummary totalAmount={cart.totalAmount} itemCount={cart.itemCount} />
        </div>
      </div>
    </div>
  );
}
