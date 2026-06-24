import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatPrice, formatDate, getFirstImage } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PayButton } from "@/components/order/PayButton";
import Link from "next/link";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await auth();

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

  // 只能本人或管理员查看
  if (order.userId !== user?.id && user?.role !== "ADMIN") {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">无权查看此订单</p>
      </div>
    );
  }

  const isOwner = order.userId === user?.id;
  const canPay = isOwner && order.status === "PENDING";

  return (
    <div className="space-y-6">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/orders" className="hover:text-primary transition-colors">
          我的订单
        </Link>
        <span>/</span>
        <span className="text-gray-600">{order.orderNumber}</span>
      </nav>

      {/* 订单头部 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <OrderStatusBadge status={order.status} />
            {canPay && <PayButton orderId={order.id} />}
          </div>
        </div>
      </div>

      {/* 订单商品 */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">商品清单</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => {
            const cover = getFirstImage(item.product?.images);

            return (
              <div key={item.id} className="flex items-center gap-4 p-6">
                <div className="h-16 w-16 shrink-0 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden">
                  {cover ? (
                    <img src={cover} alt={item.product?.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">图片</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.product?.name || "已下架"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 订单摘要 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900 mb-4">订单信息</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>收货地址</span>
            <span>{order.shippingAddress || "未填写"}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>运费</span>
            <span>免运费</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>实付金额</span>
            <span className="text-[#f43f5e]">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
