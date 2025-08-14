import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { likes } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  return realIp || 'unknown';
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const result = await db.select({ count: sql<number>`cast(count(*) as int)` })
      .from(likes)
      .where(eq(likes.postId, parseInt(postId)));

    const ipAddress = getClientIP(request);
    const userLiked = await db.select().from(likes)
      .where(and(
        eq(likes.postId, parseInt(postId)),
        eq(likes.ipAddress, ipAddress)
      ));

    return NextResponse.json({
      count: result[0]?.count || 0,
      liked: userLiked.length > 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    const numericPostId = parseInt(postId);

    if (!numericPostId || isNaN(numericPostId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const ipAddress = getClientIP(request);

    // 중복 여부 확인
    const existingLike = await db.select().from(likes)
      .where(and(
        eq(likes.postId, numericPostId),
        eq(likes.ipAddress, ipAddress)
      ));

    if (existingLike.length > 0) {
      await db.delete(likes).where(
        and(
          eq(likes.postId, numericPostId),
          eq(likes.ipAddress, ipAddress)
        )
      );
      return NextResponse.json({ liked: false });
    } else {
      await db.insert(likes).values({
        postId: numericPostId,
        ipAddress,
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

