"use client";

import { formatPrice } from "@/lib/utils";

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
  const updateQuantity = async (quantity: number) => {
    if (quantity < 1) return;
    const res = await fetch(`/api/cart/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) onUpdate();
  };

  const removeItem = async () => {
    const res = await fetch(`/api/cart/items/${item.id}`, {
      method: "DELETE",
    });
    if (res.ok) onUpdate();
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      {/* 图片占位 */}
      <div className="h-20 w-20 shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-400">图片</span>
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
        <p className="mt-1 text-sm text-primary font-medium">
          {formatPrice(item.product.price)}
        </p>
      </div>

      {/* 数量控制 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          -
        </button>
        <span className="w-10 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.quantity + 1)}
          disabled={item.quantity >= item.product.stock}
          className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          +
        </button>
      </div>

      {/* 小计 + 删除 */}
      <div className="text-right space-y-1">
        <p className="font-medium text-gray-900">
          {formatPrice(item.product.price * item.quantity)}
        </p>
        <button
          onClick={removeItem}
          className="text-xs text-gray-400 hover:text-danger transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  );
}
