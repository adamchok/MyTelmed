import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  swcMinify: true,
  cacheOnFrontendNav: true,
  aggressiveFrontEndNavCaching: true,
  cacheStartUrl: true,
  dynamicStartUrl: false,
  fallbacks: {
    document: "/offline",
    image: "/assets/logos/mytelmed-logo.png",
    audio: "/offline",
    video: "/offline",
    font: "/offline",
  },
  workboxOptions: {
    swDest: "public/sw.js",
    additionalManifestEntries: [
      {
        url: "/sw-push.js",
        revision: null,
      },
    ],
    swSrc: "public/sw-push.js", // Include our custom push worker
    runtimeCaching: [
      {
        urlPattern: /^https?.*\.(png|jpe?g|webp|svg|gif|tiff|js|css)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern:
          /^https?:\/\/(?:localhost|[\w-]+\.[\w-]+)(?::\d+)?\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https?.*\/.*$/,
        handler: "NetworkFirst",
        options: {
          cacheName: "general-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
    ],
  },
});

export default withPWA({
  output: "standalone",
  experimental: {
    optimizePackageImports: ["antd", "lucide-react"],
  },
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
});
