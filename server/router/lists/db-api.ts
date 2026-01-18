import z from 'zod';
import type {SupabaseClient} from '@/supabase-client';

const RemoveInput = z.object({
  id: z.uuid(),
  deleted_at: z.date().transform((v) => v.toISOString()),
});

type Remove = z.input<typeof RemoveInput>;

async function remove(supabase: SupabaseClient, input: Remove[]) {
  const items = RemoveInput.array().parse(input);
  await supabase.rpc('delete_outdated_lists', {items});
}

const UpdateInput = z.object({
  id: z.uuid(),
  title: z.string(),
  created_at: z.date().transform((v) => v.toISOString()),
  updated_at: z
    .date()
    .nullable()
    .transform((v) => v?.toISOString() ?? null),
});

type Update = z.input<typeof UpdateInput>;

async function update(supabase: SupabaseClient, input: Update[]) {
  const payload = UpdateInput.array().parse(input);
  await supabase.from('lists').upsert(payload);
}

const CreateInput = z.object({
  title: z.string(),
  created_at: z.date().transform((v) => v.toISOString()),
  updated_at: z
    .date()
    .nullable()
    .transform((v) => v?.toISOString() ?? null),
});

type Create = z.input<typeof CreateInput>;

async function create(supabase: SupabaseClient, input: Create[]) {
  const payload = CreateInput.array().parse(input);
  await supabase.from('lists').insert(payload);
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
    remove: (input: Remove[]) => remove(supabase, input),
    update: (input: Update[]) => update(supabase, input),
    create: (input: Create[]) => create(supabase, input),
    select: () => select(supabase),
  };
}
