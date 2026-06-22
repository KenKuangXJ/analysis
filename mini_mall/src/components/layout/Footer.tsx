export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Mini Mall. 学习项目，仅供演示。
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <span>关于我们</span>
            <span>帮助中心</span>
            <span>隐私政策</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
