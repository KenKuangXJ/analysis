import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
        >
          + 新增商品
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">商品</th>
              <th className="px-6 py-3 text-left">分类</th>
              <th className="px-6 py-3 text-right">价格</th>
              <th className="px-6 py-3 text-right">库存</th>
              <th className="px-6 py-3 text-center">状态</th>
              <th className="px-6 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              let cover: string | null = null;
              try {
                const imgs = JSON.parse(product.images);
                if (imgs.length > 0) cover = imgs[0];
              } catch {}

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {cover ? (
                          <img src={cover} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">图</span>
                        )}
                      </div>
                      <span className="truncate max-w-[200px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-3 text-right font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className={product.stock < 5 ? "text-danger font-medium" : ""}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    {product.isPublished ? (
                      <span className="text-green-600 text-xs">已发布</span>
                    ) : (
                      <span className="text-gray-400 text-xs">草稿</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-primary hover:underline text-xs"
                      >
                        编辑
                      </Link>
                      <DeleteButton
                        id={product.id}
                        name={product.name}
                        apiPath={`/api/products/${product.id}`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
