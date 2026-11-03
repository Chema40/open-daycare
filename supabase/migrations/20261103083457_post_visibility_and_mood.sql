alter type public.post_type add value if not exists 'mood';

create policy posts_parent_select
  on public.posts for select to authenticated
  using (
    exists (
      select 1
      from public.post_children pc
      join public.parent_children relation on relation.child_id = pc.child_id
      where pc.post_id = posts.id and relation.parent_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.parent_children relation
      join public.children child on child.id = relation.child_id
      where relation.parent_id = (select auth.uid())
        and child.room_id = posts.room_id
        and posts.type = 'announcement'
    )
  );

create policy post_children_parent_select
  on public.post_children for select to authenticated
  using (exists (select 1 from public.parent_children where parent_children.parent_id = (select auth.uid()) and parent_children.child_id = post_children.child_id));

create policy post_photos_parent_select
  on public.post_photos for select to authenticated
  using (
    exists (
      select 1 from public.post_children pc
      join public.parent_children relation on relation.child_id = pc.child_id
      where pc.post_id = post_photos.post_id and relation.parent_id = (select auth.uid())
    )
  );

create policy post_photos_storage_parent_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'post-photos'
    and exists (
      select 1
      from public.post_photos photo
      join public.post_children pc on pc.post_id = photo.post_id
      join public.parent_children relation on relation.child_id = pc.child_id
      where photo.post_id = split_part(name, '/', 2)::uuid
        and relation.parent_id = (select auth.uid())
    )
  );
