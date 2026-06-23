import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderStatusUpdater } from "@/components/order/OrderStatusUpdater";
import Link from "next/link";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, images: true, slug: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/admin/orders" className="hover:text-primary">
          订单管理
        </Link>
        <span>/</span>
        <span className="text-gray-600">{order.orderNumber}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            下单时间：{formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* 状态更新 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900 mb-3">更新订单状态</h2>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      {/* 客户信息 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900 mb-3">客户信息</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-gray-500">姓名：</span>
            <span>{order.user?.name || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">邮箱：</span>
            <span>{order.user?.email || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">收货地址：</span>
            <span>{order.shippingAddress || "未填写"}</span>
          </div>
          <div>
            <span className="text-gray-500">备注：</span>
            <span>{order.notes || "无"}</span>
          </div>
        </div>
      </div>

      {/* 商品清单 */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-gray-900">商品清单</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-6">
              <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs text-gray-400">图片</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {item.product?.name || "已下架"}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 金额 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex justify-between text-lg font-bold">
          <span>实付金额</span>
          <span className="text-danger">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
