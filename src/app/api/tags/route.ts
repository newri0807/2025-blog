import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags, posts } from '@/lib/schema';
import { desc, sql, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let allTags;

    if (search) {
      allTags = await db.select().from(tags)
        .where(sql`${tags.name} LIKE ${`%${search}%`}`) 
        .orderBy(desc(tags.count))
        .limit(10);
    } else {
      allTags = await db.select().from(tags)
        .orderBy(desc(tags.count));
    }

    return NextResponse.json(allTags);
  } catch (error) {
    console.error('태그 조회 실패:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const tagName = name.trim().toLowerCase();

    // 이미 존재하는 태그인지 확인
    const existingTag = await db.select().from(tags)
      .where(sql`LOWER(${tags.name}) = ${tagName}`);

    if (existingTag.length > 0) {
      return NextResponse.json(existingTag[0]);
    }

    // 새 태그 생성
    const newTag = await db.insert(tags).values({
      name: tagName,
      count: 0,
    }).returning();

    return NextResponse.json(newTag[0], { status: 201 });
  } catch (error) {
    console.error('태그 생성 실패:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
