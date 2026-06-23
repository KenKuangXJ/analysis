import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const { quantity } = await request.json();

  // 验证归属权
  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true, product: true },
  });

  if (!item || item.cart.userId !== session.user.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  if (quantity > item.product.stock) {
    return NextResponse.json(
      { error: `库存不足，仅剩 ${item.product.stock} 件` },
      { status: 400 }
    );
  }

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== session.user.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  await prisma.cartItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
