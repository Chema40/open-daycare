-- Keep the invitation lifetime derived from the row creation timestamp. The
-- client may not choose a longer or shorter lifetime.
create or replace function public.set_invitation_expiration()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.expires_at := new.created_at + interval '7 days';
  return new;
end;
$$;

update public.invitations
set expires_at = created_at + interval '7 days'
where expires_at is distinct from created_at + interval '7 days';

drop trigger if exists set_invitation_expiration on public.invitations;
create trigger set_invitation_expiration
before insert on public.invitations
for each row
execute function public.set_invitation_expiration();

alter table public.invitations
  drop constraint if exists invitations_exact_expiration_check;
alter table public.invitations
  add constraint invitations_exact_expiration_check
  check (expires_at = created_at + interval '7 days');

-- A parent can read a room only when one of its children is linked to that
-- parent. Staff/admin retain access to every room in their daycare.
drop policy if exists rooms_select_staff_admin on public.rooms;
create policy rooms_select_authorized
on public.rooms for select to authenticated
using (
  exists (
    select 1 from public.users
    where users.id = (select auth.uid())
      and users.daycare_id = rooms.daycare_id
      and users.role in ('staff', 'admin')
      and users.status = 'active'
  )
  or exists (
    select 1
    from public.parent_children pc
    join public.children c on c.id = pc.child_id
    where pc.parent_id = (select auth.uid())
      and c.room_id = rooms.id
      and c.status = 'active'
  )
);

-- Keep one SELECT policy per role/action so the RLS planner does not need to
-- evaluate multiple permissive policies for the same request.
drop policy if exists children_select_staff_admin on public.children;
drop policy if exists children_select_linked_parent on public.children;
create policy children_select_authorized
on public.children for select to authenticated
using (
  exists (
    select 1
    from public.rooms
    join public.users on users.daycare_id = rooms.daycare_id
    where rooms.id = children.room_id
      and users.id = (select auth.uid())
      and users.role in ('staff', 'admin')
      and users.status = 'active'
  )
  or exists (
    select 1 from public.parent_children pc
    join public.users u on u.id = pc.parent_id
    where pc.child_id = children.id
      and pc.parent_id = (select auth.uid())
      and u.role = 'parent'
      and u.status = 'active'
  )
);

drop policy if exists parent_children_own_select on public.parent_children;
drop policy if exists parent_children_staff_select on public.parent_children;
create policy parent_children_select_authorized
on public.parent_children for select to authenticated
using (
  parent_id = (select auth.uid())
  or exists (
    select 1
    from public.children c
    join public.rooms r on r.id = c.room_id
    join public.users u on u.daycare_id = r.daycare_id
    where c.id = parent_children.child_id
      and u.id = (select auth.uid())
      and u.role in ('staff', 'admin')
      and u.status = 'active'
  )
);
