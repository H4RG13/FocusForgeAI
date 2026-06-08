interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
        isUser ? 'bg-indigo-600 text-white' : 'bg-violet-100 text-violet-700'
      }`}>
        {isUser ? 'U' : 'AI'}
      </div>

      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-gray-100 text-gray-900 rounded-tl-sm dark:bg-gray-800 dark:text-gray-100'
      }`}>
        {content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}
