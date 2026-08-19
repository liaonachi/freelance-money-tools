'use client'

import { deletePost } from '@/app/admin/posts/actions'

export function DeletePostButton({ id }: { id: number }) {
  return (
    <form action={deletePost.bind(null, id)}>
      <button
        type="submit"
        className="text-red-400 hover:text-red-600 text-xs font-medium"
        onClick={(e) => {
          if (!confirm('確定要刪除這篇文章？')) e.preventDefault()
        }}
      >
        刪除
      </button>
    </form>
  )
}
