import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: Date | string;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: { name: string; slug: string } | null;
    }>;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </p>
          <p className="text-sm text-gray-600">
            {order.items.map((item) => item.product?.name || "已下架").join("、")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(order.totalAmount)}
          </p>
          <p className="text-sm text-gray-400">{order.items.length} 件商品</p>
        </div>
      </div>
    </Link>
  );
}
