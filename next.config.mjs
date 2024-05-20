// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/steam/:path*",
        destination: "https://store.steampowered.com/:path*", // Proxy to external URL
      },
    ];
  },
};

export default nextConfig;
