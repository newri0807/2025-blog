/* eslint-disable @next/next/no-html-link-for-pages */
import {PostCard} from "@/components/post-card";
import {TagFilter} from "@/components/tag-filter";
import {Post} from "@/types/post";

async function getPosts(tag?: string) {
    try {
        const baseUrl = process.env.NODE_ENV === "production" ? "https://your-domain.vercel.app" : "http://localhost:3000";

        const url = tag ? `${baseUrl}/api/posts?tag=${encodeURIComponent(tag)}` : `${baseUrl}/api/posts`;

        const response = await fetch(url, {
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("API 응답 오류:", response.status);
            return [];
        }

        return response.json();
    } catch (error) {
        console.error("게시글 가져오기 실패:", error);
        return [];
    }
}

async function getTags() {
    try {
        const baseUrl = process.env.NODE_ENV === "production" ? "https://your-domain.vercel.app" : "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/tags`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return [];
        }

        return response.json();
    } catch (error) {
        console.error("태그 가져오기 실패:", error);
        return [];
    }
}

export default async function Home({searchParams}: {searchParams: Promise<{tag?: string}>}) {
    const params = await searchParams;
    const selectedTag = params.tag;
    const posts = await getPosts(selectedTag);
    const tags = await getTags();

    return (
        <div className="min-h-screen bg-white dark:bg-dark-bg-custom">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedTag ? `#${selectedTag} 태그 게시글` : "최근 게시글"}</h1>
                {selectedTag && (
                    <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                        전체 보기
                    </a>
                )}
            </div>

            <TagFilter tags={tags} selectedTag={selectedTag} />

            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {selectedTag ? `"${selectedTag}" 태그에 해당하는 게시글이 없습니다.` : "아직 게시글이 없습니다."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {posts.map((post: Post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}
