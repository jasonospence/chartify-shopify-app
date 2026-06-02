alter table if exists public.lookbook_cards
add column if not exists enabled boolean not null default true;

comment on column public.lookbook_cards.enabled is
  'Controls whether the lookbook card is shown in the front-end carousel.';
