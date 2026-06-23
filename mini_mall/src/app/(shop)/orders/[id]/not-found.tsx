import Link from "next/link";

export default function OrderNotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold text-gray-900">订单不存在</h1>
      <p className="mt-2 text-gray-500">
        该订单不存在或无权查看。
      </p>
      <Link
        href="/orders"
        className="mt-4 inline-block text-primary hover:underline"
      >
        返回订单列表
      </Link>
    </div>
  );
}
