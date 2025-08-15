"use client";

import {useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {hasPendingUploads, RichTextEditor} from "./rich-text-editor";
import {TagInput} from "./tag-input";

interface Post {
    id?: number;
    title: string;
    content: string;
    excerpt: string;
    tags?: string[];
}

interface PostFormProps {
    post?: Post;
    isEdit?: boolean;
}

export function PostForm({post, isEdit = false}: PostFormProps) {
    const [formData, setFormData] = useState({
        title: post?.title || "",
        content: post?.content || "",
        excerpt: post?.excerpt || "",
        tags: post?.tags || [],
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorRef = useRef<any>(null); // CKEditor ref

    const generateExcerpt = (htmlContent: string): string => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;

        const firstParagraph = tempDiv.querySelector("p");
        if (firstParagraph) {
            const text = firstParagraph.textContent || "";
            return text.trim();
        }

        // fallback: 전체 텍스트 중 앞부분 150자
        const textContent = tempDiv.textContent || "";
        return textContent.trim().substring(0, 150);
    };

    const handleContentChange = (content: string) => {
        setFormData((prev) => ({
            ...prev,
            content,
            excerpt: generateExcerpt(content),
        }));
    };

    const isContentEmpty = (html: string): boolean => {
        const temp = document.createElement("div");
        temp.innerHTML = html;

        const text = temp.textContent?.replace(/\u00A0/g, "").trim() ?? "";
        const hasText = text.length > 0;
        const hasImage = !!temp.querySelector("img") || !!temp.querySelector("figure.image");

        return !(hasText || hasImage); // 텍스트도 없고 이미지도 없으면 true → "빈 콘텐츠"
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 👇 업로드 중인 이미지 확인
        if (editorRef.current && hasPendingUploads(editorRef.current.editor)) {
            alert("이미지 업로드가 완료될 때까지 기다려주세요.");
            return;
        }

        if (!formData.title.trim() || isContentEmpty(formData.content)) {
            alert("제목과 내용을 입력하거나 이미지를 추가해주세요.");
            return;
        }
        setLoading(true);

        try {
            const finalFormData = {
                ...formData,
                excerpt: formData.excerpt || generateExcerpt(formData.content),
            };

            const url = isEdit ? `/api/posts/${post?.id}` : "/api/posts";
            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(finalFormData),
            });

            if (response.ok) {
                const result = await response.json();
                router.push(`/posts/${result.id}`);
            } else {
                const error = await response.json();
                alert(error.error || "저장에 실패했습니다.");
            }
        } catch (error) {
            console.error("저장 실패:", error);
            alert("저장에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!post?.id) return;
        if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

        setLoading(true);

        try {
            const res = await fetch(`/api/posts/${post.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/");
            } else {
                const data = await res.json();
                alert(data.error || "삭제에 실패했습니다.");
            }
        } catch (err) {
            console.error("삭제 실패:", err);
            alert("삭제에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                        제목 *
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="게시글 제목을 입력하세요..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">태그</label>
                    <TagInput
                        value={formData.tags}
                        onChange={(tags) => setFormData({...formData, tags})}
                        placeholder="태그를 입력하세요... (Enter로 추가)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formData.tags.length}/10개 태그</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">내용 *</label>
                    <RichTextEditor
                        value={formData.content}
                        onChange={handleContentChange}
                        editorRef={editorRef}
                        placeholder="게시글 내용을 입력하세요..."
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                저장중...
                            </span>
                        ) : isEdit ? (
                            "수정하기"
                        ) : (
                            "게시하기"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        취소
                    </button>

                    {isEdit && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="ml-auto px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            삭제하기
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
