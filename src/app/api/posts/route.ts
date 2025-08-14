import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { posts, tags } from '@/lib/schema';
import { desc, sql, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    let allPosts;

    if (tag) {
      // 태그로 필터링하면서 핀 정렬도 함께
      allPosts = await db.select().from(posts)
        .where(sql`${tag} = ANY(${posts.tags})`)
        .orderBy(desc(posts.isPinned), desc(posts.createdAt)); // ✅ 핀 먼저
    } else {
      // 모든 게시글
      allPosts = await db.select().from(posts)
        .orderBy(desc(posts.isPinned), desc(posts.createdAt));
    }

    return NextResponse.json(allPosts);
  } catch (error) {
    console.error('게시글 조회 실패:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    // 세션 확인 (관리자 권한 체크)
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { title, content, excerpt, tags: postTags, isPinned } = await request.json();
    
    // 게시글 생성 (작성자 정보 포함)
    const newPost = await db.insert(posts).values({
      title,
      content,
      excerpt,
      tags: postTags || [],
      isPinned: !!isPinned, 
      authorId: session.user.id!,
      authorName: session.user.name || session.user.email!,
    }).returning();
    
    // 태그 카운트 업데이트
    if (postTags && postTags.length > 0) {
      for (const tagName of postTags) {
        await db.insert(tags).values({
          name: tagName.toLowerCase(),
          count: 1,
        }).onConflictDoUpdate({
          target: tags.name,
          set: {
            count: sql`${tags.count} + 1`,
          },
        });
      }
    }
    
    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error('게시글 생성 실패:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}