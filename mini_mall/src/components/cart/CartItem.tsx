"use client";

import { useState } from "react";
import { formatPrice, getFirstImage } from "@/lib/utils";

interface CartItemData {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string;
    stock: number;
    slug: string;
  };
}

interface CartItemProps {
  item: CartItemData;
  onUpdate: () => void;
}

export function CartItem({ item, onUpdate }: CartItemProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const coverImage = getFirstImage(item.product.images);

  const updateQuantity = async (quantity: number) => {
    if (quantity < 1) return;
    setError("");
    setLoading(true);
    const res = await fetch(`/api/cart/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    setLoading(false);
    if (res.ok) {
      onUpdate();
    } else {
      const data = await res.json();
      setError(data.error || "操作失败");
    }
  };

  const removeItem = async () => {
    if (!window.confirm(`确定要删除「${item.product.name}」吗？`)) return;
    setLoading(true);
    const res = await fetch(`/api/cart/items/${item.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) onUpdate();
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border bg-white p-4 transition-opacity ${
        loading ? "opacity-50 pointer-events-none" : "border-gray-200"
      }`}
    >
      {/* 商品图片 */}
      <div className="h-20 w-20 shrink-0 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="h-8 w-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>

      {/* 商品信息 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {item.product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {formatPrice(item.product.price)}
        </p>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>

      {/* 数量控制 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateQuantity(item.quantity - 1)}
          disabled={item.quantity <= 1 || loading}
          className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-medium tabular-nums">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.quantity + 1)}
          disabled={item.quantity >= item.product.stock || loading}
          className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>

      {/* 小计 + 删除 */}
      <div className="text-right space-y-1 shrink-0">
        <p className="font-medium text-gray-900 tabular-nums">
          {formatPrice(item.product.price * item.quantity)}
        </p>
        <button
          onClick={removeItem}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  );
}
