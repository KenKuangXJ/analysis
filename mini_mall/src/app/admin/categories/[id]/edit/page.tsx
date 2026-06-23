import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/category/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">编辑分类</h1>
      <CategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || "",
        }}
      />
    </div>
  );
}
