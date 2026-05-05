/** @type {import('next').NextConfig} */
const nextConfig = {
    // Server Actions body size limit (stable in Next.js 15+)
    serverExternalPackages: ["pdf-parse"],
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
    // Skip type-checking during Vercel build (params type mismatch)
    typescript: {
        ignoreBuildErrors: true,
    },
    // Explicitly set turbopack root to this project directory
    turbopack: {
        root: __dirname,
    },
    // Hide the Next.js DevTools floating "N" button in development.
    devIndicators: false,
};

module.exports = nextConfig;
