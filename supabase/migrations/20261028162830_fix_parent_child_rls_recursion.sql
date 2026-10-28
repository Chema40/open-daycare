create schema if not exists private;

create or replace function private.can_access_child(target_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.children c
    join public.rooms r on r.id = c.room_id
    join public.users u on u.daycare_id = r.daycare_id
    where c.id = target_child_id
      and u.id = (select auth.uid())
      and u.status = 'active'
      and u.role in ('staff', 'admin')
  )
  or exists (
    select 1
    from public.parent_children pc
    join public.users u on u.id = pc.parent_id
    where pc.child_id = target_child_id
      and pc.parent_id = (select auth.uid())
      and u.role = 'parent'
      and u.status = 'active'
  );
$$;

create or replace function private.is_staff_for_child(target_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.children c
    join public.rooms r on r.id = c.room_id
    join public.users u on u.daycare_id = r.daycare_id
    where c.id = target_child_id
      and u.id = (select auth.uid())
      and u.status = 'active'
      and u.role in ('staff', 'admin')
  );
$$;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
revoke all on function private.can_access_child(uuid) from public, anon, authenticated;
revoke all on function private.is_staff_for_child(uuid) from public, anon, authenticated;
grant execute on function private.can_access_child(uuid) to authenticated;
grant execute on function private.is_staff_for_child(uuid) to authenticated;

drop policy if exists children_select_authorized on public.children;
create policy children_select_authorized
on public.children for select to authenticated
using ((select private.can_access_child(children.id)));

drop policy if exists parent_children_select_authorized on public.parent_children;
create policy parent_children_select_authorized
on public.parent_children for select to authenticated
using (
  parent_id = (select auth.uid())
  or (select private.is_staff_for_child(parent_children.child_id))
);
