/** @type {import('next').NextConfig} */
const nextConfig = {
    // Server Actions body size limit (stable in Next.js 15)
    serverExternalPackages: ["pdf-parse"],
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
};

module.exports = nextConfig;
