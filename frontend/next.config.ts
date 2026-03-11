import type { NextConfig } from "next";

const DEV_BACKEND_ORIGIN = "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${DEV_BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
