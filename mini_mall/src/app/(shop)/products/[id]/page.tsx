import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, cn, parseImages } from "@/lib/utils";
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

  // 解析商品图片
  const images = parseImages(product.images);
  const mainImage = images.length > 0 ? images[0] : null;
  const thumbnails = images.length > 1 ? images : [];

  const inStock = product.stock > 0;

  return (
    <div className="space-y-8">
      {/* 面包屑导航 */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-primary transition-colors">
          首页
        </Link>
        <span>/</span>
        <Link
          href={`/?category=${product.category.slug}`}
          className="hover:text-primary transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 商品图片区域 */}
        <div className="space-y-4">
          {/* 主图 */}
          <div className="aspect-square rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-gray-400">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm">暂无商品图片</p>
              </div>
            )}
          </div>

          {/* 缩略图列表 */}
          {thumbnails.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {thumbnails.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square w-20 shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`${product.name} 图片 ${idx + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="space-y-6">
          {/* 分类标签 */}
          <Link
            href={`/?category=${product.category.slug}`}
            className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 hover:bg-primary/20 transition-colors"
          >
            {product.category.name}
          </Link>

          {/* 商品名称 */}
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            {product.name}
          </h1>

          {/* 价格区 */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#f43f5e]">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* 描述 */}
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>

          {/* 库存状态 */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                inStock
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  inStock ? "bg-green-500" : "bg-red-500"
                )}
              />
              {inStock ? `有货（库存 ${product.stock} 件）` : "暂时售罄"}
            </span>
          </div>

          {/* 加入购物车按钮 */}
          {inStock && (
            <AddToCartButton productId={product.id} stock={product.stock} />
          )}
        </div>
      </div>
    </div>
  );
}
