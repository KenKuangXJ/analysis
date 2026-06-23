import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from "@/types";

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ORDER_STATUS_COLORS[status as OrderStatus] || "bg-gray-100 text-gray-800"
      }`}
    >
      {ORDER_STATUS_LABELS[status as OrderStatus] || status}
    </span>
  );
}
