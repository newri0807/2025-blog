import {getBaseUrl} from "@/lib/utils";
import {Tag} from "@/types/post";
import Link from "next/link";

// 페이지를 동적으로 설정하여 cache: 'no-store' 사용 가능
export const dynamic = "force-dynamic";

async function getTags() {
    const baseUrl = getBaseUrl();

    try {
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

export default async function TagsPage() {
    const tags = await getTags();

    return (
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">모든 태그</h1>
                <p className="text-gray-600 dark:text-gray-400">태그를 클릭하면 해당 태그의 게시글을 볼 수 있습니다.</p>
            </div>

            {tags.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">아직 태그가 없습니다.</p>
                    <Link
                        href="/posts/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        첫 번째 게시글 작성하기
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tags.map((tag: Tag) => (
                        <Link
                            key={tag.id}
                            href={`/?tag=${encodeURIComponent(tag.name)}`}
                            className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow group"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    #{tag.name}
                                </h3>
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
                                    {tag.count}개 게시글
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
