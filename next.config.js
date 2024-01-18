/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "payments.pre-bnvo.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/payment",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
