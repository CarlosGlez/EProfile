# Plataforma EProfile

Tarjeta de presentación digital para estudiantes: un sitio siempre
actualizado con foto, carrera, reseña, currículum, proyectos y contacto,
compartible con un enlace fijo y un código QR.

Cada estudiante administra su propia EProfile desde un panel privado
(borrador → previsualización → publicación), sin tocar código. Un
administrador de plataforma crea las cuentas y puede apoyar en la edición
de cualquier perfil. El CV se descarga en PDF con la misma información
publicada, en 3 plantillas seleccionables.

Proyecto integrador — Asignatura Nuevas Tecnologías.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Supabase** (Postgres + Auth + Storage) como base de datos
- `@react-pdf/renderer` para generar el CV en PDF
- `qrcode` para generar el código QR

## 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta todo el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql). Esto crea las tablas,
   la vista pública, las políticas de seguridad (RLS) y el bucket de
   almacenamiento para fotos de perfil.
3. Ve a **Authentication → Users → Add user** y crea la cuenta del primer
   administrador de plataforma (correo + contraseña).
4. Copia el UUID de esa cuenta y en el SQL Editor ejecuta:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('UUID-DEL-ADMIN', 'admin_plataforma');
   ```

5. En **Project Settings → API**, copia la `Project URL`, la `anon public
   key` y la `service_role key`.

## 2. Configurar el proyecto

```bash
cp .env.local.example .env.local
```

Completa `.env.local` con los valores del paso anterior:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor (crear/eliminar
> cuentas de estudiantes, resetear contraseñas). Nunca la subas al
> repositorio ni la expongas al navegador.

## 3. Correr en desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 4. Flujo de uso

1. Entra a `/login` con la cuenta de administrador.
2. En `/admin`, crea una cuenta de estudiante (correo, contraseña
   temporal, ruta/slug — por ejemplo `luisjz`).
3. El estudiante entra a `/login` con su correo y contraseña, cae en
   `/luisjz/admin`, llena su información real (nombre, carrera, CV,
   proyectos, habilidades, contacto), guarda un borrador, previsualiza y
   publica.
4. Cualquier visitante puede ver `/luisjz` sin iniciar sesión: verá la
   última versión **publicada**, nunca el borrador.
5. El CV en PDF se descarga desde `/api/cv/luisjz`, el contacto (vCard)
   desde `/api/vcard/luisjz`, y el QR desde `/api/qr/luisjz` (apunta a la
   ruta pública definitiva).

## Cuentas de prueba

Después de seguir el paso 1, crea estas cuentas para la demostración:

| Rol | Cómo se crea |
| --- | --- |
| Administrador de plataforma | Manualmente en Supabase Auth + `user_roles` (ver paso 1.3-1.4) |
| Estudiante | Desde `/admin`, con el formulario "Crear cuenta de estudiante" |

## Estructura del modelo de datos

Ver la documentación completa y comentada en
[`supabase/schema.sql`](./supabase/schema.sql). En resumen:

- `user_roles`: el rol de cada cuenta (`estudiante` o `admin_plataforma`).
- `students`: vínculo entre la cuenta y su ruta (`slug`), y si está
  activa.
- `profiles`: el contenido de cada EProfile, guardado como JSON en dos
  columnas — `draft` (lo que el estudiante está editando) y `published`
  (lo que ve el público). Publicar copia `draft` a `published`; nada de
  lo que solo está en `draft` se expone jamás en público.
- `public_profiles` (vista): lo único que consulta el visitante — solo
  perfiles con `status = 'publicado'` de estudiantes activos.

## Seguridad

- Row Level Security en todas las tablas: cada estudiante solo puede
  leer/editar su propia fila; el administrador de plataforma puede leer y
  editar todas.
- Las contraseñas nunca se guardan en texto ni en el repositorio: las
  gestiona Supabase Auth.
- La `service_role key` solo se usa en Server Actions (nunca llega al
  navegador).

## Alcance implementado (MVP)

- [x] Autenticación por rol (`estudiante`, `admin_plataforma`)
- [x] EProfile pública por ruta, sin necesidad de iniciar sesión
- [x] Primera vista con foto, nombre, carrera y reseña; luego CV,
      habilidades, proyectos y contacto
- [x] CV consultable en el sitio y descargable en PDF (misma información
      publicada), con 3 plantillas seleccionables (punto extra)
- [x] Secciones vacías ocultas
- [x] Panel del estudiante: editar perfil, foto, CV, proyectos,
      habilidades, enlaces
- [x] Borrador, vista previa y publicación
- [x] Aislamiento entre estudiantes (RLS)
- [x] Panel de administrador: crear/desactivar/eliminar cuentas,
      resetear contraseña, listado con estado, editar cualquier perfil
- [x] Tarjeta digital con QR a la ruta definitiva + descarga de contacto
      (vCard)
- [x] Diseño responsive (celular, tableta, computadora)

## Limitaciones conocidas / próximos pasos

- No hay compresión/optimización automática de imágenes al subir la
  foto de perfil (se sube tal cual, con límite de 4 MB).
- No incluye recuperación de contraseña autoservicio para el estudiante
  (la reinicia el administrador desde su panel).
- No incluye respaldo/restauración automatizado de datos desde la UI
  (se puede hacer directamente desde el dashboard de Supabase).
