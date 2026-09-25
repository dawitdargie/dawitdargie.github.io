import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Inline the (Tailwind) stylesheet into the HTML instead of shipping a
  // render-blocking <link> — first paint no longer waits for a second request.
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;