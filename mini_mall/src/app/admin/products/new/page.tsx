import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/product/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">新增商品</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
