import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('upload') as File;

    if (!file) {
      return NextResponse.json(
        { error: { message: '파일이 없습니다.' } },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: { message: '파일 크기는 5MB를 초과할 수 없습니다.' } },
        { status: 400 }
      );
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: { message: '이미지 파일만 업로드 가능합니다.' } },
        { status: 400 }
      );
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;

    // Vercel Blob에 업로드
    const blob = await put(fileName, file, {
      access: 'public',
    });

    return NextResponse.json({
      url: blob.url
    });

  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    return NextResponse.json(
      { error: { message: '이미지 업로드에 실패했습니다.' } },
      { status: 500 }
    );
  }
}
