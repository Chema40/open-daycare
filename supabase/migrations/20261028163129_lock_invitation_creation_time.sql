-- The creation timestamp is server-owned as well, so callers cannot backdate
-- an invitation to extend its effective lifetime.
create or replace function public.set_invitation_expiration()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.created_at := now();
  new.expires_at := new.created_at + interval '7 days';
  return new;
end;
$$;
