-- Baby names and birth dates are not globally unique.
-- Remove legacy global uniqueness, if it exists, so separate accounts can
-- register babies with the same name and date of birth. Ownership remains
-- isolated by user_id and the existing RLS policy.
do $$
declare
  c record;
  i record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.babies'::regclass
      and contype = 'u'
      and replace(replace(pg_get_constraintdef(oid), ' ', ''), '"', '') in
        ('UNIQUE(name,birth_date)', 'UNIQUE(birth_date,name)')
  loop
    execute format('alter table public.babies drop constraint %I', c.conname);
  end loop;

  for i in
    select indexname
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'babies'
      and indexdef ilike 'CREATE UNIQUE INDEX%'
      and (
        replace(replace(indexdef, ' ', ''), '"', '') like '%(name,birth_date)%'
        or replace(replace(indexdef, ' ', ''), '"', '') like '%(birth_date,name)%'
      )
      and indexname not in (
        select conindid::regclass::text
        from pg_constraint
        where conrelid = 'public.babies'::regclass
          and contype = 'u'
      )
  loop
    execute format('drop index if exists public.%I', i.indexname);
  end loop;
end $$;
