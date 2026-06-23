import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold text-gray-900">商品不存在</h1>
      <p className="mt-2 text-gray-500">
        该商品可能已下架或不存在。
      </p>
      <Link
        href="/products"
        className="mt-4 inline-block text-primary hover:underline"
      >
        浏览其他商品
      </Link>
    </div>
  );
}
