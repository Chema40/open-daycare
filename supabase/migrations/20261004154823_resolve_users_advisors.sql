-- Keep lookups and deletes involving a daycare foreign key indexed.
create index users_daycare_id_idx on public.users (daycare_id);

-- Users may inspect only the daycare to which their own profile belongs.
create policy daycares_select_own
  on public.daycares
  for select
  to authenticated
  using (
    id = (
      select daycare_id
      from public.users
      where users.id = (select auth.uid())
    )
  );

-- This maintenance helper is not part of the client API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
