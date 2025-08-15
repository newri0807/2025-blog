import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {db} from "@/lib/db";
import {posts, tags} from "@/lib/schema";
import {eq, sql} from "drizzle-orm";

export async function GET(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {
        const {id} = await params;
        const post = await db
            .select()
            .from(posts)
            .where(eq(posts.id, parseInt(id)))
            .limit(1);

        if (post.length === 0) {
            return NextResponse.json({error: "Post not found"}, {status: 404});
        }

        return NextResponse.json(post[0]);
    } catch (error) {
        console.error("게시글 조회 실패:", error);
        return NextResponse.json({error: "Failed to fetch post"}, {status: 500});
    }
}

export async function PUT(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {
        // 세션 확인 (관리자 권한 체크)
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({error: "관리자 권한이 필요합니다."}, {status: 403});
        }

        const {id} = await params;
        const {title, content, excerpt, tags: postTags} = await request.json();

        // 기존 게시글 가져오기 (태그 업데이트를 위해)
        const existingPost = await db
            .select()
            .from(posts)
            .where(eq(posts.id, parseInt(id)))
            .limit(1);

        if (existingPost.length === 0) {
            return NextResponse.json({error: "Post not found"}, {status: 404});
        }

        // 게시글 업데이트
        const updatedPost = await db
            .update(posts)
            .set({
                title,
                content,
                excerpt,
                tags: postTags || [],
                updatedAt: new Date(),
            })
            .where(eq(posts.id, parseInt(id)))
            .returning();

        // 기존 태그 카운트 감소
        const oldTags = existingPost[0].tags || [];
        for (const tagName of oldTags) {
            await db
                .update(tags)
                .set({count: sql`${tags.count} - 1`})
                .where(eq(tags.name, tagName.toLowerCase()));
        }

        // 새 태그 카운트 증가
        if (postTags && postTags.length > 0) {
            for (const tagName of postTags) {
                await db
                    .insert(tags)
                    .values({
                        name: tagName.toLowerCase(),
                        count: 1,
                    })
                    .onConflictDoUpdate({
                        target: tags.name,
                        set: {
                            count: sql`${tags.count} + 1`,
                        },
                    });
            }
        }

        return NextResponse.json(updatedPost[0]);
    } catch (error) {
        console.error("게시글 수정 실패:", error);
        return NextResponse.json({error: "Failed to update post"}, {status: 500});
    }
}

export async function DELETE(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
    try {
        // 세션 확인 (관리자 권한 체크)
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({error: "관리자 권한이 필요합니다."}, {status: 403});
        }

        const {id} = await params;

        // 기존 게시글 가져오기 (태그 업데이트를 위해)
        const existingPost = await db
            .select()
            .from(posts)
            .where(eq(posts.id, parseInt(id)))
            .limit(1);

        if (existingPost.length === 0) {
            return NextResponse.json({error: "Post not found"}, {status: 404});
        }

        // 게시글 삭제
        await db.delete(posts).where(eq(posts.id, parseInt(id)));

        // 태그 카운트 감소
        const oldTags = existingPost[0].tags || [];
        for (const tagName of oldTags) {
            await db
                .update(tags)
                .set({count: sql`${tags.count} - 1`})
                .where(eq(tags.name, tagName.toLowerCase()));
        }

        return NextResponse.json({message: "Post deleted successfully"});
    } catch (error) {
        console.error("게시글 삭제 실패:", error);
        return NextResponse.json({error: "Failed to delete post"}, {status: 500});
    }
}
