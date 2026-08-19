import Link from 'next/link'
import { PostForm } from '@/components/admin/PostForm'
import { createPost } from '../actions'

export default function NewPostPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/posts" className="text-gray-400 hover:text-gray-600 text-sm">
          ← 返回列表
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新增文章</h1>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <PostForm action={createPost} />
      </div>
    </div>
  )
}
