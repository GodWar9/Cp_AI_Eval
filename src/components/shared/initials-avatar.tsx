import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface InitialsAvatarProps {
  name?: string;
  className?: string;
}

// Predictable colors based on name string
const COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

export function InitialsAvatar({ name = 'User', className }: InitialsAvatarProps) {
  // Get initials (up to 2 chars)
  const initials = name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Get color index based on character codes
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % COLORS.length;
  const colorClass = COLORS[colorIndex];

  return (
    <Avatar className={cn('h-10 w-10 border-2 border-background', className)}>
      <AvatarFallback className={cn('text-white font-semibold', colorClass)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
