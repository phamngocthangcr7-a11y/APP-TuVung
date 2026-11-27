create table public.vocab_notebooks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  contents jsonb not null default '{}'::jsonb check (jsonb_typeof(contents) = 'object')
);

alter table public.vocab_notebooks enable row level security;
revoke all on public.vocab_notebooks from anon, authenticated;
grant select, insert, update on public.vocab_notebooks to authenticated;

create policy "Users own their notebooks"
  on public.vocab_notebooks
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Apply record-level changes under the row lock so unrelated changes from two
-- devices can both survive. JSON null is a deletion, not a stored record.
create function public.sync_vocab_notebook(expected_user uuid, changes jsonb)
returns jsonb
language plpgsql security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  state jsonb;
  group_name text;
  patch jsonb;
  records jsonb;
  record_id text;
  value jsonb;
begin
  if owner_id is null or owner_id is distinct from expected_user then
    raise exception 'Account changed' using errcode = '42501';
  end if;
  if jsonb_typeof(changes) is distinct from 'object' or pg_column_size(changes) > 4194304 then
    raise exception 'Invalid notebook changes' using errcode = '22023';
  end if;
  if changes = '{}'::jsonb then
    select contents into state from public.vocab_notebooks where user_id = owner_id;
    return coalesce(state, '{}'::jsonb);
  end if;

  insert into public.vocab_notebooks(user_id) values (owner_id) on conflict do nothing;
  select contents into state from public.vocab_notebooks where user_id = owner_id for update;
  for group_name, patch in select key, items.value from jsonb_each(changes) as items loop
    if group_name not in ('words', 'decks', 'progress', 'favorites', 'history', 'settings')
      or jsonb_typeof(patch) is distinct from 'object' then
      raise exception 'Invalid notebook collection' using errcode = '22023';
    end if;
    records := coalesce(state -> group_name, '{}'::jsonb);
    for record_id, value in select key, items.value from jsonb_each(patch) as items loop
      if value = 'null'::jsonb then
        records := records - record_id;
      elsif group_name = 'history' and jsonb_typeof(value) = 'number' and
        jsonb_typeof(records -> record_id) = 'number' then
        records := jsonb_set(records, array[record_id], greatest(records -> record_id, value));
      else
        records := jsonb_set(records, array[record_id], value);
      end if;
    end loop;
    state := jsonb_set(state, array[group_name], records);
  end loop;
  update public.vocab_notebooks set contents = state where user_id = owner_id;
  return state;
end
$$;

revoke all on function public.sync_vocab_notebook(uuid, jsonb) from public, anon;
grant execute on function public.sync_vocab_notebook(uuid, jsonb) to authenticated;
