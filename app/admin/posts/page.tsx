import Link from 'next/link'
import { createSupabaseServiceClient } from '@/lib/supabase-server'
import { togglePublish } from './actions'
import { DeletePostButton } from '@/components/admin/DeletePostButton'
import { formatDate } from '@/lib/date'

export default async function AdminPostsPage() {
  const supabase = createSupabaseServiceClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 transition-colors"
        >
          ＋ 新增文章
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">標題</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">狀態</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">發布日期</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{post.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {post.status === 'published' ? '已發布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {post.published_at ? formatDate(post.published_at) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-primary hover:opacity-80 text-xs font-medium"
                      >
                        編輯
                      </Link>
                      <form action={togglePublish.bind(null, post.id, post.status)}>
                        <button
                          type="submit"
                          className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                        >
                          {post.status === 'published' ? '取消發布' : '發布'}
                        </button>
                      </form>
                      <DeletePostButton id={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-4">還沒有文章</p>
          <Link href="/admin/posts/new" className="text-primary hover:opacity-80 font-medium text-sm">
            建立第一篇文章 →
          </Link>
        </div>
      )}
    </div>
  )
}
