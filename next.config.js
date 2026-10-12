/** @type {import('next').NextConfig} */
const nextConfig = {
  // Old blog addresses that now point to a newer or merged article.
  // "permanent: true" tells Google the page has moved for good.
  async redirects() {
    return [
      {
        source: '/blog/why-every-city-needs-a-strong-private-hire-fleet',
        destination: '/blog/why-every-city-needs-a-strong-taxi-and-private-hire-fleet',
        permanent: true,
      },
      {
        source: '/blog/making-tax-digital-mtd-is-coming-this-april',
        destination: '/blog/making-tax-digital-mtd-for-taxi-drivers-in-the-uk-what-you-need-to-know',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
