import {PostForm} from "@/components/post-form";
import {AdminGuard} from "@/components/admin-guard";
import {notFound} from "next/navigation";
import { getBaseUrl } from '@/lib/utils';

async function getPost(id: string) {
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/api/posts/${id}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    return response.json();
}

export default async function EditPost({params}: {params: Promise<{id: string}>}) {
    const {id} = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    return (
        <AdminGuard>
            <div className="bg-white dark:bg-gray-900">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">글 수정</h1>
                <PostForm post={post} isEdit={true} />
            </div>
        </AdminGuard>
    );
}
