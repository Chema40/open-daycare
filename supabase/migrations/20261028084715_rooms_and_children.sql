create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (daycare_id, name)
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id),
  full_name text not null,
  birth_date date not null,
  enrolled_at date not null,
  medical_notes text,
  allergy_tags text[] not null default '{}',
  photo_consent boolean not null default true,
  status public.child_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rooms_daycare_id_idx on public.rooms (daycare_id);
create index children_room_id_idx on public.children (room_id);
create index children_active_room_id_idx on public.children (room_id)
where status = 'active';

create or replace function public.set_children_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_children_updated_at
before update on public.children
for each row
execute function public.set_children_updated_at();

alter table public.rooms enable row level security;
alter table public.children enable row level security;

revoke all on table public.rooms from anon, authenticated;
revoke all on table public.children from anon, authenticated;

grant select on table public.rooms to authenticated;
grant select, insert, update on table public.children to authenticated;

create policy rooms_select_staff_admin
on public.rooms
for select
to authenticated
using (
  exists (
    select 1
    from public.users
    where users.id = (select auth.uid())
      and users.daycare_id = rooms.daycare_id
      and users.role in ('staff', 'admin')
      and users.status = 'active'
  )
);

create policy children_select_staff_admin
on public.children
for select
to authenticated
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
);

create policy children_insert_staff_admin
on public.children
for insert
to authenticated
with check (
  exists (
    select 1
    from public.rooms
    join public.users on users.daycare_id = rooms.daycare_id
    where rooms.id = children.room_id
      and users.id = (select auth.uid())
      and users.role in ('staff', 'admin')
      and users.status = 'active'
  )
);

create policy children_update_staff_admin
on public.children
for update
to authenticated
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
)
with check (
  exists (
    select 1
    from public.rooms
    join public.users on users.daycare_id = rooms.daycare_id
    where rooms.id = children.room_id
      and users.id = (select auth.uid())
      and users.role in ('staff', 'admin')
      and users.status = 'active'
  )
);

insert into public.rooms (daycare_id, name)
select daycares.id, room_names.name
from public.daycares
cross join (values ('Soles'::text), ('Planetas'::text), ('Cometas'::text)) as room_names(name)
on conflict (daycare_id, name) do nothing;
