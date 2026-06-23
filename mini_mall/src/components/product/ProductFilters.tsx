"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  currentCategory: string;
  basePath?: string; // 支持首页用 "/"，商品列表页用 "/products"
}

export function ProductFilters({
  categories,
  currentCategory,
  basePath = "/products",
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = (formData.get("search") as string).trim();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          name="search"
          type="text"
          defaultValue={searchParams.get("search") || searchParams.get("q") || ""}
          placeholder="搜索商品..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark transition-colors"
        >
          搜索
        </button>
      </form>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange("")}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            !currentCategory
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              currentCategory === cat.slug
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
