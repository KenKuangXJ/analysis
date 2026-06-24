"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CartSummaryProps {
  totalAmount: number;
  itemCount: number;
}

export function CartSummary({ totalAmount, itemCount }: CartSummaryProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress: "" }),
      });
      const data = await res.json();

      if (res.ok && data.id) {
        router.push(`/orders/${data.id}`);
      } else {
        alert(data.error || "下单失败，请稍后再试");
      }
    } catch {
      alert("网络错误，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4 sticky top-20">
      <h3 className="text-lg font-bold text-gray-900">订单摘要</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>商品数量</span>
          <span>{itemCount} 件</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>运费</span>
          <span className="text-green-600">免运费</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-lg font-bold">
          <span>合计</span>
          <span className="text-[#f43f5e]">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      <button
        onClick={handleSubmitOrder}
        disabled={itemCount === 0 || submitting}
        className="w-full rounded-lg bg-[#f43f5e] px-6 py-3 text-white font-medium hover:bg-[#e11d48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "提交中..." : "提交订单"}
      </button>

      <p className="text-xs text-center text-gray-400">
        提交即表示您同意模拟购买协议
      </p>
    </div>
  );
}
