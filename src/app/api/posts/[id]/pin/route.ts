import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {db} from "@/lib/db";
import {posts} from "@/lib/schema";
import {eq} from "drizzle-orm";

export async function PUT(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        return NextResponse.json({error: "관리자만 가능"}, {status: 403});
    }

    const {id} = await params; // params를 await로 대기한 후 구조분해할당
    const {isPinned} = await request.json();

    await db
        .update(posts)
        .set({isPinned})
        .where(eq(posts.id, parseInt(id)));

    return NextResponse.json({success: true});
}

export async function PATCH(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        return NextResponse.json({error: "권한이 없습니다."}, {status: 403});
    }

    const {id} = await params;
    const postId = Number(id);
    if (!postId) return NextResponse.json({error: "유효하지 않은 ID"}, {status: 400});

    try {
        // 현재 상태 확인
        const existing = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
            columns: {isPinned: true},
        });

        if (!existing) {
            return NextResponse.json({error: "해당 게시글이 없습니다."}, {status: 404});
        }

        const updated = await db.update(posts).set({isPinned: !existing.isPinned}).where(eq(posts.id, postId)).returning();

        return NextResponse.json(updated[0]);
    } catch (err) {
        console.error("핀 토글 실패:", err);
        return NextResponse.json({error: "핀 변경 실패"}, {status: 500});
    }
}
