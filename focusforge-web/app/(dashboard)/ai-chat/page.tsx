'use client';

import { useState } from 'react';
import ChatInterface from '@/components/features/ai/ChatInterface';
import StudyPlanPanel from '@/components/features/ai/StudyPlanPanel';

type Tab = 'chat' | 'study-plan';

export default function AIChatPage() {
  const [tab, setTab] = useState<Tab>('chat');

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="mt-1 text-sm text-gray-500">
          Chat with your AI study assistant or generate a personalized study plan.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {([
          { key: 'chat',       label: '💬 Chat' },
          { key: 'study-plan', label: '📋 Study Plan' },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'chat'       && <ChatInterface />}
      {tab === 'study-plan' && <StudyPlanPanel />}
    </div>
  );
}
