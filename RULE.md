# FocusForge AI — Branch & Commit Rules

## Branch Strategy

### New Task → New Branch
Create a fresh branch for every new feature or task.

**Naming convention:**
```
feature/phase{N}-{short-description}    # new feature
fix/{short-description}                 # standalone bug fix
hotfix/{short-description}              # urgent prod fix
```

**Examples:**
```
feature/phase5-groq-ai
feature/phase6-notifications
fix/floating-timer-drag
hotfix/login-redirect-loop
```

### Updating an Existing Feature → Reuse Its Branch
If a task is a follow-up, adjustment, or improvement to a feature that already has an open branch, commit directly to that branch — do **not** create a new one.

**Examples:**
- Adding more colors to the category picker → push to `feature/phase5-category-icon-picker`
- Making the icon grid scrollable (follow-up to icon picker) → same branch
- Fixing a bug introduced in a feature branch before it's merged → same branch

### Merge Flow
```
feature/* or fix/* → develop → qa → staging → main
```
Never push directly to `main` or `develop`. Always go through a feature branch.

---

## Current Open Branches (as of 2026-07-08)

| Branch | Description | Status |
|---|---|---|
| `feature/phase5-focus-timer-improvements` | Floating timer, session history, presets | Merged to develop |
| `feature/phase5-groq-ai` | Replace MockAIClient with Groq API | Open |
| `feature/phase5-note-card-title` | Bigger note card title, remove hover color | Open |
| `feature/phase5-category-icon-picker` | Emoji icon picker + 36 color palette | Open |
| `feature/phase5-confirm-modal` | Replace browser confirm() with modal | Open |
| `feature/phase5-custom-favicon` | Custom SVG favicon | Open |
| `feature/phase5-ai-chat-scroll` | Fix AI chat bubble scroll | Open |
| `feature/phase5-seed-notes` | Seed sample notes for testing | Open |
| `feature/phase5-quiz-fix` | Fix delete quiz undefined bug + 404 error | Open |
| `feature/phase5-quiz-customization` | Quiz answer keyword matching improvements | Open |
| `feature/phase5-quiz-export` | Export quizzes to Word doc with drag-and-drop ordering | Open |
| `feature/phase5-task-deadline-time` | Task datetime due date, deadline notifications, inline status picker on dashboard | Open |
| `feature/phase5-category-in-notes` | Move category management into notes page, remove from sidebar | Open |
| `feature/phase5-change-password` | Change password section in settings with eye toggle | Open |

---

## Commit Message Format

```
type(scope): short description

type  = feat | fix | refactor | style | chore | docs
scope = the feature area (e.g. focus, notes, admin, ai, categories)
```

**Examples:**
```
feat(ai): integrate Groq API for real chat and study plan responses
fix(admin): loading spinner scoped to clicked user row
feat(categories): expand color palette from 12 to 36 preset colors
```

---

## Summary

| Situation | Action |
|---|---|
| Building something new | New branch |
| Adjusting / improving an existing open feature | Existing branch |
| Bug introduced in an open feature branch | Fix on that same branch |
| Bug found in develop/main after merge | New `fix/` branch |
| Urgent production issue | New `hotfix/` branch off `main` |
