import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/ui/Pagination";

const LIMIT = 9; // 每页 9 条

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || params.q || "";
  const category = params.category || "";
  const currentPage = parseInt(params.page || "1");

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

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * LIMIT,
      take: LIMIT,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">全部商品</h1>

      <Suspense>
        <ProductFilters
          categories={categories}
          currentCategory={category}
        />
      </Suspense>

      <p className="text-sm text-gray-500">
        {search && <span>搜索「{search}」— </span>}
        {category && (
          <span>
            分类「{categories.find((c) => c.slug === category)?.name || category}」—{" "}
          </span>
        )}
        共 {total} 件商品
      </p>

      <ProductGrid products={products} />

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
