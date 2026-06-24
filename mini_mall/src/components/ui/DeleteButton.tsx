"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  name: string;
  apiPath: string;
}

export function DeleteButton({ name, apiPath }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`确定要删除「${name}」吗？此操作不可撤销。`)) return;
    setLoading(true);
    try {
      const res = await fetch(apiPath, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } catch {
      alert("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 text-xs disabled:opacity-40 transition-colors"
    >
      {loading ? "删除中..." : "删除"}
    </button>
  );
}
