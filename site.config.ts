import type { SiteConfig } from '@/lib/site-config'

const site: SiteConfig = {
  name: "Freelance Money Tools",
  description: "Free calculators for freelancers: hourly rate, late fees, tax set-aside.",
  url: "https://freelance-money-tools.vercel.app",
  locale: "en",
  currency: "USD",
  timezone: "America/New_York",
  ga4Id: "",
  theme: { primary: "#0f766e" },
  nav: [
    { label: "Tools", href: "/tools" },
    { label: "Blog", href: "/blog" },
  ],
  footer: {
    links: [
      { label: "About", href: "/about" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
    copyright: "Freelance Money Tools",
  },
  seo: {
    titleTemplate: "%s | Freelance Money Tools",
    defaultOgImage: '',
  },
}

export default site
