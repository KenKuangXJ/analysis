"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CategoryFormProps {
  initialData?: { id: string; name: string; slug: string; description: string };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = initialData
      ? `/api/categories/${initialData.id}`
      : "/api/categories";
    const method = initialData ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/categories");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "操作失败");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Input
        id="name"
        name="name"
        label="分类名称"
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
        placeholder="category-slug"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : initialData ? "更新分类" : "创建分类"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/categories")}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
