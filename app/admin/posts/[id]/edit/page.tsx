import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostForm } from '@/components/admin/PostForm'
import { createSupabaseServiceClient } from '@/lib/supabase-server'
import { updatePost } from '../../actions'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = parseInt(id, 10)

  if (isNaN(numericId)) notFound()

  const supabase = createSupabaseServiceClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', numericId)
    .single()

  if (!post) notFound()

  const action = updatePost.bind(null, numericId)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/posts" className="text-gray-400 hover:text-gray-600 text-sm">
          ← 返回列表
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">編輯文章</h1>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <PostForm initialValues={post} action={action} />
      </div>
    </div>
  )
}
