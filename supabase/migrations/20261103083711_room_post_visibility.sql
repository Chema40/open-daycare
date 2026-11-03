drop policy posts_parent_select on public.posts;
create policy posts_parent_select
  on public.posts for select to authenticated
  using (
    exists (
      select 1 from public.post_children pc
      join public.parent_children relation on relation.child_id = pc.child_id
      where pc.post_id = posts.id and relation.parent_id = (select auth.uid())
    )
    or exists (
      select 1 from public.parent_children relation
      join public.children child on child.id = relation.child_id
      where relation.parent_id = (select auth.uid()) and child.room_id = posts.room_id
    )
  );

drop policy post_photos_parent_select on public.post_photos;
create policy post_photos_parent_select
  on public.post_photos for select to authenticated
  using (
    exists (
      select 1 from public.posts post
      join public.post_children pc on pc.post_id = post.id
      join public.parent_children relation on relation.child_id = pc.child_id
      where post.id = post_photos.post_id and relation.parent_id = (select auth.uid())
    )
    or exists (
      select 1 from public.posts post
      join public.parent_children relation on relation.parent_id = (select auth.uid())
      join public.children child on child.id = relation.child_id
      where post.id = post_photos.post_id and child.room_id = post.room_id
    )
  );

drop policy post_photos_storage_parent_select on storage.objects;
create policy post_photos_storage_parent_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'post-photos'
    and exists (
      select 1 from public.post_photos photo
      join public.posts post on post.id = photo.post_id
      join public.parent_children relation on relation.parent_id = (select auth.uid())
      join public.children child on child.id = relation.child_id
      where photo.post_id = split_part(name, '/', 2)::uuid
        and (exists (select 1 from public.post_children pc where pc.post_id = post.id and pc.child_id = child.id) or child.room_id = post.room_id)
    )
  );
