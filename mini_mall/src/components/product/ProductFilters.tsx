"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  currentCategory: string;
}

export function ProductFilters({
  categories,
  currentCategory,
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
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string).trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          name="q"
          type="text"
          defaultValue={searchParams.get("q") || ""}
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
