import Link from 'next/link'
import { getSite } from '@/lib/site-config'
import { t } from '@/messages'

export default function Footer() {
  const site = getSite()

  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-bold text-gray-900 mb-2">{site.name}</p>
            <p className="text-sm text-gray-500">{site.description}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">{t('footer.quickLinksHeading')}</p>
            <ul className="space-y-2">
              {site.nav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">{t('footer.aboutHeading')}</p>
            <ul className="space-y-2 mb-4">
              {site.footer.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {site.footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
