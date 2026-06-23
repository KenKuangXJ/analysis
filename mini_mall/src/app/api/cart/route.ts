import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, images: true, stock: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ items: [], totalAmount: 0, itemCount: 0 });
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return NextResponse.json({
    id: cart.id,
    items: cart.items,
    totalAmount,
    itemCount: cart.items.length,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { productId, quantity = 1 } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "商品ID不能为空" }, { status: 400 });
  }

  // 校验库存
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product || !product.isPublished) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  // 获取或创建购物车
  let cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.user.id },
    });
  }

  // 检查已有数量
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  const newTotal = (existing?.quantity || 0) + quantity;
  if (newTotal > product.stock) {
    return NextResponse.json(
      { error: `库存不足，仅剩 ${product.stock} 件` },
      { status: 400 }
    );
  }

  const item = await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: newTotal },
    create: { cartId: cart.id, productId, quantity },
  });

  return NextResponse.json(item, { status: 201 });
}
