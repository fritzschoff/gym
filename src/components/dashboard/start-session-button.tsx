'use client';

import { useTransition } from 'react';
import { startSession } from '@/actions/sessions';

interface StartSessionButtonProps {
  planId: string;
  label: string;
  className?: string;
}

export function StartSessionButton({ planId, label, className }: StartSessionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await startSession(planId);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {isPending ? '...' : label}
    </button>
  );
}
