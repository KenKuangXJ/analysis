"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 各状态下可执行的快捷操作
const QUICK_ACTIONS: Record<string, { label: string; nextStatus: string; className: string }[]> = {
  PENDING: [{ label: "支付", nextStatus: "PAID", className: "bg-blue-100 text-blue-700 hover:bg-blue-200" }],
  PAID: [{ label: "发货", nextStatus: "SHIPPED", className: "bg-blue-100 text-blue-700 hover:bg-blue-200" }],
  SHIPPED: [{ label: "完成", nextStatus: "COMPLETED", className: "bg-green-100 text-green-700 hover:bg-green-200" }],
  COMPLETED: [],
  CANCELLED: [],
};

// 所有非终态都支持取消
function getActions(status: string) {
  const actions = [...(QUICK_ACTIONS[status] || [])];
  if (["PENDING", "PAID", "SHIPPED", "COMPLETED"].includes(status)) {
    actions.push({
      label: "取消",
      nextStatus: "CANCELLED",
      className: "bg-red-50 text-red-600 hover:bg-red-100",
    });
  }
  return actions;
}

export function OrderActionButtons({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (nextStatus: string) => {
    setLoading(nextStatus);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "操作失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setLoading(null);
    }
  };

  const actions = getActions(currentStatus);
  if (actions.length === 0) return <span className="text-gray-400 text-xs">-</span>;

  return (
    <div className="flex items-center justify-center gap-1">
      {actions.map((action) => (
        <button
          key={action.nextStatus}
          onClick={() => handleAction(action.nextStatus)}
          disabled={loading !== null}
          className={`rounded px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-40 ${action.className}`}
        >
          {loading === action.nextStatus ? "..." : action.label}
        </button>
      ))}
    </div>
  );
}
