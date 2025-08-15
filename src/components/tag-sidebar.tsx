"use client";

import {useState, useEffect, useMemo, useCallback} from "react";
import Link from "next/link";
import {Search, Tag} from "lucide-react";

interface TagData {
    id: number;
    name: string;
    count: number;
}

export function TagSidebar() {
    const [tags, setTags] = useState<TagData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const filteredTags = useMemo(() => {
        if (!searchTerm.trim()) return tags;
        return tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [tags, searchTerm]);

    const fetchTags = useCallback(async () => {
        try {
            const response = await fetch("/api/tags", {
                cache: "no-store",
                headers: {"Cache-Control": "no-store"},
            });
            const data = await response.json();
            setTags(data);
        } catch (error) {
            console.error("태그 가져오기 실패:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleFocus = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fetchTags();
            }, 100);
        };

        window.addEventListener("focus", handleFocus);
        return () => {
            window.removeEventListener("focus", handleFocus);
            clearTimeout(timeoutId);
        };
    }, [fetchTags]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="space-y-2">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                태그 목록
            </h3>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="태그 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                        <Link
                            key={tag.id}
                            href={`/?tag=${encodeURIComponent(tag.name)}`}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                            <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                #{tag.name}
                            </span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                                {tag.count}
                            </span>
                        </Link>
                    ))
                ) : searchTerm ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">&quot;{searchTerm}&quot;에 해당하는 태그가 없습니다.</p>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">아직 태그가 없습니다.</p>
                )}
            </div>

            {tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">총 {tags.length}개의 태그</p>
                </div>
            )}
        </div>
    );
}
