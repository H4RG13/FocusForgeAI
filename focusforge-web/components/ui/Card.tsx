import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/format';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl border border-gray-200 bg-white p-5 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}
