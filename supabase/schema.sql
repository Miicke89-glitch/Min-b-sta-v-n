-- =============================================================
-- Din bästa vän — Supabase-schema (v1)
-- Kör hela filen i Supabase SQL Editor (eller via supabase db push)
-- =============================================================

-- ---------- Tabeller ----------

create table if not exists profil (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  namn        text not null default '',
  roll        text not null default 'kopare' check (roll in ('uppfodare', 'kopare')),
  skapad_at   timestamptz not null default now()
);

create table if not exists kennel (
  id            uuid primary key default gen_random_uuid(),
  namn          text not null,
  ort           text not null default '',
  om_text       text not null default '',
  logo_url      text,
  agare_user_id uuid not null references auth.users (id) on delete cascade,
  skapad_at     timestamptz not null default now()
);

create table if not exists kull (
  id            uuid primary key default gen_random_uuid(),
  kennel_id     uuid not null references kennel (id) on delete cascade,
  ras           text not null,
  fodelsedatum  date not null,
  mor_namn      text not null default '',
  mor_halsa     text not null default '',
  far_namn      text not null default '',
  far_halsa     text not null default '',
  antal_valpar  int not null default 0,
  skapad_at     timestamptz not null default now()
);

create table if not exists valp (
  id            uuid primary key default gen_random_uuid(),
  kull_id       uuid not null references kull (id) on delete cascade,
  namn          text not null,
  kon           text not null default 'hane' check (kon in ('hane', 'tik')),
  farg          text not null default '',
  chipnummer    text not null default '',
  reg_nummer    text not null default '',
  bild_url      text,
  agare_user_id uuid references auth.users (id) on delete set null,
  invite_token  text not null unique default encode(gen_random_bytes(16), 'hex'),
  skapad_at     timestamptz not null default now()
);

create table if not exists dokument (
  id         uuid primary key default gen_random_uuid(),
  valp_id    uuid references valp (id) on delete cascade,
  kull_id    uuid references kull (id) on delete cascade,
  typ        text not null check (typ in ('registreringsbevis', 'besiktningsintyg', 'vaccinationsintyg', 'koepeavtal', 'ovrigt')),
  filnamn    text not null,
  url        text not null, -- lagringssökväg i bucket "dokument"
  skapad_at  timestamptz not null default now(),
  check (valp_id is not null or kull_id is not null)
);

create table if not exists viktlogg (
  id        uuid primary key default gen_random_uuid(),
  valp_id   uuid not null references valp (id) on delete cascade,
  datum     date not null default current_date,
  vikt_kg   numeric(5, 2) not null check (vikt_kg > 0),
  skapad_at timestamptz not null default now()
);

create table if not exists uppfodarrad (
  id                     uuid primary key default gen_random_uuid(),
  kull_id                uuid not null references kull (id) on delete cascade,
  rubrik                 text not null,
  text                   text not null,
  visa_fran_alder_veckor int not null default 8,
  skapad_at              timestamptz not null default now()
);

create table if not exists fraga (
  id                 uuid primary key default gen_random_uuid(),
  kull_id            uuid not null references kull (id) on delete cascade,
  stalld_av_user_id  uuid not null references auth.users (id) on delete cascade,
  text               text not null,
  svar_text          text,
  svarad_at          timestamptz,
  skapad_at          timestamptz not null default now()
);

create table if not exists rasprofil (
  ras                   text primary key,
  vuxenvikt_min         numeric(5, 1) not null, -- kg, tik nedre
  vuxenvikt_max         numeric(5, 1) not null, -- kg, hane övre
  vuxenvikt_json        jsonb not null default '{}', -- spann per kön
  viktkurva_json        jsonb not null default '[]', -- [{vecka, min_kg, max_kg}]
  motionsbehov          text not null default '',
  palsvard              text not null default '',
  vanliga_halsoproblem  text not null default '',
  foderschema_json      jsonb not null default '[]'
);

