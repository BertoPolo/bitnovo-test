/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["payments.pre-bnvo.com"],
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/payment",
      },
    ]
  },
}

module.exports = nextConfig
