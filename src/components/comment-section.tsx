"use client";

import {useState, useEffect, useCallback} from "react";
import {Send, Edit2, Trash2, Check, X} from "lucide-react";

interface Comment {
    id: number;
    authorName: string;
    content: string;
    createdAt: string;
}

interface CommentSectionProps {
    postId: number;
}

export function CommentSection({postId}: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState({
        authorName: "",
        content: "",
        password: "",
    });
    const [editingComment, setEditingComment] = useState<{
        id: number;
        content: string;
        password: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        try {
            const response = await fetch(`/api/comments?postId=${postId}`);
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error("댓글 가져오기 실패:", error);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [postId, fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.authorName.trim() || !newComment.content.trim() || !newComment.password.trim()) {
            alert("이름, 댓글 내용, 비밀번호를 모두 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postId,
                    authorName: newComment.authorName,
                    content: newComment.content,
                    password: newComment.password,
                }),
            });

            if (response.ok) {
                setNewComment({authorName: "", content: "", password: ""});
                fetchComments();
            } else {
                const error = await response.json();
                alert(error.error || "댓글 작성에 실패했습니다.");
            }
        } catch (error) {
            console.error("댓글 작성 실패:", error);
            alert("댓글 작성에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (commentId: number) => {
        if (!editingComment?.content.trim() || !editingComment?.password.trim()) {
            alert("댓글 내용과 비밀번호를 입력해주세요.");
            return;
        }

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: editingComment.content,
                    password: editingComment.password,
                }),
            });

            if (response.ok) {
                setEditingComment(null);
                fetchComments();
            } else {
                const error = await response.json();
                alert(error.error || "댓글 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("댓글 수정 실패:", error);
            alert("댓글 수정에 실패했습니다.");
        }
    };

    const handleDelete = async (commentId: number) => {
        const password = prompt("댓글 비밀번호를 입력하세요:");
        if (!password) return;

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({password}),
            });

            if (response.ok) {
                fetchComments();
            } else {
                const error = await response.json();
                alert(error.error || "댓글 삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("댓글 삭제 실패:", error);
            alert("댓글 삭제에 실패했습니다.");
        }
    };

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">댓글 ({comments.length})</h3>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="이름"
                        value={newComment.authorName}
                        onChange={(e) => setNewComment({...newComment, authorName: e.target.value})}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={newComment.password}
                        onChange={(e) => setNewComment({...newComment, password: e.target.value})}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div className="flex gap-2">
                    <textarea
                        placeholder="댓글을 입력하세요..."
                        value={newComment.content}
                        onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        <Send className="w-4 h-4" />
                        {loading ? "작성중..." : "작성"}
                    </button>
                </div>
            </form>

            {/* 댓글 목록 */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">첫 번째 댓글을 작성해보세요!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">{comment.authorName}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setEditingComment({
                                                id: comment.id,
                                                content: comment.content,
                                                password: "",
                                            })
                                        }
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                        title="수정"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {editingComment?.id === comment.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={editingComment.content}
                                        onChange={(e) =>
                                            setEditingComment({
                                                ...editingComment,
                                                content: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            placeholder="비밀번호"
                                            value={editingComment.password}
                                            onChange={(e) =>
                                                setEditingComment({
                                                    ...editingComment,
                                                    password: e.target.value,
                                                })
                                            }
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            onClick={() => handleEdit(comment.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                                        >
                                            <Check className="w-3 h-3" />
                                            저장
                                        </button>
                                        <button
                                            onClick={() => setEditingComment(null)}
                                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
                                        >
                                            <X className="w-3 h-3" />
                                            취소
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
