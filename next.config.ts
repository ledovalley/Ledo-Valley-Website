import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/product-page/:slug*",
        destination: "/shop/:slug*",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/our-tea",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/_api/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
