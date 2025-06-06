/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/shift-management-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/shift-management-app' : '',
};
export default nextConfig;
