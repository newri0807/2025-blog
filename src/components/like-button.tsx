"use client";

import {useState, useEffect, useCallback} from "react";
import {Heart} from "lucide-react";

interface LikeButtonProps {
    postId: number;
}

export function LikeButton({postId}: LikeButtonProps) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchLikeStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/likes?postId=${postId}`);
            const data = await response.json();
            setLiked(data.liked);
            setLikeCount(data.count);
        } catch (error) {
            console.error("좋아요 상태 가져오기 실패:", error);
        }
    }, [postId]);

    useEffect(() => {
        fetchLikeStatus();
    }, [fetchLikeStatus]);

    const toggleLike = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const response = await fetch("/api/likes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({postId}),
            });

            const data = await response.json();
            setLiked(data.liked);
            setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
        } catch (error) {
            console.error("좋아요 토글 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleLike}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                liked
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likeCount}</span>
        </button>
    );
}
