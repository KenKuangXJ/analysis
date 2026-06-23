import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import Link from "next/link";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.isPublished) {
    notFound();
  }

  const images = JSON.parse(product.images) as string[];

  return (
    <div className="space-y-8">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/products" className="hover:text-primary">
          全部商品
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-primary"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 商品图片 */}
        <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">商品图片</span>
        </div>

        {/* 商品信息 */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-400">{product.category.name}</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-danger">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4 text-sm">
            <span
              className={`rounded-full px-3 py-1 ${
                product.stock > 0
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {product.stock > 0 ? `库存 ${product.stock} 件` : "已售罄"}
            </span>
          </div>

          {product.stock > 0 && (
            <AddToCartButton productId={product.id} stock={product.stock} />
          )}
        </div>
      </div>
    </div>
  );
}
