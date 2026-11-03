drop policy posts_staff_insert on public.posts;
create policy posts_staff_insert
  on public.posts for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.users
      where users.id = (select auth.uid())
        and users.role = 'staff'
        and users.status = 'active'
    )
  );

drop policy post_children_staff_insert on public.post_children;
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
        and actor.role = 'staff'
        and actor.status = 'active'
    )
  );

drop policy post_photos_storage_insert on storage.objects;
create policy post_photos_storage_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.users
      where users.id = (select auth.uid())
        and users.role = 'staff'
        and users.status = 'active'
    )
  );
