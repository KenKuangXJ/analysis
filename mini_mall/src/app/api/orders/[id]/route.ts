import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await auth();
  if (!user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

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

  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  // 只有订单本人或管理员可查看
  if (order.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "无权查看" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await auth();
  // 仅管理员可修改订单状态
  if (!user?.id || user.role !== "ADMIN") {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "无效的订单状态" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, images: true, slug: true },
          },
        },
      },
    },
  });

  return NextResponse.json(order);
}
