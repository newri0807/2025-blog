import { PostForm } from '@/components/post-form';
import { AdminGuard } from '@/components/admin-guard';

export default function CreatePost() {
  return (
    <AdminGuard>
      <div className="bg-white dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">새 글 작성</h1>
        <PostForm />
      </div>
    </AdminGuard>
  );
}
