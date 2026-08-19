import type zhTW from './zh-TW'

// 母版內建 UI 文案（en）。key 集合必須跟 zh-TW.ts 完全一致（見 __tests__/messages.test.ts）。
// 只約束 key 形狀（Record<keyof typeof zhTW, string>），不能直接用 typeof zhTW——
// zh-TW.ts 用了 as const，每個 value 會是字面字串型別，en 的翻譯文字當然對不上。
const messages: Record<keyof typeof zhTW, string> = {
  'home.toolsHeading': 'Tools',
  'home.blogHeading': 'Blog',
  'home.blogDescription': 'Read our latest articles',

  'tools.pageTitle': 'Tools',
  'tools.faqHeading': 'FAQ',
  'tools.notFound': 'Tool not found.',
  'tools.misconfigured': 'This tool is not configured correctly.',

  'blog.pageTitle': 'Blog',
  'blog.empty': 'Articles coming soon.',
  'blog.backToList': '← Back to all articles',
  'blog.backToTools': 'Back to tools →',
  'blog.updatedAt': ' (Updated: {date})',

  'notFound.title': 'Page not found',
  'notFound.body': 'The page you are looking for does not exist or has been removed.',
  'notFound.cta': 'Back to home',

  'header.menuLabel': 'Menu',
  'footer.quickLinksHeading': 'Quick Links',
  'footer.aboutHeading': 'About',

  'admin.headerTitle': 'Admin',
  'admin.navPosts': 'Posts',
  'admin.navSeo': 'SEO',
  'admin.navFrontend': 'Site',
  'admin.logout': 'Log out',
  'admin.noDbBanner':
    'Supabase is not configured — admin is in read-only demo mode: create/edit/delete will not persist.',
  'admin.loginTitle': 'Admin Login',
  'admin.passwordLabel': 'Password',
  'admin.passwordPlaceholder': 'Enter admin password',
  'admin.loginButton': 'Log in',
  'admin.seoPlaceholder': 'The GSC dashboard is not wired up yet — coming in MVP 5.',

  'about.metaTitle': 'About Us',
  'about.heading': 'About {siteName}',
  'about.whoWeAreHeading': 'Who we are',
  'about.contactHeading': 'Contact us',

  'disclaimer.metaTitle': 'Disclaimer',
  'disclaimer.subtitle': 'Please read this before using the site',
  'disclaimer.referenceOnlyHeading': 'For reference only',
  'disclaimer.referenceOnlyBody':
    "{siteName}'s results are reference estimates based on public data and do not constitute investment, financial, or purchasing advice. Actual results may vary.",
  'disclaimer.affiliateHeading': 'Affiliate disclosure',
  'disclaimer.contactPrefix': 'If you have any questions, please see our',
  'disclaimer.contactLinkText': 'About',
  'disclaimer.contactSuffix': 'page for how to reach us.',
}

export default messages
