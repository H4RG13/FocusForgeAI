'use client';

import { useState } from 'react';
import ChatInterface from './ChatInterface';
import StudyPlanPanel from './StudyPlanPanel';

type Tab = 'chat' | 'study-plan';

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab]       = useState<Tab>('chat');

  return (
    <>
      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="
          fixed z-50 flex flex-col overflow-hidden
          rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900
          transition-all duration-200
          bottom-20 left-3 right-3 max-h-[75vh]
          sm:left-auto sm:right-6 sm:w-[380px] sm:max-h-[min(580px,calc(100vh-7rem))]
        ">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Assistant</p>
                <p className="text-[10px] text-indigo-200">FocusForge AI · Study companion</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            {([
              { key: 'chat',       label: '💬 Chat' },
              { key: 'study-plan', label: '📋 Study Plan' },
            ] as { key: Tab; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  tab === key
                    ? 'border-b-2 border-indigo-600 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {tab === 'chat' && (
              <div className="flex h-full flex-col">
                <ChatInterface compact />
              </div>
            )}
            {tab === 'study-plan' && (
              <div className="h-full overflow-y-auto p-4">
                <StudyPlanPanel compact />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`
          fixed bottom-6 right-6 z-50
          flex h-14 w-14 items-center justify-center
          rounded-full shadow-lg transition-all duration-200
          ${isOpen
            ? 'bg-gray-700 hover:bg-gray-800 rotate-0'
            : 'bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:scale-110'
          }
        `}
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
      </button>
    </>
  );
}
