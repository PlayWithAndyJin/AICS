/** @type {import('next').NextConfig} */
const nextConfig = {

  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://api.andyjin.website/api/auth/:path*'
      }
    ]
  }
}

module.exports = nextConfig 
