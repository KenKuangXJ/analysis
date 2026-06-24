import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
        >
          + 新增分类
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">名称</th>
              <th className="px-6 py-3 text-left">缩略名</th>
              <th className="px-6 py-3 text-left">描述</th>
              <th className="px-6 py-3 text-center">商品数</th>
              <th className="px-6 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {cat.name}
                </td>
                <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                  {cat.slug}
                </td>
                <td className="px-6 py-3 text-gray-500 text-xs max-w-xs truncate">
                  {cat.description || "-"}
                </td>
                <td className="px-6 py-3 text-center">
                  {cat._count.products}
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/categories/${cat.id}/edit`}
                      className="text-primary hover:underline text-xs"
                    >
                      编辑
                    </Link>
                    <DeleteButton
                      id={cat.id}
                      name={cat.name}
                      apiPath={`/api/categories/${cat.id}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
