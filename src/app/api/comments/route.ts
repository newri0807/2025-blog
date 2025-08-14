import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    
    const postComments = await db.select({
      id: comments.id,
      authorName: comments.authorName,
      content: comments.content,
      createdAt: comments.createdAt,
    }).from(comments)
      .where(eq(comments.postId, parseInt(postId)))
      .orderBy(desc(comments.createdAt));
    
    return NextResponse.json(postComments);
  } catch (error) {
    console.error('댓글 조회 실패:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postId, authorName, content, password } = await request.json();
    
    if (!postId || !authorName || !content || !password) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newComment = await db.insert(comments).values({
      postId: parseInt(postId),
      authorName,
      content,
      passwordHash,
    }).returning();
    
    // 비밀번호 해시 제외하고 반환
    const { passwordHash: _, ...commentResponse } = newComment[0];
    
    return NextResponse.json(commentResponse, { status: 201 });
  } catch (error) {
    console.error('댓글 작성 실패:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
