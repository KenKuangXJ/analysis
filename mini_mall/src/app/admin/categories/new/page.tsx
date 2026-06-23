import { CategoryForm } from "@/components/category/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">新增分类</h1>
      <CategoryForm />
    </div>
  );
}
