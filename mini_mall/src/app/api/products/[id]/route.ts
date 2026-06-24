import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // 优先按 slug 查找，其次按 id（兼容管理后台的 cuid 查询）
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
    },
    include: { category: true },
  });
  if (!product) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }
  return NextResponse.json({
    ...product,
    images: JSON.parse(product.images),
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  const { id } = await params;
  const data = await request.json();
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      images: data.images ? JSON.stringify(data.images) : undefined,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
