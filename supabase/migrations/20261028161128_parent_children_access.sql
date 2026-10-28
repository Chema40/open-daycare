create policy children_select_linked_parent
on public.children
for select to authenticated
using (exists (
  select 1 from public.parent_children pc
  join public.users u on u.id = pc.parent_id
  where pc.child_id = children.id
    and pc.parent_id = (select auth.uid())
    and u.role = 'parent' and u.status = 'active'
));