-- Enkel meddelandetråd för kullen (skärmen "Kullen")
create table if not exists kullinlagg (
  id        uuid primary key default gen_random_uuid(),
  kull_id   uuid not null references kull (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  text      text not null,
  skapad_at timestamptz not null default now()
);

-- Avbockade tidslinjekort per valp
create table if not exists tidslinje_klar (
  valp_id  uuid not null references valp (id) on delete cascade,
  kort_id  text not null,
  klar_at  timestamptz not null default now(),
  primary key (valp_id, kort_id)
);

create index if not exists idx_kull_kennel on kull (kennel_id);
create index if not exists idx_valp_kull on valp (kull_id);
create index if not exists idx_valp_agare on valp (agare_user_id);
create index if not exists idx_dokument_valp on dokument (valp_id);
create index if not exists idx_dokument_kull on dokument (kull_id);
create index if not exists idx_viktlogg_valp on viktlogg (valp_id, datum);
create index if not exists idx_fraga_kull on fraga (kull_id);
create index if not exists idx_kullinlagg_kull on kullinlagg (kull_id, skapad_at);

-- ---------- Hjälpfunktioner (security definer, undviker rekursiv RLS) ----------

create or replace function ar_kennelagare(p_kennel_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from kennel k
    where k.id = p_kennel_id and k.agare_user_id = auth.uid()
  );
$$;

create or replace function ager_kull(p_kull_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from kull ku
    join kennel k on k.id = ku.kennel_id
    where ku.id = p_kull_id and k.agare_user_id = auth.uid()
  );
$$;

create or replace function ar_kullmedlem(p_kull_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select ager_kull(p_kull_id)
      or exists (
        select 1 from valp v
        where v.kull_id = p_kull_id and v.agare_user_id = auth.uid()
      );
$$;

-- Publik info för inbjudningssidan (innan inloggning)
create or replace function inbjudan_info(p_token text)
returns table (valp_namn text, ras text, kennel_namn text, redan_ansluten boolean)
language sql
security definer
set search_path = public
stable
as $$
  select v.namn, ku.ras, k.namn, v.agare_user_id is not null
  from valp v
  join kull ku on ku.id = v.kull_id
  join kennel k on k.id = ku.kennel_id
  where v.invite_token = p_token;
$$;

-- Köparen ansluter sin valp via inbjudningstoken
create or replace function anslut_valp(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Du måste vara inloggad.';
  end if;

  update valp
  set agare_user_id = auth.uid()
  where invite_token = p_token
    and (agare_user_id is null or agare_user_id = auth.uid())
  returning id into v_id;

  if v_id is null then
    raise exception 'Ogiltig inbjudan eller så är valpen redan ansluten till en annan köpare.';
  end if;

  insert into profil (user_id, roll)
  values (auth.uid(), 'kopare')
  on conflict (user_id) do nothing;

  return v_id;
end;
$$;

-- ---------- RLS ----------

alter table profil enable row level security;
alter table kennel enable row level security;
alter table kull enable row level security;
alter table valp enable row level security;
alter table dokument enable row level security;
alter table viktlogg enable row level security;
alter table uppfodarrad enable row level security;
alter table fraga enable row level security;
alter table rasprofil enable row level security;
alter table kullinlagg enable row level security;
alter table tidslinje_klar enable row level security;

-- profil: alla inloggade kan läsa namn, bara ägaren kan skriva
create policy "profil läs" on profil for select to authenticated using (true);
create policy "profil skapa" on profil for insert to authenticated with check (user_id = auth.uid());
create policy "profil ändra" on profil for update to authenticated using (user_id = auth.uid());

-- kennel: uppfödaren full kontroll, kullmedlemmar kan läsa
create policy "kennel läs" on kennel for select to authenticated
  using (
    agare_user_id = auth.uid()
    or exists (
      select 1 from kull ku
      join valp v on v.kull_id = ku.id
      where ku.kennel_id = kennel.id and v.agare_user_id = auth.uid()
    )
  );
create policy "kennel skapa" on kennel for insert to authenticated with check (agare_user_id = auth.uid());
create policy "kennel ändra" on kennel for update to authenticated using (agare_user_id = auth.uid());
create policy "kennel radera" on kennel for delete to authenticated using (agare_user_id = auth.uid());

-- kull
create policy "kull läs" on kull for select to authenticated using (ar_kullmedlem(id));
create policy "kull skapa" on kull for insert to authenticated with check (ar_kennelagare(kennel_id));
create policy "kull ändra" on kull for update to authenticated using (ar_kennelagare(kennel_id));
create policy "kull radera" on kull for delete to authenticated using (ar_kennelagare(kennel_id));

-- valp: kullmedlemmar ser hela kullen (skärmen "Kullen")
create policy "valp läs" on valp for select to authenticated using (ar_kullmedlem(kull_id));
create policy "valp skapa" on valp for insert to authenticated with check (ager_kull(kull_id));
create policy "valp ändra" on valp for update to authenticated
  using (ager_kull(kull_id) or agare_user_id = auth.uid());
create policy "valp radera" on valp for delete to authenticated using (ager_kull(kull_id));

-- dokument: uppfödaren full kontroll; köparen läser egna valpens + kullens dokument
create policy "dokument läs" on dokument for select to authenticated
  using (
    (valp_id is not null and exists (
      select 1 from valp v where v.id = dokument.valp_id
        and (v.agare_user_id = auth.uid() or ager_kull(v.kull_id))
    ))
    or (kull_id is not null and ar_kullmedlem(kull_id))
  );
create policy "dokument skapa" on dokument for insert to authenticated
  with check (
    (valp_id is not null and exists (
      select 1 from valp v where v.id = dokument.valp_id and ager_kull(v.kull_id)
    ))
    or (kull_id is not null and ager_kull(kull_id))
  );
create policy "dokument radera" on dokument for delete to authenticated
  using (
    (valp_id is not null and exists (
      select 1 from valp v where v.id = dokument.valp_id and ager_kull(v.kull_id)
    ))
    or (kull_id is not null and ager_kull(kull_id))
  );

-- viktlogg: valpens ägare loggar, uppfödaren ser
create policy "viktlogg läs" on viktlogg for select to authenticated
  using (exists (
    select 1 from valp v where v.id = viktlogg.valp_id
      and (v.agare_user_id = auth.uid() or ager_kull(v.kull_id))
  ));
create policy "viktlogg skapa" on viktlogg for insert to authenticated
  with check (exists (
    select 1 from valp v where v.id = viktlogg.valp_id
      and (v.agare_user_id = auth.uid() or ager_kull(v.kull_id))
  ));
create policy "viktlogg radera" on viktlogg for delete to authenticated
  using (exists (
    select 1 from valp v where v.id = viktlogg.valp_id and v.agare_user_id = auth.uid()
  ));

-- uppfodarrad
create policy "råd läs" on uppfodarrad for select to authenticated using (ar_kullmedlem(kull_id));
create policy "råd skapa" on uppfodarrad for insert to authenticated with check (ager_kull(kull_id));
create policy "råd ändra" on uppfodarrad for update to authenticated using (ager_kull(kull_id));
create policy "råd radera" on uppfodarrad for delete to authenticated using (ager_kull(kull_id));

-- fraga: kullmedlemmar läser allt (svar syns för hela kullen), köpare ställer, uppfödaren svarar
create policy "fraga läs" on fraga for select to authenticated using (ar_kullmedlem(kull_id));
create policy "fraga skapa" on fraga for insert to authenticated
  with check (ar_kullmedlem(kull_id) and stalld_av_user_id = auth.uid());
create policy "fraga svara" on fraga for update to authenticated using (ager_kull(kull_id));

-- rasprofil: öppen läsning
create policy "rasprofil läs" on rasprofil for select using (true);

-- kullinlagg
create policy "inlägg läs" on kullinlagg for select to authenticated using (ar_kullmedlem(kull_id));
create policy "inlägg skapa" on kullinlagg for insert to authenticated
  with check (ar_kullmedlem(kull_id) and user_id = auth.uid());

-- tidslinje_klar: valpens ägare (och uppfödaren) bockar av
create policy "tidslinje läs" on tidslinje_klar for select to authenticated
  using (exists (
    select 1 from valp v where v.id = tidslinje_klar.valp_id
      and (v.agare_user_id = auth.uid() or ager_kull(v.kull_id))
  ));
create policy "tidslinje skapa" on tidslinje_klar for insert to authenticated
  with check (exists (
    select 1 from valp v where v.id = tidslinje_klar.valp_id and v.agare_user_id = auth.uid()
  ));
create policy "tidslinje radera" on tidslinje_klar for delete to authenticated
  using (exists (
    select 1 from valp v where v.id = tidslinje_klar.valp_id and v.agare_user_id = auth.uid()
  ));

-- ---------- Lagring ----------
-- Två privata buckets: "dokument" (intyg m.m.) och "bilder" (logotyper, valpbilder).
-- Filer läses via signerade URL:er som skapas på servern.

insert into storage.buckets (id, name, public)
values ('dokument', 'dokument', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('bilder', 'bilder', true)
on conflict (id) do nothing;

create policy "dokument ladda upp" on storage.objects for insert to authenticated
  with check (bucket_id = 'dokument');
create policy "dokument läs fil" on storage.objects for select to authenticated
  using (bucket_id = 'dokument');
create policy "bilder ladda upp" on storage.objects for insert to authenticated
  with check (bucket_id = 'bilder');
create policy "bilder läs fil" on storage.objects for select
  using (bucket_id = 'bilder');
