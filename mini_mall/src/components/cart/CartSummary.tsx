"use client";

import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CartSummaryProps {
  totalAmount: number;
  itemCount: number;
}

export function CartSummary({ totalAmount, itemCount }: CartSummaryProps) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900">订单摘要</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>商品数量</span>
          <span>{itemCount} 件</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>运费</span>
          <span>免运费</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
          <span>合计</span>
          <span className="text-danger">{formatPrice(totalAmount)}</span>
        </div>
      </div>
      <button
        onClick={() => router.push("/orders?action=checkout")}
        className="w-full rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary-dark transition-colors"
      >
        去结算
      </button>
    </div>
  );
}
