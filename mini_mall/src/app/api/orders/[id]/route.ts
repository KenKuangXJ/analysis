import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 状态流转规则
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["CANCELLED"],
  CANCELLED: [],
};

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
  if (!user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const { status: newStatus } = await request.json();

  // 获取当前订单
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  const isAdmin = user.role === "ADMIN";
  const isOwner = order.userId === user.id;

  // 权限判断
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  // 模拟支付：仅订单本人可操作 PENDING → PAID
  if (!isAdmin && order.status === "PENDING" && newStatus === "PAID") {
    // 允许
  } else if (!isAdmin) {
    // 非管理员只能做 模拟支付
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  // 验证状态流转合法性
  const allowed = ALLOWED_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `不能从「${order.status}」变更为「${newStatus}」` },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: newStatus },
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

  return NextResponse.json(updated);
}
