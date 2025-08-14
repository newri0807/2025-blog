import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  return handleTableCreation();
}

export async function POST() {
  return handleTableCreation();
}

async function handleTableCreation() {
  try {
    console.log('🚀 데이터베이스 테이블 생성 시작...');

    // 기존 테이블 확인
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 기존 테이블:', existingTables.map(t => t.table_name));

    // users 테이블 생성 (NextAuth + 댓글용)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL,
        "emailVerified" TIMESTAMPTZ,
        image TEXT,
        comment_password TEXT,
        is_admin BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ users 테이블 생성됨');

    // NextAuth 관련 테이블들
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY (provider, "providerAccountId")
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        "sessionToken" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMPTZ NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "verificationTokens" (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `;

    // posts 테이블 생성 (작성자 정보 추가)
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        tags TEXT[] DEFAULT '{}',
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ posts 테이블 생성됨');

    // comments 테이블 생성 (사용자 연결 + 비밀번호 해시 추가)
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        author_name TEXT NOT NULL,
        content TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ comments 테이블 생성됨');

    // likes 테이블 생성 (성능 개선)
    await sql`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        ip_address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        UNIQUE(post_id, user_id, ip_address)
      )
    `;
    console.log('✅ likes 테이블 생성됨');

    // tags 테이블 생성
    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        count INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ tags 테이블 생성됨');

    // 인덱스 생성 (성능 향상)
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_author ON posts (author_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tags_count ON tags (count DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes (post_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_likes_user_ip ON likes (post_id, user_id, ip_address)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`;
    
    console.log('✅ 인덱스 생성됨');

    // 최종 테이블 목록 확인
    const finalTables = await sql`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    return NextResponse.json({
      success: true,
      message: '🎉 모든 테이블이 성공적으로 생성되었습니다!',
      tables: finalTables.map(t => ({
        name: t.table_name,
        columns: t.column_count
      })),
      total_tables: finalTables.length
    });

  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      details: 'DATABASE_URL 환경 변수와 Neon 연결을 확인해주세요.'
    }, { status: 500 });
  }
}