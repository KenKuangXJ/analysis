import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q) {
    return NextResponse.json([]);
  }

  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
      ],
    },
    include: { category: true },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
