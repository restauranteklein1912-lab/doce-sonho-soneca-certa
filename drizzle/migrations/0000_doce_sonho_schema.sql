
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  is_premium boolean not null default false,
  premium_until timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_premium(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = _user_id and is_premium and (premium_until is null or premium_until > now()))
$$;

create table public.pending_premium (
  email text primary key,
  is_premium boolean not null default true,
  premium_until timestamptz,
  event text,
  updated_at timestamptz not null default now()
);
grant all on public.pending_premium to service_role;
alter table public.pending_premium enable row level security;

create table public.babies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 60),
  birth_date date not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.babies to authenticated;
grant all on public.babies to service_role;
alter table public.babies enable row level security;
create policy "own babies" on public.babies for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.enforce_baby_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_premium(new.user_id) and (select count(*) from public.babies where user_id = new.user_id) >= 1 then
    raise exception 'FREE_BABY_LIMIT';
  end if;
  return new;
end $$;
create trigger babies_limit before insert on public.babies for each row execute function public.enforce_baby_limit();

create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  kind text not null check (kind in ('nap','night')),
  start_at timestamptz not null,
  end_at timestamptz,
  fell_asleep_how text,
  mood text,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);
create index on public.sleep_logs (baby_id, start_at desc);
grant select, insert, update, delete on public.sleep_logs to authenticated;
grant all on public.sleep_logs to service_role;
alter table public.sleep_logs enable row level security;
create policy "own logs select" on public.sleep_logs for select to authenticated
  using (user_id = auth.uid() and (public.is_premium(auth.uid()) or start_at > now() - interval '7 days'));
create policy "own logs insert" on public.sleep_logs for insert to authenticated with check (user_id = auth.uid());
create policy "own logs update" on public.sleep_logs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own logs delete" on public.sleep_logs for delete to authenticated using (user_id = auth.uid());

create table public.wakeups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  sleep_log_id uuid references public.sleep_logs(id) on delete set null,
  at timestamptz not null,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);
create index on public.wakeups (baby_id, at desc);
grant select, insert, update, delete on public.wakeups to authenticated;
grant all on public.wakeups to service_role;
alter table public.wakeups enable row level security;
create policy "own wakeups select" on public.wakeups for select to authenticated
  using (user_id = auth.uid() and (public.is_premium(auth.uid()) or at > now() - interval '7 days'));
create policy "own wakeups insert" on public.wakeups for insert to authenticated with check (user_id = auth.uid());
create policy "own wakeups update" on public.wakeups for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wakeups delete" on public.wakeups for delete to authenticated using (user_id = auth.uid());

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  baby_id uuid not null unique references public.babies(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.routines to authenticated;
grant all on public.routines to service_role;
alter table public.routines enable row level security;
create policy "own routines select" on public.routines for select to authenticated using (user_id = auth.uid());
create policy "premium routines insert" on public.routines for insert to authenticated with check (user_id = auth.uid() and public.is_premium(auth.uid()));
create policy "premium routines update" on public.routines for update to authenticated using (user_id = auth.uid() and public.is_premium(auth.uid())) with check (user_id = auth.uid());
create policy "own routines delete" on public.routines for delete to authenticated using (user_id = auth.uid());

create table public.bedtime_checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  position int not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.bedtime_checklist_items to authenticated;
grant all on public.bedtime_checklist_items to service_role;
alter table public.bedtime_checklist_items enable row level security;
create policy "own items select" on public.bedtime_checklist_items for select to authenticated using (user_id = auth.uid());
create policy "premium items write" on public.bedtime_checklist_items for insert to authenticated with check (user_id = auth.uid() and public.is_premium(auth.uid()));
create policy "premium items update" on public.bedtime_checklist_items for update to authenticated using (user_id = auth.uid() and public.is_premium(auth.uid())) with check (user_id = auth.uid());
create policy "own items delete" on public.bedtime_checklist_items for delete to authenticated using (user_id = auth.uid());

create table public.bedtime_checklist_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  item_id uuid not null references public.bedtime_checklist_items(id) on delete cascade,
  day date not null,
  unique (item_id, day)
);
grant select, insert, update, delete on public.bedtime_checklist_days to authenticated;
grant all on public.bedtime_checklist_days to service_role;
alter table public.bedtime_checklist_days enable row level security;
create policy "own days select" on public.bedtime_checklist_days for select to authenticated using (user_id = auth.uid());
create policy "premium days insert" on public.bedtime_checklist_days for insert to authenticated with check (user_id = auth.uid() and public.is_premium(auth.uid()));
create policy "own days delete" on public.bedtime_checklist_days for delete to authenticated using (user_id = auth.uid());

create table public.caregiver_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  rest int not null check (rest between 1 and 5),
  energy int not null check (energy between 1 and 5),
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.caregiver_checkins to authenticated;
grant all on public.caregiver_checkins to service_role;
alter table public.caregiver_checkins enable row level security;
create policy "own checkins" on public.caregiver_checkins for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  article_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, article_slug)
);
grant select, insert, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;
create policy "own favorites" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 255),
  source text not null default 'calculadora',
  baby_age_months int check (baby_age_months is null or baby_age_months between 0 and 60),
  created_at timestamptz not null default now()
);
grant insert on public.leads to anon, authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "anyone can leave email" on public.leads for insert to anon, authenticated with check (source = 'calculadora');

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare p public.pending_premium%rowtype;
begin
  select * into p from public.pending_premium where email = lower(new.email);
  insert into public.profiles (id, email, display_name, is_premium, premium_until)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
          coalesce(p.is_premium, false), p.premium_until);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if found then delete from public.pending_premium where email = lower(new.email); end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
