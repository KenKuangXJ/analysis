"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      const data = await res.json();

      if (res.ok) {
        router.refresh();
      } else {
        alert(data.error || "支付失败");
      }
    } catch {
      alert("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="rounded-lg bg-[#f43f5e] px-6 py-2 text-sm font-medium text-white hover:bg-[#e11d48] disabled:opacity-50 transition-colors"
    >
      {loading ? "支付中..." : "模拟支付"}
    </button>
  );
}
