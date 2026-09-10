# Plataforma EProfile

Tarjeta de presentación digital para estudiantes: un sitio siempre
actualizado con foto, carrera, reseña, currículum, proyectos y contacto,
compartible con un enlace fijo y un código QR.

Proyecto integrador — Asignatura Nuevas Tecnologías.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Supabase** (Postgres + Auth + Storage) como base de datos
- `@react-pdf/renderer` para generar el CV en PDF
- `qrcode` para generar el código QR (PNG y SVG)
- `next/og` para la imagen social (OpenGraph) de cada EProfile
- `sitemap.xml` y `robots.txt` dinámicos para SEO

## 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta todo el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql). Esto crea las tablas,
   la vista pública, las políticas de seguridad (RLS), la tabla y función
   de analítica de visitas, y el bucket de almacenamiento para fotos de
   perfil.

   > Si ya tenías la base creada de una versión anterior, vuelve a correr
   > el archivo completo (usa `create ... if not exists` / `create or
   > replace`, así que es seguro) o al menos la **sección 7** para
   > habilitar el conteo de visitas.
3. Ve a **Authentication → Users → Add user** y crea la cuenta del primer
   administrador de plataforma (correo + contraseña).
4. Copia el UUID de esa cuenta y en el SQL Editor ejecuta:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('72bf3388-8b53-4f6d-935c-06118413a7fe', 'admin_plataforma');
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
      (vCard con nombre estructurado, organización, foto y nota)
- [x] Diseño responsive (celular, tableta, computadora)

## Extras añadidos (v2)

- [x] **Portada rediseñada** con "cómo funciona" y un **directorio de
      EProfiles publicadas** (foto, nombre, carrera y enlace), con buscador
      cuando hay varias.
- [x] **Compartir** desde la EProfile pública: copiar enlace, menú nativo
      del sistema (`navigator.share`), descargar el QR (PNG) e imprimir /
      guardar como PDF con hoja de estilos de impresión propia.
- [x] **Imagen social (OpenGraph)** generada por perfil: al pegar el
      enlace en WhatsApp, LinkedIn, etc. se ve nombre, carrera e inicial.
- [x] **Metadatos enriquecidos** (`og:*`, `twitter:*`, canonical) y
      `sitemap.xml` con todas las EProfiles publicadas + `robots.txt`
      que bloquea los paneles privados.
- [x] **Analítica de visitas**: cada apertura de una EProfile publicada
      se registra (función `register_profile_visit`, `SECURITY DEFINER`);
      el estudiante ve el total y los últimos 7 / 30 días en su panel.
- [x] **Cambio de contraseña autoservicio** para el estudiante desde su
      panel (además del reinicio por parte del administrador).
- [x] **Editor más seguro**: aviso de "cambios sin guardar" al salir,
      botón para reordenar (↑/↓) cualquier elemento del CV/proyectos y
      "Descartar cambios" para volver a la última versión publicada.
- [x] **Panel de plataforma**: tarjetas de resumen (total, publicados,
      borradores, desactivados), buscador por ruta/correo y botón para
      copiar el enlace público de cada estudiante.
- [x] Página **404** propia con el diseño de la plataforma.

## Limitaciones conocidas / próximos pasos

- No hay compresión/optimización automática de imágenes al subir la
  foto de perfil (se sube tal cual, con límite de 4 MB).
- La analítica de visitas cuenta cada carga de la página (incluye las del
  propio estudiante al previsualizar y las de bots); no hay deduplicación
  por sesión ni panel de gráficas todavía.
- No incluye recuperación de contraseña por correo (sin sesión); el
  estudiante la cambia desde su panel ya autenticado o la reinicia el
  administrador.
- No incluye respaldo/restauración automatizado de datos desde la UI
  (se puede hacer directamente desde el dashboard de Supabase).
