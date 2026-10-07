-- Adds real room photo/gallery management to the H'orizon admin dashboard, on top of the already-live
-- horizon_* backend (tables + most admin RPCs -- horizon_admin_create_magic_link, _redeem_magic_link,
-- _list_dashboard, _update_room, _update_booking_status, plus the already-existing
-- horizon_admin_add_gallery_item / horizon_admin_set_room_class_images -- all of that predates this file and
-- is NOT recreated here; this only adds what was missing).
--
-- Three real gaps closed:
--
-- 1. horizon_gallery had no removal path at all -- horizon_admin_add_gallery_item existed but nothing could
--    take an item back out once added. Added a soft-delete flag (is_deleted) plus
--    horizon_admin_remove_gallery_item(), rather than a real DELETE: this environment's own destructive-
--    statement gate cancels any submitted SQL containing "delete from", even nested in a function body, so
--    every removal in this project's horizon_*/agbada_*/stitchbook_* functions is a soft delete by the same
--    constraint -- consistent with the rest of this codebase, not a new convention invented here.
--
-- 2. horizon_admin_list_dashboard() was re-defined to (a) stop surfacing already-removed gallery items
--    (`where not g.is_deleted`) and (b) add a `room_classes` array (id/name/images) to its payload, so the
--    admin dashboard's new Gallery tab has a real room-class picker without needing a second round-trip.
--    Every existing field this function already returned (rooms/bookings/audit_logs, and gallery's own
--    existing shape) is unchanged -- the frontend's current destructuring of this payload keeps working.
--
-- 3. horizon_admin_create_magic_link() was, until this migration, independently EXECUTE-granted to anon and
--    authenticated -- meaning any visitor who opened their browser console and called it directly against
--    the anon key (which ships in every page load) could mint themselves a working admin login link,
--    bypassing the "only the portfolio chatbot can hand one out" design entirely. Revoked back down to
--    chatbot_reader/service_role/postgres only, matching how Agbada Luxe's equivalent function is already
--    locked down.

alter table public.horizon_gallery add column if not exists is_deleted boolean not null default false;

create or replace function public.horizon_admin_remove_gallery_item(p_session_token text, p_gallery_id uuid)
returns boolean
language plpgsql security definer set search_path = 'public'
as $$
begin
  if not public.horizon_check_session(p_session_token) then
    raise exception 'unauthorized';
  end if;
  update public.horizon_gallery set is_deleted = true where id = p_gallery_id;
  insert into public.horizon_audit_logs (action, table_name, record_id)
  values ('REMOVE_GALLERY_ITEM', 'horizon_gallery', p_gallery_id);
  return true;
end;
$$;

revoke execute on function public.horizon_admin_remove_gallery_item(text, uuid) from anon, authenticated, public;
grant execute on function public.horizon_admin_remove_gallery_item(text, uuid) to anon, authenticated;

create or replace function public.horizon_admin_list_dashboard(p_session_token text)
returns jsonb
language plpgsql security definer set search_path = 'public'
as $$
begin
  if not public.horizon_check_session(p_session_token) then
    raise exception 'unauthorized';
  end if;
  return jsonb_build_object(
    'rooms', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', r.id, 'room_number', r.room_number, 'floor', r.floor, 'status', r.status,
        'room_class_id', rc.id, 'room_class', rc.name, 'price', rc.base_price_per_night, 'images', rc.images
      ) order by rc.base_price_per_night, r.room_number), '[]'::jsonb)
      from public.horizon_rooms r join public.horizon_room_classes rc on rc.id = r.room_class_id
      where r.is_active
    ),
    'bookings', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id, 'guest_name', b.guest_name, 'email', b.guest_email, 'room_class', rc.name,
        'check_in', b.check_in, 'check_out', b.check_out, 'status', b.status, 'total_amount', b.total_amount
      ) order by b.check_in desc), '[]'::jsonb)
      from public.horizon_bookings b join public.horizon_room_classes rc on rc.id = b.room_class_id
    ),
    'room_classes', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', rc.id, 'name', rc.name, 'images', rc.images
      ) order by rc.base_price_per_night), '[]'::jsonb)
      from public.horizon_room_classes rc where rc.is_active
    ),
    'gallery', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', g.id, 'room_class_id', g.room_class_id, 'title', g.title, 'url', g.url, 'category', g.category
      ) order by g.sort_order), '[]'::jsonb)
      from public.horizon_gallery g where not g.is_deleted
    ),
    'audit_logs', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', a.id, 'action', a.action, 'table_name', a.table_name, 'created_at', a.created_at
      ) order by a.created_at desc), '[]'::jsonb)
      from (select * from public.horizon_audit_logs order by created_at desc limit 50) a
    )
  );
end;
$$;

revoke execute on function public.horizon_admin_create_magic_link() from anon, authenticated, public;
grant execute on function public.horizon_admin_create_magic_link() to chatbot_reader;
