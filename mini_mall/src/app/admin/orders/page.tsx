import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">订单号</th>
              <th className="px-6 py-3 text-left">用户</th>
              <th className="px-6 py-3 text-right">金额</th>
              <th className="px-6 py-3 text-center">件数</th>
              <th className="px-6 py-3 text-center">状态</th>
              <th className="px-6 py-3 text-right">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-primary hover:underline font-mono text-xs"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {order.user?.name || order.user?.email || "-"}
                </td>
                <td className="px-6 py-3 text-right font-medium">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="px-6 py-3 text-center">{order.items.length}</td>
                <td className="px-6 py-3 text-center">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-6 py-3 text-right text-gray-400 text-xs">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  暂无订单
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
