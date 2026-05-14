# Nawaiam Web

Aplicacion Next.js con:

- Home comercial
- Login con NextAuth (credentials)
- Area de juegos tipo test
- Persistencia de resultados con Prisma

## Desarrollo Local

1. Crea `.env` a partir de `.env.example`.
2. Ejecuta:

```bash
npm install
npm run prisma:generate
npm run dev
```

## Base de Datos en Vercel Postgres

Configura estas variables en Vercel:

- `DATABASE_URL`: usar `POSTGRES_PRISMA_URL` (pooled)
- `DIRECT_URL`: usar `POSTGRES_URL_NON_POOLING` (direct)
- `AUTH_SECRET`
- `DEMO_USER_EMAIL`
- `DEMO_USER_PASSWORD`

Para envio real de recupero de contrasena (SMTP), agrega tambien:

- `SMTP_HOST`
- `SMTP_PORT` (ej. `587` o `465`)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE` (`true` para SSL directo, normalmente puerto 465)
- `SMTP_FROM` (ej. `Nawaiam <no-reply@nawaiam.com>`)

La app ya viene preparada para deploy con:

- `vercel.json` con build command: `npm run vercel-build`
- Script `vercel-build`: `prisma generate && prisma migrate deploy && next build`

## Comandos Utiles

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
npm run build
```
