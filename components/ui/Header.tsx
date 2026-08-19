'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSite } from '@/lib/site-config'
import { t } from '@/messages'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const site = getSite()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-900 text-base">
          {site.name}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {site.nav.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden text-gray-600 hover:text-gray-900 text-lg leading-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t('header.menuLabel')}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
          {site.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-gray-700 hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
