import { CommentSection } from '@/components/comment-section';
import { LikeButton } from '@/components/like-button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getPost(id: string) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.vercel.app' 
    : 'http://localhost:3000';
    
  const response = await fetch(`${baseUrl}/api/posts/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
}

export default async function PostDetail({ params }: { params: { id: string } }) {
  const { id } = await params;
  const post = await getPost(id);


  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900">
      <article>
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {post.title}
            </h1>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string, index: number) => (
                  <Link
                    key={index}
                    href={`/?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              <span>
                {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {post.updatedAt !== post.createdAt && (
                <span className="text-sm">
                  (수정됨: {new Date(post.updatedAt).toLocaleDateString('ko-KR')})
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            <Link
              href={`/posts/edit/${post.id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              수정
            </Link>
            <LikeButton postId={post.id} />
          </div>
        </div>
        
        <div className="prose dark:prose-invert max-w-none mb-12 prose-lg">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="ck-content text-gray-900 dark:text-gray-100"
          />
        </div>

        <CommentSection postId={post.id} />
      </article>
    </div>
  );
}

