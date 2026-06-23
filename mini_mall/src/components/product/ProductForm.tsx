"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number;
  stock: number;
  isFeatured: boolean;
  isPublished: boolean;
  categoryId: string;
}

interface ProductFormProps {
  initialData?: ProductData & { id: string };
  categories: Category[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    comparePrice: initialData?.comparePrice || 0,
    stock: initialData?.stock || 0,
    isFeatured: initialData?.isFeatured || false,
    isPublished: initialData?.isPublished ?? true,
    categoryId: initialData?.categoryId || categories[0]?.id || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = initialData
      ? `/api/products/${initialData.id}`
      : "/api/products";
    const method = initialData ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "操作失败");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="name"
          name="name"
          label="商品名称"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          id="slug"
          name="slug"
          label="URL 缩略名"
          value={form.slug}
          onChange={handleChange}
          required
          placeholder="product-slug-example"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          id="price"
          name="price"
          label="价格 (¥)"
          type="number"
          step="0.01"
          value={String(form.price)}
          onChange={handleChange}
          required
        />
        <Input
          id="comparePrice"
          name="comparePrice"
          label="原价 (¥)"
          type="number"
          step="0.01"
          value={String(form.comparePrice)}
          onChange={handleChange}
        />
        <Input
          id="stock"
          name="stock"
          label="库存"
          type="number"
          value={String(form.stock)}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分类
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-6 pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            已发布
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            精选商品
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : initialData ? "更新商品" : "创建商品"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
