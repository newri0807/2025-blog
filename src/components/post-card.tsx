import { Pin } from 'lucide-react'; 
import Link from 'next/link';
import { LikeButton } from './like-button';
import { PinToggleButton } from './pinToggle-button';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  tags?: string[];
  createdAt: string;
  isPinned?: boolean; 
}

interface PostCardProps {
  post: Post;
}

function stripHtmlTags(html: string): string {
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  return html.replace(/<[^>]*>/g, '');
}

export function PostCard({ post }: PostCardProps) {
  const displayExcerpt = post.excerpt ||
    stripHtmlTags(post.content).substring(0, 150) + '...';

  // 고정된 글일 경우 강조 스타일 적용
  const containerClass = `
    relative border rounded-lg p-6 transition-all duration-200
    ${post.isPinned
      ? 'bg-grey-40 dark:bg-grey-900 border-grey-400 dark:border-grey-500 shadow-md '
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'}
  `;

  return (
    <div className={containerClass}>
      {/* 고정된 글에 핀 토글 버튼 */}
      <div className="absolute top-3 right-3 text-blue-500">
        <PinToggleButton postId={post.id} isPinned={post.isPinned ?? false} />
      </div>

      <Link href={`/posts/${post.id}`}>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
          {post.title}
        </h2>
      </Link>

      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {displayExcerpt}
      </p>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag, index) => (
            <Link
              key={index}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              #{tag}
            </Link>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              +{post.tags.length - 3}개 더
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(post.createdAt).toLocaleDateString('ko-KR')}
        </span>
        {typeof post.id === 'number' && <LikeButton postId={post.id} />}
      </div>
    </div>
  );
}

