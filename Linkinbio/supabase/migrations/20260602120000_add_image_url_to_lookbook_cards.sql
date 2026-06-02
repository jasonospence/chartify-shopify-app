alter table if exists public.lookbook_cards
add column if not exists image_url text;

comment on column public.lookbook_cards.image_url is
  'Public image URL used by the lookbook card preview.';
