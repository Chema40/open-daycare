-- Room names are harmless metadata, but the policy must not join children while
-- evaluating the children policy again. Resolve the parent's daycare from its
-- own profile instead.
drop policy if exists rooms_select_authorized on public.rooms;
create policy rooms_select_authorized
on public.rooms for select to authenticated
using (
  exists (
    select 1 from public.users
    where users.id = (select auth.uid())
      and users.daycare_id = rooms.daycare_id
      and users.status = 'active'
      and (
        users.role in ('staff', 'admin')
        or users.role = 'parent'
      )
  )
);
