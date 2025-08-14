import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { content, password } = await request.json();
    
    if (!content || !password) {
      return NextResponse.json(
        { error: '내용과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 기존 댓글 조회
    const existingComment = await db.select().from(comments)
      .where(eq(comments.id, parseInt(id)))
      .limit(1);
    
    if (existingComment.length === 0) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, existingComment[0].passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }
    
    // 댓글 수정
    const updatedComment = await db.update(comments)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, parseInt(id)))
      .returning();
    
    // 비밀번호 해시 제외하고 반환
    const { passwordHash: _, ...commentResponse } = updatedComment[0];
    
    return NextResponse.json(commentResponse);
  } catch (error) {
    console.error('댓글 수정 실패:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 기존 댓글 조회
    const existingComment = await db.select().from(comments)
      .where(eq(comments.id, parseInt(id)))
      .limit(1);
    
    if (existingComment.length === 0) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, existingComment[0].passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }
    
    // 댓글 삭제
    await db.delete(comments).where(eq(comments.id, parseInt(id)));
    
    return NextResponse.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
