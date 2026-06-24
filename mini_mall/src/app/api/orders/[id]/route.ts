import { NextResponse } from "next/server";
import { prisma, orderWithItemsInclude } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 状态流转规则
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["CANCELLED"],
  CANCELLED: [],
  // 旧状态兼容（数据迁移过渡期）
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  PROCESSING: ["COMPLETED", "CANCELLED"],
  DELIVERED: ["CANCELLED"],
};

// 旧状态 → 新状态映射（数据迁移）
const STATUS_MIGRATION_MAP: Record<string, string> = {
  CONFIRMED: "PAID",
  PROCESSING: "SHIPPED",
  DELIVERED: "COMPLETED",
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
      ...orderWithItemsInclude,
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

  // 仅查询权限校验所需字段
  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, userId: true },
  });
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  // 规范化旧状态（数据迁移过渡期）
  const currentStatus = STATUS_MIGRATION_MAP[order.status] || order.status;
  const targetStatus = STATUS_MIGRATION_MAP[newStatus] || newStatus;

  const isAdmin = user.role === "ADMIN";
  const isOwner = order.userId === user.id;

  // 权限判断
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  // 非管理员仅允许本人 PENDING→PAID
  const canUpdate = isAdmin || (isOwner && currentStatus === "PENDING" && targetStatus === "PAID");
  if (!canUpdate) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  // 验证状态流转合法性
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    return NextResponse.json(
      { error: `不能从「${currentStatus}」变更为「${targetStatus}」` },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id },
    data: { status: targetStatus },
  });

  return NextResponse.json({ success: true, status: targetStatus });
}
