import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 9; // 每页 9 条

  const where = {
    isPublished: true,
    ...(category && { category: { slug: category } }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  };

  const orderBy: any = { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const data = await request.json();
  if (!data.name || !data.slug || !data.price || !data.categoryId) {
    return NextResponse.json(
      { error: "名称、缩略名、价格和分类不能为空" },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      images: JSON.stringify(data.images || ["/images/placeholder.svg"]),
    },
  });
  return NextResponse.json(product, { status: 201 });
}
