import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许 frpc 公网代理访问 dev server
  allowedDevOrigins: ["120.76.140.220", "*.frp-tunnel.com"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
