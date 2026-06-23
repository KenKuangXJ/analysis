import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { shippingAddress } = await request.json();

  // 获取购物车
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "购物车为空" }, { status: 400 });
  }

  // 校验库存
  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      return NextResponse.json(
        { error: `${item.product.name} 库存不足，仅剩 ${item.product.stock} 件` },
        { status: 400 }
      );
    }
  }

  // 计算总金额并创建订单
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    // 创建订单
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        totalAmount,
        shippingAddress: shippingAddress || "",
        userId: session.user.id,
        status: "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // 下单时价格快照
          })),
        },
      },
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

    // 扣减库存
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 清空购物车
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return newOrder;
  });

  return NextResponse.json(order, { status: 201 });
}
