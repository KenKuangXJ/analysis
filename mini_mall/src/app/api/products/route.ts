import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const sort = searchParams.get("sort") || "newest";

  const where = {
    isPublished: true,
    ...(category && { category: { slug: category } }),
    ...(q && {
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
      ],
    }),
  };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "name") orderBy = { name: "asc" };

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
