import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/ui/Pagination";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { category, q, page: pageStr } = await searchParams;
  const currentPage = parseInt(pageStr || "1");
  const limit = 12;

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

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">全部商品</h1>

      <Suspense>
        <ProductFilters
          categories={categories}
          currentCategory={category || ""}
        />
      </Suspense>

      <p className="text-sm text-gray-500">
        {q && <span>搜索「{q}」— </span>}
        共 {total} 件商品
      </p>

      <ProductGrid products={products} />

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
