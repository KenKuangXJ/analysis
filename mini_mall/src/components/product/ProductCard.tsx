import Link from "next/link";
import { formatPrice, getFirstImage } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string;
    category: { name: string; slug: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const coverImage = getFirstImage(product.images);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* 商品图片 */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <svg
            className="h-12 w-12 text-gray-300"
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
        )}
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        {/* 分类标签 */}
        <p className="text-xs text-gray-400">{product.category.name}</p>

        {/* 商品名称 */}
        <h3 className="mt-1 font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* 价格 */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-[#f43f5e]">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
