import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <h2 className="text-xl font-semibold text-gray-900">页面不存在</h2>
        <p className="text-gray-500">
          你访问的页面可能已被移除或地址输入有误。
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
