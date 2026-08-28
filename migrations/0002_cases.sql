-- Unowned ops tables. XML is the request/response interchange; actors,
-- timeline, logs, and import runs live here as the troubleshooting envelope.

create table if not exists teams (
  slug text primary key,
  name text not null,
  role text not null,
  blurb text not null,
  statuses jsonb not null,
  unit_filter text not null default ''
);

create table if not exists cases (
  id text primary key,
  title text not null,
  source_name text not null,
  source_kind text not null,
  team_slug text not null default 'fsr',
  raw_xml text not null,
  tar jsonb not null,
  gaps jsonb not null,
  hollowness integer not null,
  questions jsonb not null,
  status text not null,
  hypotheses jsonb not null default '[]',
  engineer_notes text not null default '',
  qa_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unanswered_since timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  last_answered_at timestamptz
);

create table if not exists case_actors (
  id text primary key,
  case_id text not null references cases (id) on delete cascade,
  actor_role text not null,
  display_name text not null,
  contact text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists case_events (
  id text primary key,
  case_id text not null references cases (id) on delete cascade,
  at timestamptz not null default now(),
  kind text not null,
  actor_name text not null default '',
  summary text not null,
  detail jsonb not null default '{}'
);

create table if not exists case_artifacts (
  id text primary key,
  case_id text not null references cases (id) on delete cascade,
  kind text not null,
  name text not null,
  content text not null default '',
  captured_at timestamptz not null default now()
);

create table if not exists case_xml_messages (
  id text primary key,
  case_id text not null references cases (id) on delete cascade,
  direction text not null,
  purpose text not null,
  raw_xml text not null,
  created_at timestamptz not null default now()
);

create table if not exists import_runs (
  id text primary key,
  source_kind text not null,
  status text not null,
  message text not null,
  files_ok integer not null default 0,
  files_failed integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

insert into teams (slug, name, role, blurb, statuses) values
  ('fsr', 'Field service', 'fsr', 'Inbound 107s that still need context from the unit.', '["ingested","awaiting-context"]'),
  ('engineer', 'Engineering', 'engineer', 'Solid enough to work. Hypotheses and kill-checks live here.', '["ready-for-engineer","in-resolution"]'),
  ('qa', 'QA', 'qa', 'Review, close, or send back. Cannot close a hollow case.', '["qa-review"]'),
  ('ops', 'Ops ingest', 'fsr', 'All open requests. Web upload and folder drop land here first.', '["ingested","awaiting-context","ready-for-engineer","in-resolution","qa-review"]')
on conflict (slug) do nothing;
