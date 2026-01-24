CREATE TYPE "list_pushed" AS (
  "id" uuid,
  "title" text,
  "order" numeric,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

CREATE TYPE "list_synced" AS (
  "id" uuid,
  "title" text,
  "order" numeric,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE OR REPLACE FUNCTION public.lists_push(items list_pushed[])
  RETURNS SETOF list_synced
AS $$
DECLARE
  it list_pushed;
BEGIN
  FOREACH it IN ARRAY items LOOP
    IF it.id IS NULL AND it.deleted_at IS NULL  THEN
      -- CREATE: insert a new row for client-local item
      INSERT INTO public.lists (title, "order", created_at, updated_at)
      VALUES (it.title, it.order, it.created_at, it.updated_at);

    ELSIF it.id IS NOT NULL AND it.deleted_at IS NOT NULL THEN
      -- DELETE: only remove if server has not been updated since client's deleted_at
      DELETE FROM public.lists
      WHERE id = it.id
        AND (updated_at IS NULL OR updated_at < it.deleted_at);

    ELSE
      -- UPDATE: only apply if client's updated_at is newer than server's
      IF it.updated_at IS NOT NULL THEN
        UPDATE public.lists
        SET
          title = it.title,
          "order" = it.order,
          created_at = COALESCE(created_at, it.created_at),
          updated_at = COALESCE(updated_at, it.updated_at)
        WHERE id = it.id
          AND (updated_at IS NULL OR updated_at < it.updated_at);
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT id, title, "order", created_at, updated_at FROM public.lists;
END;
$$ LANGUAGE plpgsql;
