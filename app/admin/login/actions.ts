'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE, constantTimeEqual, getSessionToken } from '@/lib/admin-auth'

export async function loginAction(formData: FormData) {
  const password = formData.get('password')
  const adminPassword = process.env.ADMIN_PASSWORD

  if (
    typeof password !== 'string' ||
    !adminPassword ||
    !constantTimeEqual(password, adminPassword)
  ) {
    redirect('/admin/login?error=1')
  }

  const token = await getSessionToken(Date.now())
  if (!token) {
    redirect('/admin/login?error=1')
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/admin/posts')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  redirect('/admin/login')
}
