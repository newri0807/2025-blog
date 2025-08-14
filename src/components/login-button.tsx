'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        {session.user?.isAdmin && (
          <Link
            href="/posts/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 글 작성
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          로그아웃
        </button>
      </>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      로그인
    </Link>
  );
}