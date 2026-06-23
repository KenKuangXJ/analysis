"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-300">500</h1>
        <h2 className="text-xl font-semibold text-gray-900">出了点问题</h2>
        <p className="text-gray-500">抱歉，页面加载出错了。请稍后再试。</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
          >
            重试
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
