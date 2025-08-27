/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // appDir is now stable and enabled by default in Next.js 14
    },
    // API configuration moved to individual API routes
    env: {
        // CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
}

module.exports = nextConfig