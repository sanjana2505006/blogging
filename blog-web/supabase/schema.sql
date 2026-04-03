-- Blog Web database schema (Supabase)
-- Required tables:
--   public.users    (id, name, email, role)
--   public.posts    (id, title, body, image_url, author_id, summary)
--   public.comments (id, post_id, user_id, comment_text)

create extension if not exists pgcrypto;

-- 1) USERS
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  role text not null default 'viewer' check (role in ('author', 'viewer', 'admin'))
);

-- Keep `public.users` in sync with signups.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'viewer')
  )
  on conflict (id) do update
    set
      name = excluded.name,
      email = excluded.email,
      role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 2) POSTS
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  author_id uuid not null references public.users(id) on delete cascade,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
before update on public.posts
for each row execute procedure public.set_updated_at();

-- 3) COMMENTS
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  comment_text text not null,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_created_at on public.comments(created_at asc);

-- =========================
-- Row Level Security (RLS)
-- =========================
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Helper: fetch role for current user
create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.users where id = auth.uid();
$$;

-- USERS policies
drop policy if exists "users_read_own" on public.users;
create policy "users_read_own"
on public.users
for select
to authenticated
using (id = auth.uid());

-- Public can read basic author details for post/comment bylines.
drop policy if exists "users_public_read_basic" on public.users;
create policy "users_public_read_basic"
on public.users
for select
using (true);

-- Admin can update user roles (for author/viewer/admin setup)
drop policy if exists "users_admin_update_role" on public.users;
create policy "users_admin_update_role"
on public.users
for update
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- POSTS policies
-- Public can read posts + summaries.
drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read"
on public.posts
for select
using (true);

-- Authors/Admin can create posts for themselves.
drop policy if exists "posts_author_insert_own" on public.posts;
create policy "posts_author_insert_own"
on public.posts
for insert
to authenticated
with check (
  author_id = auth.uid()
  and public.current_role() in ('author', 'admin')
);

-- Authors can edit their own posts.
drop policy if exists "posts_author_update_own" on public.posts;
create policy "posts_author_update_own"
on public.posts
for update
to authenticated
using (
  author_id = auth.uid()
  and public.current_role() in ('author', 'admin')
)
with check (
  author_id = auth.uid()
  and public.current_role() in ('author', 'admin')
);

-- Admin can edit any post.
drop policy if exists "posts_admin_update_any" on public.posts;
create policy "posts_admin_update_any"
on public.posts
for update
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- COMMENTS policies
-- Public can read comments (so the comment section works for viewers).
drop policy if exists "comments_public_read" on public.comments;
create policy "comments_public_read"
on public.comments
for select
using (true);

-- Viewer/Author/Admin can comment on posts.
drop policy if exists "comments_role_insert" on public.comments;
create policy "comments_role_insert"
on public.comments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.current_role() in ('viewer', 'author', 'admin')
);

