create table public.feeding_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  kind text not null check (kind in ('breast','bottle','expressed_milk','solids')),
  started_at timestamptz not null default now(),
  duration_minutes int check (duration_minutes is null or duration_minutes between 0 and 600),
  breast_side text check (breast_side is null or breast_side in ('left','right','both','not_applicable')),
  left_minutes int check (left_minutes is null or left_minutes between 0 and 600),
  right_minutes int check (right_minutes is null or right_minutes between 0 and 600),
  amount_ml int check (amount_ml is null or amount_ml between 0 and 2000),
  food text check (food is null or char_length(food) <= 300),
  reaction text check (reaction is null or reaction in ('none','accepted','refused','possible_reaction','other')),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  constraint feeding_kind_fields check (
    (kind = 'breast' and breast_side is not null)
    or (kind <> 'breast' and breast_side is null)
  ),
  constraint feeding_solids_food check (kind <> 'solids' or food is not null)
);
create index feeding_logs_baby_started_idx on public.feeding_logs (baby_id, started_at desc);
grant select, insert, update, delete on public.feeding_logs to authenticated;
grant all on public.feeding_logs to service_role;
alter table public.feeding_logs enable row level security;
create policy "own feeding logs select" on public.feeding_logs for select to authenticated
  using (user_id = auth.uid() and exists (select 1 from public.babies b where b.id = baby_id and b.user_id = auth.uid()));
create policy "own feeding logs insert" on public.feeding_logs for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.babies b where b.id = baby_id and b.user_id = auth.uid()));
create policy "own feeding logs update" on public.feeding_logs for update to authenticated
  using (user_id = auth.uid() and exists (select 1 from public.babies b where b.id = baby_id and b.user_id = auth.uid()))
  with check (user_id = auth.uid() and exists (select 1 from public.babies b where b.id = baby_id and b.user_id = auth.uid()));
create policy "own feeding logs delete" on public.feeding_logs for delete to authenticated
  using (user_id = auth.uid() and exists (select 1 from public.babies b where b.id = baby_id and b.user_id = auth.uid()));
