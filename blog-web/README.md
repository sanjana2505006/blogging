# Blog Web (Next.js + Supabase + AI Summaries)

A simple blogging platform built with **Next.js** and **Supabase** with:

- Role-based access control for **Author / Viewer / Admin**
- `users`, `posts`, `comments` schema in Supabase
- Automatic **~200-word** post summaries using the **Google Gemini API**

## Tech Stack

- **Frontend/Backend:** Next.js (App Router, TypeScript)
- **Auth + Database:** Supabase Auth + Supabase Postgres
- **RBAC:** Supabase Row Level Security (RLS)
- **AI Summaries:** Google Gemini API (`@google/generative-ai`)

## AI Tools Used (Development)

- Cursor: used for implementing and wiring the Next.js + Supabase integration (routing, RLS checks, and API handlers).
- (Optional) Any Gemini prompt helper/editor features: used to iterate on the summary prompt and keep output strictly plain text.

## Database Setup (Supabase)

1. Create a Supabase project.
2. Run the SQL file: `supabase/schema.sql`
3. Configure Auth settings as needed (email/password is used in the app).
4. Assign roles for testing (Supabase Dashboard > SQL editor):

   ```sql
   update public.users
   set role = 'author'
   where email = 'your-email@example.com';
   ```

   Set `role = 'admin'` similarly.

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_GEMINI_API_KEY`

## Run Locally

```bash
cd "blog-web"
npm install
npm run dev
```

Then open the dev URL shown in the terminal.

## How the AI Feature Works

When an Author/Admin publishes a new post (`POST /api/posts/create`):

1. The app inserts the post into `public.posts` with `summary = NULL`.
2. The server generates a ~200-word summary using Gemini.
3. The app updates the same row with `posts.summary`.

Token/cost optimizations:

- Summary generation happens **only once** (on post creation) and the result is stored in the database to avoid repeated API calls.

## Role-Based Access Logic

Permissions match the assignment requirement:

- **Author**
  - Can create posts (`posts_author_insert_own`)
  - Can edit their own posts (`posts_author_update_own`)
  - Can view comments on posts (comment read policy is public)
- **Viewer**
  - Can read posts and summaries (public select policy)
  - Can comment on posts (`comments_role_insert`)
- **Admin**
  - Can view all posts (public select policy)
  - Can edit any post (`posts_admin_update_any`)
  - Can update user roles (`users_admin_update_role`)

## Feature Logic Summary (Authentication + Flow)

- Authentication uses Supabase email/password.
- After signup, a Supabase trigger (`handle_new_user`) creates/updates a row in `public.users` with a default role of `viewer`.
- Role checks are enforced in two layers:
  - UI route protection (e.g., only Author/Admin can access `/posts/new` and `/posts/[id]/edit`)
  - Database-level RLS policies for `users`, `posts`, and `comments`

## Development Understanding

- Cost optimization: summary generation runs **only once** on post creation and is stored in `posts.summary` to prevent repeated Gemini calls.
- Key architectural decisions:
  - Server-side API routes (`/api/posts/create`, `/api/posts/[id]`, `/api/comments`) handle writes so RLS + role checks remain consistent.
  - RLS is the source of truth for permissions (not only frontend checks).
- Bug encountered & resolution (example):
  - Next.js route handler typing/signature mismatch for the dynamic `[id]` API route was fixed by awaiting `context.params` in the handler.

## Deployment (VPS)

This app is deployed as a standard Next.js server on your VPS:

1. Install Node.js (same major version as your local dev; Node 20+ recommended).
2. Clone/pull your repository on the VPS.
3. Create `.env.local` on the VPS with the required environment variables.
4. Build and start:

   ```bash
   npm install
   npm run build
   npm run start
   ```

5. Ensure the VPS firewall/security group allows inbound traffic for the port you run on (commonly `3000`).

## Notes for Submission

Deliverables to include in your submission:

1. GitHub repository link
2. Live deployed URL
3. Short written explanation covering:
   - AI tools used and why
   - Feature logic: authentication flow, role-based access, and AI summary flow

