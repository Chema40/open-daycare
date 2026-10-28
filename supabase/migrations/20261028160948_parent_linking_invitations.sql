create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  invited_by uuid not null references public.users(id),
  full_name text not null,
  email text not null,
  relationship public.relationship_type not null,
  code text not null unique,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.parent_children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  relationship public.relationship_type not null,
  created_at timestamptz not null default now(),
  unique (parent_id, child_id)
);

create index invitations_child_id_idx on public.invitations (child_id);
create index invitations_invited_by_idx on public.invitations (invited_by);
create index invitations_email_idx on public.invitations (lower(email));
create index invitations_code_idx on public.invitations (code);
create index invitations_pending_idx on public.invitations (expires_at)
  where status = 'pending';
create index parent_children_parent_id_idx on public.parent_children (parent_id);
create index parent_children_child_id_idx on public.parent_children (child_id);

alter table public.invitations enable row level security;
alter table public.parent_children enable row level security;
revoke all on table public.invitations, public.parent_children from anon, authenticated;
grant select, insert on public.invitations to authenticated;
grant select on public.parent_children to authenticated;

create policy invitations_staff_select
on public.invitations for select to authenticated
using (exists (
  select 1 from public.children c
  join public.rooms r on r.id = c.room_id
  join public.users u on u.daycare_id = r.daycare_id
  where c.id = invitations.child_id and u.id = (select auth.uid())
    and u.role in ('staff', 'admin') and u.status = 'active'
));

create policy invitations_staff_insert
on public.invitations for insert to authenticated
with check (invited_by = (select auth.uid()) and exists (
  select 1 from public.children c
  join public.rooms r on r.id = c.room_id
  join public.users u on u.daycare_id = r.daycare_id
  where c.id = invitations.child_id and u.id = (select auth.uid())
    and u.role in ('staff', 'admin') and u.status = 'active'
));

create policy parent_children_own_select
on public.parent_children for select to authenticated
using (parent_id = (select auth.uid()));

create policy parent_children_staff_select
on public.parent_children for select to authenticated
using (exists (
  select 1 from public.children c
  join public.rooms r on r.id = c.room_id
  join public.users u on u.daycare_id = r.daycare_id
  where c.id = parent_children.child_id and u.id = (select auth.uid())
    and u.role in ('staff', 'admin') and u.status = 'active'
));

-- The public lookup only returns a matching, usable invitation; it never exposes a list.
create or replace function public.get_invitation_details(invitation_code text)
returns table (id uuid, child_id uuid, daycare_id uuid, child_name text, room_name text, email text, full_name text, relationship public.relationship_type, expires_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select i.id, c.id, r.daycare_id, c.full_name, r.name, i.email, i.full_name, i.relationship, i.expires_at
  from public.invitations i
  join public.children c on c.id = i.child_id
  join public.rooms r on r.id = c.room_id
  where i.code = upper(trim(invitation_code)) and i.status = 'pending' and i.expires_at > now();
$$;
revoke execute on function public.get_invitation_details(text) from public;
grant execute on function public.get_invitation_details(text) to anon, authenticated;

-- This is the only client-callable write for acceptance. It validates both the
-- authenticated email and the daycare relationship in the same transaction.
create or replace function public.accept_parent_invitation(invitation_code text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  invitation_row public.invitations;
  current_user_row public.users;
  auth_email text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into invitation_row from public.invitations
    where code = upper(trim(invitation_code)) for update;
  if not found or invitation_row.status <> 'pending' or invitation_row.expires_at <= now() then
    raise exception 'Invitation is invalid or expired';
  end if;
  select email into auth_email from auth.users where id = auth.uid();
  if lower(trim(auth_email)) <> lower(trim(invitation_row.email)) then
    raise exception 'The authenticated email does not match the invitation';
  end if;
  select * into current_user_row from public.users where id = auth.uid();
  if current_user_row.role <> 'parent' or current_user_row.status <> 'active' then
    raise exception 'Only active parent accounts can accept invitations';
  end if;
  if not exists (
    select 1 from public.children c join public.rooms r on r.id = c.room_id
    where c.id = invitation_row.child_id and r.daycare_id = current_user_row.daycare_id
  ) then raise exception 'The invitation daycare is invalid'; end if;
  insert into public.parent_children (parent_id, child_id, relationship)
    values (auth.uid(), invitation_row.child_id, invitation_row.relationship)
    on conflict (parent_id, child_id) do nothing;
  update public.invitations set status = 'accepted', accepted_at = now()
    where id = invitation_row.id and status = 'pending';
end;
$$;
revoke execute on function public.accept_parent_invitation(text) from public, anon;
grant execute on function public.accept_parent_invitation(text) to authenticated;
