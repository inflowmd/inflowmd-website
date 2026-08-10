import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Inline compiled CSS into the HTML instead of serving it as
     * render-blocking <link> requests. Lighthouse measured those two
     * stylesheets at ~450–600ms of FCP/LCP delay on throttled mobile.
     * Trade-off: slightly larger HTML, no cross-page CSS caching — the right
     * side of the trade for a marketing site this size.
     */
    inlineCss: true,
  },
  async redirects() {
    return [
      {
        // The booth audit tool moved; keep previously shared links working.
        source: "/booth",
        destination: "/audit",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        // Private audit page — must not be edge-cached.
        source: "/prevosti",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
