"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "待确认" },
  { value: "CONFIRMED", label: "已确认" },
  { value: "PROCESSING", label: "处理中" },
  { value: "SHIPPED", label: "已发货" },
  { value: "DELIVERED", label: "已送达" },
  { value: "CANCELLED", label: "已取消" },
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const updateStatus = async () => {
    if (status === currentStatus) return;
    setLoading(true);

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setLoading(false);

    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={updateStatus}
        disabled={loading || status === currentStatus}
        className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading ? "更新中..." : "更新状态"}
      </button>
    </div>
  );
}
