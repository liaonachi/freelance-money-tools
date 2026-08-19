import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, validateSession } from '@/lib/admin-auth'

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }
  const session = request.cookies.get(ADMIN_COOKIE)?.value
  if (!(await validateSession(session))) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
