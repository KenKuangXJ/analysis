import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";

const LIMIT = 9; // 每页 9 条

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    q?: string;
    page?: string;
  }>;
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

  // 并行查询：商品列表 + 总数 + 分类列表
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
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Mini Mall</h1>
        <p className="mt-2 text-gray-500">发现精选好物，畅享便捷购物体验</p>
      </div>

      {/* 搜索 + 分类筛选 */}
      <Suspense>
        <ProductFilters
          categories={categories}
          currentCategory={category}
          basePath="/"
        />
      </Suspense>

      {/* 结果统计 */}
      <p className="text-sm text-gray-500">
        {search && <span>搜索「{search}」— </span>}
        {category && (
          <span>
            分类「{categories.find((c) => c.slug === category)?.name || category}」—{" "}
          </span>
        )}
        共 {total} 件商品
      </p>

      {/* 商品网格 */}
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">暂无符合条件的商品</p>
          <Link
            href="/"
            className="mt-2 inline-block text-primary hover:underline text-sm"
          >
            清除筛选条件
          </Link>
        </div>
      )}

      {/* 分页 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/"
      />
    </div>
  );
}
