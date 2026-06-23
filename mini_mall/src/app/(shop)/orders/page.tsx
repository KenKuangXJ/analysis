import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { OrderCard } from "@/components/order/OrderCard";

export default async function OrdersPage() {
  const user = await auth();
  const userId = user?.id;

  if (!userId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">请先登录</p>
        <Link href="/auth/login" className="mt-2 text-primary hover:underline">
          去登录
        </Link>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">暂无订单</p>
          <Link
            href="/products"
            className="mt-2 inline-block text-primary hover:underline"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
