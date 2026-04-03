# Blog Web - Next.js + Supabase + Gemini

A full-stack blogging platform built for the assignment requirements.

Core capabilities:
- Role-based access (`author`, `viewer`, `admin`)
- Supabase-backed schema (`users`, `posts`, `comments`)
- AI-generated post summaries (~200 words) using Gemini
- Search + pagination in post listing
- Create/edit posts and comments with permission checks

---

## 1) Assignment Coverage

This project covers the required areas from the brief:

- **Tech stack:** Next.js + Supabase Auth + Supabase Postgres + Git/GitHub + Gemini API
- **Roles:** Author, Viewer, Admin with role-specific permissions
- **Blog post features:** title, image, body, comments, edit flow, listing
- **AI feature:** summary generated once on post creation and stored in DB
- **Database:** tables and relationships in Supabase with RLS
- **Repository + README:** setup, run, deploy, architecture notes

---

## 2) Tech Stack

- **App framework:** Next.js App Router (TypeScript)
- **UI:** Custom CSS (editorial theme)
- **Auth:** Supabase Auth (email/password)
- **Database:** Supabase Postgres
- **Authorization:** Row Level Security (RLS) policies
- **AI integration:** `@google/generative-ai`

---

## 3) Project Structure

```txt
src/
  app/
    api/
      auth/signup/route.ts
      posts/create/route.ts
      posts/[id]/route.ts
      comments/route.ts
    login/page.tsx
    signup/page.tsx
    posts/new/page.tsx
    posts/[id]/page.tsx
    posts/[id]/edit/page.tsx
    page.tsx
  components/
    NavBar.tsx
    AuthActions.tsx
    PostForm.tsx
    CommentForm.tsx
  lib/
    summarize.ts
    getUserRole.ts
    authBypass.ts
    supabase/
      client.ts
      server.ts
      admin.ts
supabase/
  schema.sql
```

---

## 4) Database Schema (Supabase)

Run `supabase/schema.sql` in Supabase SQL Editor.

### Tables

1. **`public.users`**
   - `id` (uuid, PK, references `auth.users.id`)
   - `name` (text)
   - `email` (text)
   - `role` (`author` | `viewer` | `admin`)

2. **`public.posts`**
   - `id` (uuid, PK)
   - `title` (text)
   - `body` (text)
   - `image_url` (text, optional)
   - `author_id` (uuid, FK -> `users.id`)
   - `summary` (text)
   - `created_at`, `updated_at`

3. **`public.comments`**
   - `id` (uuid, PK)
   - `post_id` (uuid, FK -> `posts.id`)
   - `user_id` (uuid, FK -> `users.id`)
   - `comment_text` (text)
   - `created_at`

### Trigger

- `handle_new_user` trigger syncs new auth users into `public.users`.

### RLS Policies

- Public read:
  - `posts_public_read`
  - `comments_public_read`
  - `users_public_read_basic` (for author byline joins)
- Author/Admin write:
  - `posts_author_insert_own`
  - `posts_author_update_own`
  - `posts_admin_update_any`
- Viewer/Author/Admin comment:
  - `comments_role_insert`
- Admin role management:
  - `users_admin_update_role`

---

## 5) Authentication and Roles

### Signup

- UI page: `/signup`
- API route: `POST /api/auth/signup`
- Uses Supabase Admin API (`SUPABASE_SECRET_KEY`) to create users with `email_confirm: true` for easier testing.

### Login

- UI page: `/login`
- Uses Supabase browser client sign-in.

### Role assignment

Default role is `viewer`. Promote users via SQL:

```sql
update public.users
set role = 'author'
where email = 'your-email@example.com';
```

For admin:

```sql
update public.users
set role = 'admin'
where email = 'admin-email@example.com';
```

---

## 6) AI Summary Flow

When a post is published:

1. `POST /api/posts/create` inserts post row with `summary = null`
2. `generateGeminiSummary()` is called
3. Summary text is written back to `posts.summary`
4. Listing/detail pages display summary from DB

### Cost optimization

- Summary is generated **once per post creation**
- Stored in DB to avoid repeated API calls on page reads

### Model fallback

The app tries multiple Gemini model names in order, reducing breakage when one model alias is unavailable.

---

## 7) Search and Pagination

Implemented in `src/app/page.tsx`:

- Query parameter `q`: searches title and summary
- Query parameter `page`: paginates listing
- Page size is currently `6`

Examples:
- `/` -> first page, no filter
- `/?q=devops` -> filtered results
- `/?q=devops&page=2` -> second page filtered

---

## 8) Environment Variables

Create `.env.local` from `.env.example`.

Required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_GEMINI_API_KEY=
SUPABASE_SECRET_KEY=
```

Optional (local testing only):

```env
AUTH_BYPASS=false
NEXT_PUBLIC_AUTH_BYPASS=false
```

> Keep bypass flags `false` for final behavior/demo.

---

## 9) Local Setup

```bash
cd "/Users/sanjana./blog web/blog-web"
npm install
npm run dev
```

Open the URL printed in terminal (usually `http://localhost:3000`).

---

## 10) Test Plan (Checklist)

### Auth
- [ ] Sign up from `/signup`
- [ ] Sign in from `/login`
- [ ] Sign out from nav

### Roles
- [ ] `viewer`: can read + comment, cannot create/edit posts
- [ ] `author`: can create + edit own post
- [ ] `admin`: can edit any post and manage roles via SQL

### Post flow
- [ ] Create post with title/image/body
- [ ] Verify summary appears
- [ ] Verify listing card + detail page

### Listing
- [ ] Search by keyword (`q`)
- [ ] Pagination prev/next (`page`)

### Comments
- [ ] Add comment on detail page
- [ ] Verify comment appears in list

---

## 11) Deployment (VPS)

Standard Next.js Node deployment:

1. Install Node.js (20+)
2. Clone repo on VPS
3. Create `.env.local` with production keys
4. Build and run:

```bash
npm install
npm run build
npm run start
```

5. Expose service port (default 3000) through firewall/security group

---

## 12) Submission Notes

Provide:

1. GitHub repository URL
2. Live deployed URL
3. Short explanation covering:
   - AI tool used and why
   - Auth + role logic
   - Post + summary generation flow
   - Token/cost optimization strategy
   - One bug encountered and how it was fixed

---

## 13) Known Notes

- Old posts keep old summary text; if AI config changes, create a new post to verify updated summary behavior.
- If login/session appears inconsistent, restart dev server after env changes.

