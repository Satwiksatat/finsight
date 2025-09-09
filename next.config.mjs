// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable type checking and linting during build for Docker
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add your image optimization domains here.
  // This is crucial for next/image to correctly optimize external images.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Example: for the mock image API provided earlier
        port: '',
        pathname: '/id/**',
      },
      // Add other external image domains here if your LLM generates image URLs from them.
      // For example:
      // {
      //   protocol: 'https',
      //   hostname: 'example-cdn.com',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'another-image-source.com',
      // },
    ],
  },
  // Add any other Next.js configurations here as needed
  // For example:
  // experimental: {
  //   serverActions: true,
  // },
};

export default nextConfig;