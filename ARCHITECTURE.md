# FocusForge AI — Software Architecture Document

**Version:** 1.0.0
**Date:** 2026-05-27
**Status:** Living Document
**Classification:** Internal Engineering Reference

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Architectural Style & Decisions](#3-architectural-style--decisions)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Architecture](#6-database-architecture)
7. [Authentication & Security](#7-authentication--security)
8. [AI Architecture](#8-ai-architecture)
9. [API Design](#9-api-design)
10. [DevOps & Deployment](#10-devops--deployment)
11. [Scalability Design](#11-scalability-design)
12. [Clean Code & Engineering Standards](#12-clean-code--engineering-standards)
13. [Development Roadmap](#13-development-roadmap)
14. [Future Enhancements](#14-future-enhancements)

---

## 1. Executive Summary

### 1.1 Purpose

FocusForge AI is a cloud-native, AI-powered productivity and study companion SaaS platform. It combines structured task management, intelligent study planning, AI-driven content generation, and behavioral analytics into a unified workspace — enabling students and knowledge workers to work with greater clarity, consistency, and measurable output.

The platform is designed as a **multi-tenant SaaS application** with a clear separation between the frontend (Next.js), backend API (Laravel), and AI layer (OpenAI), deployed on modern cloud infrastructure for reliability and scalability.

### 1.2 Main Goals

| Goal | Description |
|------|-------------|
| **Productivity Acceleration** | Help users manage tasks, build study routines, and track output over time |
| **AI-Augmented Learning** | Generate summaries, quizzes, and study plans from user-uploaded content |
| **Behavioral Insight** | Surface analytics to help users understand their focus patterns |
| **Scalable Infrastructure** | Architecture that supports growth from 100 to 100,000+ users without re-engineering |
| **Developer Velocity** | Clean, modular codebase that allows rapid feature iteration |

### 1.3 Target Users

- **Students** (university/high school) managing coursework, notes, and exam prep
- **Self-learners** building structured learning habits
- **Knowledge workers** managing deep work sessions and personal projects
- **Power users** who want AI to accelerate their note synthesis and study cycles

### 1.4 Technical Objectives

- Sub-200ms API response times for non-AI endpoints
- AI response delivery within 3–8 seconds (streaming where applicable)
- 99.9% uptime for core task/notes features
- Horizontal scalability via stateless API design and queue-based AI processing
- Zero-trust security model at every API boundary
- Full audit trail for AI-generated content

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │              Next.js Application (Vercel CDN Edge)                   │  │
│   │                                                                      │  │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │  │
│   │   │  App Router  │  │  Components  │  │  State (Zustand/ReactQ)  │  │  │
│   │   └──────────────┘  └──────────────┘  └──────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTPS / REST
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                              │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │          Laravel API (Railway / DigitalOcean App Platform)           │  │
│   │                                                                      │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│   │  │  Routes  │  │Middleware│  │Controllers│  │  Service Layer   │    │  │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘    │  │
│   │                                                                      │  │
│   │  ┌──────────────────────┐    ┌─────────────────────────────────┐    │  │
│   │  │   Queue Workers      │    │       AI Service Layer          │    │  │
│   │  │ (Laravel Horizon)    │    │  (OpenAI Client Abstraction)    │    │  │
│   │  └──────────────────────┘    └─────────────────────────────────┘    │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────────────────────────────┬───────────────────┘
           │ PDO / Eloquent ORM                           │ HTTP (OpenAI SDK)
           ▼                                              ▼
┌─────────────────────┐                    ┌─────────────────────────────────┐
│   DATA LAYER        │                    │       EXTERNAL AI LAYER         │
│                     │                    │                                 │
│  ┌───────────────┐  │                    │  ┌───────────────────────────┐  │
│  │  PostgreSQL   │  │                    │  │     OpenAI API            │  │
│  │  (Primary DB) │  │                    │  │  - GPT-4o (Chat/Summaries)│  │
│  └───────────────┘  │                    │  │  - GPT-4o (Quiz Gen)      │  │
│                     │                    │  │  - Embeddings (future)    │  │
│  ┌───────────────┐  │                    │  └───────────────────────────┘  │
│  │  Redis Cache  │  │                    └─────────────────────────────────┘
│  │  + Queue      │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │  File Storage │  │
│  │ (S3 / R2)     │  │
│  └───────────────┘  │
└─────────────────────┘
```

### 2.2 Communication Flow

```
Browser
  │
  ├── Static Assets ──────────────────► Vercel Edge CDN (HTML/CSS/JS)
  │
  └── API Requests (HTTPS + Bearer Token)
        │
        ▼
   Laravel API Server
        │
        ├── Auth Middleware (Sanctum) ──── validates token → user context
        │
        ├── Request Validation ──────────── FormRequest classes
        │
        ├── Controller ──────────────────── thin, delegates to Service
        │
        ├── Service Layer ───────────────── business logic
        │   │
        │   ├── Eloquent Repository ──────── database access
        │   │   └── PostgreSQL
        │   │
        │   └── AI Service ───────────────── AI generation
        │       │
        │       ├── Sync: small prompts → direct OpenAI call
        │       │
        │       └── Async: heavy jobs ──────► Redis Queue
        │                                         │
        │                                         ▼
        │                                    Queue Worker
        │                                         │
        │                                    OpenAI API
        │                                         │
        │                                    Store result → DB
        │                                    Broadcast → WebSocket (opt.)
        │
        └── API Resource ───────────────── transform & return JSON response
```

### 2.3 Request Lifecycle

```
1. User action in browser (e.g., "Generate Summary")
2. Next.js component dispatches API call via axios/fetch
3. Request hits Laravel API with Authorization header
4. Sanctum middleware validates Bearer token
5. Rate limiter checks request quota per user
6. FormRequest validates input payload
7. Controller delegates to AIService
8. AIService dispatches GenerateSummaryJob to Redis queue
9. API returns 202 Accepted with job_id
10. Queue Worker picks up job
11. Worker calls OpenAI GPT-4o with structured prompt
12. Response stored in ai_generations table
13. (Optional) WebSocket event broadcast to client
14. Client polls GET /ai/generations/{id} or receives push
15. UI renders formatted AI output
```

---

## 3. Architectural Style & Decisions

### 3.1 Client-Server Architecture

**Decision:** Strict separation between the Next.js frontend and Laravel backend API.

**Rationale:**
- Enables independent deployment cycles — frontend can be updated without API changes
- Frontend scales via Vercel's global edge network without touching the backend
- Enables future native mobile apps (iOS/Android) to consume the same API
- Clear contract (OpenAPI spec) between teams

### 3.2 RESTful API

**Decision:** All client-server communication over REST with JSON payloads.

**Rationale:**
- Universally understood and toolable (Postman, OpenAPI, curl)
- Stateless design aligns with horizontal scaling
- Predictable URL structure maps cleanly to Laravel's resource routing
- HTTP caching (ETags, Cache-Control) available for read-heavy endpoints
- Simpler than GraphQL for this domain's query patterns

### 3.3 Service Layer Pattern

**Decision:** Business logic lives in `app/Services/`, not in controllers or models.

**Rationale:**
- Controllers remain thin — they validate input, call a service, return a response
- Services are independently testable without HTTP scaffolding
- AI logic, queue dispatch, and complex orchestration are encapsulated in one place
- Prevents "fat model" and "fat controller" anti-patterns
- Enables service reuse across CLI commands, queued jobs, and API controllers

### 3.4 Repository Pattern (Applied Selectively)

**Decision:** Repository interfaces for entities with complex query needs (notes, tasks, analytics). Eloquent used directly for simple CRUD.

**Rationale:**
- Repositories isolate query logic and make it testable with fakes
- Avoids scattering `->where()->with()->orderBy()` chains across services
- Pragmatic: not all models need a repository — only those with non-trivial query requirements

### 3.5 Modular Architecture

**Decision:** Backend organized into feature modules (Auth, Tasks, Notes, AI, Analytics).

**Rationale:**
- Reduces cognitive load when navigating large codebases
- Mirrors domain boundaries, making ownership clear
- Easier to extract into microservices if needed at scale

### 3.6 Event-Driven Patterns (Selective)

**Decision:** Laravel Events/Listeners used for side effects (notifications, analytics recording, AI job dispatch).

**Rationale:**
- Decouples primary action (create task) from secondary effects (record analytics event)
- Listeners can be queued independently, preventing primary action latency
- Enables clean audit trail without polluting service logic

---

## 4. Frontend Architecture

### 4.1 Folder Structure

```
focusforge-web/
├── public/
│   └── assets/                    # Static images, icons, fonts
│
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── (auth)/                # Route group: unauthenticated pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/           # Route group: authenticated app
│   │   │   ├── layout.tsx         # Shell: sidebar, topbar, auth guard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── notes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── study-plans/
│   │   │   │   └── page.tsx
│   │   │   ├── focus/
│   │   │   │   └── page.tsx       # Pomodoro timer
│   │   │   ├── quizzes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── ai-chat/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                   # Next.js API Routes (thin proxies only)
│   │   │   └── auth/
│   │   │       └── [...nextauth]/ # If using NextAuth adapter
│   │   │
│   │   ├── layout.tsx             # Root layout (fonts, providers)
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                    # Primitive, unstyled-base components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── Spinner/
│   │   │   ├── Toast/
│   │   │   └── index.ts           # Barrel export
│   │   │
│   │   ├── layout/                # Structural layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── PageHeader.tsx
│   │   │
│   │   ├── features/              # Feature-specific composite components
│   │   │   ├── tasks/
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   └── TaskFilters.tsx
│   │   │   ├── notes/
│   │   │   │   ├── NoteEditor.tsx
│   │   │   │   ├── NoteCard.tsx
│   │   │   │   └── AIActionsPanel.tsx
│   │   │   ├── focus/
│   │   │   │   ├── PomodoroTimer.tsx
│   │   │   │   ├── SessionControls.tsx
│   │   │   │   └── SessionHistory.tsx
│   │   │   ├── quizzes/
│   │   │   │   ├── QuizCard.tsx
│   │   │   │   ├── QuizRunner.tsx
│   │   │   │   └── QuizResults.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── ProductivityChart.tsx
│   │   │   │   ├── FocusHeatmap.tsx
│   │   │   │   └── StreakWidget.tsx
│   │   │   └── ai/
│   │   │       ├── ChatInterface.tsx
│   │   │       ├── ChatMessage.tsx
│   │   │       └── AIStatusBadge.tsx
│   │   │
│   │   └── shared/                # Cross-feature shared components
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── LoadingSkeleton.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   ├── useNotes.ts
│   │   ├── useAIGeneration.ts
│   │   ├── useFocusSession.ts
│   │   ├── usePomodoro.ts
│   │   └── useAnalytics.ts
│   │
│   ├── lib/
│   │   ├── api/                   # API client layer
│   │   │   ├── client.ts          # Axios instance with interceptors
│   │   │   ├── auth.ts
│   │   │   ├── tasks.ts
│   │   │   ├── notes.ts
│   │   │   ├── ai.ts
│   │   │   ├── focus.ts
│   │   │   └── analytics.ts
│   │   │
│   │   ├── utils/                 # Pure utility functions
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   └── validation.ts
│   │   │
│   │   └── constants/
│   │       ├── routes.ts
│   │       └── config.ts
│   │
│   ├── store/                     # Zustand global state
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts            # Sidebar state, modals, toasts
│   │   └── focus.store.ts         # Pomodoro timer state
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── api.types.ts           # API response shapes
│   │   ├── domain.types.ts        # Core domain models
│   │   └── ui.types.ts
│   │
│   └── middleware.ts              # Next.js middleware (route protection)
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.2 Component Architecture

Components follow a three-tier hierarchy:

```
UI Primitives (components/ui/)
    └── Atomic, stateless, pure presentation
    └── No business logic or API calls
    └── Accept props + className, emit callbacks
    └── Examples: Button, Input, Badge, Modal

Feature Components (components/features/)
    └── Composed from UI primitives
    └── May contain local state
    └── May call custom hooks (which call API layer)
    └── Domain-aware (know about Task, Note, etc.)
    └── Examples: TaskCard, NoteEditor, PomodoroTimer

Page Components (app/**/page.tsx)
    └── Orchestrate feature components
    └── Handle route-level data fetching (React Query)
    └── Pass data down, receive events up
    └── Minimal JSX — delegate to feature components
```

### 4.3 State Management Strategy

| State Type | Solution | Rationale |
|---|---|---|
| Server state (API data) | TanStack Query (React Query) | Cache invalidation, background refetch, loading/error states |
| Global UI state | Zustand | Sidebar open/close, active modal, toast queue |
| Timer state | Zustand (persisted) | Pomodoro timer must survive re-renders |
| Form state | React Hook Form | Performant, validation-native |
| URL/navigation state | Next.js router | Filters, pagination, tab state via query params |

**Anti-pattern avoided:** No prop drilling beyond 2 levels. No Redux for this scale — Zustand is sufficient and far simpler.

### 4.4 API Layer

```typescript
// src/lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 → logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

```typescript
// src/lib/api/tasks.ts
import apiClient from './client';
import { Task, CreateTaskPayload, PaginatedResponse } from '@/types';

export const tasksApi = {
  list: (params?: { status?: string; category_id?: number; page?: number }) =>
    apiClient.get<PaginatedResponse<Task>>('/tasks', { params }),

  get: (id: number) =>
    apiClient.get<Task>(`/tasks/${id}`),

  create: (data: CreateTaskPayload) =>
    apiClient.post<Task>('/tasks', data),

  update: (id: number, data: Partial<CreateTaskPayload>) =>
    apiClient.put<Task>(`/tasks/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/tasks/${id}`),
};
```

### 4.5 Authentication Flow

```
1. User submits login form
2. POST /api/auth/login → Laravel API
3. API validates credentials, returns { token, user }
4. Token stored in httpOnly cookie (preferred) OR localStorage
5. Zustand auth store hydrated with user object
6. Next.js middleware reads cookie, allows access to (dashboard) routes
7. On 401 response: clear store, redirect to /login
8. On app load: GET /api/auth/me to rehydrate user from token
```

### 4.6 Route Protection (Next.js Middleware)

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/tasks', '/notes', '/focus', '/analytics'];
const AUTH_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
```

### 4.7 Error Handling Strategy

```
Component Level:   ErrorBoundary wraps feature sections — catches render errors
Query Level:       React Query error state renders inline error UI
API Level:         Axios interceptor normalizes error shape → { message, errors, code }
Form Level:        React Hook Form + Zod schema validation → field-level errors
Global Toasts:     Non-blocking notifications for success/error via Zustand toast queue
Network Errors:    Retry logic via React Query (3 retries with exponential backoff)
```

---

## 5. Backend Architecture

### 5.1 Laravel Folder Structure

```
focusforge-api/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── PruneExpiredTokens.php
│   │       └── SyncAnalyticsSnapshots.php
│   │
│   ├── Events/
│   │   ├── TaskCreated.php
│   │   ├── FocusSessionCompleted.php
│   │   └── AIGenerationCompleted.php
│   │
│   ├── Exceptions/
│   │   ├── Handler.php            # Global exception handler → JSON responses
│   │   ├── AIServiceException.php
│   │   └── InsufficientCreditsException.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── TaskController.php
│   │   │   │   ├── NoteController.php
│   │   │   │   ├── AIController.php
│   │   │   │   ├── FocusSessionController.php
│   │   │   │   ├── QuizController.php
│   │   │   │   ├── AnalyticsController.php
│   │   │   │   └── CategoryController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── ForceJsonResponse.php
│   │   │   ├── RateLimitAIRequests.php
│   │   │   └── EnsureEmailVerified.php
│   │   │
│   │   └── Requests/
│   │       ├── Auth/
│   │       │   ├── LoginRequest.php
│   │       │   └── RegisterRequest.php
│   │       ├── Task/
│   │       │   ├── StoreTaskRequest.php
│   │       │   └── UpdateTaskRequest.php
│   │       ├── Note/
│   │       │   ├── StoreNoteRequest.php
│   │       │   └── UpdateNoteRequest.php
│   │       ├── AI/
│   │       │   ├── GenerateSummaryRequest.php
│   │       │   ├── GenerateQuizRequest.php
│   │       │   └── ChatRequest.php
│   │       └── Focus/
│   │           └── StoreFocusSessionRequest.php
│   │
│   ├── Jobs/
│   │   ├── GenerateSummaryJob.php
│   │   ├── GenerateQuizJob.php
│   │   ├── GenerateStudyPlanJob.php
│   │   └── ProcessDocumentUploadJob.php
│   │
│   ├── Listeners/
│   │   ├── RecordTaskCreatedAnalytics.php
│   │   ├── SendFocusSessionCompletedNotification.php
│   │   └── NotifyAIGenerationCompleted.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Task.php
│   │   ├── Note.php
│   │   ├── AIGeneration.php
│   │   ├── FocusSession.php
│   │   ├── Quiz.php
│   │   ├── QuizQuestion.php
│   │   └── Category.php
│   │
│   ├── Policies/
│   │   ├── TaskPolicy.php
│   │   ├── NotePolicy.php
│   │   ├── QuizPolicy.php
│   │   └── FocusSessionPolicy.php
│   │
│   ├── Repositories/
│   │   ├── Contracts/
│   │   │   ├── TaskRepositoryInterface.php
│   │   │   ├── NoteRepositoryInterface.php
│   │   │   └── AnalyticsRepositoryInterface.php
│   │   ├── TaskRepository.php
│   │   ├── NoteRepository.php
│   │   └── AnalyticsRepository.php
│   │
│   ├── Resources/
│   │   ├── TaskResource.php
│   │   ├── TaskCollection.php
│   │   ├── NoteResource.php
│   │   ├── AIGenerationResource.php
│   │   ├── FocusSessionResource.php
│   │   ├── QuizResource.php
│   │   └── UserResource.php
│   │
│   └── Services/
│       ├── AuthService.php
│       ├── TaskService.php
│       ├── NoteService.php
│       ├── FocusSessionService.php
│       ├── QuizService.php
│       ├── AnalyticsService.php
│       └── AI/
│           ├── AIService.php              # Facade/coordinator
│           ├── OpenAIClient.php           # Wraps OpenAI PHP SDK
│           ├── Prompts/
│           │   ├── SummaryPrompt.php
│           │   ├── QuizPrompt.php
│           │   ├── StudyPlanPrompt.php
│           │   └── ChatPrompt.php
│           └── Parsers/
│               ├── QuizResponseParser.php
│               └── StudyPlanResponseParser.php
│
├── bootstrap/
│   └── app.php
│
├── config/
│   ├── ai.php                     # AI config: model, token limits, retry policy
│   ├── sanctum.php
│   └── queue.php
│
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── 0001_create_users_table.php
│   │   ├── 0002_create_categories_table.php
│   │   ├── 0003_create_tasks_table.php
│   │   ├── 0004_create_notes_table.php
│   │   ├── 0005_create_ai_generations_table.php
│   │   ├── 0006_create_focus_sessions_table.php
│   │   ├── 0007_create_quizzes_table.php
│   │   └── 0008_create_quiz_questions_table.php
│   └── seeders/
│
├── routes/
│   ├── api.php                    # All API routes
│   └── console.php
│
├── storage/
│   └── app/uploads/               # User-uploaded documents (pre-S3 fallback)
│
├── tests/
│   ├── Feature/
│   │   ├── Auth/
│   │   ├── Tasks/
│   │   ├── Notes/
│   │   └── AI/
│   └── Unit/
│       ├── Services/
│       └── Repositories/
│
├── .env
├── .env.example
└── composer.json
```

### 5.2 Controller Design (Thin Controllers)

```php
// app/Http/Controllers/Api/TaskController.php

final class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService) {}

    public function index(Request $request): TaskCollection
    {
        $tasks = $this->taskService->listForUser(
            user: $request->user(),
            filters: $request->only(['status', 'category_id', 'due_before']),
            perPage: $request->integer('per_page', 15),
        );

        return new TaskCollection($tasks);
    }

    public function store(StoreTaskRequest $request): TaskResource
    {
        $task = $this->taskService->create(
            user: $request->user(),
            data: $request->validated(),
        );

        return (new TaskResource($task))->response()->setStatusCode(201);
    }

    public function update(UpdateTaskRequest $request, Task $task): TaskResource
    {
        $this->authorize('update', $task);
        $task = $this->taskService->update($task, $request->validated());

        return new TaskResource($task);
    }

    public function destroy(Request $request, Task $task): Response
    {
        $this->authorize('delete', $task);
        $this->taskService->delete($task);

        return response()->noContent();
    }
}
```

### 5.3 Service Layer

```php
// app/Services/TaskService.php

final class TaskService
{
    public function __construct(
        private readonly TaskRepositoryInterface $taskRepository,
    ) {}

    public function listForUser(User $user, array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->taskRepository->queryForUser($user->id, $filters, $perPage);
    }

    public function create(User $user, array $data): Task
    {
        $task = $this->taskRepository->create([
            ...$data,
            'user_id' => $user->id,
        ]);

        event(new TaskCreated($task));

        return $task;
    }

    public function update(Task $task, array $data): Task
    {
        return $this->taskRepository->update($task, $data);
    }

    public function delete(Task $task): void
    {
        $this->taskRepository->delete($task);
    }
}
```

### 5.4 Middleware Stack

```
Global Middleware:
  ├── TrustProxies          → handles load balancer headers
  ├── ForceJsonResponse     → always return JSON (no HTML errors)
  ├── HandleCors            → CORS for Next.js origin
  └── ThrottleRequests      → global rate limiter

Route Group: api/
  ├── auth:sanctum          → validates Bearer token
  └── verified              → (optional) email verification gate

Route Group: api/ai/
  └── RateLimitAIRequests   → stricter limit: 20 req/hr per user
```

### 5.5 API Resources (Response Transformation)

```php
// app/Resources/TaskResource.php

final class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'description'  => $this->description,
            'status'       => $this->status,
            'priority'     => $this->priority,
            'due_date'     => $this->due_date?->toDateString(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'category'     => new CategoryResource($this->whenLoaded('category')),
            'created_at'   => $this->created_at->toIso8601String(),
            'updated_at'   => $this->updated_at->toIso8601String(),
        ];
    }
}
```

### 5.6 Queue Architecture

```
Jobs and their queues:

Queue: "ai"           (high priority, dedicated worker)
  ├── GenerateSummaryJob
  ├── GenerateQuizJob
  └── GenerateStudyPlanJob

Queue: "default"      (standard priority)
  ├── ProcessDocumentUploadJob
  └── SendNotificationJob

Queue: "analytics"    (low priority)
  └── RecordAnalyticsSnapshotJob

Retry strategy:
  - AI jobs: 3 attempts, backoff [30s, 120s, 300s]
  - Failed jobs → failed_jobs table → alert via Slack webhook

Horizon Dashboard:
  - Monitor queue depth, job throughput, failure rates
  - Auto-scale workers via Horizon supervisor config
```

### 5.7 Exception Handling

```php
// app/Exceptions/Handler.php

public function register(): void
{
    $this->renderable(function (ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed.',
            'errors'  => $e->errors(),
        ], 422);
    });

    $this->renderable(function (AuthorizationException $e) {
        return response()->json(['message' => 'This action is unauthorized.'], 403);
    });

    $this->renderable(function (ModelNotFoundException $e) {
        return response()->json(['message' => 'Resource not found.'], 404);
    });

    $this->renderable(function (AIServiceException $e) {
        Log::error('AI service failure', ['exception' => $e]);
        return response()->json([
            'message' => 'AI service temporarily unavailable. Please try again.',
            'retry_after' => 30,
        ], 503);
    });
}
```

---

## 6. Database Architecture

### 6.1 Entity Relationship Diagram

```
┌───────────────────────────────┐
│            users              │
├───────────────────────────────┤
│ id (PK, bigint)               │
│ name (varchar 255)            │
│ email (varchar 255, unique)   │
│ password (varchar 255)        │
│ email_verified_at (timestamp) │
│ timezone (varchar 50)         │
│ daily_focus_goal_minutes (int)│
│ created_at / updated_at       │
└──────────────┬────────────────┘
               │ 1
               │
    ┌──────────┴──────────────────────────────────────────┐
    │                                                     │
    │ n                                                   │ n
    ▼                                                     ▼
┌──────────────────────┐               ┌──────────────────────────┐
│      categories      │               │         tasks            │
├──────────────────────┤               ├──────────────────────────┤
│ id (PK)              │◄──────────────│ id (PK)                  │
│ user_id (FK→users)   │  category_id  │ user_id (FK→users)       │
│ name (varchar 100)   │               │ category_id (FK, null)   │
│ color (varchar 7)    │               │ title (varchar 255)      │
│ icon (varchar 50)    │               │ description (text, null) │
│ created_at           │               │ status (enum)            │
└──────────────────────┘               │ priority (enum)          │
                                       │ due_date (date, null)    │
                                       │ completed_at (timestamp) │
                                       │ created_at / updated_at  │
                                       └──────────────────────────┘

┌──────────────────────────────────┐
│             notes                │
├──────────────────────────────────┤
│ id (PK)                          │
│ user_id (FK→users)               │◄──── has many ai_generations
│ category_id (FK→categories, null)│
│ title (varchar 255)              │
│ content (longtext)               │
│ file_path (varchar 500, null)    │◄──── S3/R2 path for uploads
│ file_type (varchar 50, null)     │
│ word_count (int)                 │
│ created_at / updated_at          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          ai_generations          │
├──────────────────────────────────┤
│ id (PK)                          │
│ user_id (FK→users)               │
│ generatable_id (bigint)          │◄──── polymorphic: note/task id
│ generatable_type (varchar 100)   │◄──── polymorphic: App\Models\Note
│ type (enum: summary,quiz,        │
│        study_plan, chat)         │
│ status (enum: pending,done,fail) │
│ prompt_tokens (int)              │
│ completion_tokens (int)          │
│ model (varchar 50)               │
│ input_hash (varchar 64)          │◄──── SHA-256 for dedup/cache
│ result (json)                    │
│ error_message (text, null)       │
│ created_at / updated_at          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│          focus_sessions          │
├──────────────────────────────────┤
│ id (PK)                          │
│ user_id (FK→users)               │
│ task_id (FK→tasks, null)         │◄──── optional task association
│ started_at (timestamp)           │
│ ended_at (timestamp, null)       │
│ duration_minutes (int)           │
│ type (enum: pomodoro, freeform)  │
│ completed (boolean)              │
│ notes (text, null)               │
│ created_at / updated_at          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│             quizzes              │
├──────────────────────────────────┤
│ id (PK)                          │
│ user_id (FK→users)               │
│ note_id (FK→notes)               │◄──── source note
│ ai_generation_id (FK→ai_gens)    │
│ title (varchar 255)              │
│ status (enum: draft, published)  │
│ score (decimal 5,2, null)        │◄──── last attempt score
│ attempts_count (int, default 0)  │
│ created_at / updated_at          │
└─────────────────┬────────────────┘
                  │ 1
                  │ n
                  ▼
┌──────────────────────────────────┐
│          quiz_questions          │
├──────────────────────────────────┤
│ id (PK)                          │
│ quiz_id (FK→quizzes)             │
│ question (text)                  │
│ options (json)                   │◄──── [{label, value}, ...]
│ correct_answer (varchar 255)     │
│ explanation (text, null)         │
│ order_index (int)                │
│ created_at / updated_at          │
└──────────────────────────────────┘
```

### 6.2 Table Schemas (Migration Examples)

```php
// users
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->string('timezone', 50)->default('UTC');
    $table->unsignedSmallInteger('daily_focus_goal_minutes')->default(120);
    $table->rememberToken();
    $table->timestamps();
});

// tasks
Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
    $table->string('title');
    $table->text('description')->nullable();
    $table->enum('status', ['todo', 'in_progress', 'done', 'archived'])->default('todo');
    $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
    $table->date('due_date')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();

    $table->index(['user_id', 'status']);
    $table->index(['user_id', 'due_date']);
    $table->index(['user_id', 'created_at']);
});

// ai_generations
Schema::create('ai_generations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->morphs('generatable');     // generatable_id + generatable_type + index
    $table->enum('type', ['summary', 'quiz', 'study_plan', 'chat']);
    $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
    $table->unsignedInteger('prompt_tokens')->default(0);
    $table->unsignedInteger('completion_tokens')->default(0);
    $table->string('model', 50)->default('gpt-4o');
    $table->string('input_hash', 64)->nullable()->index();
    $table->json('result')->nullable();
    $table->text('error_message')->nullable();
    $table->timestamps();

    $table->index(['user_id', 'type', 'status']);
});
```

### 6.3 Indexing Strategy

| Table | Index | Type | Purpose |
|---|---|---|---|
| users | email | UNIQUE | Login lookup |
| tasks | (user_id, status) | COMPOSITE | Dashboard task list |
| tasks | (user_id, due_date) | COMPOSITE | Due-date filtered views |
| notes | (user_id, created_at) | COMPOSITE | Chronological note list |
| ai_generations | input_hash | INDEX | Deduplication / cache hits |
| ai_generations | (user_id, type, status) | COMPOSITE | Status polling |
| focus_sessions | (user_id, started_at) | COMPOSITE | Analytics date range queries |
| quiz_questions | quiz_id | INDEX | Quiz retrieval |

---

## 7. Authentication & Security

### 7.1 Sanctum Authentication Flow

```
Registration:
  POST /api/auth/register
    │
    ├── Validate (name, email, password, password_confirmation)
    ├── Hash password (bcrypt, cost=12)
    ├── Create User record
    ├── Fire Registered event → send verification email
    ├── Create Sanctum token: $user->createToken('web-client')
    └── Return { token, user }

Login:
  POST /api/auth/login
    │
    ├── Validate credentials
    ├── Auth::attempt() → fails → 401 "Invalid credentials"
    ├── Check email verified (if required)
    ├── Revoke all existing tokens (single session) OR keep (multi-session)
    ├── Create new Sanctum personal access token
    └── Return { token, user }

Authenticated Request:
  Any protected endpoint
    │
    ├── Middleware: auth:sanctum
    ├── Reads Authorization: Bearer {token}
    ├── Hashes token, looks up in personal_access_tokens table
    ├── Loads associated user → available as $request->user()
    └── Proceeds to controller

Logout:
  POST /api/auth/logout
    │
    └── $request->user()->currentAccessToken()->delete()
```

### 7.2 Password Security

```
- Algorithm: bcrypt (Laravel default)
- Work factor: 12 (balances security vs. latency)
- Password reset: signed URL, expires in 60 minutes
- Minimum requirements enforced at FormRequest level:
    - Min 8 characters
    - At least 1 uppercase, 1 number
    - Zxcvbn score ≥ 2 (optional: client-side strength meter)
```

### 7.3 Authorization (Policies)

```php
// app/Policies/TaskPolicy.php

final class TaskPolicy
{
    public function view(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }

    public function update(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }
}
```

All resource operations enforce policy checks. Route model binding automatically resolves models and the controller calls `$this->authorize()` before any mutation.

### 7.4 API Security Measures

| Threat | Mitigation |
|---|---|
| Brute force login | Throttle: 5 attempts / minute per IP via `ThrottleRequests` |
| Credential stuffing | Sanctum token rotation on login |
| Mass assignment | `$fillable` on all Eloquent models |
| SQL injection | Eloquent parameterized queries (no raw queries) |
| XSS | API returns JSON only; rendering is frontend's concern |
| CSRF | Sanctum token auth (stateless); no cookie-based sessions on API routes |
| IDOR | Policy layer checks `user_id` on every resource |
| AI prompt injection | Input sanitization + system prompt isolation |
| Sensitive data exposure | API Resources explicitly whitelist returned fields |
| Insecure file upload | MIME type validation, virus scan hook (optional), S3 storage (out of webroot) |

### 7.5 Rate Limiting

```php
// routes/api.php

Route::middleware(['throttle:60,1'])->group(function () {
    // 60 requests per minute for general API
});

Route::middleware(['throttle:ai_requests'])->group(function () {
    // Custom limiter for AI routes
});

// app/Providers/AppServiceProvider.php
RateLimiter::for('ai_requests', function (Request $request) {
    return Limit::perHour(20)->by($request->user()?->id)
        ->response(fn() => response()->json([
            'message' => 'AI request limit reached. Resets in 1 hour.',
        ], 429));
});
```

### 7.6 Environment Variables Security

```
- All secrets in .env, never committed to VCS
- .env.example contains only keys, no values
- Production secrets managed via Railway/DigitalOcean secret manager
- APP_KEY rotation procedure documented in runbook
- OPENAI_API_KEY scoped to minimum required permissions
- Database credentials use separate read/write users in production
```

---

## 8. AI Architecture

### 8.1 AI Service Abstraction

```php
// app/Services/AI/AIService.php

final class AIService
{
    public function __construct(
        private readonly OpenAIClient $client,
        private readonly AIGenerationRepository $generationRepo,
    ) {}

    public function queueSummary(Note $note, User $user): AIGeneration
    {
        $inputHash = $this->hashInput($note->content);

        // Return cached result if input is unchanged
        $existing = $this->generationRepo->findByHash($inputHash, 'summary', $note);
        if ($existing?->isCompleted()) {
            return $existing;
        }

        $generation = $this->generationRepo->create([
            'user_id'           => $user->id,
            'generatable_id'    => $note->id,
            'generatable_type'  => Note::class,
            'type'              => 'summary',
            'status'            => 'pending',
            'input_hash'        => $inputHash,
        ]);

        GenerateSummaryJob::dispatch($generation)->onQueue('ai');

        return $generation;
    }

    private function hashInput(string $content): string
    {
        return hash('sha256', trim($content));
    }
}
```

### 8.2 OpenAI Client Wrapper

```php
// app/Services/AI/OpenAIClient.php

final class OpenAIClient
{
    private readonly Client $http;

    public function __construct()
    {
        $this->http = \OpenAI::client(config('ai.openai_key'));
    }

    public function chat(array $messages, array $options = []): string
    {
        $response = retry(
            times: 3,
            callback: fn() => $this->http->chat()->create([
                'model'       => $options['model'] ?? config('ai.default_model'),
                'messages'    => $messages,
                'max_tokens'  => $options['max_tokens'] ?? 1000,
                'temperature' => $options['temperature'] ?? 0.7,
            ]),
            sleepMilliseconds: fn(int $attempt) => $attempt * 2000,
            when: fn(Throwable $e) => $e instanceof \OpenAI\Exceptions\TransporterException,
        );

        return $response->choices[0]->message->content;
    }
}
```

### 8.3 Prompt Engineering Structure

All prompts are first-class objects, not inline strings:

```php
// app/Services/AI/Prompts/SummaryPrompt.php

final class SummaryPrompt
{
    public function build(string $content, string $style = 'concise'): array
    {
        $styleInstructions = match($style) {
            'concise'    => 'Summarize in 3-5 bullet points. Be direct.',
            'detailed'   => 'Provide a structured summary with headings and key concepts.',
            'flashcards' => 'Extract 5-10 key facts as short Q&A pairs.',
            default      => 'Summarize clearly and concisely.',
        };

        return [
            [
                'role'    => 'system',
                'content' => <<<SYSTEM
                You are an academic study assistant. Your role is to help students
                understand and retain information from their study notes.
                Always respond in well-structured markdown.
                Never fabricate information not present in the provided notes.
                SYSTEM,
            ],
            [
                'role'    => 'user',
                'content' => <<<USER
                Please summarize the following study notes.

                Style: {$styleInstructions}

                --- NOTES BEGIN ---
                {$content}
                --- NOTES END ---
                USER,
            ],
        ];
    }
}
```

### 8.4 Queue-Based AI Job

```php
// app/Jobs/GenerateSummaryJob.php

final class GenerateSummaryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [30, 120, 300];
    public int $timeout = 120;

    public function __construct(private readonly AIGeneration $generation) {}

    public function handle(AIService $aiService, SummaryPrompt $prompt): void
    {
        $this->generation->update(['status' => 'processing']);

        try {
            $note = $this->generation->generatable;
            $messages = $prompt->build($note->content);

            $result = $aiService->getClient()->chat($messages, [
                'max_tokens'  => 800,
                'temperature' => 0.5,
            ]);

            $this->generation->update([
                'status' => 'completed',
                'result' => ['summary' => $result],
            ]);

            event(new AIGenerationCompleted($this->generation));

        } catch (Throwable $e) {
            $this->generation->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        $this->generation->update(['status' => 'failed']);
        Log::error('Summary generation permanently failed', [
            'generation_id' => $this->generation->id,
            'error'         => $exception->getMessage(),
        ]);
    }
}
```

### 8.5 Token Optimization Strategy

| Strategy | Implementation |
|---|---|
| Input deduplication | SHA-256 hash of content; skip AI call if hash matches existing completed generation |
| Content truncation | Strip HTML, normalize whitespace, truncate to `max_input_chars` before sending |
| Model selection | GPT-4o-mini for short tasks (chat, simple summary), GPT-4o for complex (study plan, quiz) |
| Prompt caching | Stable system prompts structured to maximize OpenAI prompt cache hit rate |
| Result caching | `ai_generations.result` stores response; re-use until content changes |
| Streaming (future) | Stream tokens to frontend via SSE for long responses to improve perceived latency |

---

## 9. API Design

### 9.1 API Conventions

```
Base URL:     https://api.focusforgeai.com/api/v1
Auth Header:  Authorization: Bearer {token}
Content-Type: application/json
Accept:       application/json

Success:      2xx with JSON body
Errors:       { "message": "...", "errors": {...} }
Pagination:   { "data": [...], "meta": { "current_page", "last_page", "total" } }
```

### 9.2 Authentication Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create account + return token |
| POST | `/auth/login` | Authenticate + return token |
| POST | `/auth/logout` | Revoke current token |
| GET | `/auth/me` | Get authenticated user profile |
| PUT | `/auth/me` | Update profile (name, timezone, goal) |
| POST | `/auth/forgot-password` | Send password reset email |
| POST | `/auth/reset-password` | Reset password via signed token |

### 9.3 Task Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/tasks` | List tasks (filter: status, category, due_before, page) |
| POST | `/tasks` | Create task |
| GET | `/tasks/{id}` | Get single task |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| PATCH | `/tasks/{id}/complete` | Mark task complete |
| GET | `/tasks/today` | Tasks due today |
| GET | `/tasks/overdue` | Overdue tasks |

### 9.4 Notes Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/notes` | List notes (filter: category, search, page) |
| POST | `/notes` | Create note (body: title, content, category_id) |
| GET | `/notes/{id}` | Get note with AI generations |
| PUT | `/notes/{id}` | Update note |
| DELETE | `/notes/{id}` | Delete note |
| POST | `/notes/{id}/upload` | Upload document (PDF/DOCX), extract text |

### 9.5 AI Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/ai/summarize` | Queue summary for a note |
| POST | `/ai/quiz` | Queue quiz generation from a note |
| POST | `/ai/study-plan` | Queue study plan generation |
| POST | `/ai/chat` | Send chat message (sync, short) |
| GET | `/ai/generations/{id}` | Poll generation status + result |
| GET | `/ai/generations` | List user's AI generation history |

**Example Request — Generate Summary:**
```json
POST /api/v1/ai/summarize
{
  "note_id": 42,
  "style": "concise"
}

Response 202 Accepted:
{
  "data": {
    "id": 7,
    "status": "pending",
    "type": "summary",
    "created_at": "2026-05-27T10:00:00Z"
  }
}
```

**Poll for Result:**
```json
GET /api/v1/ai/generations/7

Response 200 OK (completed):
{
  "data": {
    "id": 7,
    "status": "completed",
    "type": "summary",
    "result": {
      "summary": "- Key concept A\n- Key concept B\n- Key concept C"
    },
    "model": "gpt-4o",
    "prompt_tokens": 312,
    "completion_tokens": 87
  }
}
```

### 9.6 Focus Session Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/focus/sessions` | Start a focus session |
| PATCH | `/focus/sessions/{id}/complete` | End and record session |
| GET | `/focus/sessions` | List sessions (filter: date range) |
| GET | `/focus/sessions/today` | Today's sessions |

### 9.7 Quiz Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/quizzes` | List user's quizzes |
| GET | `/quizzes/{id}` | Get quiz with questions |
| POST | `/quizzes/{id}/attempt` | Submit quiz answers, get score |
| DELETE | `/quizzes/{id}` | Delete quiz |

### 9.8 Analytics Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/analytics/overview` | Summary stats (tasks done, focus time, streak) |
| GET | `/analytics/focus` | Focus time by day/week/month |
| GET | `/analytics/tasks` | Task completion rate over time |
| GET | `/analytics/productivity-score` | Computed productivity score |

### 9.9 Category Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/categories` | List user's categories |
| POST | `/categories` | Create category |
| PUT | `/categories/{id}` | Update category |
| DELETE | `/categories/{id}` | Delete category |

---

## 10. DevOps & Deployment

### 10.1 Environment Architecture

```
Development:
  Frontend:  localhost:3000  (next dev)
  Backend:   localhost:8000  (php artisan serve)
  DB:        localhost:5432  (Docker PostgreSQL)
  Redis:     localhost:6379  (Docker Redis)
  Horizon:   localhost:8000/horizon

Staging:
  Frontend:  staging.focusforgeai.com  (Vercel preview branch)
  Backend:   api-staging.focusforgeai.com  (Railway staging env)
  DB:        Separate PostgreSQL instance
  Redis:     Railway Redis

Production:
  Frontend:  focusforgeai.com  (Vercel production)
  Backend:   api.focusforgeai.com  (Railway production)
  DB:        Managed PostgreSQL (Railway / Supabase)
  Redis:     Managed Redis (Railway / Upstash)
  Storage:   Cloudflare R2 or AWS S3
```

### 10.2 Docker Strategy (Local Development)

```yaml
# docker-compose.yml

version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: focusforge
      POSTGRES_USER: focusforge
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI

volumes:
  pg_data:
```

### 10.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/api.yml

name: API CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: focusforge_test
          POSTGRES_USER: forge
          POSTGRES_PASSWORD: secret
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: pdo, pdo_pgsql, redis
          coverage: pcov

      - run: composer install --no-interaction --prefer-dist
      - run: cp .env.example .env.testing
      - run: php artisan key:generate --env=testing
      - run: php artisan migrate --env=testing --force
      - run: php artisan test --coverage --min=80

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: railwayapp/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: focusforge-api
```

### 10.4 Production Deployment Checklist

```
Before deploy:
  □ All tests green on CI
  □ .env.production reviewed — no debug flags, APP_DEBUG=false
  □ Database migration reviewed (backward compatible, no full table locks)
  □ Rollback plan documented

Deploy sequence:
  1. Run migrations (php artisan migrate --force)
  2. Deploy new application code
  3. Clear and rebuild caches (php artisan optimize)
  4. Restart queue workers (php artisan horizon:terminate + auto-restart)
  5. Smoke test critical paths (health check endpoint, login, task create)

Post deploy:
  □ Monitor error rate in Sentry for 15 minutes
  □ Check queue depth in Horizon dashboard
  □ Verify AI generation pipeline with test request
```

### 10.5 Monitoring & Observability

| Concern | Tool | Configuration |
|---|---|---|
| Error tracking | Sentry | Alert on new issue types; daily digest |
| Application logs | Laravel Log + Papertrail | Structured JSON logs |
| Queue monitoring | Laravel Horizon | Slack alert on queue depth > 50 |
| Uptime | BetterUptime / UptimeRobot | 1-min check; page on 2 failures |
| Performance | Clockwork (dev) / Telescope (staging) | N+1 detection, slow queries |
| Database | pg_stat_statements | Weekly slow query review |

---

## 11. Scalability Design

### 11.1 Current Scale Targets (MVP)

```
Concurrent users:        500
Daily active users:      5,000
API requests/day:        500,000
AI generations/day:      10,000
Database size (1 year):  ~20 GB
```

### 11.2 Scaling Architecture

```
Stateless API Design:
  └── No server-side session state
  └── All user state in database + token
  └── Multiple API instances can run behind load balancer without coordination

Horizontal Scaling Path:
  ┌─────────────────────────────────────────────┐
  │           Load Balancer (Railway)           │
  └──────┬───────────────┬──────────────────────┘
         │               │
   ┌─────▼─────┐   ┌─────▼─────┐
   │ API Pod 1 │   │ API Pod 2 │  ← Scale to N replicas
   └─────┬─────┘   └─────┬─────┘
         │               │
   ┌─────▼───────────────▼─────┐
   │     Shared PostgreSQL      │
   └───────────────────────────┘
         │
   ┌─────▼───────┐
   │ Shared Redis │  ← Queue, cache, sessions
   └─────────────┘

Queue Workers (separate process pool):
  ├── ai-worker-1  → queue:ai
  ├── ai-worker-2  → queue:ai
  └── default-worker-1 → queue:default
      (scale independently from API servers)
```

### 11.3 Database Optimization

```
Read Replicas (when needed):
  └── Analytics queries routed to read replica
  └── App::make(ReadConnection::class) for read-heavy operations

Connection Pooling:
  └── PgBouncer in transaction mode (Railway managed)
  └── Max 20 connections per API instance

Query Optimization:
  └── Eager loading with ->with() to prevent N+1 (enforced by Telescope in staging)
  └── Pagination on all list endpoints (max 50 per page)
  └── Chunking for bulk operations (->chunk(100))
  └── Deferred counts: ->withCount() only when needed

Archiving Strategy:
  └── focus_sessions older than 2 years → archive partition
  └── ai_generations older than 1 year with no associated active note → prune
```

### 11.4 Caching Strategy

```
Layer 1 — Application Cache (Redis):
  Key: user:{id}:dashboard_stats  TTL: 5 min
  Key: user:{id}:categories       TTL: 1 hour (invalidated on category mutation)
  Key: ai_gen:hash:{sha256}       TTL: 24 hours (dedup cache)

Layer 2 — HTTP Cache:
  GET /categories → Cache-Control: private, max-age=300
  GET /analytics/overview → Cache-Control: private, max-age=60

Layer 3 — CDN (Vercel Edge):
  Static assets: immutable cache (content-hashed filenames)
  API routes proxied to Railway: no CDN caching (authenticated)
```

### 11.5 CDN Usage

```
Vercel Edge Network:
  └── Serves Next.js static files globally
  └── ISR (Incremental Static Regeneration) for any public-facing pages
  └── Edge middleware for auth redirect (avoids round-trip to origin)

Cloudflare R2 / AWS S3:
  └── User-uploaded documents served via CDN-fronted bucket URL
  └── Signed URLs with 1-hour expiry for private document access
```

---

## 12. Clean Code & Engineering Standards

### 12.1 SOLID Principles Applied

| Principle | Application |
|---|---|
| **S** — Single Responsibility | `TaskService` only handles task business logic; `AnalyticsService` only handles analytics |
| **O** — Open/Closed | AI prompt classes extended via strategy pattern, not modified |
| **L** — Liskov Substitution | `TaskRepositoryInterface` → swap Eloquent for array-backed fake in tests |
| **I** — Interface Segregation | Separate repository interfaces per domain; no "god repository" |
| **D** — Dependency Inversion | Services receive dependencies via constructor injection; no `new` inside services |

### 12.2 DRY — Don't Repeat Yourself

```
- Shared validation rules extracted to FormRequest base classes
- Repeated Eloquent scopes defined on model (scopeForUser, scopeCompleted)
- API response transformation centralized in Resource classes
- Common test setup in base TestCase trait
```

### 12.3 KISS — Keep It Simple

```
- No microservices until a single service becomes a bottleneck
- No GraphQL — REST is sufficient for defined query patterns
- No complex event sourcing — standard CRUD with event side effects
- No premature optimization — profile before caching
```

### 12.4 Naming Conventions

```
PHP / Laravel:
  Classes:          PascalCase         (TaskService, AIGeneration)
  Methods:          camelCase          (createTask, generateSummary)
  Variables:        camelCase          ($userId, $noteContent)
  Database tables:  snake_case plural  (ai_generations, focus_sessions)
  Columns:          snake_case         (user_id, created_at)
  Routes:           kebab-case         (/focus-sessions, /study-plans)
  Events:           PastTense noun     (TaskCreated, FocusSessionCompleted)
  Jobs:             Verb + noun + Job  (GenerateSummaryJob)

TypeScript / React:
  Components:       PascalCase         (TaskCard, PomodoroTimer)
  Hooks:            camelCase, use*    (useTasks, usePomodoro)
  Types/Interfaces: PascalCase         (Task, CreateTaskPayload)
  API functions:    camelCase          (createTask, generateSummary)
  CSS classes:      Tailwind utilities (no custom CSS names)
  Stores:           camelCase + Store  (authStore, uiStore)
```

### 12.5 Git Workflow

```
Branch Strategy (GitHub Flow with environments):

main          → production (auto-deploy on merge)
develop       → staging    (auto-deploy on push)
feature/*     → PR into develop
bugfix/*      → PR into develop
hotfix/*      → PR into main (emergency) + backport to develop

Commit Convention (Conventional Commits):
  feat:     New feature
  fix:      Bug fix
  chore:    Tooling, dependencies
  refactor: Code change without behavior change
  test:     Test additions or corrections
  docs:     Documentation updates

Examples:
  feat(tasks): add priority filter to task list endpoint
  fix(ai): handle OpenAI rate limit response with exponential backoff
  chore(deps): upgrade laravel/framework to 11.x

PR Requirements:
  ✓ CI passes
  ✓ 1 reviewer approval
  ✓ No unresolved comments
  ✓ Linked to issue/ticket
```

### 12.6 Testing Strategy

```
Backend (Laravel):
  Unit tests:     Services, Repositories — fast, no DB
  Feature tests:  Controller tests using RefreshDatabase
  Coverage:       Minimum 80% on Services, Controllers

Frontend (Next.js):
  Unit tests:     Utility functions, custom hooks (Vitest)
  Component tests:Component rendering and interaction (Testing Library)
  E2E tests:      Critical user flows (Playwright) — login, create task, generate summary
```

---

## 13. Development Roadmap

### Phase 1 — Foundation (Weeks 1–3)

```
Goal: Working authenticated application with core task/note CRUD

Backend:
  □ Laravel project setup with Sanctum
  □ PostgreSQL schema + migrations (all tables)
  □ Auth endpoints (register, login, logout, me)
  □ Task CRUD endpoints + policies
  □ Note CRUD endpoints + policies
  □ Category CRUD endpoints
  □ FormRequest validation for all endpoints
  □ API Resources for all models
  □ Base test setup + auth tests

Frontend:
  □ Next.js project setup with TypeScript + Tailwind
  □ Auth pages (login, register)
  □ Middleware for route protection
  □ API client with interceptors
  □ Dashboard shell (sidebar, topbar)
  □ Task list + create/edit/delete UI
  □ Note list + basic editor UI
  □ Category management UI
```

### Phase 2 — Core AI Features (Weeks 4–6)

```
Goal: AI summarization and quiz generation functional end-to-end

Backend:
  □ Redis + Laravel Horizon setup
  □ AIService + OpenAIClient wrapper
  □ SummaryPrompt, QuizPrompt classes
  □ GenerateSummaryJob + GenerateQuizJob
  □ AI endpoints (summarize, quiz, poll)
  □ AIGeneration model + repository
  □ Rate limiting for AI routes
  □ Input hash deduplication

Frontend:
  □ Note detail view with AI actions panel
  □ Generate summary button + status polling
  □ Summary display in markdown
  □ Quiz generation + quiz runner UI
  □ Quiz results display
  □ AI generation history view
```

### Phase 3 — Focus & Analytics (Weeks 7–9)

```
Goal: Pomodoro timer with session recording and analytics dashboard

Backend:
  □ FocusSession CRUD endpoints
  □ AnalyticsService (overview, focus, task completion)
  □ Analytics endpoints
  □ Analytics recording listeners (async)

Frontend:
  □ Pomodoro timer component (Zustand-persisted state)
  □ Session history
  □ Analytics dashboard with charts (Recharts)
  □ Productivity heatmap
  □ Streak widget
```

### Phase 4 — Polish & Production (Weeks 10–12)

```
Goal: Production-ready deployment with monitoring

Infrastructure:
  □ Vercel production deployment
  □ Railway production environment
  □ Managed PostgreSQL + Redis
  □ S3/R2 file storage
  □ Sentry error tracking
  □ Uptime monitoring
  □ GitHub Actions CI/CD

Features:
  □ Document upload (PDF extraction)
  □ AI chat interface
  □ Study plan generation
  □ Password reset flow
  □ Email notifications (session complete, AI ready)
  □ Mobile-responsive UI polish

Quality:
  □ E2E test suite (Playwright)
  □ Performance audit (Lighthouse, query optimization)
  □ Security review (OWASP checklist)
  □ Load testing (k6, 500 concurrent users)
```

---

## 14. Future Enhancements

### 14.1 Real-Time Collaboration

```
Technology: Laravel Broadcasting + Pusher / Soketi
Use cases:
  - Shared study rooms: multiple users view the same note/quiz simultaneously
  - Collaborative task boards: team projects with shared task lists
  - Live AI generation status pushed to client (replaces polling)

Architecture:
  Backend broadcasts events on private channels:
    channel: private-user.{id}
    event: AIGenerationCompleted → push result to client

  Frontend subscribes with Laravel Echo:
    Echo.private(`user.${userId}`).listen('AIGenerationCompleted', handler)
```

### 14.2 AI Voice Assistant

```
Stack: Web Speech API (browser) + Whisper API (transcription) + TTS
Flow:
  1. User clicks mic → browser records audio
  2. Audio sent to /api/ai/voice → Whisper transcription
  3. Transcript processed by chat pipeline
  4. Response text → OpenAI TTS → audio stream
  5. Browser plays response

Use cases:
  - "Add task: submit physics assignment by Friday"
  - "Summarize my chemistry notes"
  - "Start a 25-minute focus session on algorithms"
```

### 14.3 Calendar Integration

```
Integrations: Google Calendar API, Apple Calendar (CalDAV), Outlook
Features:
  - Sync tasks with due dates to calendar
  - Block focus sessions on calendar
  - Import calendar events as tasks
  - Study plan auto-scheduled around existing events
```

### 14.4 Mobile App

```
Technology: React Native (code share with Next.js via shared packages)
Architecture:
  - Same Laravel API — no backend changes needed
  - Shared TypeScript types and API client from monorepo packages/
  - Offline-first: SQLite local cache + background sync
  - Push notifications via FCM/APNs for session reminders
```

### 14.5 Recommendation Engine

```
Mechanism:
  - Track user behavior: time of day for focus sessions, task completion rate by category, quiz scores
  - Lightweight collaborative filtering: users with similar patterns → surface popular note structures
  - AI-powered suggestions: "Based on your quiz scores, you may need to review Chapter 3"
  - Scheduled job: nightly recommendations batch (GenerateRecommendationsJob)

Initial model: rule-based heuristics (no ML infrastructure needed at launch)
Advanced: store embeddings in pgvector, cosine similarity for content recommendations
```

### 14.6 RAG (Retrieval-Augmented Generation)

```
Purpose: Allow AI chat to answer questions grounded in the user's own notes

Architecture:
  ┌──────────────┐    chunk + embed     ┌────────────────┐
  │  User Notes  │ ─────────────────── ►│  pgvector DB   │
  └──────────────┘                      │  (embeddings)  │
                                        └───────┬────────┘
  User asks: "What does my note                 │ semantic search
  say about mitosis?"                           │
         │                                      ▼
         │                          top-k relevant chunks
         │                                      │
         ▼                                      ▼
  ┌────────────────────────────────────────────────────────┐
  │  GPT-4o: Answer using only the provided context        │
  └────────────────────────────────────────────────────────┘

Stack:
  - text-embedding-3-small for embedding generation
  - pgvector extension on PostgreSQL
  - note_embeddings table: (id, note_id, chunk_index, content, embedding vector(1536))
  - ProcessNoteEmbeddingsJob: triggered on note save
```

---

*This document is a living specification. It should be updated as architectural decisions evolve, new features are scoped, and production learnings surface. All significant architectural changes should be proposed as ADRs (Architecture Decision Records) and reviewed before implementation.*

---

**Document Owner:** Engineering Lead
**Last Reviewed:** 2026-05-27
**Next Review:** 2026-08-27
