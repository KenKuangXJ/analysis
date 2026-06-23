import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string;
    category: { name: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">商品图片</span>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400">{product.category.name}</p>
        <h3 className="mt-1 font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
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
  );
}
