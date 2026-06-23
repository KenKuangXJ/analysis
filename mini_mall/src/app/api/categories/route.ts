import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { name, slug, description } = await request.json();
  if (!name || !slug) {
    return NextResponse.json({ error: "名称和缩略名不能为空" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { name, slug, description },
  });
  return NextResponse.json(category, { status: 201 });
}
