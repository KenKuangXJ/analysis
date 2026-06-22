import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    include: { category: true },
    take: 4,
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-12">
      {/* 头部 */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">欢迎来到 Mini Mall</h1>
        <p className="mt-3 text-lg text-gray-500">
          微型电商平台，发现精选好物
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary-dark transition-colors"
        >
          浏览全部商品
        </Link>
      </section>

      {/* 分类展示 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900">商品分类</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="rounded-lg border border-gray-200 bg-white p-4 text-center hover:border-primary hover:shadow-sm transition-all"
            >
              <p className="font-medium text-gray-900">{category.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 精选商品 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900">精选商品</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">商品图片</span>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-400">{product.category.name}</p>
                <h3 className="mt-1 font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-bold text-danger">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
