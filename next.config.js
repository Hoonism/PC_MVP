/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    
    // Allowed image domains
    domains: [
      'images.unsplash.com',
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com', // GitHub avatars
      'firebasestorage.googleapis.com', // Firebase Storage
    ],
    
    // Remote patterns for more flexible domain matching
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Image sizes for different use cases
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Minimum cache time (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
}

module.exports = nextConfig
