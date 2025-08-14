'use client'

import { Pin, PinOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation'; 

export function PinToggleButton({ postId, isPinned }: { postId: number, isPinned: boolean }) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); 

  if (!session?.user?.isAdmin) return null;

  const handleToggle = async () => {
    startTransition(async () => {
      const res = await fetch(`/api/posts/${postId}/pin`, { method: 'PATCH' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || '핀 변경 실패');
      } else {
        router.refresh(); 
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      className="text-blue-500 hover:text-blue-700 transition"
      title={isPinned ? '핀 해제' : '고정하기'}
      disabled={isPending}
    >
      {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
    </button>
  );
}
