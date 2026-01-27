alter table "public"."lists" add column "version" numeric not null default 1;

CREATE TYPE "list_pushed" AS (
  "id" uuid,
  "version" numeric,
  "title" text,
  "order" numeric,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

CREATE TYPE "list_synced" AS (
  "id" uuid,
  "version" numeric,
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
      INSERT INTO "public"."lists" ("title", "order", "created_at", "updated_at")
      VALUES (it.title, it.order, it.created_at, it.updated_at);

    ELSIF it.id IS NOT NULL AND it.deleted_at IS NOT NULL THEN
      -- DELETE: only remove if server has not been updated since client's deleted_at
      DELETE FROM "public"."lists"
      WHERE "id" = it.id
        AND "version" <= it.version;

    ELSE
      -- UPDATE: only apply if client's version is newer than server's
      UPDATE "public"."lists"
      SET
        "version" = it.version + 1,
        "title" = it.title,
        "order" = it.order,
        "created_at" = COALESCE(created_at, it.created_at),
        "updated_at" = COALESCE(updated_at, it.updated_at)
      WHERE "id" = it.id
        AND "version" < it.version;
    END IF;
  END LOOP;

  RETURN QUERY SELECT "id", "version", "title", "order", "created_at", "updated_at" FROM "public"."lists";
END;
$$ LANGUAGE plpgsql;
