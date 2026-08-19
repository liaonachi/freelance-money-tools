'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServiceClient } from '@/lib/supabase-server'
import { ADMIN_COOKIE, validateSession } from '@/lib/admin-auth'

async function requireAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_COOKIE)?.value
  if (!(await validateSession(session))) {
    redirect('/admin/login')
  }
}

export async function createPost(formData: FormData) {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const status = formData.get('status') as 'draft' | 'published'

  await supabase.from('blog_posts').insert({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    excerpt: (formData.get('excerpt') as string) || null,
    content: formData.get('content') as string,
    cover_image: null,
    status,
    published_at: status === 'published' ? new Date().toISOString() : null,
    faq_jsonld: null,
  })

  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  redirect('/admin/posts')
}

export async function updatePost(id: number, formData: FormData) {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const status = formData.get('status') as 'draft' | 'published'

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('status, published_at, slug')
    .eq('id', id)
    .single()

  const published_at =
    status === 'published' && existing?.status !== 'published'
      ? new Date().toISOString()
      : status === 'published'
      ? (existing?.published_at ?? new Date().toISOString())
      : null

  await supabase
    .from('blog_posts')
    .update({
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      excerpt: (formData.get('excerpt') as string) || null,
      content: formData.get('content') as string,
      status,
      published_at,
    })
    .eq('id', id)

  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  redirect('/admin/posts')
}

export async function deletePost(id: number, _formData: FormData) {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('id', id)
    .single()

  await supabase.from('blog_posts').delete().eq('id', id)

  if (data?.slug) revalidatePath(`/blog/${data.slug}`)
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  redirect('/admin/posts')
}

export async function togglePublish(id: number, currentStatus: string, _formData: FormData) {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const newStatus = currentStatus === 'published' ? 'draft' : 'published'

  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('id', id)
    .single()

  await supabase
    .from('blog_posts')
    .update({
      status: newStatus as 'draft' | 'published',
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (data?.slug) revalidatePath(`/blog/${data.slug}`)
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')
  redirect('/admin/posts')
}
