set check_function_bodies = off;

-- Delete only items that updated before they marked as deleted.
CREATE OR REPLACE FUNCTION public.delete_outdated_lists(items jsonb)
 RETURNS void
 LANGUAGE sql
AS $function$
  delete from lists t
  using (
    select
      (item->>'id')::uuid                as server_id,
      (item->>'deleted_at')::timestamptz as deleted_at
    from jsonb_array_elements(items) as item
  ) s
  where t.id = s.server_id
    and (t.updated_at is null or t.updated_at < s.deleted_at);
$function$
;


