/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'static.cdn.itsjavi.com', 
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org', 
      },
      {
        protocol: 'https',
        hostname: 'files.catbox.moe',   
      },
      {
        protocol: 'https',
        hostname: 'https://res.cloudinary.com', 
      },
      {
        protocol: 'https',
        hostname: 'uploader.danafxc.my.id', 
      },
    ],
  },
};

export default nextConfig;