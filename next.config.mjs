/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hnaptwk79kknvilx.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;


  