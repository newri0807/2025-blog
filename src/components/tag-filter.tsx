import Link from 'next/link';

interface Tag {
  id: number;
  name: string;
  count: number;
}

interface TagFilterProps {
  tags: Tag[];
  selectedTag?: string;
}

export function TagFilter({ tags, selectedTag }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        태그별 필터
      </h3>
      <div className="flex flex-wrap gap-2">
        {/* 전체 보기 버튼 */}
        <Link
          href="/"
          className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedTag
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          전체
        </Link>
        
        {/* 태그 버튼들 */}
        {tags.slice(0, 10).map((tag) => (
          <Link
            key={tag.id}
            href={`/?tag=${encodeURIComponent(tag.name)}`}
            className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedTag === tag.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            #{tag.name}
            <span className="ml-1 text-xs opacity-75">
              ({tag.count})
            </span>
          </Link>
        ))}
        
        {tags.length > 10 && (
          <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            +{tags.length - 10}개 더
          </span>
        )}
      </div>
    </div>
  );
}
