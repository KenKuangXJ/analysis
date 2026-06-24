import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import Link from "next/link";

export default async function AdminDashboard() {
  const [productCount, orderCount, userCount, totalRevenue, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  const stats = [
    { label: "商品总数", value: String(productCount) },
    { label: "订单总数", value: String(orderCount) },
    { label: "用户总数", value: String(userCount) },
    {
      label: "总营业额",
      value: formatPrice(totalRevenue._sum.totalAmount || 0),
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* 最近订单 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近订单</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-primary hover:underline"
          >
            查看全部
          </Link>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">订单号</th>
                <th className="px-6 py-3 text-left">用户</th>
                <th className="px-6 py-3 text-left">金额</th>
                <th className="px-6 py-3 text-left">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
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
                  <td className="px-6 py-3 font-medium">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    暂无订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
