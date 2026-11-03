create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  type public.post_type not null,
  title text,
  body text not null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_children (
  post_id uuid not null references public.posts(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  primary key (post_id, child_id)
);

create table public.post_photos (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  url text not null,
  width int,
  height int,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index posts_author_id_idx on public.posts (author_id);
create index posts_room_published_at_idx on public.posts (room_id, published_at desc);
create index post_children_child_id_idx on public.post_children (child_id);
create index post_photos_post_id_idx on public.post_photos (post_id);

alter table public.posts enable row level security;
alter table public.post_children enable row level security;
alter table public.post_photos enable row level security;

revoke all on table public.posts, public.post_children, public.post_photos from anon, authenticated;
grant select, insert on table public.posts to authenticated;
grant select, insert on table public.post_children, public.post_photos to authenticated;

create policy posts_staff_select
  on public.posts for select to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = (select auth.uid())
        and users.daycare_id = (select author.daycare_id from public.users author where author.id = posts.author_id)
        and users.role in ('staff', 'admin')
        and users.status = 'active'
    )
  );

create policy posts_staff_insert
  on public.posts for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.users
      where users.id = (select auth.uid())
        and users.role in ('staff', 'admin')
        and users.status = 'active'
    )
  );

create policy post_children_staff_select
  on public.post_children for select to authenticated
  using (exists (select 1 from public.posts where posts.id = post_children.post_id));

create policy post_children_staff_insert
  on public.post_children for insert to authenticated
  with check (
    exists (
      select 1 from public.posts
      join public.users author on author.id = posts.author_id
      join public.children child on child.id = post_children.child_id
      join public.rooms child_room on child_room.id = child.room_id
      join public.users actor on actor.id = (select auth.uid())
      where posts.id = post_children.post_id
        and posts.author_id = (select auth.uid())
        and author.daycare_id = child_room.daycare_id
        and actor.daycare_id = author.daycare_id
        and actor.role in ('staff', 'admin')
        and actor.status = 'active'
    )
  );

create policy post_photos_staff_select
  on public.post_photos for select to authenticated
  using (exists (select 1 from public.posts where posts.id = post_photos.post_id));

create policy post_photos_staff_insert
  on public.post_photos for insert to authenticated
  with check (exists (select 1 from public.posts where posts.id = post_photos.post_id and posts.author_id = (select auth.uid())));

insert into storage.buckets (id, name, public)
values ('post-photos', 'post-photos', false)
on conflict (id) do nothing;

create policy post_photos_storage_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.users
      where users.id = (select auth.uid())
        and users.role in ('staff', 'admin')
        and users.status = 'active'
    )
  );

create policy post_photos_storage_select
  on storage.objects for select to authenticated
  using (bucket_id = 'post-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
