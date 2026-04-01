import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "149.102.155.247",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "gpu.js": path.resolve(__dirname, "lib/empty.js"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "gpu.js": "./lib/empty.js",
    },
  },
};

export default nextConfig;
