-- ============================================================================
-- Plataforma EProfile — esquema de base de datos (Supabase / Postgres)
-- ============================================================================
-- Cómo usarlo:
-- 1. Crea un proyecto en https://supabase.com
-- 2. Ve a SQL Editor y pega/ejecuta todo este archivo.
-- 3. Crea el primer usuario administrador (ver sección "Seed" al final).
-- ============================================================================

-- Extensión necesaria para generar UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Roles de usuario
-- ----------------------------------------------------------------------------
-- Cada cuenta de auth.users tiene exactamente un rol: 'estudiante' o 'admin_plataforma'.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('estudiante', 'admin_plataforma')),
  created_at timestamptz not null default now()
);

-- Función helper: ¿el usuario actual es admin de plataforma?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin_plataforma'
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. Estudiantes (vínculo cuenta <-> ruta/slug)
-- ----------------------------------------------------------------------------
create table if not exists public.students (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Slugs válidos: minúsculas, números y guiones, 3-40 caracteres.
alter table public.students
  add constraint slug_format check (slug ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])?$');

-- ----------------------------------------------------------------------------
-- 3. Perfiles (contenido editable de cada EProfile)
-- ----------------------------------------------------------------------------
-- El contenido completo (encabezado, CV, habilidades, proyectos, contacto) se
-- guarda como un documento JSON. `draft` es lo que el estudiante está editando;
-- `published` es una copia congelada de `draft` en el momento de publicar, y es
-- lo único que ve el público. Esto garantiza que "lo no publicado nunca se ve
-- en público" sin duplicar tablas por cada sección.
--
-- Forma del documento JSON (draft y published comparten la misma forma):
-- {
--   "fullName": "string",
--   "career": "string",
--   "bio": "string",
--   "photoUrl": "string | null",
--   "cvTemplate": "classic" | "modern" | "minimal",
--   "cv": {
--     "formacion": [{ "titulo": "", "institucion": "", "periodo": "" }],
--     "experiencia": [{ "puesto": "", "organizacion": "", "periodo": "", "descripcion": "" }],
--     "reconocimientos": [{ "titulo": "", "detalle": "" }]
--   },
--   "skills": [{ "category": "Técnicas", "items": ["React", "SQL"] }],
--   "projects": [{ "name": "", "description": "", "tech": "", "role": "", "url": "" }],
--   "contact": { "email": "", "phone": "", "linkedin": "", "github": "" }
-- }
create table if not exists public.profiles (
  student_id uuid primary key references public.students (id) on delete cascade,
  status text not null default 'borrador' check (status in ('borrador', 'publicado')),
  draft jsonb not null default '{}'::jsonb,
  published jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Mantener updated_at al día
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Cuando se crea un estudiante, crearle automáticamente su fila de perfil vacío.
create or replace function public.handle_new_student()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (student_id, draft)
  values (new.id, '{}'::jsonb)
  on conflict (student_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_student_created on public.students;
create trigger on_student_created
  after insert on public.students
  for each row execute function public.handle_new_student();

-- ----------------------------------------------------------------------------
-- 4. Vista pública (solo contenido publicado, de estudiantes activos)
-- ----------------------------------------------------------------------------
-- El visitante SOLO consulta esta vista, nunca las tablas base. Así el borrador
-- jamás queda expuesto, incluso si cambia la política de RLS por error.
create or replace view public.public_profiles as
select
  s.slug,
  p.published,
  p.published_at
from public.students s
join public.profiles p on p.student_id = s.id
where s.active = true
  and p.status = 'publicado'
  and p.published is not null;

-- ----------------------------------------------------------------------------
-- 5. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.user_roles enable row level security;
alter table public.students enable row level security;
alter table public.profiles enable row level security;

-- user_roles: cada quien ve su propio rol; el admin ve todos.
drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select using (user_id = auth.uid() or public.is_admin());

-- students: el propio estudiante ve su fila; el admin ve/edita todas.
drop policy if exists students_select on public.students;
create policy students_select on public.students
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists students_admin_all on public.students;
create policy students_admin_all on public.students
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists students_update_own on public.students;
create policy students_update_own on public.students
  for update using (id = auth.uid());

-- profiles: el propio estudiante lee/edita su perfil (draft/status); el admin, cualquiera.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (student_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
  for insert with check (public.is_admin() or student_id = auth.uid());

-- La vista pública se expone a "anon" y "authenticated" (solo lectura, sin RLS
-- porque ya filtra por status/active en su definición).
grant select on public.public_profiles to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. Storage: fotos de perfil
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

drop policy if exists "Fotos públicas de lectura" on storage.objects;
create policy "Fotos públicas de lectura" on storage.objects
  for select using (bucket_id = 'profile-photos');

drop policy if exists "Estudiantes suben su propia foto" on storage.objects;
create policy "Estudiantes suben su propia foto" on storage.objects
  for insert with check (
    bucket_id = 'profile-photos'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists "Estudiantes actualizan su propia foto" on storage.objects;
create policy "Estudiantes actualizan su propia foto" on storage.objects
  for update using (
    bucket_id = 'profile-photos'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

-- ----------------------------------------------------------------------------
-- 7. Seed: primer administrador de plataforma
-- ----------------------------------------------------------------------------
-- 1) Crea el usuario admin desde el dashboard de Supabase
--    (Authentication → Users → Add user), con correo y contraseña.
-- 2) Copia su UUID y ejecuta (reemplazando el UUID):
--
-- insert into public.user_roles (user_id, role)
-- values ('UUID-DEL-ADMIN', 'admin_plataforma');
--
-- Desde ahí, ese usuario puede entrar a /admin y crear cuentas de estudiantes
-- desde la propia aplicación (usa la Service Role Key en el servidor).
