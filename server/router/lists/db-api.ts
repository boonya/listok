import type {SupabaseClient} from '@/supabase-client';

type Remove = {
  id: string;
  deleted_at: Date;
}[];

async function remove(supabase: SupabaseClient, input: Remove) {
  // @ts-expect-error Just ignore it so far
  await supabase.rpc('delete_outdated_lists', {items: input});
}

type Update = {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date | null;
}[];

async function update(supabase: SupabaseClient, input: Update) {
  const payload = input.map(({created_at, updated_at, ...rest}) => ({
    created_at: created_at.toISOString(),
    updated_at: updated_at?.toISOString() ?? null,
    ...rest,
  }));
  await supabase.from('lists').upsert(payload).select('id');
}

type Create = {
  title: string;
  created_at: Date;
  updated_at: Date | null;
}[];

async function create(supabase: SupabaseClient, input: Create) {
  const payload = input.map(({created_at, updated_at, ...rest}) => ({
    created_at: created_at.toISOString(),
    updated_at: updated_at?.toISOString() ?? null,
    ...rest,
  }));
  await supabase.from('lists').insert(payload).select('id');
}

async function select(supabase: SupabaseClient) {
  const {data} = await supabase
    .from('lists')
    .select('id, title, created_at, updated_at')
    .order('created_at', {ascending: false})
    // .order('order', {
    //   referencedTable: 'items',
    //   ascending: true,
    // })
    // .order('created_at', {referencedTable: 'items', ascending: false})
    // .order('is_completed', {referencedTable: 'items', ascending: true})
    .throwOnError();

  return data.map(({created_at, updated_at, ...rest}) => ({
    created_at: new Date(created_at),
    updated_at: updated_at ? new Date(updated_at) : null,
    ...rest,
  }));
}

export function getDbApi(supabase: SupabaseClient) {
  return {
    remove: (input: Remove) => remove(supabase, input),
    update: (input: Update) => update(supabase, input),
    create: (input: Create) => create(supabase, input),
    select: () => select(supabase),
  };
}
