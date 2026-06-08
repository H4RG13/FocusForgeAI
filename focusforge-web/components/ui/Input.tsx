import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/format';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm dark:text-gray-100 dark:bg-gray-800',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 dark:disabled:bg-gray-900',
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
