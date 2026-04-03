# Short Written Explanation (For PDF Submission)

This document covers the four required explanation areas:

1. AI Tools
2. Feature Logic
3. Cost Optimization
4. Development Understanding

---

## 1) AI Tools

### Tool(s) used
- **Cursor (AI coding assistant)** for implementation support, debugging, and iterative refinement.
- **Google Gemini API** for AI-generated blog summaries.

### Why these tools were selected
- Cursor was selected to accelerate full-stack development tasks (routing, API handlers, Supabase integration, and UI refinements) while keeping code quality and consistency.
- Gemini API was selected because it offers a free-tier-friendly text generation option suitable for summary generation requirements.

### How AI tools helped development
- Faster scaffolding and refactoring of Next.js App Router pages and API routes.
- Quicker debugging of runtime/type issues (e.g., dynamic route params handling).
- Better iteration speed for summary prompt design and response quality.

---

## 2) Feature Logic

### Authentication flow
- Users can create accounts from `/signup` and sign in from `/login`.
- Supabase Auth is used for user identity.
- On user creation, a DB trigger (`handle_new_user`) syncs/creates a corresponding row in `public.users`.
- Session-aware behavior is applied across protected routes and API handlers.

### Role-based access
Three roles are supported:
- **Author**
  - Create posts
  - Edit own posts
  - View comments
- **Viewer**
  - View posts and summaries
  - Add comments
- **Admin**
  - View all posts
  - Edit any post
  - Manage role-related operations

Role checks are enforced in two layers:
- **UI/route layer** (e.g., guarded pages like `/posts/new`, `/posts/[id]/edit`)
- **Database layer (RLS)** to enforce permissions at data access level

### Post creation logic
- Author/Admin submits post data (title, body, optional image URL).
- Backend API validates input and inserts a new row in `public.posts`.
- Post appears in listing and detail pages.
- Edit functionality is restricted based on role and ownership rules.

### AI summary generation flow
- On post creation, server calls Gemini with title/body prompt.
- A ~200-word plain text summary is generated.
- The summary is stored in `posts.summary`.
- Listing page and detail page read and render the stored summary.

---

## 3) Cost Optimization

### Token reduction strategy
- Prompt is concise and task-specific (summary-only output, no verbose formatting).
- Output constraints (plain text and approximate length) reduce unnecessary token usage.

### Generate summary only once
- Summary generation is triggered on **post creation**, not on every page view.
- This avoids repeated model calls for the same content.

### Store summaries in database
- Generated summaries are persisted in `public.posts.summary`.
- Pages read directly from DB for subsequent views, eliminating redundant API usage and reducing cost.

---

## 4) Development Understanding

### Bug encountered and resolution
- **Issue:** Dynamic route parameter handling in Next.js (`/posts/[id]`) caused runtime warnings because `params` needed async unwrapping.
- **Fix:** Updated route/page handling to correctly await route params before query usage.

Additional practical issue:
- **Issue:** Auth email rate-limit friction during repeated signup attempts.
- **Fix:** Introduced dedicated signup flow and safer testing approach to reduce repeated email trigger failures.

### Key architectural decisions
- Chose **Next.js App Router** with server/client separation for clean data flow and route-based APIs.
- Kept authorization logic in **RLS policies** so DB is source of truth for permissions.
- Used dedicated API routes for post/comment mutations to centralize validation and role checks.
- Stored AI output in DB for performance and cost efficiency.
- Added search/pagination at query level for scalable listing behavior.

---

## Closing Note

The implementation prioritizes:
- Correct role-based behavior,
- Stable Supabase-backed data access,
- Practical AI integration with cost-aware design,
- And clear, explainable architecture aligned with assignment evaluation criteria.

