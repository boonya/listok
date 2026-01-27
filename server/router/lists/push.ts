import {ORPCError, os} from '@orpc/server';
import {z} from 'zod';
import {supabaseMiddleware} from '@/supabase-client';
import type {ORPCContext} from '@/types/orpc';

const InputSchema = z.object({
  id: z
    .uuid()
    .or(z.number().transform((_) => null))
    .nullish()
    .default(null),
  version: z
    .number()
    .nullish()
    .transform((v) => (v ? Number(v) : 1)),
  title: z.string(),
  order: z.number().nullish().default(null),
  created_at: z.date().transform((v) => v.toISOString()),
  updated_at: z
    .date()
    .transform((v) => v.toISOString())
    .nullish()
    .default(null),
  deleted_at: z
    .date()
    .transform((v) => v.toISOString())
    .nullish()
    .default(null),
});

const ResultSchema = z.object({
  id: z.uuid(),
  version: z.number(),
  title: z.string(),
  order: z.number().nullish().default(null),
  created_at: z.string().transform((v) => new Date(v)),
  updated_at: z
    .string()
    .nullish()
    .transform((v) => (v ? new Date(v) : null)),
});

type NullableProps<T> = {[K in keyof T]: T[K] | null};
type RpcData = NullableProps<z.input<typeof ResultSchema>>[];

export default os
  .$context<ORPCContext>()
  .use(supabaseMiddleware)
  .input(InputSchema.array())
  .handler(async ({context, input}) => {
    try {
      const {data} = await context.supabase
        .rpc('lists_push', {items: input})
        .throwOnError();
      return ResultSchema.array().parse(data satisfies RpcData);
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });
