-- Migration: Layer-Funktion hinzufügen
-- Füge layerable und layer_position Felder zur clothing_items Tabelle hinzu

-- Füge neue Spalten hinzu
alter table public.clothing_items 
  add column if not exists layerable boolean not null default false,
  add column if not exists layer_position text check (layer_position in ('under', 'over'));

-- Kommentare für bessere Dokumentation
comment on column public.clothing_items.layerable is 'Gibt an, ob das Kleidungsstück layerbar ist (mit anderen kombinierbar)';
comment on column public.clothing_items.layer_position is 'Position beim Layering: under (drunter) oder over (drüber)';
